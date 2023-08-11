const Admin = require("../../../Model/AdminModal");
const { StatusCodes } = require("http-status-codes");
const { generatePassword, comparePassword } = require("../../../helper/PassEncrypt");
var config = require("../../../helper/config");
const jwt = require('jsonwebtoken');

// Admin Signup
exports.adminsignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await Admin.findOne({ email });

    if (user) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Email Already Exists",
      });
      return;
    }

    let data = await Admin({
      name,
      email,
      password,
      role: "Admin",
    });

    data.password = await generatePassword(data.password);
    data.save();

    res.status(StatusCodes.OK).json({
      status: true,
      message: " Admin Created Successfully",
      data: data,
    });
    return;
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};


// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "" || password === "") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Email and password can not be empty!!!",
      });
      return;
    }

    const userRes = await Admin.findOne({ email });

    if (!userRes) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Email not exist",
      });
      return;
    }

    console.log(comparePassword(userRes.password, password));

    if (comparePassword(userRes.password, password)) {
      let token = jwt.sign(
        {
          id: userRes._id,
          email: userRes.email,
          role: userRes.role,
        },
        config.secret_key, // Import the secret key from helper file.
        {
          expiresIn: "60000d",
        }
      );

      res.status(StatusCodes.OK).json({
        status: true,
        message: "Login Successfull",
        data: userRes,
        token: token,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Incorrect Email Or Password",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "something went wrong",
      error: err,
    });
    return;
  }
};
