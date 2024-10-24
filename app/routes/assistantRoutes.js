const express = require("express");
const router = express.Router();
const assistantController = require("../controllers/assistantController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Lấy danh sách tất cả học sinh
router.get("/assistants", auth([1, 3]), assistantController.getAllAssistant);
// Tạo trợ lý
router.post("/assistant/create", auth([1]),validate(['name','detail','instructions','image','file_ids','suggests']), assistantController.createAssistant);
// Cập nhật trợ lý
router.post("/assistant/update", auth([1]),validate(['name','detail','instructions','image','file_ids','suggests']), assistantController.updateAssistant);

// Tìm kiếm trợ lý
router.post("/assistant/find", auth([1,3]),validate(['id']), assistantController.find);

// Xóa trợ lý
router.delete("/assistant/delete", auth([1]),validate(['id']), assistantController.delete);

module.exports = router;
