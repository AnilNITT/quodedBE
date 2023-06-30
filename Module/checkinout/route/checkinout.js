var express = require('express')
var router = express.Router();
var checkinoutController = require("./../controller/checkinoutController");
var authendiCate = require("../../../helper/Jwt");

// Split the route

// Add Check IN
router.post('/add-checkin',authendiCate.authenticateToken,checkinoutController.addCheckIn);


// Add Check Out
router.post('/add-checkout',authendiCate.authenticateToken,checkinoutController.addCheckOut);

module.exports = router;