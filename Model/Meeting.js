var mongoose = require('mongoose');

// Define the user collection schema
var meetingSchema = new mongoose.Schema({
    name :{
        type : String,
    },
    roomId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'conversations' , 
        default: null 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' ,
        default : null
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        default : null 
    },
    location: {
        type: String
    },
    repeat: {
        type: String
    },
    dates: [
      {
        startTime: {
          type: Date,
          default: new Date(),
        },
        endTime: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    description: { 
        type: String, 
        default: "" 
    },
    startTime : {
        type :Date, 
        default : new Date()
    },
    endTime: { 
        type: Date, 
        default: new Date() 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'RSVP', 'Revise Date', 'Deny Meeting'], 
        default: "Pending" 
    }
},
{ 
    timestamps: true 
}
);

module.exports = mongoose.model('meeting', meetingSchema, "meeting");