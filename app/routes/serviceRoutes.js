const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const auth = require('../middlewares/authMiddleware.js');

// Lấy danh sách tất cả học sinh
router.get("/students", auth([1, 2]), userController.getAllStudents);

// Lấy danh sách tất cả giáo viên
router.get("/teachers", auth([1, 2]),userController.getAllTeachers);

// Tìm một học sinh hoặc giáo viên cụ thể
router.get("/users/:id", auth([1, 2]), userController.findUserById);

// Cập nhật thông tin người dùng
router.put('/users/:id', auth([1, 2]), userController.updateUser);

// Xóa người dùng
router.delete('/users/:id', auth([1, 2]), userController.deleteUser);

module.exports = router;
