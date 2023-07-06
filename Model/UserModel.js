var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

// Define the user collection schema

var UserSchema = new mongoose.Schema(
  {
    // firstname:{type:String, required : true},
    // lastname:{type:String, required : false},
    name: { type: String, required: false },
    userName: { type: String, required: false },
    email: { type: String, required: false},
    PhoneNumber: { type: Number, required: false },
    otp: { type: Number, required: false },
    ProfileIcon: { type: String, default: ""},
    job_title :{
      type: String, default: ""
    },
    // abc:[ { type: String, default :""}],
    // abc:{ type: [{type:String, default :""}]},
    // abc :{ type : Array , "default" : [] },
    // Password: { type: String, required: true },
    
    SocketId: { type: String },
    Status: { type: String, default: "offline" },
    profileType: { type: String, default: "public" },
  },
  { timestamps: true }
);


// Encrypt the password and save to the password with bcrypt.
UserSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("Password")) return next();

  if (user.Password.length == 0) return next();
  // generate a salt
  bcrypt.genSalt(12, function (err, salt) {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.Password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.Password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


module.exports = mongoose.model("users", UserSchema, "users");