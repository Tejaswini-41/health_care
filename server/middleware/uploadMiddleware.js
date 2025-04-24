// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';

// Store in uploads/ with original file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// File filter (optional - only allow certain file types)
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

const upload = multer({ storage, fileFilter });

export default upload;
