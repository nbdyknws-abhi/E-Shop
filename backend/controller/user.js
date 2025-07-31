const userCollection = require("../model/user");
const productCollection = require("../model/product");
const queryCollection = require("../model/query");
const cartCollection = require("../model/cart");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const Razorpay = require("razorpay");
const crypto=require("crypto");
const orderCollection = require("../model/order");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const OrderController = async (req, res) => {
  const { amount, currency, receipt } = req.body;
  const options = {
    amount: amount * 100,
    currency,
    receipt,
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error..😓" });
  }
};

const VerifyController = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    userID,
  } = req.body;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generate_Signature = hmac.digest("hex");

  if (generate_Signature === razorpay_signature) {
    const record = new orderCollection({
      userId: userID,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: amount,
      status: "Paid",
    });

    await record.save();

    res.json({ success: true, message: "Payment Verify Successfully" });
    
  } else {
    res.json({ success: false, message: "Payment Verify Failed" });
  }
};



const regDataController = async (req, res) => {
  try {
    const { fname, email, pass } = req.body;

    if (!fname || !email || !pass) {
      return res.status(400).json({ message: "All fields are required 😓" });
    }

    const emailExist = await userCollection.findOne({ userEmail: email });

    if (emailExist) {
      return res.status(400).json({ message: "Email already register" });
    }

    const hashPassword = await bcrypt.hash(pass, 10);

    const record = new userCollection({
      userName: fname,
      userEmail: email,
      userPass: hashPassword,
    });

    await record.save();
    res.status(200).json({ message: "Successfully Register 😍" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: "Internal Server Error😓" });
  }
};

const loginDataController = async (req, res) => {
  try {
    const { LoginEmail, LoginPass } = req.body;

    const userCheck = await userCollection.findOne({ userEmail: LoginEmail });

    if (!userCheck) {
      console.log(userCheck);
      return res.status(400).json({ message: "User not found..!" });
    }

    const matchPass = await bcrypt.compare(LoginPass, userCheck.userPass);

    if (!matchPass) {
      return res.status(400).json({ message: "Invalid Credentials😓" });
    }
    const token = jwt.sign(
      { id: userCheck._id, email: userCheck.userEmail },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(200).json({
      message: " Login Successfully😍",
      data: userCheck,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error😓" });
  }
};

const getAllProductsController = async (req, res) => {
  try {
    const category = req.query.category;
    let filter = { ProductStatus: "In-Stock" };
    if (category && category !== "All") {
      filter.ProductCat = category;
    }
    const record = await productCollection.find(filter);
    res.status(200).json({ data: record });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Internal Server Error😓" });
  }
};
const userQueryController = async (req, res) => {
  try {
    const { userName, userEmail, userQuery } = req.body;
    const record = new queryCollection({
      Name: userName,
      Email: userEmail,
      Query: userQuery,
    });
    await record.save();
    res.status(200).json({ message: "Query Submitted Successfully" });
  } catch (error) {
    console.error("Error submitting query:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const saveCartController = async (req, res) => {
  try {
    const { userId, cartItems, totalPrice, totalQuantity } = req.body;

    let cart = await cartCollection.findOne({ userId });
    if (cart) {
      cart.cartItems = cartItems;
      cart.totalPrice = totalPrice;
      cart.totalQuantity = totalQuantity;
      await cart.save();
      res.status(200).json({ message: "Cart updated successfully" });
    } else {
      cart = new cartCollection({
        userId: userId,
        cartItems: cartItems,
        totalPrice: totalPrice,
        totalQuantity: totalQuantity,
      });
      await cart.save();
    }
  } catch (error) {
    console.error("Error saving cart:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const fetchCartController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await cartCollection.findOne({ userId });
    res
      .status(200)
      .json(cart || { cartItems: [], totalPrice: 0, totalQuantity: 0 });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchController = async(req, res) => {
  try {
    const keyword = req.query.q;
    const result = await productCollection.find({
      $or: [
         { ProductName: { $regex: keyword, $options: "i" } },
         { ProductCat: { $regex: keyword, $options: "i" } },
        ],
         ProductStatus: "In-Stock" 
      });
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error in searchController:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  regDataController,
  loginDataController,
  getAllProductsController,
  userQueryController,
  saveCartController,
  fetchCartController,
  searchController,
  OrderController,
  VerifyController,
};
