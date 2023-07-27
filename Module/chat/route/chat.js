var express = require('express')
var router = express.Router();
const chatController = require("../controller/chatController");
var authendiCate = require("../../../helper/Jwt");
const multer = require('multer');
var fs = require("fs-extra");


// Define the allowed file types
const allowedFileTypes = ['png', 'jpg', 'jpeg', 'gif', "pdf"];

// Create a function to validate the file type
function fileFilter(req, file, cb) {

  if (allowedFileTypes.includes(file.originalname.split('.')[1])) {
    // Allow the file to be uploaded
    cb(null, true);
  } else {
    // Reject the file and send an error message
    cb(new Error('Invalid file type. Only PNG, JPEG, and GIF files are allowed.'));
  }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = `uploads/chat/`;
        fs.mkdirsSync(path);
        cb(null, path);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.originalname.split('.')[0].replace(" ","-");
      cb(null, filename + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});
  

// const upload = multer({ storage: storage, fileFilter: fileFilter });
const upload = multer({ storage: storage });


// send text message
router.post('/send-text-message',authendiCate.authenticateToken,chatController.sendTextMessage);


// send text message to Email and phone Number
router.post('/send-message',authendiCate.authenticateToken,chatController.sendTextEmailAndPhone);

// delete text message
router.delete('/delete-text-message',authendiCate.authenticateToken,chatController.deleteTextMessage);

// update text message
router.post('/update-text-message',authendiCate.authenticateToken,chatController.editTextMessage);

// get login user conversation list
router.get('/conversation-list',authendiCate.authenticateToken,chatController.conversationList)

// start conversation with new user
router.post('/coversation-start',authendiCate.authenticateToken,chatController.coversationStart)

// accept the task
router.post('/task-accept',authendiCate.authenticateToken,chatController.acceptTask)

// get single conversation
router.post('/getconversation',authendiCate.authenticateToken,chatController.getconversation)

// search user in conversation list
router.post('/search-user',authendiCate.authenticateToken,chatController.SearchConversation)

// get login user conversations with count of new messages
router.get('/conversationcount',authendiCate.authenticateToken,chatController.conversatioUnseenCount)

// send image auido vedio files in messages
router.post('/send-multimedia-message',upload.array('files'),authendiCate.authenticateToken,chatController.sendMultimediaMessage)

// get all  image auido vedio files in messages
router.get('/get-files', authendiCate.authenticateToken,chatController.getFiles)


router.post('/get-data-for-task', authendiCate.authenticateToken,chatController.getDataForTask)

module.exports = router;