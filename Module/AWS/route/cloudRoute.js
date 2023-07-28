var express = require('express')
var router = express.Router();
var cloudController = require("./../controller/cloudController");
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
        var path = `uploads/aws/`;
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


router.post('/upload-file',upload.single('image'),authendiCate.authenticateToken,cloudController.uploadData);
// router.post('/upload-files',upload.single('image'),authendiCate.authenticateToken,cloudController.uploadData);


module.exports = router;