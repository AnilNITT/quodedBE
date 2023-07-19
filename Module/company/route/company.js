var express = require('express')
var router = express.Router();
var authendiCate = require("../../../helper/Jwt");
var CompanyController = require('../../../Module/company/controller/companyController');


// Add Company
router.post('/add-company',authendiCate.authenticateToken,CompanyController.AddCompany)

router.get('/get-all-company',authendiCate.authenticateToken,CompanyController.GetAllCompany)


module.exports = router;