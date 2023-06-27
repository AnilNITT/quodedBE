var Meeting = require("../../../Model/Meeting");
var jwt = require("jsonwebtoken");
var config = require("../../../helper/config");
var bcrypt = require("bcrypt");
var ObjectId = require("mongoose").Types.ObjectId;
// password and confirm password validation here

// Search the user
exports.getMeetings = (req, res) => {
  console.log("userid", req.user.id);
  console.log({ senderId: ObjectId(req.user.id) }, { receiverId: req.user.id });
  Meeting.find(
    { $or: [{ senderId: req.user.id }, { receiverId: req.user.id }] },
    function (err, obj) {
      res.json({
        status: true,
        meeting: obj,
        message: "Founded results",
      });
    }
  );
};


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


// Add Meeting
exports.addMeeting = async (req, res) => {
  try {
    const { name, roomId, type, senderId, receiverId, location, description, startTime, endTime } = req.body;

    let counts = 0;
    let lengths = roomId.length;

    if(lengths > 0) {
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

          const data = {
            name: name,
            roomId: rooms,
            senderId: senderId,
            receiverId: receivers,
            location:location,
            description: description,
            startTime: startTime,
            endTime: endTime,
          };

          let meeting = await Meeting.create(data);
          await meeting.save();
          
        /* 
        if (attachments) {
            // Task.Attachments.push(req.file ? req.file.filename : "");
            Task.Attachments.push(...attachments);
        } */

          message.taskId = meeting._id;
          await message.save();

          counts++;

          if (lengths === counts) {
            res.status(StatusCodes.OK).send({
              status: true,
              message: "Meeting added successfully",
            });
            return;
          }
        }
      });
    });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: "fail",
            message: "No RoomID found",
            error: err,
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


//
exports.createMeeting = async(req,res) => {
  const { topic, start_time, duration } = req.body;

  const zoomApiUrl = "https://api.zoom.us/v2/users/me/meetings";
  const jwtToken =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IlFfeWN3UGFzUmRLR2FjaWgzSkRqUVEiLCJleHAiOjE2NzkyMDc5MjUsImlhdCI6MTY3OTIwMjUyNX0.xNOmYc5i5A1vQEDGZQz_nyu5_xwi2IZbgYdQUN9HMts";

    const response = await axios.post(
      zoomApiUrl,
      {
        topic,
        type: 2,
        start_time,
        duration,
      },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log(response);
    res.json(response.data);

}