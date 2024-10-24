const express = require("express");
const router = express.Router();
const setupController = require("../controllers/setupController.js");
const auth = require('../middlewares/authMiddleware.js');

// Lấy danh sách cài đặt
router.get("/setup", auth([1]), setupController.getAllSetup);

// Lưu cài đặt
router.get("/setup/save", auth([1, 3]),setupController.getAllSetup);


module.exports = router;
