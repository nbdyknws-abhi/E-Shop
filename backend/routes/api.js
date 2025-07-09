const api=require("express").Router();
const UserController=require("../controller/user.js");
api.get("/",(req,res)=>{
    res.send("Welcome to the E-commerce API");
})

api.post("/regdata", UserController.regDataController);






module.exports=api;