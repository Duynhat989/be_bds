const express = require('express');
const authController= require('../controllers/authController');
const router = express.Router();
const { validate } = require('../middlewares/validation.js');
const auth = require('../middlewares/authMiddleware.js');
// Đăng ký Giáo viên mới
router.post('/register',  validate(['name','email','phone','password']), authController.register);

// Đăng nhập
router.post('/login',  validate(['email', 'password']), authController.login);

// Quên tài khoản
// router.post("/auth/forget", auth([1,3]), authController.forget); 

module.exports = router;
