var mongoose = require("mongoose");
Schema = mongoose.Schema;

// Define the user collection schema

var taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
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
    comments: [
      { 
        type: String, 
        default: "" 
      }
    ],
    /* members:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"users"
    }], */
    description: {
      type: String,
      default: "",
      text: true
    },
    Additional_Details: {
      type: String,
      default: "",
    },
    Attachments: {
      type: [
        {
          type: String,
        },
      ],
    },
    endTime: {
      type: Date,
      default: new Date(),
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Overdue"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tasks", taskSchema, "tasks");
