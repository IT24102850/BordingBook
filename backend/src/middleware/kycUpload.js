const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fileStore = require('../lib/fileStore');

const fileFilter = (req, file, cb) => {
  const allowed = /^\.(jpe?g|png|pdf)$/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only JPG, PNG, and PDF files are allowed'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
}).fields([
  { name: 'nicFront', maxCount: 1 },
  { name: 'nicBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);

// Parse the multipart form, then persist each file to durable storage under
// uploads/kyc/<unguessable name>. Controllers keep using file.filename.
module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const groups = Object.values(req.files || {});
      for (const files of groups) {
        for (const file of files) {
          const ext = path.extname(file.originalname).toLowerCase();
          file.filename = `${file.fieldname}-${req.user._id}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
          await fileStore.saveFile(`uploads/kyc/${file.filename}`, file.buffer, file.mimetype);
        }
      }
      return next();
    } catch (e) {
      return next(e);
    }
  });
};
