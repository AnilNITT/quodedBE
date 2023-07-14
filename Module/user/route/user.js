var express = require('express')
var router = express.Router();
var userController = require("../controller/userController")
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
        var path = `uploads/user/`;
        fs.mkdirsSync(path);
        cb(null, path);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.originalname.split('.')[0].replace(" ","-");
      cb(null, filename + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

  
const upload = multer({ storage: storage, fileFilter: fileFilter });


// Split the route 
// Register route.
router.post('/register', upload.single('file'),userController.register)

router.post('/registerOtp', userController.registerOTP)

// Login route.
router.post('/login',userController.login)


// otp verify route
router.post('/verifyotp',userController.verifyOtp)

// get login user
router.get('/getuser', authendiCate.authenticateToken, userController.getUser)


// get All user
router.get('/getalluser', authendiCate.authenticateToken, userController.getAllUser)

router.get('/getallusers', userController.getAllUsers)

// get user By ID
router.post('/getuserbyid', authendiCate.authenticateToken, userController.getUserById)


// Uplaod profile image
router.post('/updateprofileimage', upload.single('file'),authendiCate.authenticateToken, userController.updateProfilePicture)


// update user profile
router.post('/updateuser', upload.single('file'),authendiCate.authenticateToken, userController.updateProfile)


// Search user for start conversation
// router.get('/search',authendiCate.authenticateToken,userController.findUser)
router.get('/search',authendiCate.authenticateToken,userController.search)


router.post('/test',authendiCate.authenticateToken,userController.findtesting)

// make profile public or private
router.post('/update-profile-status', authendiCate.authenticateToken, userController.updateProfileStatus)


router.delete('/delete-email', authendiCate.authenticateToken, userController.deleteEmail)

router.delete('/delete-phoneno', authendiCate.authenticateToken, userController.deletePhoneNo)

module.exports = router

