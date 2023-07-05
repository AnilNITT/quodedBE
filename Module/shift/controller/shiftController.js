var ShiftModal = require("../../../Model/ShiftModal");
var MessageModal = require("../../../Model/MessageModal");
var ObjectId = require("mongoose").Types.ObjectId;
var { StatusCodes } = require("http-status-codes");

// Add Meeting
exports.addShift = async (req, res) => {
    
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
  