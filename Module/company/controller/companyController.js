var Company = require("../../../Model/CompanyModel");
var { StatusCodes } = require("http-status-codes");


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
