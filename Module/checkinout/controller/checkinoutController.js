var CheckModel = require("../../../Model/CheckinoutModal");
var MessageModal = require("../../../Model/MessageModal");
var { StatusCodes } = require("http-status-codes");

// Add Meeting
exports.addCheckIn = async (req, res) => {
    try {
    
    const { type, roomId, senderId, receiverId, location, checkInTime } = req.body;

    if(roomId === undefined) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          error: "error",
          message: "room Id is required",
          status: "fail",
        });
        return;
    }
      
    const data = {
        type: type,
        roomId:roomId,
        senderId:senderId,
        receiverId:receiverId,
        location:location,
        checkInTime:checkInTime,
    }

    let checkin = await CheckModel.create(data);

    const msgdata = {
        type: type,
        roomId: roomId,
        senderId: senderId,
        receiverId: receiverId,
        checkId:checkin._id
    };
    
    await MessageModal.create(msgdata);

    res.status(StatusCodes.OK).send({
        status: true,
        message: "CheckIn added successfully",
      });
      return;

    } catch(err) {

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Something went wrong",
          error: err,
        });
        return;

    }
};


exports.addCheckOut = async (req, res) => {
    try {
    
    const { type, roomId, senderId, receiverId, location, checkOutTime } = req.body;

    if(roomId === undefined) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          error: "error",
          message: "room Id is required",
          status: "fail",
        });
        return;
    }
      
    const data = {
        type: type,
        roomId:roomId,
        senderId:senderId,
        receiverId:receiverId,
        location:location,
        checkOutTime:checkOutTime,
    }

    let checkin = await CheckModel.create(data);

    const msgdata = {
        type: type,
        roomId: roomId,
        senderId: senderId,
        receiverId: receiverId,
        checkId:checkin._id
    };
    
    await MessageModal.create(msgdata);

    res.status(StatusCodes.OK).send({
        status: true,
        message: "CheckOut added successfully",
      });
      return;

    } catch(err) {

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          status: "fail",
          message: "Something went wrong",
          error: err,
        });
        return;

    }
};