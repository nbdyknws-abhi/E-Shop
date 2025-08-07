const queryCollection = require("../model/query");
const productCollection = require("../model/product");
const nodemailer = require("nodemailer");
const addProductController = async (req, res) => {
  try {
    // Debug logging
    console.log("=== ADD PRODUCT DEBUG ===");
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("All headers:", Object.keys(req.headers));
    console.log("========================");

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required. Please upload an image file.",
        error: "No file received",
      });
    }

    const Pimage = req.file.filename;
    const { Pname, Price, Cat } = req.body;

    // Validate required fields
    if (!Pname || !Price || !Cat) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message:
          "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
        received: req.file.mimetype,
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: "File too large. Maximum size is 5MB.",
        received: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      });
    }

    const record = new productCollection({
      ProductName: Pname,
      ProductPrice: Price,
      ProductCat: Cat,
      ProductImage: Pimage,
    });

    await record.save();
    res.status(200).json({
      message: "Product added successfully ✅",
      productId: record._id,
      imageName: Pimage,
    });
  } catch (error) {
    console.error("Add Product Error:", error);

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

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
    console.log("=== UPDATE PRODUCT DEBUG ===");
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("============================");

    const { Pname, Pprice, Pcat, Pstatus, removeImage } = req.body;
    const id = req.params.abc;
    const updateData = {
      ProductName: Pname,
      ProductPrice: Pprice,
      ProductCat: Pcat,
      ProductStatus: Pstatus,
    };

    // Handle image updates
    if (req.file) {
      // Validate file type for updates too
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
        });
      }
      updateData.ProductImage = req.file.filename;
    } else if (removeImage === "true") {
      // User wants to remove current image
      updateData.ProductImage = null;
    }
    // If neither new file nor remove flag, keep existing image (don't modify ProductImage field)

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
