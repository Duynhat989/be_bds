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
router.post("/forget",   validate(['email']),authController.forget); 

// Quên tài khoản
router.post("/confirm",   validate(['code']),authController.confirm); 
module.exports = router;
