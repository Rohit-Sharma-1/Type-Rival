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

const port = process.env.PORT || 3000; // ✅ Render gives its own port
app.use(cors());
app.use(express.json());

const rooms = new Map();

// 🧠 Local random word pool
const wordSets = [
  "The quick brown fox jumps over the lazy dog in the sunny park",
  "Coding at midnight feels like a superpower until the bugs appear",
  "React components are fun until props start misbehaving again",
  "Every developer has tried turning it off and on at least twice",
  "JavaScript is the only language that can confuse and impress simultaneously",
  "Typing speed means nothing when autocorrect is your true enemy",
  "Socket connections are like friendships — easy to start, hard to maintain",
  "Bugs in code are like mosquitoes — always appearing where you least expect",
  "Sometimes the best debug tool is a long walk and a cup of coffee",
  "Deploying on Friday is an extreme sport for true developers",
];

// 🧩 Generate random text of exactly 40 words
function generateRandomText(wordCount = 40) {
  const allWords = wordSets.join(" ").split(" ");
  let result = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * allWords.length);
    result.push(allWords[randomIndex]);
  }
  return result.join(" ");
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("createRoom", () => {
    const roomId = Math.random().toString(36).substring(2, 10);
    const text = generateRandomText(40);

    socket.join(roomId);
    rooms.set(roomId, { players: [socket.id], text });
    socket.emit("roomCreated", roomId);

    console.log(`Room created with ID: ${roomId}`);
  });

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

  socket.on("rejoinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🔁 ${socket.id} rejoined room: ${roomId}`);
  });

  socket.on("progressUpdate", ({ roomId, progress }) => {
    socket.to(roomId).emit("opponentProgress", { progress });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
