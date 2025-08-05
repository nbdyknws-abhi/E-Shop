const jwt = require("jsonwebtoken");
// const userCollection = require("../model/user");

const adminAuth = async (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;

    if (!bearerHeader || !bearerHeader.startsWith("Bearer")) {
      return res.status(401).json({ 
        message: "Admin access denied - No authorization header",
        requiresLogin: true 
      });
    }

    const token = bearerHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        message: "Admin access denied - Token missing",
        requiresLogin: true 
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simplified admin check - just check if token contains admin email
    if (decoded.email !== "admin@gmail.com") {
      return res.status(403).json({ 
        message: "Admin access denied - Insufficient privileges",
        requiresLogin: false 
      });
    }

    // Add user info to request object
    req.user = decoded;
    
    console.log(`✅ Admin access granted to: ${decoded.email}`);
    next();

  } catch (error) {
    console.error("Admin Authentication Error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: "Admin access denied - Invalid token",
        requiresLogin: true 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: "Admin access denied - Token expired",
        requiresLogin: true 
      });
    }

    // For other errors
    return res.status(500).json({ 
      message: "Admin authentication failed - Server error",
      requiresLogin: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = adminAuth;
