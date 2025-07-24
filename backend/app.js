const express=require("express")
const dotenv= require("dotenv")
const app=express();
const mongoose=require("mongoose")
dotenv.config()
const apiRouter=require("./routes/api.js");

app.use(express.static("public"));
app.use(express.json());
app.use("/api",apiRouter);
mongoose.connect("mongodb://127.0.0.1:27017/eshop")
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("MongoDB connection error:", err);
});
let port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});