const express = require("express");
const router = express.Router();
const navController = require("../controllers/navController.js");
const auth = require('../middlewares/authMiddleware.js');


// Lưu cài đặt
router.get("/nav/estateAnalysis", auth([1, 3]),navController.estateAnalysis);
// Lưu cài đặt
router.get("/nav/financialAnalysis", auth([1, 3]),navController.financialAnalysis);
// Lưu cài đặt
router.get("/nav/newsSummary", auth([1, 3]),navController.newsSummary);
// Lưu cài đặt
router.get("/nav/teamTraining", auth([1, 3]),navController.teamTraining);

// Lời khuyên đầu tư
router.get("/nav/investmentAdvice", auth([1, 3]),navController.investmentAdvice);

// LẤY CÀI ĐẶT
router.get("/nav/scanContract", auth([1, 3]),navController.scanContract);


module.exports = router;
