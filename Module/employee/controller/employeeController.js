var Employee = require("../../../Model/Employee");
var { StatusCodes } = require("http-status-codes");
var ObjectId = require("mongoose").Types.ObjectId;


// Add a new Employee
exports.AddEmployee = async (req, res) => {
  try {
    let { company_id, user_id } = req.body;

    if (company_id === undefined || user_id === "") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Company Id &  name is required",
      });
      return;
    }

    const employee = await Employee();
    employee.C_Id = company_id;
    employee.user_id = user_id;
    employee.employee_name = req.body.name;
    employee.company_emp_id = req.body.company_emp_id;
    employee.job_profile = req.body.job_profile;
    employee.company_email = req.body.company_email;
    employee.company_phone = req.body.company_phone;
    employee.project_id = req.body.project_id;

    await employee.save();

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Employee Added successfully",
      data: employee,
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


// Get All Employee
exports.GetAllEmployee = async (req, res) => {
  try {
    const employee = await Employee.aggregate([
      {
        $lookup: {
          from: "Company",
          localField: "C_Id",
          foreignField: "id",
          as: "Company",
        },
      },
      {
        $unwind: "$Company",
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "User",
        },
      },
      {
        $unwind: "$User", // get user value in object not likwe [{}]
      },
      {
        $project: {
          C_Id: 1,
          user_id: 1, // 1 means show n 0 means not show
          employee_name: 1,
          company_emp_id: 1,
          job_profile: 1,
          company_email: 1,
          company_phone: 1,
          project_id: 1,
          "User._id": 1,
          "User.name": 1,
          "User.ProfileIcon": 1,
          // "Company.id": 1,
          "Company.name": 1,
        },
      },
    ]);

    res.status(StatusCodes.OK).send({
      status: true,
      message: "successfull",
      data: employee,
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


// Get All Employee
exports.GetSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.aggregate([
      {
        $match: { company_emp_id: req.params.id },
      },
      {
        $lookup: {
          from: "Company",
          localField: "C_Id",
          foreignField: "id",
          as: "Company",
        },
      },
      {
        $unwind: "$Company",
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "User",
        },
      },
      {
        $unwind: "$User", // get user value in object not likwe [{}]
      },
      {
        $project: {
          C_Id: 1,
          user_id: 1, // 1 means show n 0 means not show
          employee_name: 1,
          company_emp_id: 1,
          job_profile: 1,
          company_email: 1,
          company_phone: 1,
          project_id: 1,
          "User._id": 1,
          "User.name": 1,
          "User.ProfileIcon": 1,
          // "Company.id": 1,
          "Company.name": 1,
        },
      },
    ]);

    if (employee.length > 0) {
      res.status(StatusCodes.OK).send({
        status: true,
        message: "successfull",
        data: employee,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Employee not found",
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
