var Conversation = require("../../../Model/Conversation");
// var UserModel = require("../../../Model/UserModel");
var MessageModal = require("../../../Model/MessageModal");
var TaskModal = require("../../../Model/TaskModal");
var CommentsModal = require("../../../Model/TaskComments");
var { StatusCodes } = require("http-status-codes");

exports.conversationList = async (req, res) => {
  Conversation.find(
    {
      members: { $in: [req.user.id] },
    },
    function (err, user) {
      if (user) {
        res.json({
          status: true,
          data: user,
          message: "Founded results",
        });
      } else {
        res.json({
          status: true,
          data: "No conversation found",
          message: "Founded results",
        });
      }
    }
  )
    .populate("senderId", "ProfileIcon Status firstname lastname email")
    .populate("receiverId", "ProfileIcon Status firstname lastname email");
};

exports.coversationStart = async (req, res) => {
  let { receiverId } = req.body;

  const conversations = await Conversation.findOne({
    senderId: req.user.id,
    receiverId: receiverId,
  })
    .populate("senderId", "ProfileIcon Status firstname lastname email")
    .populate("receiverId", "ProfileIcon Status firstname lastname email");

  if (!conversations) {
    let conversation = new Conversation();
    conversation.members.push(req.user.id);
    conversation.members.push(receiverId);
    conversation.senderId = req.user.id;
    conversation.receiverId = receiverId;
    await conversation.save();
    const data = await Conversation.findOne({ _id: conversation._id })
      .populate("senderId", "ProfileIcon Status firstname lastname email")
      .populate("receiverId", "ProfileIcon Status firstname lastname email");

    res.json({
      status: true,
      data: data,
      message: "Founded results",
    });
    return;
  } else if (conversations) {
    res.json({
      status: true,
      data: conversations,
      message: "Founded results",
    });
  }
};

exports.getTaskAttchments = async (req, res) => {
  let { taskId } = req.query;
  if (taskId === undefined) {
    res.status(500).send({
      error: "error",
      message: "task id is required",
      status: "fail",
    });
    return;
  } else {
    TaskModal.find({ _id: taskId }, function (err, obj) {
      res.status(200).send({
        status: true,
        taskDetails: obj,
      });
    })
      .populate("senderId", "ProfileIcon Status firstname lastname email")
      .populate("receiverId", "ProfileIcon Status firstname lastname email");
  }
};

exports.acceptTask = async (req, res) => {
  try {
    let { messageId } = req.body;

    if (messageId == undefined) {
      res.status(500).send({
        error: "error",
        message: "messageId is required",
        status: "fail",
      });
      return;
    }

    const message = await MessageModal.findByIdAndUpdate(
      { _id: messageId, type: "task" },
      { status: "In-progress" }
    );

    res.status(StatusCodes.OK).send({
      message: "task status updated successfully",
      status: true,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// update the task or Task status
exports.updateTask = async (req, res) => {
  try {
    let { taskId, status } = req.body;

    if (req.user.id === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "User Id is required",
        status: "fail",
      });
      return;
    } else if (taskId === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "task Id is required",
        status: "fail",
      });
      return;
    }

    const task = await TaskModal.findById(taskId);

    if(task) {
      const task = await TaskModal.findByIdAndUpdate(
        { _id: taskId },
        { status: status },
        { new: true }
      );
  
      const msgs = await MessageModal.findOneAndUpdate(
        { taskId: taskId },
        { status: status },
        { new: true }
      );
  
      res.status(StatusCodes.OK).send({
        status: true,
        message: "task status updated successfully",
        data: task,
      });
      return; 
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "task not found",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// upload Task Attachments
exports.uploadTaskAttachments = async (req, res) => {
  try {
    const imagespath = [];
    if (req.files) {
      for (image of req.files) {
        imagespath.push(image.filename);
      }
    }
    res.status(StatusCodes.OK).send({
      status: true,
      data: imagespath,
      message: "task attachments uploaded successfully",
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// get task details
exports.getTaskDetails = async (req, res) => {
  try {
    let { taskId } = req.params;

    if (taskId === undefined || taskId.length < 24) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "Incorrect task Id",
        status: "fail",
      });
      return;
    } else {
      const task = await TaskModal.findOne({ _id: taskId })
        .populate("senderId", "ProfileIcon Status name email")
        .populate("receiverId", "ProfileIcon Status name email");

      if (task) {

        if(new Date().getTime() > new Date(task.endTime).getTime()){
          if(task.status != "Completed"){
            task.status = "Overdue";
            await task.save();
          }
        }

        res.status(StatusCodes.OK).send({
          status: true,
          taskDetails: task,
        });
        return;
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "false",
          message: "No Task found",
        });
        return;
      }
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// add post comments
exports.postComments = async (req, res) => {
  try{
  let { taskId, roomId, senderId, receiverId, commentstext } = req.body;

  if (receiverId === undefined || taskId === undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: "error",
      message: "User Id and Task Id is required",
      status: "fail",
    });
    return;
  }

  let comments = new CommentsModal();
  comments.senderId = senderId;
  comments.receiverId = receiverId;
  comments.roomId = roomId;
  comments.commentstext = commentstext;
  comments.taskId = taskId;

  await comments.save();
  res.status(StatusCodes.OK).send({
    status: true,
    message: comments,
  });
  return;
} catch (err) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    status: "fail",
    message: "Something went wrong",
    error: err,
  });
  return;
}
};


// Add Task
exports.addTask = async (req, res) => {
  try {
    const {
      roomId,
      type,
      senderId,
      receiverId,
      attachments,
      additional_details,
      description,
      endTime,
    } = req.body;

    let counts = 0;
    let lengths = roomId.length;

    roomId.forEach(async (rooms, index) => {
      receiverId.forEach(async (receivers, rindex) => {
        if (index === rindex) {
          const msgdata = {
            type: type,
            roomId: rooms,
            senderId: senderId,
            receiverId: receivers,
          };

          let message = await MessageModal.create(msgdata);

          const task = {
            roomId: rooms,
            senderId: senderId,
            receiverId: receivers,
            description: description,
            additional_details: additional_details,
            endTime: endTime,
          };

          let Task = await TaskModal.create(task);

          if (attachments) {
            // Task.Attachments.push(req.file ? req.file.filename : "");
            Task.Attachments.push(...attachments);
          }

          await Task.save();

          message.taskId = Task._id;
          await message.save();

          counts++;

          if (lengths === counts) {
            res.status(StatusCodes.OK).send({
              status: true,
              message: "task added successfully",
            });
            return;
          }
        }
      });
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};

// get Task Comments
exports.getTaskComments = async (req, res) => {
  try {
    let { taskId } = req.params;

    if (taskId === undefined || taskId.length < 24) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "task id is required",
        status: "fail",
      });
      return;
    }
    const comments = await CommentsModal.find({ taskId: taskId })
      .populate("senderId", "ProfileIcon Status name email")
      .populate("receiverId", "ProfileIcon Status name email");

    if (comments.length > 0) {
      res.status(StatusCodes.OK).send({
        status: true,
        comments: comments,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "false",
        comments: comments,
        message: "No comments found",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};

// get Perticular User Assign Task
exports.getAllTaskwithUserId = async (req, res) => {
  try {
    const task = await TaskModal.find({ receiverId: req.user.id })
      .populate("senderId", "ProfileIcon Status name email")
      .populate("receiverId", "ProfileIcon Status name email");

    if (task.length > 0) {
      res.status(StatusCodes.OK).send({
        status: true,
        tasks: task,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "false",
        tasks: task,
        message: "No Task found",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};


// get All task with RoomID
exports.getAllTaskwithRoomId = async (req, res) => {
  try {
    let { roomId } = req.query;

    if (roomId === undefined || roomId.length < 24) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "Room Id is required",
        status: "fail",
      });
      return;
    }

    const task = await TaskModal.find({ roomId: roomId })
      .populate("senderId", "ProfileIcon Status name email")
      .populate("receiverId", "ProfileIcon Status name email");

    if (task.length > 0) {
      res.status(StatusCodes.OK).send({
        status: true,
        tasks: task,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "false",
        tasks: task,
        message: "No Task found",
      });
      return;
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};
