var mongoose = require("mongoose");
Schema = mongoose.Schema;

// Define the user collection schema

var tempLoginSchema = new mongoose.Schema({
    phone: Number,
    email:String,
    otp:Number,
    createdAt: { 
        type: Date, 
        expires: 1, 
        default: Date.now() 
    }
})

module.exports = mongoose.model("tempLogin", tempLoginSchema, "tempLogin");
