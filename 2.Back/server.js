import http from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = 3000;
app.use(cors()); 
app.use(express.json()); // Middleware to parse JSON bodies

const rooms = new Map(); //stores roomId -> { players: [], text: "" }
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle room creation
  socket.on("createRoom", async() => {
    const roomId = Math.random().toString(36).substring(2, 10);

    // Fetch random text here, ONCE per room
    const response = await fetch("https://baconipsum.com/api/?type=all-meat&paras=1");
    const data = await response.json();
    const text = data[0].split(" ").slice(0, 40).join(" ");

    socket.join(roomId);
    rooms.set(roomId, { players: [socket.id], text: text || "" });
    socket.emit("roomCreated", roomId);

    console.log(`Room created with ID: ${roomId}`);
  });

  // Handle joining a room
  socket.on("joinRoom", ({ joinUserName, joinRoomId }) => {

    console.log("Trying to join room:", joinRoomId);

    const room = rooms.get(joinRoomId);
    console.log("Room found:", room);

    if (room && room.players.length < 2) {
      room.players.push(socket.id);
      socket.join(joinRoomId);
      socket.emit("roomJoined", joinRoomId);
      console.log(`✅ ${socket.id} joined room ${joinRoomId}`);
    }
    if (room && room.players.length === 2) {
      io.to(joinRoomId).emit("startGame", { text: room.text, roomId: joinRoomId });
      console.log(`🚀 Game started for room: ${joinRoomId}`);
    } else {
      console.log("Failed to join room");
    }
  });

  // Handle rejoining a room
  socket.on("rejoinRoom", (roomId) => {

    socket.join(roomId);
    console.log(`🔁 ${socket.id} rejoined room: ${roomId}`);
  });

  // Handle progress updates
  socket.on("progressUpdate", ({ roomId, progress }) => {

    console.log(io.sockets.adapter.rooms);
    socket.to(roomId).emit("opponentProgress", { progress });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
