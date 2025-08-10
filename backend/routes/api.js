const api = require("express").Router();
const UserController = require("../controller/user.js");
const AdminController = require("../controller/admin.js");
const uploads = require("../middleware/multer.js");
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminAuth.js");
console.log("adminAuth type:", typeof adminAuth);
console.log(
  "Loaded adminAuth from:",
  require.resolve("../middleware/adminAuth.js")
);

console.log("adminAuth value:", adminAuth);

api.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

// Public routes
api.post("/regdata", UserController.regDataController);
api.post("/userdata", UserController.loginDataController);
api.get("/allproducts", UserController.getAllProductsController);
api.post("/userquery", UserController.userQueryController);
api.get("/search", UserController.searchController);

// Image serving route with better error handling
api.get("/image/:filename", (req, res) => {
  const { filename } = req.params;
  const path = require("path");
  const fs = require("fs");
  
  const imagePath = path.join(__dirname, "../public/uploads", filename);
  
  // Check if file exists
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    // Send a placeholder image or 404
    res.status(404).json({ message: "Image not found" });
  }
});

// Protected user routes (require user authentication)
api.post("/cart/save", auth, UserController.saveCartController);
api.get("/cart/:userId", auth, UserController.fetchCartController);
api.post("/create-order", UserController.OrderController);
api.post("/verify", auth, UserController.VerifyController);
api.post(
  "/verify-and-create-order",
  auth,
  UserController.VerifyAndCreateOrderController
);
api.get("/orders/:userId", auth, UserController.getUserOrdersController);
api.get("/user/profile/:userId", auth, UserController.getUserProfileController);
api.put(
  "/user/profile/:userId",
  auth,
  UserController.updateUserProfileController
);

// Protected admin routes (require admin authentication)
api.post(
  "/add-product",
  adminAuth,
  uploads.single("ProductImage"),
  AdminController.addProductController
);
api.get("/getproducts", adminAuth, AdminController.getProductsController);
api.delete(
  "/deleteproduct/:id",
  adminAuth,
  AdminController.deleteProductController
);
api.get("/admin/orders-stats", adminAuth, AdminController.getOrdersStatsController);
api.get("/admin/orders", adminAuth, AdminController.getAllOrdersController);
api.get("/fetchdata/:abc", adminAuth, AdminController.editProductsController);
api.put(
  "/productupdate/:abc",
  adminAuth,
  uploads.single("ProductImage"),
  AdminController.updateProductController
);
api.get("/query/reply", adminAuth, AdminController.replyQueryController);
api.delete(
  "/deletequery/:abc",
  adminAuth,
  AdminController.deleteQueryController
);
api.get("/getquery/:abc", adminAuth, AdminController.fetchQueryController);
api.post("/queryreply/:abc", adminAuth, AdminController.queryReplyController);

module.exports = api;
