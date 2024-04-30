// Creating websocket server

const { Server } = require("socket.io");
const http = require('http')
const express = require('express')
let onlineUsers = [];

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: "http://localhost:5173" });//this step is done because our server and client are running on different domain

io.on("connection", (socket) => {
    console.log("New Connection", socket.id);

    //listen to a connection
    socket.on("addNewUser", (userId) => {
        !onlineUsers.some((user) => {
            user.userId === userId
        }) &&
            onlineUsers.push({ userId, socketId: socket.id });
        console.log("onlineUsers", onlineUsers);
        io.emit("getOnlineUsers", onlineUsers);
    });
    // listen to message
    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find((user) => user.userId === message.recipientId);
        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", { senderId: message.senderId, isRead: false, date: new Date() });
        }
    });
    //listen to a disconnection
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    });
});






//!------------------------------------------------------------------
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
//const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

const port = 5000 || process.env.PORT;
const uri = process.env.ATLAS_URI;

app.get("/", (req, res) => {
    res.send("Welcome to Chat App APIs...");
})

server.listen(port, (req, res) => {
    console.log(`Listening on port... : ${port}`);
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connection established")).catch((error) => console.log("MongoDB connection failed: ", error.message))