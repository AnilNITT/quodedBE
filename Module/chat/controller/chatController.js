var Conversation = require("../../../Model/Conversation");
var UserModel = require("../../../Model/UserModel");
var MessageModal = require("../../../Model/MessageModal");
const TaskModal = require("../../../Model/TaskModal");
var ObjectId = require("mongoose").Types.ObjectId;
// var cryptoen = require("../../../helper/Crypto");
var { StatusCodes } = require("http-status-codes");


exports.conversationList = async (req, res) => {

  const conversation = await Conversation.find({
    members: { $in: [req.user.id] },
  })
    .populate("senderId", "ProfileIcon Status name email")
    .populate("receiverId", "ProfileIcon Status name email");

  if (conversation) {
      

      const message = await MessageModal.find({receiverId: req.user.id}).sort("roomId")


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
      data: message,
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
  const { roomId } = req.body;

  /* let updateReceived = await MessageModal.updateMany(
      { receiverId: req.user.id, roomId: roomId },
      { seenStatus: "seened" });
    */

  let getAllmessage = await MessageModal.find({ roomId: new ObjectId(roomId) })
    .populate("taskId")
    .populate("meeting")
    .populate("senderId", "ProfileIcon Status name email")
    .populate("receiverId", "ProfileIcon Status name email");

  /* let data = getAllmessage.map((msg) =>{
        msg.text = cryptoen.decryption(msg.text);
        return msg
      }); */

  res.json({ data: getAllmessage });
};


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