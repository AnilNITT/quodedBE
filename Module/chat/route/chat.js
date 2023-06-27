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
  

router.get('/conversation-list',authendiCate.authenticateToken,chatController.conversationList)
router.post('/coversation-start',authendiCate.authenticateToken,chatController.coversationStart)
router.post('/task-accept',authendiCate.authenticateToken,chatController.acceptTask)

router.post('/getconversation',authendiCate.authenticateToken,chatController.getconversation)

// send image auido vedio files in messages
router.post('/send-multimedia-message',upload.array('files'),authendiCate.authenticateToken,chatController.sendMultimediaMessage)

// get all  image auido vedio files in messages
router.get('/get-files', authendiCate.authenticateToken,chatController.getFiles)

module.exports = router;