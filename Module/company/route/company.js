var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var CompanyController = require('../../../Module/company/controller/companyController');


// Add Company
router.post('/add-company',authendiCate.authenticateToken,CompanyController.AddCompany)

// Get All Company
router.get('/get-all-company',authendiCate.authenticateToken,CompanyController.GetAllCompany)

// get company by company id
router.get('/get-company/:id',authendiCate.authenticateToken,CompanyController.GetCompany)

// update company name
router.patch('/update-company',authendiCate.authenticateToken,CompanyController.updateCompany)

// delete company by company id
router.delete('/delete-company',authendiCate.authenticateToken,CompanyController.deleteCompany)

module.exports = router;