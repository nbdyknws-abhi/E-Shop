const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const shippingAddressSchema = new Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },
});

const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String, required: true },
  signature: { type: String, required: true },

  // Order Items
  items: [orderItemSchema],

  // Shipping Information
  shippingAddress: shippingAddressSchema,

  // Order Summary
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },

  // Order Status
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "confirmed",
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expectedDelivery: { type: Date },

  // Payment Details
  paymentMethod: { type: String, default: "Razorpay" },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "completed",
  },
});

// Add index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt field before saving
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("Order", orderSchema);
