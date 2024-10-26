const express = require("express");
const router = express.Router();
const licenseController = require("../controllers/licenseController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Xem tất cả khóa học
router.get("/licenses", auth([1, 3]), licenseController.getLicenses);
// Tìm khóa học 
router.post("/license/find", auth([1,3]),validate(['user_id']), licenseController.getLicenseById);
// Tạo trợ lý
router.post("/license/create", auth([1]),validate(['user_id','pack_id','date']), licenseController.addLicense);
// Cập nhật trợ lý
router.post("/license/update", auth([1]),validate(['id']), licenseController.updateLicense);
// Xóa khóa học
router.delete("/license/delete", auth([1]),validate(['id']), licenseController.deleteLicense);
// Tìm khóa học 
router.get("/license/me", auth([1,3]), licenseController.getLicense);

module.exports = router;
