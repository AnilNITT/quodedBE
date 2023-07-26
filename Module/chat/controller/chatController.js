var Conversation = require("../../../Model/Conversation");
var UserModel = require("../../../Model/UserModel");
var MessageModal = require("../../../Model/MessageModal");
const TaskModal = require("../../../Model/TaskModal");
var ObjectId = require("mongoose").Types.ObjectId;
// var cryptoen = require("../../../helper/Crypto");
var { StatusCodes } = require("http-status-codes");
var sendEmail = require("../../../helper/sendEmail");


exports.conversationList = async (req, res) => {
  const conversation = await Conversation.find({
    members: { $in: [req.user.id] },
  })
    .populate("senderId", "ProfileIcon Status name email")
    .populate("receiverId", "ProfileIcon Status name email")
    // .sort({createdAt: -1})
    .sort({ updatedAt: -1 });

  if (conversation) {
    /*     const message = await MessageModal.find({ receiverId: req.user.id }).sort(
      "roomId"
    ); */

    // const message = await MessageModal.find({ receiverId: req.user.id })

    /*  const message = await MessageModal.aggregate([
      { $match : {"receiverId": new ObjectId(req.user.id) }},
      {$group: { _id: '$roomId', count: {$sum: 1}}},
    ]) */

    // const message = await MessageModal.aggregate().sortByCount("roomId")

    /* const userList = await Conversation.aggregate([
      {
          $match: { $or:[
            
            { senderId: {$ne:new ObjectId(req.user.id) } },
            { receiverId: {$ne:new ObjectId(req.user.id) } }
          ]}
      },
      { $lookup: 
          {
              from: 'messages',
              let: { 'receiverId':new ObjectId(req.user.id) },
              pipeline: [
                  { 
                      $match: 
                      { $or: [
                        {
                          'seenStatus': "send",
                          $expr: { $eq: [ '$$receiverId', '$receiverId' ] }
                        },
                        {
                          'seenStatus': "received",
                          $expr: { $eq: [ '$$receiverId', '$receiverId' ] }
                        },
                      ]},
                  },
                  { $count: 'count' }
              ],
              as: 'messages'    
          }
      },
      { 
          $addFields: 
          {
              'unreadTotal': { $sum: '$messages.count' }
          }
      }
    ]);
 */
    res.json({
      status: true,
      data: conversation,
      message: "Founded results",
    });
  } else {
    res.json({
      status: true,
      data: "No conversation found",
      message: "Founded results",
    });
  }
};


exports.coversationStart = async (req, res) => {
  let { receiverId } = req.body;

  /*   const conversations = await Conversation.findOne({
    senderId: req.user.id,
    receiverId: receiverId,
  })
    .populate("senderId", "ProfileIcon Status firstname lastname email")
    .populate("receiverId", "ProfileIcon Status firstname lastname email");
 */

  const conversations = await Conversation.aggregate([
    {
      $match: {
        $or: [
          {
            senderId: new ObjectId(req.user.id),
            receiverId: new ObjectId(receiverId),
          },
          {
            receiverId: new ObjectId(req.user.id),
            senderId: new ObjectId(receiverId),
          },
        ],
      },
    },
  ]);

  if (conversations.length > 0) {
    await Conversation.populate(conversations, {
      path: "senderId receiverId",
      select: ["ProfileIcon", "Status", "email", "name"],
    });

    res.json({
      status: true,
      data: conversations,
      message: "Founded results",
    });
  } else {
    let conversation = new Conversation();
    conversation.members.push(req.user.id);
    conversation.members.push(receiverId);
    conversation.senderId = req.user.id;
    conversation.receiverId = receiverId;
    await conversation.save();

    const data = await Conversation.populate(conversation, {
      path: "senderId receiverId",
      select: ["ProfileIcon", "Status", "email", "name"],
    });

    res.json({
      status: true,
      data: data,
      message: "Founded results",
    });
    return;
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
        TaskModal.findByIdAndUpdate(
          { _id: obj.taskId },
          { status: "In-progress" },
          function (err, Findobj) {
            console.log("obj", obj);
            res.status(200).send({
              message: "task status updated success",
              status: true,
            });
          }
        );
      }
    );
  }
};


exports.getconversation = async (req, res) => {
  try{
  const { roomId } = req.body;

  /* let updateReceived = await MessageModal.updateMany(
      { receiverId: req.user.id, roomId: roomId },
      { seenStatus: "seened" });
    */

  let getAllmessage = await MessageModal.find({ roomId: new ObjectId(roomId) })
    .populate("taskId")
    .populate("meeting")
    .populate("checkId")
    .populate("shiftId")
    .populate({path:"oldMessageId",populate:{path:'senderId',select: "name createdAt"}})
    .populate("senderId", "ProfileIcon Status name email")
    .populate("receiverId", "ProfileIcon Status name email")

  /* let data = getAllmessage.map((msg) =>{
        msg.text = cryptoen.decryption(msg.text);
        return msg
      }); */

  res.json({ data: getAllmessage });
} catch (err) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    status: "fail",
    message: "Something went wrong",
    error: err,
  });
  return;
}
};


// send image auido vedio files in messages
exports.sendMultimediaMessage = async (req, res) => {
  try {
    const { roomId, type, senderId, receiverId, text } = req.body;

    let message = new MessageModal();
    message.type = type;
    message.roomId = roomId;
    message.senderId = senderId;
    message.receiverId = receiverId;
    message.text = text || "";

    if (req.files) {
      for (image of req.files) {
        message.Attachments.push(image.filename);
      }
    }

    await message.save();

    res.status(StatusCodes.OK).send({
      status: true,
      data: message,
      message: "message send successfully",
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


// get single conversation all multimedia files
exports.getFiles = async (req, res) => {
  try {

    const { roomId } = req.query;
    
    if (roomId === undefined || roomId.length < 24) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "Room Id is required",
        status: "fail",
      });
      return;
    }

    const messages = await MessageModal.aggregate([
      {
        $match: {
          $and: [
            {
              roomId: new ObjectId(roomId),
            },
            {
              type: "file",
            },
          ],
        },
      },
    ]);

    if (messages.length > 0) {
      res.status(StatusCodes.OK).send({
        status: true,
        files: messages,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "false",
        message: "No file found",
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


exports.conversatioUnseenCount = async (req, res) => {
  try {
    let updateReceived = await MessageModal.updateMany(
      { receiverId: req.user.id, seenStatus: "send" },
      { seenStatus: "received" }
    );

    let conversation = await Conversation.find({
      members: { $in: [req.user.id] },
    })
      // .sort({createdAt: -1})
      .sort({ updatedAt: -1 });

    /* 
  .populate("senderId", "ProfileIcon Status name email")
  .populate("receiverId", "ProfileIcon Status name email"); 
  */

    if (conversation) {
      conversation.map(async (data) => {
        const senderId =
          data.senderId == req.user.id ? data.receiverId : data.senderId;

        const message = await MessageModal.aggregate([
          {
            $match: {
              $and: [
                { senderId: senderId },
                { receiverId: new ObjectId(req.user.id) },
                // {seenStatus: 'send'},
              ],
            },
          },
        ]);
        // .sort({createdAt: -1});

        data.counts = message.filter(
          (data) => data.seenStatus === "send" || data.seenStatus === "received"
        ).length;
        await data.save();
      });

      await Conversation.populate(conversation, {
        path: "senderId receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });

      res.json({
        status: true,
        data: conversation,
        message: "Founded results",
      });

      /*     const message = await MessageModal.find({ receiverId: req.user.id }).sort(
      "roomId"
    ); */

      // const message = await MessageModal.find({ receiverId: req.user.id })

      /*  const message = await MessageModal.aggregate([
      { $match : {"receiverId": new ObjectId(req.user.id) }},
      {$group: { _id: '$roomId', count: {$sum: 1}}},
    ]) */

      // const message = await MessageModal.aggregate().sortByCount("roomId")

      /* const userList = await Conversation.aggregate([
      {
          $match: { $or:[
            
            { senderId: {$ne:new ObjectId(req.user.id) } },
            { receiverId: {$ne:new ObjectId(req.user.id) } }
          ]}
      },
      { $lookup: 
          {
              from: 'messages',
              let: { 'receiverId':new ObjectId(req.user.id) },
              pipeline: [
                  { 
                      $match: 
                      { $or: [
                        {
                          'seenStatus': "send",
                          $expr: { $eq: [ '$$receiverId', '$receiverId' ] }
                        },
                        {
                          'seenStatus': "received",
                          $expr: { $eq: [ '$$receiverId', '$receiverId' ] }
                        },
                      ]},
                  },
                  { $count: 'count' }
              ],
              as: 'messages'    
          }
      },
      { 
          $addFields: 
          {
              'unreadTotal': { $sum: '$messages.count' }
          }
      }
    ]);
 */
    } else {
      res.json({
        status: true,
        data: "No conversation found",
        message: "Founded results",
      });
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


exports.SearchConversation = async (req, res) => {
  try {
    const { name } = req.query;
    let conversation = await Conversation.aggregate([
      {
        $match: {
          members: { $in: [req.user.id] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "Sender",
        },
      },
      {
        $unwind: "$Sender",
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "Receiver",
        },
      },
      {
        $unwind: "$Receiver",
      },
      {
        $project: {
          roomId: 1, // 1 means show n 0 means not show
          senderId: 1,
          receiverId: 1,
          "Sender._id": 1,
          "Sender.name": 1,
          "Sender.ProfileIcon": 1,
          "Receiver._id": 1,
          "Receiver.name": 1,
          "Receiver.ProfileIcon": 1,
        },
      },
      // { $sort: { _id: 1 } }, // sort by count   no of user in one group
    ]);

    if (conversation) {
      
      const regex = new RegExp(name, "i"); // 'i' flag for case-insensitive search

      conversation = conversation.filter(
        (item) => regex.test(item.Sender.name) || regex.test(item.Receiver.name)
      );

      res.json({
        status: true,
        message: "Founded results",
        data: conversation,
      });
    } else {
      res.json({
        status: true,
        data: "No conversation found",
        message: "Founded results",
      });
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


exports.sendTextMessage = async (req, res) => {
  try{
  const { type, text, roomId,oldMessageId, senderId, receiverId } = req.body;

  let message = new MessageModal();
  message.type = type;
  message.roomId = roomId;
  message.senderId = senderId;
  message.receiverId = receiverId;
  message.text = text;

  if(oldMessageId){
    message.oldMessageId = oldMessageId;
  }

  await message.save();

  res.status(StatusCodes.OK).send({
    status: true,
    data: message,
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


exports.deleteTextMessage = async (req, res) => {
  try{
  const { messageId } = req.body;

  if (messageId === undefined || messageId === "") {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Select Message to Dekete",
    });
    return;
  }

  const message = await MessageModal.findById(messageId);

  if(!message) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "No Message found to Delete",
    });
    return;
  }

  await MessageModal.findByIdAndDelete(messageId);

  res.status(StatusCodes.OK).send({
    status: true,
    message: "Message deleted successfully",
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


exports.sendTextEmailAndPhone = async (req, res) => {
  try{

  const { senderId, receiverId, text, type } = req.body;

  if (receiverId == undefined || senderId == undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "sender & receiver user is required",
      status: "fail",
    });
    return;
  }

  const sender = await UserModel.findById(senderId);
  const receiver = await UserModel.findById(receiverId);

  if(!receiver || !sender){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Sender Or Receiver Not found",
    });
    return;
  }

  if (type === "email") {
      // let mail ={}
      const mail = await sendEmail({email:receiver.email[0],name:sender.name,text:text});

      if (mail.status !== true) {
        res.status(StatusCodes.OK).json({
          status: false,
          message: "Email Send Message Error",
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        status: true,
        message: "Mesage sent to Email successfully",
      });
      return;

  } else {

      res.status(StatusCodes.OK).json({
        status: true,
        message: "Message send to Phone number successfully",
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


exports.editTextMessage = async (req, res) => {
  try{
  const { messageId, text } = req.body;

  if (messageId === undefined || messageId === "") {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "Select Message to Dekete",
    });
    return;
  }

  const message = await MessageModal.findById(messageId);

  if(!message) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "No Message found to Delete",
    });
    return;
  }

  await MessageModal.findByIdAndUpdate({_id:messageId},{ text: text },{ new: true });

  res.status(StatusCodes.OK).send({
    status: true,
    message: "Message update successfully",
    // data : message
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

