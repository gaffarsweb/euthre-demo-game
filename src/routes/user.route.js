const express = require('express');
const { registerUser, login, verifyEmail, resendVerifycationEmail } = require('../modules/user/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations")
const router = express.Router();

router.route('/register-user').post(validate(userValidation.registerSchema), registerUser)
router.route('/login').post(validate(userValidation.loginSchema), login)
router.route('/verify-mail').post(verifyEmail)
router.route('/resend-verification-mail').post(resendVerifycationEmail)

module.exports = router;