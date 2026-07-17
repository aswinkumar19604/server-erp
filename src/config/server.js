import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./db.js";
import ChatMessage from "./models/ChatMessage.js";

connectDB();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id}`);

  // Register client into their personal inbox room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 Active user registered chat room: ${userId}`);
  });

  // Handle direct P2P message channels
  socket.on("private_message", async (msgData) => {
    try {
      const { sender, senderName, recipient, content } = msgData;

      if (!sender || !recipient || !content) return;

      // Persist in MongoDB
      const chat = await ChatMessage.create({
        sender,
        senderName,
        recipient,
        content
      });

      // Dispatch instantly to recipient inbox room
      io.to(recipient).emit("message", chat);

      // Dispatch back to sender room for self UI sync
      io.to(sender).emit("message", chat);

      console.log(`✉️ Real-time P2P chat: ${senderName} -> ${recipient}`);
    } catch (err) {
      console.log("WebSocket message save error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});