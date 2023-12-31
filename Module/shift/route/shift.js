var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var shiftController = require("./../controller/shiftController")


// Add Shift
router.post('/add-shift',authendiCate.authenticateToken,shiftController.addShift)

// update Shift status
router.post('/update-shift-status',authendiCate.authenticateToken,shiftController.updateShiftStatus)

// Transfer Shift
router.patch('/transfer-shift',authendiCate.authenticateToken,shiftController.transferShift)


module.exports = router;