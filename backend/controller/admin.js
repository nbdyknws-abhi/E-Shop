const queryCollection = require("../model/query");
const productCollection = require("../model/product");
const nodemailer = require("nodemailer");
const addProductController = async (req, res) => {
  try {
    const Pimage = req.file.filename;

    const { Pname, Price, Cat } = req.body;
    if (!Pname || !Price || !Cat) {
      return res.status(400).json({ message: "All fields are required " });
    }

    const record = new productCollection({
      ProductName: Pname,
      ProductPrice: Price,
      ProductCat: Cat,
      ProductImage: Pimage,
    });

    await record.save();
    res.status(200).json({ message: "Product added successfully ✅" });
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
    const updateData = {
      ProductName: Pname,
      ProductPrice: Pprice,
      ProductCat: Pcat,
      ProductStatus: Pstatus,
    };

    if (req.file) {
      updateData.ProductImage = req.file.filename;
    }

    // ✅ Correct way in Mongoose 7+
    const updatedProduct = await productCollection.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
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
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "ChopperTown Support"}" <${
        process.env.EMAIL_USER
      }>`,
      to: to,
      subject: sub,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Reply from ChopperTown Support</h2>
        <p>${body.replace(/\n/g, "<br>")}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated response from ChopperTown customer support.
          <br>If you have any further questions, please don't hesitate to contact us.
        </p>
      </div>`,
    };

    await transporter.sendMail(mailOptions);

    // Update query status to "Resolved"
    await queryCollection.findByIdAndUpdate(id, { QueryStatus: "Resolved" });

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);

    if (error.code === "EAUTH") {
      res.status(500).json({
        message: "Email authentication failed. Please check email credentials.",
      });
    } else if (error.code === "ECONNECTION") {
      res.status(500).json({
        message: "Failed to connect to email server. Please try again later.",
      });
    } else {
      res.status(500).json({
        message: "Failed to send reply. Please try again later.",
      });
    }
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
