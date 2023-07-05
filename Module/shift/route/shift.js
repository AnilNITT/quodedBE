var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var shiftController = require("./../controller/shiftController")


// Add Shift
router.post('/add-shift',authendiCate.authenticateToken,shiftController.addShift)


module.exports = router;
