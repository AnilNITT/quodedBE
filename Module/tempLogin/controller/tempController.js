var tempLogin = require("../../../Model/TempLogin");
var users = require("../../../Model/UserModel");
var { StatusCodes } = require("http-status-codes");


exports.sendOtp = async function (req, res) {
  try {
    let {email} = req.body;
    if(email == undefined){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "email or phonenumber is required",
        status: "fail",
      });
      return;
    }

    if(email.includes("@")) {

        let user = await users.findOne({email:email});
        if(user){
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "email already exits",
          });
          return;
        } else {
          let newUser = await tempLogin.create({email:email});
          newUser.otp = 12345;
          await newUser.save();
          res.status(StatusCodes.OK).json({
            status: true,
            message: "OTP send to your Email for verification",
          });
          return;
        }
      } else {
      
      const phonenumber = Number(email)
      let user = await users.findOne({PhoneNumber:phonenumber});
      if(user){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "phonenumber already exits",
        });
        return;
      } else {
        let newUser = await tempLogin.create({phone:phonenumber});
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
  try{
  let { otp, email } = req.body;

  if (otp == undefined || email == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "otp and email or phonenumber is required",
      status: "fail",
    });
    return;
  }

  if(email.includes("@")) {
  
    let user = await tempLogin.findOne({ email: email.toLowerCase()}).sort({'createdAt':-1});

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
      message: "OTP Verification successfull",
    });
  }
  } else {

  let user = await tempLogin.findOne({ phone: Number(email) }).sort({'createdAt':-1});;
  
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
      message: "OTP Verification successfull",
    });
  }
}
} catch (err) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    status: "fail",
    message: "Something went wrong",
    error:err
  });
  return;
}
};


