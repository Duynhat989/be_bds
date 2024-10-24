const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Tạo mới luồng chat
router.post("/conversation/thread", auth([1, 3]), conversationController.createThread);
// Tạo luồng chat stream
router.post("/conversation/stream", auth([1, 3]),validate(['thread_id','message']), conversationController.createConversation);
// Lấy danh sách tin nhắn
router.post("/conversation", auth([1, 3]),validate(['thread_id']), conversationController.conversation);

module.exports = router;
