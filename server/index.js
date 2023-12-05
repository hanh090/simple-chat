import express from "express";
import dotenv from "dotenv";
import path from "path";
const app = express();
import http from "http";
import { Server } from "socket.io";
import { addUser, removeUser } from "./utils/helpers.js";
import "./config/config.js";
import Chat from "./models/chat.js";
dotenv.config();
const __dirname = path.resolve();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`User has been connected to ${socket.id}`);

  // Join chat room
  socket.on("join", async (data, callback) => {
    // Add user to the room
    const { error, user } = addUser({
      id: socket.id,
      ...data,
    });

    if (error) {
      return callback(error);
    }

    const roomChatData = await Chat.find({ room: data.room })
      .sort({ createdAt: 1 })
      .lean();

    socket.join(user.room);

    socket.join(data);
    socket.emit("sendingRoomChatData", roomChatData);
    console.log(`User with id: ${socket.id} has joined the room: ${data}`);
    callback();
  });

  // Send message
  socket.on("send_message", async (data) => {
    const chat = new Chat({ ...data });

    await chat.save();
    socket.to(data.room).emit("receive_message", data);
  });

  // Disconnect to socket
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`User disconnected ${socket.id}`);
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is on port ${PORT}`);
});
