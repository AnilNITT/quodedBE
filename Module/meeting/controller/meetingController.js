var Meeting = require("../../../Model/Meeting");
var MessageModal = require("../../../Model/MessageModal");
// var jwt = require("jsonwebtoken");
// var config = require("../../../helper/config");
// var bcrypt = require("bcrypt");
var ObjectId = require("mongoose").Types.ObjectId;
var { StatusCodes } = require("http-status-codes");


// Search the user meetings list
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

          message.meeting = meeting._id;
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


// update the task or Task status
exports.updateMeetingStatus = async (req, res) => {
  try {
    let { meetingId, status } = req.body;

    if (meetingId === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "meeting Id is required",
        status: "fail",
      });
      return;
    }

    const meeting = await Meeting.findById(meetingId);

    if(meeting) {

      const meetings = await Meeting.findByIdAndUpdate(
        { _id: meetingId },
        { status: status },
        { new: true }
      );
  
      /* const msgs = await MessageModal.findOneAndUpdate(
        { taskId: meetingId },
        { status: status },
        { new: true }
      ); */
  
      res.status(StatusCodes.OK).send({
        status: true,
        message: "meeting status updated successfully",
        data: meetings,
      });
      return; 

    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "meeting not found",
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


// update the meeting time
exports.reviseMeetingDate = async (req, res) => {
  try {
    let { meetingId, description, startTime, endTime } = req.body;

    if (meetingId === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "meeting Id is required",
        status: "fail",
      });
      return;
    }

    const meeting = await Meeting.findById(meetingId);

    if(meeting) {

      const data = {
        description:description,
        startTime: startTime,
        endTime: endTime,
        status: "Revise Date"
      }

      const meetings = await Meeting.findByIdAndUpdate(
        { _id: meetingId },
        { $set: data },
        { new: true }
      );
  
      /* const msgs = await MessageModal.findOneAndUpdate(
        { taskId: meetingId },
        { status: status },
        { new: true }
      ); */
  
      res.status(StatusCodes.OK).send({
        status: true,
        message: "meeting date revised successfully",
        data: meetings,
      });
      return; 

    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "meeting not found",
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


// get single meeting details
exports.getmeetingDetails = async (req, res) => {
  try {
    let { meetingId } = req.params;

    if (meetingId === undefined || meetingId.length < 24) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: "error",
        message: "Incorrect meeting Id",
        status: "fail",
      });
      return;
    } else {
      const meeting = await Meeting.findOne({ _id: meetingId })
        .populate("senderId", "ProfileIcon Status name email")
        .populate("receiverId", "ProfileIcon Status name email");

      if (meeting) {

       /*  if(new Date().getTime() > new Date(task.endTime).getTime()){
          if(task.status != "Completed"){
            task.status = "Overdue";
            await task.save();
          }
        } */

        res.status(StatusCodes.OK).send({
          status: true,
          taskDetails: meeting,
        });
        return;
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "false",
          message: "No meeting found",
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