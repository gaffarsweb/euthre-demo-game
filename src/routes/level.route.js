const express = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const levelValidation = require("../modules/level/level.validation")
const levelController = require("../modules/level/controller")

const router = express.Router();


router.route('/addLevel').post(auth("adminAccess"), validate(levelValidation.addLevel), levelController.addLevel)
router.route('/getLevel').get(levelController.getAllLevel)



module.exports = router;