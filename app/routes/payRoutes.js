const express = require("express");
const router = express.Router();
const payController = require("../controllers/payController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/pays", auth([1, 3]), payController.pays);
// Tìm theo ID
// router.post("/pay/find", auth([1,3]),validate(['id']), payController.findById);
// // Tìm theo tên
// router.post("/pay/findName", auth([1,3]),validate(['name']), payController.findByName);
// // Tạo trợ lý
router.post("/pay/create", auth([1,3]), payController.createPay);
// // Cập nhật trợ lý
// router.post("/pay/update", auth([1]), payController.update);
// // Xóa khóa học
router.delete("/pay/delete", auth([1]),validate(['id']), payController.deletePay);
// Tìm khóa học 


module.exports = router;
