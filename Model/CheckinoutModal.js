var mongoose = require('mongoose');

// Define the user collection schema
var checkInSchema = new mongoose.Schema({
    type: {
        type: String,
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
        type: String,
    },
    lat: {
        type: Number,
    },
    long: {
        type: Number,
    },
    checkInTime : {
        type :Date, 
        // default : new Date()
    },
    checkOutTime: { 
        type: Date,
        // default: new Date() 
    },
},
{ 
    timestamps: true 
}
);

module.exports = mongoose.model('checkin', checkInSchema, "checkin");