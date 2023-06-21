const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http").Server(app);
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
var user = require("./Module/user/route/user");
var chat = require("./Module/chat/route/chat");
var task = require("./Module/task/route/task");
var templogin = require("./Module/tempLogin/route/templogin");
var meeting = require("./Module/meeting/route/meeting");
const config = require("./helper/config");
const jwt = require("jsonwebtoken");
const UserModel = require("./Model/UserModel");
const Conversation = require("./Model/Conversation");
const MessageModal = require("./Model/MessageModal");
const TaskModal = require("./Model/TaskModal");
const Meeting = require("./Model/Meeting");
const shifts = require("./Model/Shift");
const multer = require('multer');
const cryptoen = require("./helper/Crypto");
const dateFormat = "%Y-%m-%d";

// Define the origin for cross origin block
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

// JSON type request accept with express json
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// make images folder publicly
app.use("/uploads", express.static("uploads"));

app.get("/", async(request, response) => {
  const roomId = "64913d254dcbc0a84147f8e2"
  let getAllmessage = await MessageModal.find(
    { roomId: roomId },
    )
    .populate("taskId")
    .populate("meeting")
    .populate("senderId", "ProfileIcon Status firstname lastname email")
    .populate("receiverId", "ProfileIcon Status firstname lastname email");
  
  // console.log(getAllmessage);
  const data = getAllmessage.map((msg) =>{
    msg.text = cryptoen.decryption(msg.text);
    console.log(msg.text);
    return msg;
  })

response.json({
    status: true,
    msg: data,
    message: "Quoded Server runing",
  });
});


// Socket io route implementation
app.use((req, res, next) => {
  req.io = socketIO;
  return next();
});

// User router
app.use(express.static("uploads"));
app.use("/user", user);
app.use("/chat", chat);
app.use("/task", task);
app.use("/templogin", templogin);
app.use("/meetings", meeting);

app.post("/meeting", async function (req, res) {
  const { topic, start_time, duration } = req.body;
  const zoomApiUrl = "https://api.zoom.us/v2/users/me/meetings";
  const jwtToken =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IlFfeWN3UGFzUmRLR2FjaWgzSkRqUVEiLCJleHAiOjE2NzkyMDc5MjUsImlhdCI6MTY3OTIwMjUyNX0.xNOmYc5i5A1vQEDGZQz_nyu5_xwi2IZbgYdQUN9HMts";

  try {
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

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Zoom meeting" });
  }
});

// Socket connection intialize
socketIO.use(function (socket, next) {
  // console.log("socket.handshake.query",socket.handshake.query);
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      config.secret_key,
      function (err, decoded) {
        if (err) return next(new Error("Authentication error"));
        socket.decoded = decoded;
        next();
      }
    );
  } else {
    next(new Error("Authentication error"));
  }
});


socketIO.on("connection", async (socket) => {
 
  let updateCurrentId = await UserModel.findByIdAndUpdate(
    {
      _id: socket.decoded.id,
    },
    {
      Status: "online",
      SocketId: socket.id,
    }
  );

  let updateReceived = await MessageModal.updateMany(
    { receiverId: socket.decoded.id, seenStatus: "send" },
    { seenStatus: "received" }
  );

  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("users", async (data) => {
    // let users = await userModel.find({ currentStatus: "online" });
    // socket.emit("users", users);
  });

  // Receive conversation save to database
  socket.on("coversation-start", async (data) => {
    
    const obj = Conversation.findOne({
      senderId: socket.decoded.id,
      receiverId: data.receiverId,
    });

    if (!obj) {
      let conversation = new Conversation();
      conversation.members.push(socket.decoded.id);
      conversation.members.push(data.receiverId);
      conversation.senderId = socket.decoded.id;
      conversation.receiverId = data.receiverId;
      const user = await conversation.save();
      socket.emit("coversation-started", user);

    } else if (obj) {
      socket.emit("coversation-started", obj);
    }
  });


  // Send conversation list

  socket.on("coversation-list", async (data) => {
    const conversations = Conversation.find(
      {
        members: { $in: [socket.decoded.id] },
      });

    socket.emit("coversation-list", conversations);
  });

  socket.on("joinRoom", (data) => {
    socket.join(data.roomId);
    socket.emit("joinedRoom", data.roomId);
  });

  socket.on("getDetails", async (data) => {
    const obj = UserModel.findOne({ _id: data.id });
    if (obj) {
      socket.emit("getDetails", obj);
    } else {
      socket.emit("getDetails-faild", "User Not found");
    }
  });

  // Receive the message or task
  socket.on("message", async (data) => {

    // console.log("req.body", data);

    if (data.type) {
      let message = new MessageModal();
      message.type = data.type;
      message.roomId = data.roomId;
      message.senderId = data.senderId;
      message.receiverId = data.receiverId;
      

      if (data.type === "task") {

        let Task = new TaskModal();
        Task.roomId = data.roomId;
        Task.senderId = data.senderId;
        Task.receiverId = data.receiverId;
        Task.description = data.description;
        Task.endTime = data.endTime;
        Task.Attachments.push(data.filePath ? data.filePath : "");
        let taskDetails = await Task.save();
        message.taskId = taskDetails._id;


      } else if (data.type === "meeting") {

        console.log("data", data);
        let meeting = new Meeting();
        meeting.roomId = data.roomId;
        meeting.senderId = data.senderId;
        meeting.receiverId = data.receiverId;
        meeting.description = data.text;
        meeting.endTime = data.endTime;
        meeting.Attachments.push(data.filePath ? data.filePath : "");
        let meetingDetails = await meeting.save();
        message.meeting = meetingDetails._id;


      } else if (data.type === "shift") {

        console.log("data", data);
        let shift = new shifts();
        shift.roomId = data.roomId;
        shift.senderId = data.senderId;
        shift.receiverId = data.receiverId;
        shift.description = data.text;
        shift.startTime = data.startTime;
        shift.endTime = data.endTime;

        let shiftDetails = await shifts.save();
        message.shiftId = shiftDetails._id;

      } else {
        // encrypt the message
        message.text = cryptoen.encryption(data.text);
      }

      await message.save();

      let getAllmessage = await MessageModal.find(
        { roomId: data.roomId },
        )
        .populate("taskId")
        .populate("meeting")
        .populate("shiftId")
        .populate("senderId", "ProfileIcon Status firstname lastname email")
        .populate(
          "receiverId",
          "ProfileIcon Status firstname lastname email"
        );

        const data = getAllmessage.map((msg) =>{
          msg.text = cryptoen.decryption(msg.text);
          return msg
        });

        socket.emit("message", data);
        socket.broadcast.emit("message", data);

    } else if (data.roomId) {

      let updateReceived = await MessageModal.updateMany(
        { receiverId: socket.decoded.id, roomId: data.roomId },
        { seenStatus: "seened" });


      let getAllmessage = await MessageModal.find(
        { roomId: data.roomId },
        )
        .populate("taskId")
        .populate("meeting")
        .populate("senderId", "ProfileIcon Status firstname lastname email")
        .populate("receiverId", "ProfileIcon Status firstname lastname email");

        const data = getAllmessage.map((msg) =>{
          msg.text = cryptoen.decryption(msg.text);
          return msg
        });
      
        socket.emit("message", data);
        socket.broadcast.emit("message", data);
    }
  });

  // Join personal chat
  socket.on("join", async (data) => {
    socket.join(data.roomId);
    socket.emit("joined", data);
  });

  // Disconnect the socket
  socket.on("disconnect", async () => {
    console.log("🔥", socket.id);
    let updateoffline = await UserModel.findOneAndUpdate(
      { SocketId: socket.id },
      { Status: "offline" }
    );
    // if (updateoffline) {
    //   socket.disconnect()
    // }
    // let users = await userModel.find({ currentStatus: "online" });
    // socket.broadcast.emit("users", users);
    // socketIO.emit("newUserResponse", "disconnect")
  });
});

// Mongodb connection setup
try {
  mongoose.set("strictQuery", false);
  mongoose.connect(
    "mongodb+srv://jameel86:YGKx17uttjwe8knk@cluster0.zpiaagb.mongodb.net/quoded?retryWrites=true&w=majority"
  );
  var db = mongoose.connection;
  // Added check for DB connection
  if (!db) {
    console.log("Error connecting db");
  } else {
    console.log("DB connected successfully");
  }
} catch (error) {
  console.error(error);
}

// Define the port from helper file
const PORT = config.app.port;

// Server running and listen the port
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Multer image error handler
function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.json({
      success: 0,
      message: err.message,
    });
  }
}



app.use(errHandler);