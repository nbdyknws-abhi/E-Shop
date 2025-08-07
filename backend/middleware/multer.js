const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "product-" + uniqueSuffix + fileExtension);
  },
});

const uploads = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file
  },
  fileFilter: (req, file, cb) => {
    console.log("Multer file filter - field name:", file.fieldname);
    console.log("Multer file filter - mimetype:", file.mimetype);
    console.log("Multer file filter - originalname:", file.originalname);
    
    // Check if file is an image
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed!'), false);
    }
  }
});

module.exports = uploads;
