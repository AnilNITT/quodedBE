var ShiftModal = require("../../../Model/ShiftModal");
var MessageModal = require("../../../Model/MessageModal");
var ObjectId = require("mongoose").Types.ObjectId;
var { StatusCodes } = require("http-status-codes");


// Add Meeting
exports.addShift = async (req, res) => {
    
    try {
      // const { name, roomId, type, senderId, receiverId, description, startTime, endTime } = req.body;
      const { roomId, type, senderId, receiverId, description, startTime, endTime } = req.body;
  

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
              // name: name,
              roomId: rooms,
              senderId: senderId,
              receiverId: receivers,
              description: description,
              startTime: startTime,
              endTime: endTime,
            };
  
            let shift = await ShiftModal.create(data);
            await shift.save();
  
            message.shiftId = shift._id;
            await message.save();
  
            counts++;
  
            if (lengths === counts) {
              res.status(StatusCodes.OK).send({
                status: true,
                message: "Shift added successfully",
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


// update the Shift status
exports.updateShiftStatus = async (req, res) => {
  try {
    let { shiftId, status } = req.body;

  if(shiftId === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "shift Id is required",
        status: "fail",
      });
      return;
    }

    const shifts = await ShiftModal.findById(shiftId);

    if (shifts) {

      const shift = await ShiftModal.findByIdAndUpdate(
        { _id: shiftId },
        { status: status },
        { new: true }
      );

      res.status(StatusCodes.OK).send({
        status: true,
        message: "Shift status updated successfully",
        data: shift,
      });
      return;

    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Shift not found",
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


// update the Shift status
exports.transferShift = async (req, res) => {
  try {
    let { shiftId,roomId,receiverId } = req.body;

  if(shiftId === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: "shift Id is required",
        status: "fail",
      });
      return;
    }

    const shifts = await ShiftModal.findById(shiftId);
    const message = await MessageModal.findOne({shiftId: shiftId});

    // res.send(message);
    
    if (shifts && message){
      
      const data = {
        shiftId:shiftId,
        roomId: roomId,
        receiverId:receiverId,
        status:"Pending"
      }

      let shift = await ShiftModal.findByIdAndUpdate(
        { _id: shiftId }, data, { new: true }
      );

      await MessageModal.findByIdAndUpdate(
        { _id: message._id }, data, { new: true }
      );

      shift = await ShiftModal.populate(shift ,{
        path: "receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });

      res.status(StatusCodes.OK).send({
        status: true,
        message: "Shift transfer successfully",
        data: shift,
      });
      return;
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        message: "Shift not found",
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

/* 
"roomId": "64ed85223f743a2094c64cdf",
"senderId": "64ed84153f743a2094c64cc6",
"receiverId": "64bfd262ad80c76742263326", */