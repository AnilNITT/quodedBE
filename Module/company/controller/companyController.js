const Company = require("../../../Model/CompanyModel");
const { StatusCodes } = require("http-status-codes");


// Add a new Company
exports.AddCompany = async (req, res) => {
  try {
    let { name } = req.body;

    if (name === undefined || name === "") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Company name is required",
      });
      return;
    }

    // check if company is already registered
    const data = await Company.findOne({ name: name });
    if (data) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Company name already exists",
      });
      return;
    }

    const company = await Company.create({ name: name.toLowerCase() });

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Company Added successfully",
      data: company,
    });
    return;
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// Get All Company
exports.GetAllCompany = async (req, res) => {
  try {
    const company = await Company.find(req.query);

    res.status(StatusCodes.OK).send({
      status: true,
      message: "successfull",
      data: company,
    });
    return;
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// Get Single Company
exports.GetCompany = async (req, res) => {
  try {

    const company = await Company.findOne({id:req.params.id});

    if(!company){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No company found",
      });
      return;
    } else {
    res.status(StatusCodes.OK).send({
      status: true,
      message: "successfull",
      data: company,
    });
    return;
  }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// Update Company
exports.updateCompany = async (req, res) => {
  try {

    const {company_id, name} = req.body;

    let company = await Company.findOne({id:company_id});

    if(!company){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No company found",
      });
      return;
    } else {
    
    // edit the name of Company
    // await Company.findByIdAndUpdate({id:company_id},{name:name},{new: true});
    company.name = name;
    await company.save();

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Company Data Updated successfull",
      data: company,
    });
    return;
  }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// Delete Company
exports.deleteCompany = async (req, res) => {
  try {

    const {company_id} = req.body;

    let company = await Company.findOne({id:company_id});

    if(!company){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No company found",
      });
      return;
    } else {
    
    // edit the name of Company
    await Company.deleteOne({id:company_id});

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Company deleted successfully",
    });
    return;
  }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};