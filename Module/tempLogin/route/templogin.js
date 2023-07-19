var express = require('express')
var router = express.Router();
var tempController = require("../controller/tempController")

// send OTP
router.post('/sendotp',tempController.sendOtp);

router.post('/verifyotp',tempController.verifyOtp);

router.post('/verification',tempController.Verification);

router.get('/getall',tempController.getAll);

module.exports = router;