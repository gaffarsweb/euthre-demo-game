const express = require('express');
const { createRoomandUpdate,checkRoomStatus } = require('../modules/playingroom/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/create-update').post( authenticate, createRoomandUpdate);
router.route('/check-room-status').get( authenticate, checkRoomStatus);

module.exports = router;