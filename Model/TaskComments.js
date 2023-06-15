var mongoose = require("mongoose");
Schema = mongoose.Schema;

// Define the comments collection schema

var commentSchema = new mongoose.Schema(
  {
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversations",
        default: null,
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users" 
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks",
        default: null,
    },
    commentstext: {
        type: String,
        default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comments", commentSchema, "comments");
