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
  uploads.single("pimage"),
  AdminController.addProductController
);
api.get("/getproducts", adminAuth, AdminController.getProductsController);
api.delete(
  "/deleteproduct/:id",
  adminAuth,
  AdminController.deleteProductController
);
api.get("/fetchdata/:abc", adminAuth, AdminController.editProductsController);
api.put(
  "/productupdate/:abc",
  adminAuth,
  uploads.single("Pimage"),
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
