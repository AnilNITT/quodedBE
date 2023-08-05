const express = require('express')
const router = express.Router();
const authendiCate = require("../../../helper/Jwt");
const EmployeeController = require('../../../Module/employee/controller/employeeController');


// add new Employee
router.post('/add-employee',authendiCate.authenticateToken,EmployeeController.AddEmployee);

// get all employees
router.get('/get-all-employee',authendiCate.authenticateToken,EmployeeController.GetAllEmployee);

// Get Employee by company provided employee Id
router.get('/get-employee/:id',authendiCate.authenticateToken,EmployeeController.GetSingleEmployee);

// Get All Employees of given Company Id
router.get('/get-all-employee/:c_id',authendiCate.authenticateToken,EmployeeController.GetEmployeeByCompany);

// Get employee sorted by Company Name
router.get('/get-sorted-employee',authendiCate.authenticateToken,EmployeeController.getEmployeeSortedByCompany);

// Delete Employee
router.delete('/delete-employee',authendiCate.authenticateToken,EmployeeController.deleteEmployee);

// Update Employee
router.patch('/update-employee',authendiCate.authenticateToken,EmployeeController.updateEmployee);


module.exports = router;