const UserController = require("../model/user");
const bcrypt=require("bcrypt")

const regDataController = async (req, res) => {
  try {
    const { fname, email, pass } = req.body;
    if(!fname || !email || !pass) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const record= await UserController({
        userName: fname,
        userEmail: email,
        userPass: hashedPassword,
    })
    await record.save();
    res.status(200).json({ message: "Registration successful", data: { fname, email } });

  } catch (error) {
    console.error("Error occurred during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  

}
module.exports={
    regDataController,
}