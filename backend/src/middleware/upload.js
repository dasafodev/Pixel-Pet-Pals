const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage directory for post images
const postImageDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'posts');

// Ensure the directory exists
if (!fs.existsSync(postImageDir)) {
  fs.mkdirSync(postImageDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, postImageDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

// Initialize upload variable for multiple files (up to 9 for 'images' field)
const uploadPostImages = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit per image
  fileFilter: fileFilter
}).array('images', 9); // 'images' is the field name, 9 is the max count

module.exports = uploadPostImages;
