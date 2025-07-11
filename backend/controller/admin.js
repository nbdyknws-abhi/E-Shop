const productCollection = require("../model/product");
const addProductController = async(req,res)=>{
    console.log(req.body)
    try {
     const { Pname, Price, Cat } = req.body;
      if (!Pname || !Price || !Cat) {
      return res.status(400).json({ message: "All fields are required 😓" });
    }
     const record = new productCollection({
         ProductName: Pname,
         ProductPrice: Price,
         ProductCat: Cat
     });
     await record.save();
     res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
     console.error(error);
     res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {addProductController};