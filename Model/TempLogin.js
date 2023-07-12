var mongoose = require("mongoose");

// Define the temp Login collection schema
var tempLoginSchema = new mongoose.Schema({
    phone: Number,
    email:String,
    otp:Number,
    /* expireAt: {
        type: Date,
        // expires: 60000, // expires: 60,    means 60 seconds expires: "10m",    means 10 minutes
        // default: Date.now() + (1000*60*60*24) // for 1 day
        // default: Date.now() + (1000*120) // for 1 minute
    }, */
    createdAt: { 
        type: Date, 
        default: new Date(new Date().getTime() + 3 /* expires after 10 minutes */ * 60000) 
    }
},
{   
    timestamps:true,
}) 

// tempLoginSchema.index({ expireAt: 3 }, { expireAfterSeconds: 180000 });

module.exports = mongoose.model("tempLogin", tempLoginSchema, "tempLogin");
