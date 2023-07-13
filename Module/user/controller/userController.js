var users = require("../../../Model/UserModel");
var jwt = require("jsonwebtoken");
var config = require("../../../helper/config");
var sendEmail = require("../../../helper/sendEmail");
// var bcrypt = require("bcrypt");
// var jwt_decode = require("jwt-decode");
// var ObjectId = require("mongoose").Types.ObjectId;
var { StatusCodes } = require("http-status-codes");
const fs = require("fs");
var path = require("path");
var config = require("../../../helper/config");


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

  try {
    await user.save();
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
  } catch (err) {
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


// User login with this function
exports.login = async (req, res) => {
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

      let user = await users.findOne({ email: email.toLowerCase() });

      if (user) {
        const otp = Math.floor(10000 + Math.random() * 90000);
        const mail = await sendEmail(user.email, otp);

        if (mail.status !== true) {
          res.status(StatusCodes.OK).json({
            status: false,
            message: "Email OTP send Error",
          });
          return;
        }

        user.otp = otp;
        await user.save();
        res.status(StatusCodes.OK).json({
          status: true,
          message: "Login Authentication successfull and OTP send successfully",
        });
      } else {
        res.json({
          status: false,
          message: "User not found",
        });
      }
    } else {
      const phone = Number(email)
      let user = await users.findOne({ PhoneNumber: phone });

      if (user) {
        user.otp = 12345;
        await user.save();

        res.status(StatusCodes.OK).json({
          status: true,
          message: "Login Authentication successfull and OTP send successfully",
        });
        
      } else {
        res.json({
          status: false,
          message: "User not found",
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
      let user = await users.findOne({ email: email.toLowerCase() });

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
        let token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          // Import the secret key from helper file.
          config.secret_key,
          {
            expiresIn: "60000d",
          }
        );
        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP Verification successfull",
          userId: user._id,
          token: token,
        });
      }
    } else {
      let user = await users.findOne({ PhoneNumber: Number(email) });

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
          },
          // Import the secret key from helper file.
          config.secret_key,
          {
            expiresIn: "60000d",
          }
        );
        res.status(StatusCodes.OK).json({
          status: true,
          userId: user._id,
          token: token,
          message: "OTP Verification successfull",
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


// register user
/* exports.register = async(req,res)=>{
  try{
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
      let newUser = await users.create({email:email});
      newUser.otp = 12345;
      await newUser.save();
      res.status(StatusCodes.OK).json({
        status: true,
        message: "Registration Successfull, OTP send to your Phonenumber",
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
    let newUser = await users.create({PhoneNumber:phonenumber});
    newUser.otp = 12345;
    await newUser.save();

    res.status(StatusCodes.OK).json({
      status: true,
      message: "Registration Successfull, OTP send to your Phonenumber",
    });
    return;
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
}
 */



// update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const userdata = req.user;

    let file = req.file;
    if (file == undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "file is required",
        status: "fail",
      });
      return;
    }

    const user = await users.findById(userdata.id);

   /*  if (user.ProfileIcon === "") {
      user.ProfileIcon = req.file.filename;
    } else {
      const folderPath = path.join(
        path.resolve(process.cwd()),
        "/uploads/user/"
      );
      let filePath = path.join(folderPath, user.ProfileIcon);

      user.ProfileIcon = req.file.filename;

      // Delete the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`Deleted file: ${filePath}`);
      });
    } */

    user.ProfileIcon = req.file.filename;

    await user.save();

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Profile Picture update successfully",
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


// update profile
exports.updateProfile = async (req, res) => {
  try {
    // get Login user
    const userdata = req.user;

    // const { name, email, phonenumber, job_title } = req.body;
    const { name, email, phonenumber } = req.body;

    const user = await users.findById(userdata.id);

    const emailAuth = await users.findOne({ email: email.toLowerCase() });

    const phoneAuth = await users.findOne({ PhoneNumber: phonenumber });

    if (!emailAuth || emailAuth.email === user.email) {
      if (!phoneAuth || phoneAuth.PhoneNumber === user.PhoneNumber) {
        // update the user details
       /*  user.name = name;
        // user.job_title = job_title;
        user.email.push(email);
        user.PhoneNumber.push(phonenumber); */

        const data = {
          name: name,
          email: email,
          PhoneNumber: phonenumber,
        };


        const user = await users.findByIdAndUpdate(
          { _id: userdata.id },
          { $set: data },
          { new: true }
        );

        await user.save();

        return res.status(StatusCodes.OK).json({
          status: true,
          message: "Profile updated successfully",
          data: user,
        });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Phone number already used by User",
        });
        return;
      }
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Email already used by User",
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


// get All user
exports.getAllUser = async (req, res) => {
  try {
    const user = await users.find(req.query);

    if (user) {
      const index = user.findIndex((element) => {
        return element.id === req.user.id;
      });

      user.splice(index, 1);

      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Users found",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No User found",
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


// get login user
exports.getUser = async (req, res) => {
  try {
    const userdata = req.user;

    const user = await users.findById(userdata.id);

    if (user) {
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "User found",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "User not found",
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


// get User By ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId == undefined || userId === "") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "userId is required",
      });
      return;
    }

    const user = await users.findById(userId);
    if (user) {
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "User found",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "User not found",
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


// update user profile status (public or private)
exports.updateProfileStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (userId == undefined || userId === "") {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "userId is required",
      });
      return;
    }

    const user = await users.findById(userId);

    if (user) {
      user.profileType = status;
      await user.save();
      return res.status(StatusCodes.OK).json({
        status: true,
        message: `User profile Updated to ${status}`,
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "User not found",
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


// register user
exports.register = async (req, res) => {
  try {
    const { name, email, phonenumber } = req.body;

    const emailAuth = await users.findOne({ email: email.toLowerCase() });

    const phoneAuth = await users.findOne({ PhoneNumber: phonenumber });

    if (req.file) {
      if (!emailAuth) {
        if (!phoneAuth) {
          const data = {
            name: name,
            email: email,
            PhoneNumber: phonenumber,
            ProfileIcon: req.file.filename,
          };

          const user = await users.create(data);

          let token = jwt.sign(
            {
              id: user._id,
              email: user.email,
            },
            // Import the secret key from helper file.
            config.secret_key,
            {
              expiresIn: "24h", // expires in 24 hours
            }
          );

          res.status(StatusCodes.OK).json({
            status: true,
            userId: user._id,
            email: user.email,
            token: token,
            message: "Registration Successfull",
          });
          return;
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "Phone number already used by User",
          });
          return;
        }
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email already used by User",
        });
        return;
      }
    } else {
      if (!emailAuth) {
        if (!phoneAuth) {
          const data = {
            name: name,
            email: email,
            PhoneNumber: phonenumber,
          };

          const user = await users.create(data);

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
            email: user.email,
            token: token,
            message: "Registration Successfull",
          });
          return;
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "Phone number already used by User",
          });
          return;
        }
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email already used by User",
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


// register user
exports.registerOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (email == undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "email or phonenumber is required",
        status: "fail",
      });
      return;
    }

    if (email.includes("@")) {
      let user = await users.findOne({ email: email.toLowerCase() });

      if (user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email already exist",
        });
        return;
      } else {
        const user = await users.create(data);

        let token = jwt.sign(
          { id: user._id },
          // Import the secret key from helper file.
          config.secret_key,
          { expiresIn: "48h" } // expires in 24 hours
        );

        res.status(StatusCodes.OK).json({
          status: true,
          userId: user._id,
          token: token,
          message: "Registration Successfull and OTP send successfully",
        });
        return;

        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP send successfully... plz check your Email",
        });
      }
    } else {
      let user = await users.findOne({ PhoneNumber: Number(email) });

      if (user) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Phone number already exist",
        });
        return;
      } else {
        res.status(StatusCodes.OK).json({
          status: true,
          message: "OTP send successfully... plz check your Mobile",
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


// register user
exports.registration = async (req, res) => {
  try {
    const { email, phonenumber } = req.body;

    const emailAuth = await users.findOne({ email: email.toLowerCase() });

    const phoneAuth = await users.findOne({ PhoneNumber: phonenumber });

    if (req.file) {
      if (!emailAuth) {
        if (!phoneAuth) {
          const data = {
            name: name,
            email: email,
            PhoneNumber: phonenumber,
            ProfileIcon: req.file.filename,
          };

          const user = await users.create(data);

          let token = jwt.sign(
            {
              id: user._id,
              email: user.email,
            },
            // Import the secret key from helper file.
            config.secret_key,
            {
              expiresIn: "24h", // expires in 24 hours
            }
          );

          res.status(StatusCodes.OK).json({
            status: true,
            userId: user._id,
            email: user.email,
            token: token,
            message: "Registration Successfull",
          });
          return;
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "Phone number already used by User",
          });
          return;
        }
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email already used by User",
        });
        return;
      }
    } else {
      if (!emailAuth) {
        if (!phoneAuth) {
          const data = {
            name: name,
            email: email,
            PhoneNumber: phonenumber,
          };

          const user = await users.create(data);

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
            email: user.email,
            token: token,
            message: "Registration Successfull",
          });
          return;
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "Phone number already used by User",
          });
          return;
        }
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Email already used by User",
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


// get All user
exports.getAllUsers = async (req, res) => {
  try {
    const user = await users.find(req.query);

    if (user) {
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Users found",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "No User found",
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


// find user
exports.findtesting = async (req, res) => {
  const { name } = req.body;
  console.log(typeof `${name}`);
  const user = await users.find({ abc: { $in: name } });
  res.send(user);
};


// search user by name and Email
exports.search = async (req, res) => {
  try {
    const { search } = req.query;

    const user = await users.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: `${search}`, $options: "i" } },
            { email: { $regex: `${search}`, $options: "i" } },
            // { PhoneNumber: { $elemMatch: { $eq: Number(search) }}},
            { PhoneNumber: { $in: [Number(search)] } },
            // { PhoneNumber: Number(search) },
          ],
          $and: [
            // {profileType:"public"},
            { profileType: { $ne: "private" } }, // $ne not inlcuded
          ],
        },
      },
    ]);

    if (user.length > 0) {
      const index = user.findIndex((element) => {
        return element._id.toString() === req.user.id;
      });

      if (index >= 0) {
        user.splice(index, 1);
      }
    }

    if (user.length > 0) {
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "User found",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "User not found",
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


// get User By ID
exports.deleteEmail = async (req, res) => {

  try{
  const { userId, email } = req.body;

  if (userId == undefined || userId === "") {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "userId is required",
    });
    return;
  }

  const user = await users.findById(userId);

  if (user) {
    const index = user.email.findIndex((element) => {
      return element === email;
    });

    if (index < 0) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Email Not found",
      });
      return;
    }

    if (user.email.length > 1) {
      user.email.splice(index, 1);

      await user.save();

      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Email Deleted successfully",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "You Can't delete Primary Email",
      });
      return;
    }
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "User not found",
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


// get User By ID
exports.deletePhoneNo = async (req, res) => {

  try{
  const { userId, phone } = req.body;

  if (userId == undefined || userId === "") {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "userId is required",
    });
    return;
  }

  const user = await users.findById(userId);

  if (user) {
    const index = user.PhoneNumber.findIndex((element) => {
      return element === phone;
    });

    if (index < 0) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Phone Number Not found",
      });
      return;
    }

    if (user.PhoneNumber.length > 1) {
      user.PhoneNumber.splice(index, 1);

      await user.save();

      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Phone Number Deleted successfully",
        data: user,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "You Can't delete Primary Phone Number",
      });
      return;
    }
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "User not found",
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
