const express = require("express");
const router = express.Router();
const assistantController = require("../controllers/assistantController.js");
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');

// Lấy danh sách tất cả học sinh
router.get("/assistants", auth([1, 3]), assistantController.getAllAssistant);
router.post("/assistant/create", auth([1, 3]),validate(['name','detail','instructions','image','file_ids','suggests']), assistantController.createAssistant);


module.exports = router;
