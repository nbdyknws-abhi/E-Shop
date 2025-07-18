const queryCollection = require("../model/query");
const productCollection = require("../model/product");
const nodemailer = require("nodemailer");
const addProductController = async (req, res) => {
  try {
    const { Pname, Price, Cat } = req.body;
    if (!Pname || !Price || !Cat) {
      return res.status(400).json({ message: "All fields are required 😓" });
    }
    const record = new productCollection({
      ProductName: Pname,
      ProductPrice: Price,
      ProductCat: Cat,
    });
    await record.save();
    res.status(200).json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getProductsController = async (req, res) => {
  try {
    const products = await productCollection.find();
    res.status(200).json({ data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteProductController = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await productCollection.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const editProductsController = async (req, res) => {
  try {
    const id = req.params.abc;
    const record = await productCollection.findById(id);
    res.status(200).json({ data: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateProductController = async (req, res) => {
  try {
    const { Pname, Pprice, Pcat, Pstatus } = req.body;
    const id = req.params.abc;
    await productCollection.findByIdAndUpdate(id, {
      ProductName: Pname,
      ProductPrice: Pprice,
      ProductCat: Pcat,
      ProductStatus: Pstatus,
    });
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const replyQueryController = async (req, res) => {
  console.log(req.body);
  try {
    const record = await queryCollection.find();
    res.status(200).json({ data: record });
  } catch (error) {
    console.error("Error replying to query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteQueryController = async (req, res) => {
  try {
    const id = req.params.abc;
    const result = await queryCollection.findByIdAndDelete(id);
    res.status(200).json({ message: "Query deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const fetchQueryController = async (req, res) => {
  try {
    const id = req.params.abc;
    const record = await queryCollection.findById(id);
    res.status(200).json({ data: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const queryReplyController = async (req, res) => {
  try {
    const { to, sub, body } = req.body;
    const id = req.params.abc;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "av022002@gmail.com",
        pass: "xvyp ucoh ogzq guvu",
      },
    });

   await transporter.sendMail({
      from: '"ChopperTown" <av022002@gmail.com>',
      to: to,
      subject: sub,
      text: body,
      html: `<b>${body}</b>`,
    });
  
      const info = transporter.sendMail({
        from: '"ChopperTown" <dkexpress06@gmail.com>',
        to: to,
        subject: sub,
        text: body,
        html: `<b>${body}</b>`,
      });
    await queryCollection.findByIdAndUpdate(id, {
      QueryStatus: "replied",
    })
    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reply" });
    console.error("Error sending email:", error);
  }
};
module.exports = {
  addProductController,
  getProductsController,
  deleteProductController,
  editProductsController,
  updateProductController,
  replyQueryController,
  deleteQueryController,
  fetchQueryController,
  queryReplyController,
};
