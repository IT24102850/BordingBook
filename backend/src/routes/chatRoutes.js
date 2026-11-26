const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const multer = require('multer');

const router = express.Router();

const chatUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/(png|jpe?g|gif|webp)|application\/pdf|text\/plain|application\/(msword|vnd\.openxmlformats-officedocument\.[\w.]+))$/.test(file.mimetype);
    return ok ? cb(null, true) : cb(new Error('Unsupported file type'));
  },
}).single('file');

function handleChatUpload(req, res, next) {
  chatUpload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    return next();
  });
}

router.get('/contacts', requireAuth, chatController.getDirectContacts);

router.get('/conversations', requireAuth, chatController.getConversations);

router.post(
  '/conversations/direct',
  requireAuth,
  [body('recipientId').isMongoId()],
  validateRequest,
  chatController.getOrCreateDirectConversation
);

router.post('/conversations/group', requireAuth, chatController.getOrCreateGroupConversation);

router.get('/conversations/:conversationId/messages', requireAuth, chatController.getConversationMessages);

router.post(
  '/conversations/:conversationId/messages',
  requireAuth,
  [body('content').isString().isLength({ min: 1, max: 2000 })],
  validateRequest,
  chatController.sendMessage
);

router.post('/upload', requireAuth, handleChatUpload, chatController.uploadAttachment);

router.patch('/conversations/:conversationId/read', requireAuth, chatController.markConversationRead);

module.exports = router;
