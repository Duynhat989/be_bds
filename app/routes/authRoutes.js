const express = require('express');
const authController= require('../controllers/authController');
const router = express.Router();
const { validate } = require('../middlewares/validation.js');
const {checkName, checkEmail, checkPassword, checkPhone } = require('../middlewares/validations/common.js');
const auth = require('../middlewares/authMiddleware.js');
// Đăng ký Giáo viên mới
router.post('/register',  validate([checkName, checkEmail, checkPassword, checkPhone]), authController.register);

// Đăng nhập
router.post('/login',  validate([checkEmail, checkPassword]), authController.login);

// Admin và giáo viên tạo tài khoản
router.post('/create-user', auth([1, 2]),  validate([checkName, checkEmail, checkPassword]), authController.createUser);


module.exports = router;
