const express = require("express");
const router = express.Router();
const payController = require("../controllers/payController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/pays", auth([1, 3]), payController.pays);
// Tìm theo ID
router.post("/pay/find", auth([1]), payController.findById);
// // Tìm theo tên
router.post("/pay/findId", auth([1]), validate(['id']), payController.findByIdUpdate);

// // Tạo trợ lý
router.post("/pay/create", auth([1, 3]), payController.createPay);
// // Cập nhật trợ lý
router.get("/pay/users", auth([1]), payController.users);
// // Xóa khóa học
router.delete("/pay/delete", auth([1]), validate(['id']), payController.deletePay);
// Tìm khóa học 

// cập nhật hóa đơn 

// CẬP NHẬT VÀ KIỂM TRA HÓA DƠN


router.post("/pay/update", auth([1]), payController.EditInvoice);


// Chạy API bank
router.post("/pay/confirmInvoice", auth([1]), payController.updateInvoice);

router.post("/pay/checkInvoice", auth([1]), payController.checkInvoiceStatus);
// kiểm tra hóa đơn
router.post("/pay/verifyInvoice", auth([1,3]), payController.verifyInvoice);


module.exports = router;
