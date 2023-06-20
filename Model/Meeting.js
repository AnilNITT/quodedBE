var mongoose = require('mongoose');

// Define the user collection schema
var meetingSchema = new mongoose.Schema({
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
    description: { 
        type: String, 
        default: "" 
    },
    Attachments: {
        type: [{
            type: String
        }]
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
        enum: ['Pending', 'In Process', 'Completed', 'Overdue'], 
        default: "Pending" 
    }
},
{ 
    timestamps: true 
}
);

module.exports = mongoose.model('meeting', meetingSchema, "meeting");