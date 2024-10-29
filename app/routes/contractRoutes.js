const express = require("express");
const router = express.Router();
const contractController = require("../controllers/contractController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/contracts", auth([1, 3]), contractController.contracts);
// Tìm khóa học 
router.post("/contract/find", auth([1,3]),validate(['id']), contractController.find);
// Tạo trợ lý
router.post("/contract/create", auth([1]),validate(['name']), contractController.create);
// Cập nhật trợ lý
router.post("/contract/update", auth([1]),validate(['id']), contractController.edit);
// Xóa khóa học
router.delete("/contract/delete", auth([1]),validate(['id']), contractController.delete);
// Tìm khóa học 
module.exports = router;
