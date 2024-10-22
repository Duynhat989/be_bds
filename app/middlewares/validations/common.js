const { check } = require('express-validator');

// Quy tắc kiểm tra tên
const checkName = check('name')
  .notEmpty()
  .withMessage((value, { req }) => req.t('validation.nameNotEmpty'));

// Quy tắc kiểm tra email
const checkEmail = check('email')
  .isEmail()
  .withMessage((value, { req }) => req.t('validation.emailInvalid'));

// Quy tắc kiểm tra mật khẩu
const checkPassword = check('password')
  .notEmpty()
  .withMessage((value, { req }) => req.t('validation.passwordNotEmpty'))
  .isLength({ min: 6 })
  .withMessage((value, { req }) => req.t('validation.passwordMinLength'));

// Quy tắc kiểm tra số điện thoại
const checkPhone = check('phone')
  .notEmpty()
  .withMessage((value, { req }) => req.t('validation.phoneNotEmpty'))
  .matches(/^[0-9]{10,11}$/)
  .withMessage((value, { req }) => req.t('validation.phoneInvalid'));

module.exports = {
  checkName,
  checkEmail,
  checkPassword,
  checkPhone
};
