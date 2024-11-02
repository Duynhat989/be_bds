const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController.js");
const courseUserController = require("../controllers/courseUserController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/courses", auth([1, 3]), courseController.courses);
// Tìm khóa học 
router.post("/course/find", auth([1,3]),validate(['id']), courseController.find);
// Tìm kiếm theo tên 
router.post("/course/findName", auth([1,3]),validate(['id']), courseController.find);
// Tạo trợ lý
router.post("/course/create", auth([1]),validate(['name']), courseController.create);
// Cập nhật trợ lý
router.post("/course/update", auth([1]),validate(['id']), courseController.edit);
// Xóa khóa học
router.delete("/course/delete", auth([1]),validate(['id']), courseController.delete);
// Tìm khóa học 
router.get("/course/me", auth([1,3]), courseUserController.mySevices);


// Đăng ký khóa học
router.post("/course/signin", auth([1,3]),validate(['course_id']), courseUserController.create);
module.exports = router;
