const express = require('express');
const { createRoomandUpdate, } = require('../modules/playingroom/controllers');
const validate = require("../middlewares/validate")
const userValidation = require("../modules/user/user.validations");
const auth = require('../middlewares/auth');
const authenticate = require('../middlewares/authonticate');
const router = express.Router();

router.route('/create-update').post( createRoomandUpdate);

module.exports = router;