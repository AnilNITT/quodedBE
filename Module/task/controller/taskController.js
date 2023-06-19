var Conversation = require("../../../Model/Conversation");
var UserModel = require("../../../Model/UserModel");
var MessageModal = require("../../../Model/MessageModal");
var TaskModal = require("../../../Model/TaskModal");
var CommentsModal = require("../../../Model/TaskComments");


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

  const conversations =await Conversation.findOne(
    {
      senderId: req.user.id,
      receiverId: receiverId,
    }
      )
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
              .populate(
                "receiverId",
                "ProfileIcon Status firstname lastname email"
              );

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

exports.acceptTask = async (req, res) => {
  let { messageId } = req.body;
  if (messageId == undefined) {
    res.status(500).send({
      error: "error",
      message: "messageId is required",
      status: "fail",
    });
    return;
  } else {
    MessageModal.findByIdAndUpdate(
      { _id: messageId, type: "task" },
      { status: "In-progress" },
      function (err, obj) {
        res.status(200).send({
          message: "task status updated success",
          status: true,
        });
      }
    );
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

exports.updateTask = async (req, res) => {
  console.log("req.nbody", req.body);
  let { taskId, status } = req.body;
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
    TaskModal.findByIdAndUpdate(
      { _id: taskId },
      { status: status },
      { new: true },
      function (err, obj) {
        MessageModal.findOneAndUpdate(
          {
            taskId: taskId,
          },
          {
            status: status,
          },
          { new: true },
          function (err, messagobj) {
            res.status(200).send({
              message: obj,
              status: true,
            });
            return;
          }
        );
      }
    );
  }
};


/* exports.addTask = async(req,res) => {
  let { roomId, senderId, receiverId, description,endTime,Additional_Details } = req.body;

} */