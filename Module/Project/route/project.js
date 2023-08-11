const express = require('express')
const router = express.Router();
const projectController = require("../controller/projectController");
var authendiCate = require("../../../helper/Jwt");


// Add New Project
router.post('/add-project',authendiCate.authenticateToken,projectController.addProject);


// Get All Project
router.get('/get-all',authendiCate.authenticateToken,projectController.getAllProject);


// Get single Project
router.get('/get/:id',authendiCate.authenticateToken,projectController.getProject);


// Delete Project
router.delete('/delete/:id',authendiCate.authenticateToken,projectController.deleteProject);


// Update Project
router.patch('/update/:id',authendiCate.authenticateToken,projectController.updateProject);


module.exports = router;