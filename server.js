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
const check = require("./Module/checkinout/route/checkinout");
const shift = require("./Module/shift/route/shift");
const company = require("./Module/company/route/company");
const employee = require("./Module/employee/route/employee");
const config = require("./helper/config");
const jwt = require("jsonwebtoken");
const multer = require("multer");
// const cryptoen = require("./helper/Crypto");
// var CryptoJS = require("crypto-js");
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const jwt_decode = require("jwt-decode");

const UserModel = require("./Model/UserModel");
const Conversation = require("./Model/Conversation");
const MessageModal = require("./Model/MessageModal");
const TaskModal = require("./Model/TaskModal");
const Meeting = require("./Model/Meeting");
const shifts = require("./Model/ShiftModal");

const dateFormat = "%Y-%m-%d";

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  // res.header("Access-Control-Allow-Headers", "Content-Type",'Authorization');
  res.header(
    "Access-Control-Allow-Headers",
    " Origin, X-Requested-With, Content-Type, Accept, form-data,Authorization"
  );
  // res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

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


app.get("/", async(req, res)=> {

  const ZOOM_API_BASE_URL = "https://api.zoom.us/v2";
  const API_KEY = "rntB6_6kSniGQxEzJBU67g";
  const API_SECRET = "leAr6jJE4AEALcmhwRLlFunkCMdSSAws";
  const FROM_PHONE_NUMBER = "9630196313";
  const TO_PHONE_NUMBER = "7000269701";

  const accessToken = "eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjhmMWE4NTcyLWVmMTUtNDM1Zi05YmU2LWE0YjI0MWY2MzVkOCJ9.eyJ2ZXIiOjksImF1aWQiOiIyNDQ1N2VhMjVjNmMwNmI0YzE4ZTM0NDE5OGE3ZDFkNyIsImNvZGUiOiIzcTdPUnA5ME5VSzZEVEc3V1BQVHRPNXpocjdRekxLU0EiLCJpc3MiOiJ6bTpjaWQ6dms1cVdFR1RVMlFtcGw5b1pTY3d3IiwiZ25vIjowLCJ0eXBlIjowLCJ0aWQiOjAsImF1ZCI6Imh0dHBzOi8vb2F1dGguem9vbS51cyIsInVpZCI6IjJSbnVjMldLUjA2MGozWnhrV1VEZmciLCJuYmYiOjE2ODk4NTAyNDQsImV4cCI6MTY4OTg1Mzg0NCwiaWF0IjoxNjg5ODUwMjQ0LCJhaWQiOiJydWhNdlNqWVJUZTNkUWdneUlMMzBBIn0.ifIwpisFIfUU0UdWdf9dCAvbjY8hEnDUoY71Adchgvqr_ZoLl6S_0kXlyMlWCPuFVDhEMzT5H5iJYtKsTIQV4Q"

      // Step 2: Make the voice call
  const { data: makeCallResponse } = await axios.post(
      `${ZOOM_API_BASE_URL}/phone/call/make`,
      {
        from: FROM_PHONE_NUMBER,
        to: TO_PHONE_NUMBER,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

  res.send({
    status: true,
    message: "Quoded Server runing",
    data:makeCallResponse
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
app.use("/check", check);
app.use("/shift", shift);
app.use("/company", company);
app.use("/employee", employee);


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
  // "socket.decoded.id"   login user id
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
    const conversations = await Conversation.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: new ObjectId(socket.decoded.id),
              receiverId: new ObjectId(data.receiverId),
            },
            {
              receiverId: new ObjectId(socket.decoded.id),
              senderId: new ObjectId(data.receiverId),
            },
          ],
        },
      },
    ]);

    if (conversations.length > 0) {
      await Conversation.populate(conversations, {
        path: "senderId receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });
      socket.emit("coversation-started", conversations);
    } else {
      let conversation = new Conversation();
      conversation.members.push(socket.decoded.id);
      conversation.members.push(data.receiverId);
      conversation.senderId = socket.decoded.id;
      conversation.receiverId = data.receiverId;
      await conversation.save();
      await Conversation.populate(conversation, {
        path: "senderId receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });
      socket.emit("coversation-started", conversation);

      /*  const data = Conversation.findOne({ _id: ObjectId(conversation._id) })
        .populate("senderId", "ProfileIcon Status firstname lastname email")
        .populate("receiverId", "ProfileIcon Status firstname lastname email"); */
    }
  });

  // Send conversation list
  /*   socket.on("coversation-list", async (data) => {
    const conversations = Conversation.find({
      members: { $in: [socket.decoded.id] },
    })
      .populate("senderId", "ProfileIcon Status name email")
      .populate("receiverId", "ProfileIcon Status name email");

    socket.emit("coversation-list", conversations);
  }); */

  // Send conversation list
  socket.on("coversation-list", async (data) => {
    /* let updateReceived = await MessageModal.updateMany(
      { receiverId: socket.decoded.id, seenStatus: "send" },
      { seenStatus: "received" }
    ); */

    const conversations = Conversation.find({
      members: { $in: [socket.decoded.id] },
    }).sort({ updatedAt: -1 });
    // .sort({ createdAt: -1 });

    if (conversations.length > 0) {
      conversations.map(async (data) => {
        const senderId =
          data.senderId == socket.decoded.id ? data.receiverId : data.senderId;
        const message = await MessageModal.aggregate([
          {
            $match: {
              $and: [
                { senderId: senderId },
                { receiverId: new ObjectId(socket.decoded.id) },
              ],
            },
          },
        ]);

        data.counts = message.filter(
          (data) => data.seenStatus === "send" || data.seenStatus === "received"
        ).length;
        await data.save();
      });

      await Conversation.populate(conversations, {
        path: "senderId receiverId",
        select: ["ProfileIcon", "Status", "email", "name"],
      });
      socket.emit("coversation-list", conversations);
    } else {
      socket.emit("coversation-list", conversations);
    }
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
        // message.text = cryptoen.encryption(data.text);
        message.text = data.text;
      }

      await message.save();

      let getAllmessage = await MessageModal.find({ roomId: data.roomId })
        .populate("taskId")
        .populate("meeting")
        .populate("shiftId")
        .populate("checkId")
        .populate("senderId", "ProfileIcon Status name email")
        .populate("receiverId", "ProfileIcon Status name email");

      /* const data = getAllmessage.map((msg) =>{
          msg.text = cryptoen.decryption(msg.text);
          return msg
      }); */

      socket.emit("message", getAllmessage);
      socket.broadcast.emit("message", getAllmessage);
    } else if (data.roomId) {
      let updateReceived = await MessageModal.updateMany(
        { receiverId: socket.decoded.id, roomId: data.roomId },
        { seenStatus: "seened" }
      );

      let getAllmessage = await MessageModal.find({ roomId: data.roomId })
        .populate("taskId")
        .populate("meeting")
        .populate("shiftId")
        .populate("checkId")
        .populate("senderId", "ProfileIcon Status name email")
        .populate("receiverId", "ProfileIcon Status name email");

      /* const data = getAllmessage.map((msg) =>{
          const keys = config.crypto_key;
          // msg.text = cryptoen.decryption(msg.text);
          msg.text = CryptoJS.AES.decrypt(msg.text, keys).toString(CryptoJS.enc.Utf8);;
          return msg
        }); */

      socket.emit("message", getAllmessage);
      socket.broadcast.emit("message", getAllmessage);
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
    // "mongodb+srv://jameel86:YGKx17uttjwe8knk@cluster0.zpiaagb.mongodb.net/qo?retryWrites=true&w=majority",
    // "mongodb+srv://jameel86:YGKx17uttjwe8knk@cluster0.zpiaagb.mongodb.net/RealDatabase?retryWrites=true&w=majority",
    "mongodb+srv://jameel86:YGKx17uttjwe8knk@cluster0.zpiaagb.mongodb.net/qotest?retryWrites=true&w=majority",
    // "mongodb+srv://jameel86:YGKx17uttjwe8knk@cluster0.zpiaagb.mongodb.net/qotestssss?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
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

/* 
name : Jacques
email : mjameelandroid@gmail.com
PhoneNumber : 966567054272


name : Ben
email : jameel86@gmail.com
PhoneNumber : 5068973848 
*/
