const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');


// Lấy danh sách tất cả học sinh
router.get("/lessons", auth([1, 3]), lessonController.lessons);
// Tìm khóa học 
router.post("/lesson/find", auth([1,3]),validate(['id']), lessonController.find);
// Tạo trợ lý
router.post("/lesson/create", auth([1]),validate(['name']), lessonController.create);
// Cập nhật trợ lý
router.post("/lesson/update", auth([1]),validate(['id']), lessonController.edit);
// Xóa khóa học
router.delete("/lesson/delete", auth([1]),validate(['id']), lessonController.delete);

module.exports = router;
