var Meeting = require("../../../Model/Meeting");
var MessageModal = require("../../../Model/MessageModal");
// var jwt = require("jsonwebtoken");
// var config = require("../../../helper/config");
// var bcrypt = require("bcrypt");
var ObjectId = require("mongoose").Types.ObjectId;
var { StatusCodes } = require("http-status-codes");
var moment = require("moment");

var today = moment().startOf('day'); // Get today's date at the beginning of the day

// Search the user meetings list
exports.getMeetings = (req, res) => {

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


// deny the meeting
exports.denyMeeting = async (req, res) => {
  try {
    let { meetingId, description } = req.body;

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
        status: "Deny Meeting"
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
        message: "meeting deny successfully",
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


// Add Meeting
exports.addMeeting = async (req, res) => {
    const { name, roomId, type, senderId, receiverId, repeat, location, description, startTime, endTime } = req.body;

    let counts = 0;
    let lengths = roomId.length;
    // const DateData = [];

    if(lengths > 0) {
    roomId.forEach(async(rooms, index) => {

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
            repeat:repeat,
            description: description,
            startTime: startTime,
            endTime: endTime,
          };

          let meeting = await Meeting.create(data);
          await meeting.save();


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

};


// get task sorted by Date
exports.getSortedLoginUserMeeting = async (req, res) => {
  try {


    const meeting = await Meeting.aggregate([
      {
        $match: {
          receiverId: new ObjectId(req.user.id),
          startTime: { $gt: today.toDate() }
        },
      },
      {
        $group: {
          // _id:"$endTime",
          _id: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$startTime",
            },
          },
          // _id: { $substr: ["$endTime", 0,10] },
          data: { $push: "$$ROOT" }, // show all params
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // sort by count   no of user in one group
    ]);

    if (meeting.length > 0) {
      await Meeting.populate(meeting[0].data, {
        path: "senderId receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });

      res.status(StatusCodes.OK).send({
        status: true,
        meeting: meeting,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "false",
        meeting: meeting,
        message: "No Meeting found",
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


// get task sorted by Date
exports.getSortedByMonthLoginUserMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.aggregate([
      {
        $match: {
          receiverId: new ObjectId(req.user.id),
          startTime: { $gt: today.toDate() }
        },
      },
      {
        $group: {
          // _id:"$endTime",
          _id: {
            $dateToString: {
              format: "%m-%Y",
              date: "$startTime",
            },
          },
          // _id: { $substr: ["$endTime", 0,10] },
          data: { $push: "$$ROOT" }, // show all params
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // sort by count   no of user in one group
    ]);

    if (meeting.length > 0) {
      await Meeting.populate(meeting[0].data, {
        path: "senderId receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });

      res.status(StatusCodes.OK).send({
        status: true,
        meeting: meeting,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "false",
        meeting: meeting,
        message: "No Meeting found",
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