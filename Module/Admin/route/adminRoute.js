const express = require('express')
const router = express.Router();
const adminController = require("../controller/adminController");

// start conversation with new user
router.post('/register',adminController.adminsignup);

// start conversation with new user
router.post('/login',adminController.adminLogin);

module.exports = router;