const userCollection = require("../model/user");
const bcrypt = require("bcrypt");

const regDataController = async (req, res) => {
  try {
    const { fname, email, pass } = req.body;

    if (!fname || !email || !pass) {
      return res.status(400).json({ message: "All fields are required 😓" });
    }

    const emailExist = await userCollection.findOne({ userEmail: email });

    if (emailExist) {
      return res.status(400).json({ message: "Email already register" });
    }

    const hashPassword = await bcrypt.hash(pass, 10);

    const record = new userCollection({
      userName: fname,
      userEmail: email,
      userPass: hashPassword,
    });

    await record.save();
    res.status(200).json({ message: "Successfully Register 😍" });
  }catch (error) {
  console.error("Registration Error:", error.message);
  res.status(500).json({ message: "Internal Server Error😓" });
}

};

const loginDataController = async (req, res) => {

  try {
    const { LoginEmail, LoginPass } = req.body;

    const userCheck = await userCollection.findOne({ userEmail: LoginEmail });

    if (!userCheck) {
      console.log(userCheck)
      return res.status(400).json({ message: "User not found..!" });
    }

    const matchPass = await bcrypt.compare(LoginPass, userCheck.userPass);

    if (!matchPass) {
      return res.status(400).json({ message: "Invalid Credentials😓" });
    }

    res.status(200).json({
      message: " Login Successfully😍",
      data: userCheck,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error😓" });
  }
};

module.exports = {
  regDataController,
  loginDataController,
};