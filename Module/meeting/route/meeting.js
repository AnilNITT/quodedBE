var express = require('express')
var router = express.Router();
var meetingController = require("./../controller/meetingController")
var authendiCate = require("../../../helper/Jwt");
 // Split the route 

// Search user for start conversation

router.get('/get-meetings',authendiCate.authenticateToken,meetingController.getMeetings)
// router.get('/change-meetings',authendiCate.authenticateToken,meetingController.getMeetings)


// Add meeting
router.post('/add-meetings',authendiCate.authenticateToken,meetingController.addMeeting)

router.post('/update-meetings',authendiCate.authenticateToken,meetingController.updateMeeting)

module.exports = router