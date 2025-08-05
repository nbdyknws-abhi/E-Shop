const userCollection = require("../model/user");
const productCollection = require("../model/product");
const queryCollection = require("../model/query");
const cartCollection = require("../model/cart");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");
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
    res.status(200).json({ message: "Successfully Registered" });
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
      message: " You are logged in successfully",
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
    res.status(500).json({ message: "Internal Server Error" });
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

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Ensure cartItems is an array
    const validCartItems = Array.isArray(cartItems) ? cartItems : [];

    let cart = await cartCollection.findOne({ userId });
    if (cart) {
      cart.cartItems = validCartItems;
      cart.totalPrice = totalPrice || 0;
      cart.totalQuantity = totalQuantity || 0;
      await cart.save();
      res.status(200).json({ message: "Cart updated successfully", cart });
    } else {
      cart = new cartCollection({
        userId: userId,
        cartItems: validCartItems,
        totalPrice: totalPrice || 0,
        totalQuantity: totalQuantity || 0,
      });
      await cart.save();
      res.status(200).json({ message: "Cart created successfully", cart });
    }
  } catch (error) {
    console.error("Error saving cart:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const fetchCartController = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cart = await cartCollection.findOne({ userId });

    if (cart) {
      res.status(200).json({
        cartItems: cart.cartItems || [],
        totalPrice: cart.totalPrice || 0,
        totalQuantity: cart.totalQuantity || 0,
      });
    } else {
      // Return empty cart if no cart found
      res.status(200).json({
        cartItems: [],
        totalPrice: 0,
        totalQuantity: 0,
      });
    }
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const clearCartController = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    await cartCollection.findOneAndUpdate(
      { userId },
      {
        cartItems: [],
        totalPrice: 0,
        totalQuantity: 0,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Cart cleared successfully",
      cartItems: [],
      totalPrice: 0,
      totalQuantity: 0,
    });
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchController = async (req, res) => {
  try {
    const keyword = req.query.q;
    const result = await productCollection.find({
      $or: [
        { ProductName: { $regex: keyword, $options: "i" } },
        { ProductCat: { $regex: keyword, $options: "i" } },
      ],
      ProductStatus: "In-Stock",
    });
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error in searchController:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const VerifyAndCreateOrderController = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      cartItems,
      shippingAddress,
      subtotal,
      shippingCost,
      totalAmount,
      totalQuantity,
    } = req.body;

    // Verify payment signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generate_Signature = hmac.digest("hex");

    if (generate_Signature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Create order with detailed information
    const orderItems = cartItems.map((item) => ({
      productId: item._id,
      productName: item.ProductName,
      productImage: item.ProductImage,
      productPrice: parseFloat(item.ProductPrice),
      quantity: parseInt(item.quantity),
      totalPrice: parseFloat(item.ProductPrice) * parseInt(item.quantity),
    }));

    // Calculate expected delivery (5-7 days from now)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 6);

    const newOrder = new orderCollection({
      userId: userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      items: orderItems,
      shippingAddress: shippingAddress,
      subtotal: parseFloat(subtotal),
      shippingCost: parseFloat(shippingCost),
      totalAmount: parseFloat(totalAmount),
      totalQuantity: parseInt(totalQuantity),
      status: "confirmed",
      paymentMethod: "Razorpay",
      paymentStatus: "completed",
      expectedDelivery: expectedDelivery,
    });

    await newOrder.save();

    // Clear user's cart after successful order
    await cartCollection.findOneAndUpdate(
      { userId },
      {
        cartItems: [],
        totalPrice: 0,
        totalQuantity: 0,
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Order created successfully",
      orderId: razorpay_order_id,
      expectedDelivery: expectedDelivery,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

const getUserOrdersController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch orders for the user, sorted by creation date (newest first)
    const orders = await orderCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      orders: orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserProfileController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user profile (excluding password)
    const user = await userCollection
      .findById(userId)
      .select("-userPass")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userName, userEmail, phoneNumber, address, city, state, pincode } =
      req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if email is being changed and if it already exists
    if (userEmail) {
      const existingUser = await userCollection.findOne({
        userEmail: userEmail,
        _id: { $ne: userId }, // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update user profile
    const updatedUser = await userCollection
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(userName && { userName }),
            ...(userEmail && { userEmail }),
            ...(phoneNumber !== undefined && { phoneNumber }),
            ...(address !== undefined && { address }),
            ...(city !== undefined && { city }),
            ...(state !== undefined && { state }),
            ...(pincode !== undefined && { pincode }),
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      )
      .select("-userPass");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid data provided" });
    }
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
  clearCartController,
  searchController,
  OrderController,
  VerifyController,
  VerifyAndCreateOrderController,
  getUserOrdersController,
  getUserProfileController,
  updateUserProfileController,
};
