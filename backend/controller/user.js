const userCollection = require("../model/user");
const productCollection = require("../model/product");
const queryCollection =require("../model/query")
const cartCollection=require("../model/cart")
const bcrypt = require("bcrypt");

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
  }catch (error) {
  console.error("Registration Error:", error.message);
  res.status(500).json({ message: "Internal Server Error😓" });
}

};

const loginDataController = async (req, res) => {

  try {
    const { LoginEmail, LoginPass } = req.body;

    const userCheck = await userCollection.findOne({ userEmail: LoginEmail });

    if (!userCheck) {
      console.log(userCheck)
      return res.status(400).json({ message: "User not found..!" });
    }

    const matchPass = await bcrypt.compare(LoginPass, userCheck.userPass);

    if (!matchPass) {
      return res.status(400).json({ message: "Invalid Credentials😓" });
    }

    res.status(200).json({
      message: " Login Successfully😍",
      data: userCheck,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error😓" });
  }
};

const getAllProductsController = async(req, res) => {
  try {
    const record = await productCollection.find({ ProductStatus: "In-Stock" });
    res.status(200).json({ data: record });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Internal Server Error😓" });
  }
}
const userQueryController = async(req,res)=>{
  try {
    const { userName, userEmail, userQuery } = req.body;
    const record =  new queryCollection({
      Name:userName,
      Email:userEmail,
      Query:userQuery,
    });
    await record.save();
     res.status(200).json({ message: "Query Submitted Successfully" });
  } catch (error) {
    console.error("Error submitting query:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
    
  }


   
}
const saveCartController= async(req,res)=>{
  try {
    const {userId,cartItems,totalPrice,totalQuantity}=req.body;

    let cart=await cartCollection.findOne({ userId});
    console.log(cart);
    if(cart){
      cart.cartItems = cartItems;
      cart.totalPrice = totalPrice;
      cart.totalQuantity = totalQuantity;
      await cart.save();
      res.status(200).json({ message: "Cart updated successfully" });
    }else{
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
}
module.exports = {
  regDataController,
  loginDataController,
  getAllProductsController,
  userQueryController,
  saveCartController
};