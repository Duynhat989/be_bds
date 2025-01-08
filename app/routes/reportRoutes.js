const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');


// Lấy danh sách tất cả học sinh
router.get("/report/users", auth([1]), reportController.getUserPackageSummary);
router.get("/report/user-new", auth([1]), reportController.getUserRegistrationStats);
router.get("/report/revenue", auth([1]), reportController.getRevenueStats);
// đăng ký

router.get("/report/user-day", reportController.getUserRegistrationStatsDay);
router.get("/report/revenue-day", reportController.getRevenueStatsDay);
// router.get("/report/total", auth([1]), reportController.getTotalRevenue);

module.exports = router;
