const Employee = require("../../../Model/Employee");
const { StatusCodes } = require("http-status-codes");
// var ObjectId = require("mongoose").Types.ObjectId;


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
          foreignField: "user_id",
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
          "User.email": 1,
          "Company.id": 1,
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


// Get Employee by company provided employee Id
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
          foreignField: "user_id",
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
          "User.email": 1,
          "User.ProfileIcon": 1,
          "Company.id": 1,
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


// Get All Employees of given Company Id
exports.GetEmployeeByCompany = async (req, res) => {
  try {

    const employee = await Employee.aggregate([
      {
        $match: { C_Id : Number(req.params.c_id) },
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
          foreignField: "user_id",
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
          "User.email": 1,
          "User.ProfileIcon": 1,
          "Company.id": 1,
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
    } 
    else {
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


// Get employee sorted by Company Name
exports.getEmployeeSortedByCompany = async (req, res) => {
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
          foreignField: "user_id",
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
          "User.email": 1,
          "User.ProfileIcon": 1,
          "Company.id": 1,
          "Company.name": 1,
        },
      },
      {
        $group: {
          _id:"$Company.name",
          count: { $sum: 1 },
          data: { $push: "$$ROOT" }, // show all params
        }
      },
      { 
        $sort: { _id: -1 } 
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


// Delete Employee by Id
exports.deleteEmployee = async (req, res) => {
  try {
    const {employee_id} = req.body;

    let employee = await Employee.findById(employee_id);

    if(!employee){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No employee found",
      });
      return;
    } 
    else {

    await Employee.findByIdAndDelete(employee_id);

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Employee deleted successfully",
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


// Update Employee
exports.updateEmployee = async (req, res) => {
  try {

    const {employee_id, name, company_emp_id, job_profile, company_email, company_phone, project_id} = req.body;

    let employee = await Employee.findById(employee_id);

    if(!employee){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No employee found",
      });
      return;
    } 
    else {
    
    // update the Employee Data
    employee = await Employee.findByIdAndUpdate(employee_id,req.body,{new:true});

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Employee Data updated successfully",
      data:employee
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