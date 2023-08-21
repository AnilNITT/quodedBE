var CheckModel = require("../../../Model/CheckinoutModal");
var MessageModal = require("../../../Model/MessageModal");
var { StatusCodes } = require("http-status-codes");


// make CheckIn
exports.addCheckIn = async (req, res) => {
    try {
    
    const { type, roomId, senderId, receiverId,lat,long, location, checkInTime } = req.body;

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
        lat:lat,
        long:long,
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


// make CheckOut
exports.addCheckOut = async (req, res) => {
    try {
    
    const { type, roomId, senderId, receiverId, lat, long, location, checkOutTime } = req.body;

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
        lat:lat,
        long:long,
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


// make CheckIn
exports.getCheckIn = async (req, res) => {
  try {
  
  // get Login user
  const userdata = req.user;


  let checkin = await CheckModel.findOne({senderId:userdata.id})
                                .sort({createdAt:-1})

  if(checkin.type == "check in"){
    res.status(StatusCodes.OK).send({
      status: true,
      message: "successfully",
      data : checkin,
    });
    return;
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      message: "No CheckIn found",
    });
    return;
  }
  } catch(err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Something went wrong",
        error: err,
      });
      return;
  }
};


