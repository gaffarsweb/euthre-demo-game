const express = require('express');
const { registerUser, login, verifyEmail, resendVerifycationEmail,getReffredUsers,updateUserStatus,
    forgotPassword, sendResetLink, getAllUsers, getLeaderboard, sendForgotOtp } = require('../modules/user/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/register-user').post(validate(userValidation.registerSchema), registerUser)
router.route('/login').post(validate(userValidation.loginSchema), login);

router.route('/forgot-password').post(forgotPassword);
router.route('/send-reset-link').post(sendResetLink);
router.route('/send-otp').post(sendForgotOtp);

router.route('/verify-mail').post(verifyEmail)
router.route('/resend-verification-mail').post(resendVerifycationEmail);


router.route('/get-all-users').get(auth("adminAccess"), getAllUsers);
router.route('/get-referred-users').post(auth("adminAccess"), getReffredUsers);
router.route('/update-status').post(auth("adminAccess"), updateUserStatus);

router.route('/get-leaderboard').get(authenticate, getLeaderboard);
router.route('/get-leaderboard-admin').get(getLeaderboard);


module.exports = router;