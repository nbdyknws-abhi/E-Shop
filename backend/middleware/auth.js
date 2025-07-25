const jwt= require("jsonwebtoken");

const auth=(req,res,next)=>{
    const bearerHeader =req.headers["authorization"];
    const token =bearerHeader.split(" ")[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET)
            // , (err, user) => {
            // if (err) {
            //     return res.status(403).json({ message: "Invalid token or token has expired" });
            // }
            // req.user = user;
            next();
        ;
    } catch (error) {
        console.error("Authentication Error:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });

    }
}
module.exports = auth;