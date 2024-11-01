const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contractController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/contracts", auth([1, 3]), contractController.contracts);
// Tìm theo ID
router.post("/contract/find", auth([1,3]),validate(['id']), contractController.findById);
// Tìm theo tên
router.post("/contract/findName", auth([1,3]),validate(['name']), contractController.findByName);
// Tạo trợ lý
router.post("/contract/create", auth([1]), contractController.create);
// Cập nhật trợ lý
router.post("/contract/update", auth([1]), contractController.update);
// Xóa khóa học
router.delete("/contract/delete", auth([1]),validate(['id']), contractController.delete);
// Tìm khóa học 


// Rà soát hợp đồng 
router.post("/contract/scan", auth([1,3]),validate(['id']), contractController.appProcess);

// Xuất hợp đồng theo keyword
router.post("/contract/export", auth([1,3]),validate(['id']), contractController.appRender);

module.exports = router;
