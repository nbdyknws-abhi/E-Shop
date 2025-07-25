const api=require("express").Router();
const UserController=require("../controller/user.js");
const AdminController=require("../controller/admin.js")
const uploads = require("../middleware/multer.js");
api.get("/",(req,res)=>{
    res.send("Welcome to the E-commerce API");
})

api.post("/regdata", UserController.regDataController);
api.post("/userdata", UserController.loginDataController);
api.post("/add-product",uploads.single("pimage"),AdminController.addProductController);
api.get("/getproducts",AdminController.getProductsController);
api.delete("/deleteproduct/:id", AdminController.deleteProductController);
api.get("/fetchdata/:abc", AdminController.editProductsController);
api.put("/productupdate/:abc", uploads.single("Pimage"), AdminController.updateProductController);
api.get("/allproducts", UserController.getAllProductsController);
api.post("/userquery", UserController.userQueryController);
api.get("/query/reply", AdminController.replyQueryController);
api.delete("/deletequery/:abc", AdminController.deleteQueryController);
api.get("/getquery/:abc", AdminController.fetchQueryController);
api.post("/queryreply/:abc", AdminController.queryReplyController);
api.post("/cart/save", UserController.saveCartController);
api.get("/cart/:userId", UserController.fetchCartController);
api.get("/search", UserController.searchController);

module.exports = api;