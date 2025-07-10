const api=require("express").Router();
const UserController=require("../controller/user.js");
const AdminController=require("../controller/admin.js")
api.get("/",(req,res)=>{
    res.send("Welcome to the E-commerce API");
})

api.post("/regdata", UserController.regDataController);
api.post("/userdata", UserController.loginDataController);
api.post("/add-product",AdminController.addProductController);


module.exports=api;