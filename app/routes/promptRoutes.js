const express = require("express");
const router = express.Router();
const promptController = require("../controllers/promptController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.post("/prompts", auth([1, 3]),validate(['assistant_id']), promptController.getPrompts);
// Tìm khóa học 
router.post("/prompt/find", auth([1,3]),validate(['id']), promptController.findPromptById);
// Tạo trợ lý
router.post("/prompt/create", auth([1,3]),validate(['assistant_id']), promptController.createPrompt);
// Cập nhật trợ lý
router.post("/prompt/update", auth([1,3]),validate(['id']), promptController.updatePromptById);
// Xóa khóa học
router.delete("/prompt/delete", auth([1,3]),validate(['id']), promptController.deletePromptById);
// Tìm khóa học 


module.exports = router;
