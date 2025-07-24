const mongoose=require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    cartItems: [],
    totalPrice:Number,
    totalQuantity:Number,

});

module.exports=mongoose.model("Cart",cartSchema); 
