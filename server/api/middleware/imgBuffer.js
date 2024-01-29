// multer
const multer = require('multer')

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'text'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
  }
};

const uploadBuffer = multer({
  dest: 'uploads/', // Specify the destination folder
  limits: { fileSize: 100 * 1024 * 1024 }, // Set the maximum file size to 100 MB
  fileFilter: fileFilter, // Specify the file filter function
})

module.exports = uploadBuffer