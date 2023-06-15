var mongoose = require('mongoose');

// Define the Conversation collection schema
var ConversationSchema = new mongoose.Schema({
    members : {
        type : Array
    },
    senderId : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },
    receiverId : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },
},  
{ 
    timestamps: true 
}
);

module.exports =  mongoose.model('conversations', ConversationSchema,"conversations");