const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const socketRoomMap = new Map();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    socketRoomMap.set(socket.id, room);

    const usersInRoom = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit("room_users", usersInRoom);

    console.log(`User : ${socket.id} Joined : ${room}. Total: ${usersInRoom}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", () => {
    const room = socketRoomMap.get(socket.id);
    if (room) {
      socket.leave(room);
      socketRoomMap.delete(socket.id);

      const userInRoom = io.sockets.adapter.rooms.get(room)?.size || 0;
      io.to(room).emit("room_users", userInRoom);
    }
  });

  socket.on("disconnect", () => {
    const room = socketRoomMap.get(socket.id);
    if (room) {
      const usersInRoom = io.sockets.adapter.rooms.get(room)?.size || 0;
      socketRoomMap.delete(socket.id);
    }
    console.log(`User Disconnected`, socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server Running on PORT ${PORT}`);
});
