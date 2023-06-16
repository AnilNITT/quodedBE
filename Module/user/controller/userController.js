var users = require("../../../Model/UserModel");
var jwt = require("jsonwebtoken");
var config = require("../../../helper/config");
var bcrypt = require("bcrypt");
var jwt_decode = require("jwt-decode");
var ObjectId = require("mongoose").Types.ObjectId;
var { StatusCodes } = require("http-status-codes");

// password and confirm password validation here
function comparePassword(password, cpassword) {
  if (password == cpassword) {
    return true;
  } else {
    return false;
  }
}

// Save the user data in mongodb with this function
async function registerUser(req, res) {
  var user = new users();
  user.userName = req.body.username ? req.body.username : "";
  user.firstname = req.body.firstname ? req.body.firstname : "";
  user.lastname = req.body.lastname ? req.body.lastname : "";
  user.email = req.body.email ? req.body.email.toLowerCase() : "";
  user.Password = req.body.password ? req.body.password : "";
  user.PhoneNumber = req.body.phonenumber ? req.body.phonenumber : "";
  
  try{
      await user.save()
      let token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        // Import the secret key from helper file.
        config.secret_key
        // {
        //     // expiresIn: "24h", // expires in 24 hours
        // }
      );
      res.status(StatusCodes.OK).json({
        status: true,
        token: token,
        userId: user._id,
        name: user.firstname + " " + user.lastname,
        email: user.email,
        message: "Register successfull",
      });
  } catch(err){
    console.log(err);
  }
}

// User register with this function
/* exports.register = async (req, res) => {
  let { email, password, confirmpassword, phonenumber } = req.body;
  if (email == undefined && phonenumber == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "Email or phonenumber is required",
      status: "fail",
    });
    return;
  }
  if (password == undefined && confirmpassword == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "password and confirmpassword is required",
      status: "fail",
    });
    return;
  }
  let ExistUser = await users.findOne({ email: email.toLowerCase() });
  if (ExistUser) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "Email already exits",
      status: "fail",
    });
    return;
  }
  if (comparePassword(password, confirmpassword)) {
    registerUser(req, res);
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "password and confirmpassword must match",
      status: "fail",
    });
    return;
  }
};
 */


// User login with this function
exports.login = async (req, res) => {
  let { phonenumber } = req.body;
  
  if (phonenumber == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "phonenumber is required",
      status: "fail",
    });
    return;
  }

  let user = await users.findOne({PhoneNumber:phonenumber});

  if (user) {
        let token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          // Import the secret key from helper file.
          config.secret_key
          // {
          //     expiresIn: "24h", // expires in 24 hours
          // }
        );

        user.otp = 12345;
        await user.save();

        res.status(StatusCodes.OK).json({
          status: true,
          // userId: user._id,
          // name: user.firstname + " " + user.lastname,
          email: user.email,
          // token: token,
          message: "Login Authentication successfull and OTP send successfully",
        });
  } else {
    res.json({
      status: false,
      message: "Phone number not valid",
    });
  }
};

// Search the user
exports.findUser = (req, res) => {
  let { email } = req.query;
  if (email == undefined) {
    res.status(500).send({
      error: "error",
      message: "Email is required",
      status: "fail",
    });
    return;
  }

  users.find(
    {
      email: {
        $regex: `^${email}`,
        $options: "i",
        $ne: req.user.email,
      },
    },
    {
      email: 1,
      firstname: 1,
      lastname: 1,
      Status: 1,
      ProfileIcon: 1,
    },
    function (err, user) {
      let myArray = user.filter(function (obj) {
        return obj._id.toString() !== req.user.id;
      });

      res.json({
        status: true,
        users: myArray,
        message: "Founded results",
      });
    }
  );
};

// update profile picture
exports.updateProfilePicture = async (req, res) => {

  const userdata = req.user

  let file = req.file;
  if (file == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "file is required",
      status: "fail",
    });
    return;
  }

  const user = await users.findById(userdata.id);

  user.ProfileIcon = req.file.filename;
  await user.save();
  return res.status(StatusCodes.OK).json({
    status: true,
    message: "Profile Picture update successfully",
  });
};

// update profile
exports.updateProfile = async (req, res) => {

  const userdata = req.user

  const { firstname, lastname, PhoneNumber } = req.body;

  const data = {
    firstname: firstname,
    lastname: lastname,
    PhoneNumber: PhoneNumber,
  };

  const user = await users.findByIdAndUpdate(
    { _id: userdata.id },
    { $set: data },
    { new: true }
  );

  if (user) {
    return res.status(StatusCodes.OK).json({
      status: true,
      data: user,
      message: "Profile updated successfully",
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Something went wrong",
      status: "fail",
    });
    return;
  }
};

// register user
exports.register = async(req,res)=>{
  try{
  let {phonenumber} = req.body;
  if(phonenumber == undefined){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "phonenumber is required",
      status: "fail",
    });
    return;
  }
  let user = await users.findOne({PhoneNumber:phonenumber});
  if(user){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "phonenumber already exits",
    });
    return;
  } else {
    let newUser = await users.create({
      PhoneNumber: phonenumber,
    });
    newUser.otp = 12345;
    await newUser.save();
    res.status(StatusCodes.OK).json({
      status: true,
      message: "Registration Successfull, OTP send to your Phonenumber",
    });
  }
  }
  catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error:err
    });
    return;
  }
}

// verify OTP
exports.verifyOtp = async (req, res) => {
  let { otp, phonenumber } = req.body;

  if (otp == undefined || phonenumber == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "otp and phonenumber is required",
      status: "fail",
    });
    return;
  }

  let user = await users.findOne({ PhoneNumber: phonenumber });

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
    let token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      // Import the secret key from helper file.
      config.secret_key
      // {
      //     expiresIn: "24h", // expires in 24 hours
      // }
    );
    res.status(StatusCodes.OK).json({
      status: true,
      userId: user._id,
      token: token,
      message: "OTP Verification successfull",
    });
  }
};