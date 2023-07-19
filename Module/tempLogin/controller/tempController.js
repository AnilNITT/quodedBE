var tempLogin = require("../../../Model/TempLogin");
var Users = require("../../../Model/UserModel");
var sendEmail = require("../../../helper/sendEmail");
var { StatusCodes } = require("http-status-codes");
var jwt = require("jsonwebtoken");
var config = require("../../../helper/config");
var { generateId } = require("../../../helper/GenerateId");

// Send OTP to verify phone number and email address
exports.sendOtp = async function (req, res) {
  try {
    let { email } = req.body;

    if (email == undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "email or phonenumber is required",
        status: "fail",
      });
      return;
    }

    if (email.includes("@")) {
      let user = await Users.findOne({ email: email });

      if (user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "email already exits",
        });
        return;
      } else {
        let newUser = await tempLogin.create({ email: email.toLowerCase() });

        const otp = Math.floor(10000 + Math.random() * 90000);
        const mail = await sendEmail(email, otp);
        newUser.otp = otp;

        if (mail.status !== true) {
          res.status(StatusCodes.OK).json({
            status: false,
            message: "Email OTP send Error",
          });
          return;
        }

        await newUser.save();

        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP send to your Email for verification",
        });
        return;
      }
    } else {
      const phonenumber = Number(email);
      let user = await Users.findOne({ PhoneNumber: phonenumber });

      if (user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "phonenumber already exits",
        });
        return;
      } else {
        let newUser = await tempLogin.create({ phone: phonenumber });
        newUser.otp = 12345;
        await newUser.save();

        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP send to your Phone number for verificatiopn",
        });
        return;
      }
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

// verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    let { otp, email } = req.body;

    if (otp == undefined || email == undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "otp and email or phonenumber is required",
        status: "fail",
      });
      return;
    }

    if (email.includes("@")) {
      let data = await Users.findOne({ email: email });

      if (data) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "User email already exits",
        });
        return;
      }

      let user = await tempLogin
        .findOne({ email: email.toLowerCase() })
        .sort({ createdAt: -1 });

      if (!user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email not found",
        });
        return;
      }

      if (user.otp != otp) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Invalid otp",
          status: "fail",
        });
        return;
      } else {
        const user = new Users();
        user.email.push(email.toLowerCase());
        user.user_id = generateId();
        await user.save();

        const token = jwt.sign(
          {
            id: user._id,
          },
          // Import the secret key from helper file.
          config.secret_key,
          {
            expiresIn: "60000d", // expires in 24 hours
          }
        );

        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP Verification successfull",
          data: user,
          token: token,
        });
      }
    } else {
      let data = await Users.findOne({ PhoneNumber: Number(email) });

      if (data) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "phonenumber already exits",
        });
        return;
      }

      let user = await tempLogin
        .findOne({ phone: Number(email) })
        .sort({ createdAt: -1 });

      if (!user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "PhoneNumber not found",
        });
        return;
      }

      if (user.otp != otp) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Invalid otp",
          status: "fail",
        });
        return;
      } else {
        const user = new Users();
        user.PhoneNumber.push(Number(email));
        user.user_id = await generateId();
        await user.save();

        const token = jwt.sign(
          {
            id: user._id,
          },
          // Import the secret key from helper file.
          config.secret_key,
          {
            expiresIn: "60000d", // expires in 24 hours
          }
        );
        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP Verification successfull",
          data: user,
          token: token,
        });
      }
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

// verify OTP on update user profile
exports.Verification = async (req, res) => {
  try {
    let { otp, email } = req.body;

    if (otp == undefined || email == undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "otp and email or phonenumber is required",
        status: "fail",
      });
      return;
    }

    if (email.includes("@")) {
      let user = await tempLogin
        .findOne({ email: email.toLowerCase() })
        .sort({ createdAt: -1 });

      if (!user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email not found",
        });
        return;
      }

      if (user.otp != otp) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Invalid otp",
          status: "fail",
        });
        return;
      } else {
        res.status(StatusCodes.OK).json({
          status: true,
          message: "Verification successfull",
        });
      }
    } else {
      let user = await tempLogin
        .findOne({ phone: Number(email) })
        .sort({ createdAt: -1 });

      if (!user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "PhoneNumber not found",
        });
        return;
      }

      if (user.otp != otp) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Invalid otp",
          status: "fail",
        });
        return;
      } else {
        res.status(StatusCodes.OK).json({
          status: true,
          message: "Verification successfull",
        });
      }
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


exports.getAll = async (req, res) => {
  try {
    let user = await tempLogin.find().sort({createdAt: -1});

    res.status(StatusCodes.OK).json({
      status: true,
      data: user,
    });

  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};
