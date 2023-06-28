var express = require('express')
var router = express.Router();
var meetingController = require("./../controller/meetingController")
var authendiCate = require("../../../helper/Jwt");
 // Split the route 

router.get('/get-meetings',authendiCate.authenticateToken,meetingController.getMeetings)
// router.get('/change-meetings',authendiCate.authenticateToken,meetingController.getMeetings)

// Add meeting
router.post('/add-meetings',authendiCate.authenticateToken,meetingController.addMeeting)

// update meeting status
router.post('/update-meetings-status',authendiCate.authenticateToken,meetingController.updateMeetingStatus)

// update meeting time
router.post('/revised-meetings-time',authendiCate.authenticateToken,meetingController.reviseMeetingDate)

// update meeting time
router.post('/deny-meetings',authendiCate.authenticateToken,meetingController.denyMeeting)

// get single meeting details by meetingId
router.get('/get-meeting-details/:meetingId', authendiCate.authenticateToken, meetingController.getmeetingDetails);

module.exports = router;