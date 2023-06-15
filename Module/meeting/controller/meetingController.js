var Meeting = require("../../../Model/Meeting");
var jwt = require("jsonwebtoken");
var config = require('../../../helper/config');
var bcrypt = require('bcrypt');
var ObjectId = require('mongoose').Types.ObjectId;
// password and confirm password validation here

// Search the user 
exports.getMeetings = (req, res) => {
    console.log("userid", req.user.id)
    console.log({ senderId: ObjectId(req.user.id) }, { receiverId: req.user.id })
    Meeting.find({ $or: [{ senderId: req.user.id }, { receiverId: req.user.id }] }, function (err, obj) {
        res.json({
            status: true,
            meeting: obj,
            message: "Founded results",
        });
    })
}


// change meeting status 
// exports.changeMeetings = (req, res) => {   
//     Meeting.findByIdAndUpdate({ _id : req.body.taskId },{ status :  } ,function (err, obj) {
//         res.json({
//             status: true,
//             meeting: obj,
//             message: "Founded results",
//         });
//     })
// }