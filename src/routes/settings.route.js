const express = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const settingsController = require("../modules/settings/controllers")

const router = express.Router();


// router.route('/addPackage').post(auth(), settingsController.addPackages)
router.route('/add-update-settings').post(auth("adminAccess"), settingsController?.addUpdateSettings);
router.route('/get-settings').get( settingsController?.getSettings);

// router.route('/getStoreDataByType/:type').get(settingsController.getStoreDataByType)




module.exports = router;