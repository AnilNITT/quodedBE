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

exports.taskDetails = async (req, res) => {
  let { taskId } = req.query;
  if (taskId === undefined) {
    res.status(500).send({
      error: "error",
      message: "task Id is required",
      status: "fail",
    });
    return;
  } else {
    TaskModal.findOne({ _id: taskId }, function (err, obj) {
      res.status(200).send({
        status: true,
        taskDetails: obj,
      });
    })
      .populate("senderId", "ProfileIcon Status firstname lastname email")
      .populate("receiverId", "ProfileIcon Status firstname lastname email");
  }
};

exports.getAllTaskwithRoomId = async (req, res) => {
  let { roomId } = req.query;
  if (roomId === undefined) {
    res.status(500).send({
      error: "error",
      message: "task Id is required",
      status: "fail",
    });
    return;
  } else {
    console.log("roomId", roomId);
    TaskModal.find({ roomId: roomId }, function (err, obj) {
      console.log("obj", obj);
      res.status(200).send({
        status: true,
        taskDetails: obj,
      });
    })
      .populate("senderId", "ProfileIcon Status firstname lastname email")
      .populate("receiverId", "ProfileIcon Status firstname lastname email");
    return;
  }
};

exports.getAllTaskwithUserId = async (req, res) => {
  if (req.user.id === undefined) {
    res.status(500).send({
      error: "error",
      message: "User id is required",
      status: "fail",
    });
    return;
  } else {
    TaskModal.find({ receiverId: req.user.id }, function (err, obj) {
      res.status(200).send({
        status: true,
        taskDetails: obj,
      });
    })
      .populate("senderId", "ProfileIcon Status firstname lastname email")
      .populate("receiverId", "ProfileIcon Status firstname lastname email");
  }
};

exports.getTaskComments = async (req, res) => {
  let { taskId } = req.query;
  if (taskId === undefined) {
    res.status(500).send({
      error: "error",
      message: "task id is required",
      status: "fail",
    });
    return;
  } else {
    CommentsModal.find({ taskId: taskId }, function (err, obj) {
      res.status(200).send({
        status: true,
        taskDetails: obj,
      });
    })
      .populate("senderId", "ProfileIcon Status firstname lastname email")
      .populate("receiverId", "ProfileIcon Status firstname lastname email");
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

exports.postComments = async (req, res) => {
  let { taskId, roomId, senderId, commentstext } = req.body;
  if (req.user.id === undefined) {
    res.status(500).send({
      error: "error",
      message: "User Id is required",
      status: "fail",
    });
    return;
  } else if (taskId === undefined) {
    res.status(500).send({
      error: "error",
      message: "task Id is required",
      status: "fail",
    });
    return;
  } else {
    let comments = new CommentsModal();
    comments.senderId = req.user.id;
    comments.commentstext = commentstext;
    comments.taskId = taskId;
    comments.save(function (err, obj) {
      console.log(err);
      res.status(200).send({
        message: obj,
        status: true,
      });
      return;
    });
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

// Add Task
exports.addTask = async (req, res) => {

  const {roomId, type, senderId, receiverId, members, description, endTime } = req.body;

  const msgdata= {
    type: type,
    roomId: roomId,
    senderId: senderId,
    receiverId: receiverId,
  }

  let message = await MessageModal.create(msgdata);
  
  const task = {
    roomId: roomId,
    senderId: senderId,
    receiverId: receiverId,
    description: description,
    endTime: endTime,
  }

  let Task = await TaskModal.create(task);

  if(members){
    Task.members = members;
    /* for(const member of members){
      Task.members.push(member)
    } */
  }

  Task.Attachments.push(req.file ? req.file.filename : "");
  
  await Task.save();
  
  message.taskId = Task._id;
  await message.save();


  res.status(StatusCodes.OK).send({
    status: true,
    message: "task added successfully",
    data: Task,
  });
  return;

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

    const task = await TaskModal.findByIdAndUpdate(
      { _id: taskId },
      { status: status },
      { new: true }
    );

    if (!task) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "task not found",
      });
      return;
    }

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
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Something went wrong",
      error: err,
    });
    return;
  }
};