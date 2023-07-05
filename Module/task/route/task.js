var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var taskController = require("../controller/taskController");
const multer = require('multer');
const TaskModal = require('../../../Model/TaskModal');
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
        var path = `uploads/task/`;
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


router.post('/task-attachement', upload.single('file'), function (req, res, next) {
  res.json({
    status: true,
    message: 'File uploaded successfully',
    name: req.file.filename,
    path: req.file.destination.replace('uploads', '') + req.file.filename,
    originalname: req.file.originalname
  });
});

// get task comments
router.get('/get-task-comments/:taskId', authendiCate.authenticateToken, taskController.getTaskComments);

// get task details by taskID
router.get('/get-task-details/:taskId', authendiCate.authenticateToken, taskController.getTaskDetails);

// get single chat all task
router.get('/chat-all-task', authendiCate.authenticateToken, taskController.getAllTaskwithRoomId);

// get single chat all files
router.get('/chat-all-files', authendiCate.authenticateToken, taskController.getChatAllFiles);

// get Login user All tasks
router.get('/user-all-task', authendiCate.authenticateToken, taskController.getAllTaskwithUserId);

// get Login user All tasks
router.get('/assigned-all-task', authendiCate.authenticateToken, taskController.getAllTaskwithUserIds);

// Add comments to task
router.post('/add-task-comments', authendiCate.authenticateToken, taskController.taskComments);

// update task of change the status of task
router.post('/update-task', authendiCate.authenticateToken, taskController.updateTask);

// add task
router.post('/add-task', upload.array('files'),authendiCate.authenticateToken, taskController.addTask);

// get task attachments
router.get('/get-task-attchments', authendiCate.authenticateToken, taskController.getTaskAttchments);

// upload task attachments
router.post('/task-attachments', upload.array('files'),taskController.uploadTaskAttachments)

// upload task attachments
router.post('/update-task-attachments', upload.array('files'),taskController.updateTaskAttachments)

// get task attachments
router.get('/get-all-task', authendiCate.authenticateToken, taskController.getAllTask);


// get task attachments
router.get('/get-date-sorted-task', authendiCate.authenticateToken, taskController.getSortedLoginUserTask);

// get task attachments
router.get('/get-month-sorted-task', authendiCate.authenticateToken, taskController.getSortedByMonthLoginUserTask);

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

module.exports = router
