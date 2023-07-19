var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var EmployeeController = require('../../../Module/employee/controller/employeeController');

router.post('/add-employee',authendiCate.authenticateToken,EmployeeController.AddEmployee)

router.get('/get-all-employee',authendiCate.authenticateToken,EmployeeController.GetAllEmployee)

router.get('/get-employee/:id',authendiCate.authenticateToken,EmployeeController.GetSingleEmployee)

module.exports = router;