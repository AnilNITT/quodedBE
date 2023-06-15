var express = require('express')
var router = express.Router();
const chatController = require("../controller/chatController");
var authendiCate = require("../../../helper/Jwt");

router.get('/conversation-list',authendiCate.authenticateToken,chatController.conversationList)
router.post('/coversation-start',authendiCate.authenticateToken,chatController.coversationStart)
router.post('/task-accept',authendiCate.authenticateToken,chatController.acceptTask)

module.exports = router;