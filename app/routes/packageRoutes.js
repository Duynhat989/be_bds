const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/packages", auth([1, 3]), packageController.getPackages);
// Tìm khóa học 
// router.post("/package/find", auth([1,3]),validate(['id']), packageController.find);
// Tạo trợ lý
router.post("/package/create", auth([1]),validate(['name']), packageController.addPackage);
// Cập nhật trợ lý
router.post("/package/update", auth([1]),validate(['id']), packageController.updatePackage);
// Xóa khóa học
router.delete("/package/delete", auth([1]),validate(['id']), packageController.deletePackage);
// Tìm khóa học 

module.exports = router;
