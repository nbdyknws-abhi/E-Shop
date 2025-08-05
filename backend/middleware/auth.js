const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const bearerHeader = req.headers.authorization;

  if (!bearerHeader || !bearerHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Authorization invalid" });
  }

  const token = bearerHeader.split(" ")[1];

  if (!token) {
    console.log("Token missing after split:", bearerHeader);
    return res.status(401).json({ message: "Token not found" });
  }
  try {
    const VerifyUser = jwt.verify(token, process.env.JWT_SECRET);

    req.user = VerifyUser;
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res
      .status(403)
      .json({ message: "Invalid token or token has expired" });
  }
};
module.exports = auth;
