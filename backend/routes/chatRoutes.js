const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All chat routes require authentication
router.use(auth);

// Send a message to AI assistant
router.post('/message', chatController.sendMessage);

module.exports = router;