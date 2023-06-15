var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var taskController = require("../controller/taskController");
const multer = require('multer');
const TaskModal = require('../../../Model/TaskModal');

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
    cb(null, 'uploads/task/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.originalname.split('.')[0];
    cb(null, filename + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/task-attachement', upload.single('file'), function (req, res, next) {
  res.json({
    status: true,
    message: 'File uploaded successfully',
    name: req.file.filename,
    path: req.file.destination.replace('uploads', '') + req.file.filename,
    originalname: req.file.originalname
  });
});

router.get('/task-details-get', authendiCate.authenticateToken, taskController.taskDetails);
router.get('/all-task-depends-chat', authendiCate.authenticateToken, taskController.getAllTaskwithRoomId);
router.get('/all-task-depends-user', authendiCate.authenticateToken, taskController.getAllTaskwithUserId);
router.get('/get-task-comments', authendiCate.authenticateToken, taskController.getTaskComments);
router.post('/post-task-comments', authendiCate.authenticateToken, taskController.postComments);
router.post('/update-tesk', authendiCate.authenticateToken, taskController.updateTask);

const uploadMultiple = multer({ storage: storage, fileFilter: fileFilter });

router.post('/multiple-task-attchments', uploadMultiple.single('file'), function (req, res) { 
  let { taskId } = req.body;
  let attachmentsValue = req.file.destination.replace('uploads', '') + req.file.filename;
  TaskModal.updateOne(
    { _id: taskId },
    { "$push": { "Attachments": attachmentsValue } }
    , function (err, obj) {     
      res.json({
        status: true,
        message: 'File uploaded successfully',
        name: req.file.filename,
        path: req.file.destination.replace('uploads', '') + req.file.filename,
        originalname: req.file.originalname
      });
    });
});

router.get('/get-task-attchments', authendiCate.authenticateToken, taskController.getTaskAttchments);

module.exports = router;