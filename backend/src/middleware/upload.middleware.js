const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { ApiError } = require('../utils/error.util');

// Ensure upload directory exists
const createUploadDir = async () => {
  const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_PATH);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configure multer storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError('Invalid file type', 400), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE),
  },
  fileFilter,
});

// Process image middleware
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadDir = await createUploadDir();
    const filename = `${Date.now()}-${req.user.id}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    // Add processed file info to request
    req.processedFile = {
      filename,
      filepath,
      url: `/uploads/${filename}`
    };

    next();
  } catch (error) {
    next(new ApiError('Error processing image', 500));
  }
};

// Delete old profile picture
const deleteOldProfilePicture = async (filepath) => {
  try {
    if (!filepath) return;
    const fullPath = path.join(__dirname, '..', '..', filepath.replace(/^\//, ''));
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting old profile picture:', error);
  }
};

module.exports = {
  upload: upload.single('profilePicture'),
  processImage,
  deleteOldProfilePicture
};
