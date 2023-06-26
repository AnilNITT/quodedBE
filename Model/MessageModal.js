var mongoose = require("mongoose");

// Define the user collection schema
var messageSchema = new mongoose.Schema({
    type: {
      type: String,
      default: "message",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      default: null,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shifts",
      default: null,
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "meeting",
      default: null,
    },
    text: {
      type: String,
      default: "",
    },
    Attachments: {
      type: [{
          type: String,
        },
      ],
    },
    seenStatus: {
      type: String,
      enum: ["send", "received", "seened"],
      default: "send",
    },
    status: {
      type: String,
      enum: ["Pending", "In-progress", "Completed", "Overdue"],
      default: "Pending",
    },
},
{
    timestamps: true 
}
);

module.exports = mongoose.model("messages", messageSchema, "messages");