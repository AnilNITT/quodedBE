var Conversation = require("../../../Model/Conversation");
var UserModel = require("../../../Model/UserModel");
var MessageModal = require('../../../Model/MessageModal');
const TaskModal = require("../../../Model/TaskModal");
var ObjectId = require("mongoose").Types.ObjectId;

exports.conversationList = async (req, res) => {
    Conversation.find({
        members: { $in: [req.user.id] }
    }, function (err, user) {
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
    })
        .populate("senderId", "ProfileIcon Status firstname lastname email",)
        .populate('receiverId', "ProfileIcon Status firstname lastname email");
}

exports.coversationStart = async (req, res) => {
    let { receiverId } = req.body;

    const conversations = await Conversation.findOne({
        senderId: req.user.id,
        receiverId: receiverId
    })
        .populate("senderId", "ProfileIcon Status firstname lastname email",)
        .populate('receiverId', "ProfileIcon Status firstname lastname email");

            if (!conversations) {
                let conversation = new Conversation();
                conversation.members.push(req.user.id);
                conversation.members.push(receiverId);
                conversation.senderId = req.user.id;
                conversation.receiverId = receiverId;
                await conversation.save();
                console.log(conversation._id);
                const data = Conversation.findOne({ _id: ObjectId(conversation._id) })
                    .populate("senderId", "ProfileIcon Status firstname lastname email",)
                    .populate('receiverId', "ProfileIcon Status firstname lastname email");

                res.json({
                            status: true,
                            data: data,
                            message: "Founded results",
                        })
                        return;
            } else if (conversations) {
                res.json({
                    status: true,
                    data: conversations,
                    message: "Founded results",
                });
            }
        
}

exports.acceptTask = async (req, res) => {
    let { messageId } = req.body;
    if (messageId == undefined ) {
        res.status(500).send({
            error: "error",
            message: "messageId is required",
            status: "fail",
        });
        return;
    }else {
        MessageModal.findByIdAndUpdate({_id : messageId , type: "task"},{status : "In-progress"},function (err,obj){
            TaskModal.findByIdAndUpdate({_id : obj.taskId },{status : "In-progress"}, function (err,Findobj){
                console.log("obj",obj);
                res.status(200).send({               
                    message: "task status updated success",
                    status: true,
                });
            })
           
        })
    }
}