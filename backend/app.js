const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const apiRouter = require("./routes/api.js");

// --------------------
// CORS Configuration
// --------------------
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// --------------------
// Middleware
// --------------------
app.use(express.static("public"));
app.use(express.json({ limit: "5000mb" }));
app.use(express.urlencoded({ extended: true, limit: "5000mb" }));

// --------------------
// API Routes
// --------------------
app.use("/api", apiRouter);

// Frontend is deployed separately; remove catch-all to avoid Express 5 path-to-regexp wildcard issues.

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Using URI:", process.env.MONGO_URL);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// --------------------
// Start Server
// --------------------
let port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
