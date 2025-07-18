const  mongoose = require("mongoose");
const{ Schema , model} = mongoose;

const productSchema = new Schema({
    ProductName:{type: String,required: true,},
    ProductPrice:{type: String,required: true,},
    ProductCat:{type: String,required: true},
    ProductStatus:{type: String,default: "In-Stock"},
}, 
{ timestamps: true }
);
module.exports = model("Product", productSchema);