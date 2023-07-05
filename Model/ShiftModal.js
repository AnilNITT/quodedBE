var mongoose = require('mongoose');

// Define the user collection schema
var shiftSchema = new mongoose.Schema({
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
        enum: ['Pending', 'Accept', 'Reject', 'Transfer'], 
        default: "Pending" 
    }
},
{ 
    timestamps: true 
}
);


module.exports = mongoose.model('shifts', shiftSchema, "shifts");