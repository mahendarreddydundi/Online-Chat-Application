import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // Your frontend
    methods: ["GET", "POST"],
  },
});

// 🧠 Track connected users → { userId: socketId }
const userSocketMap = {};

// Get socket id of receiver
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// 🔥 Socket Events
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Get the userId from frontend
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    // Store userId as string for consistent matching
    userSocketMap[userId.toString()] = socket.id;
  }

  // Send updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 📨 RECEIVE MESSAGE FROM FRONTEND
  socket.on("sendMessage", (message) => {
    const { senderId, receiverId } = message;

    // Convert to string for consistent matching
    const receiverSocketId = getReceiverSocketId(receiverId?.toString());
    const senderSocketId = getReceiverSocketId(senderId?.toString());

    console.log("📩 Message received:", message);

    // Send message to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    // Send back to sender (to update sender UI instantly)
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message);
    }
  });

  // ⌨️ TYPING INDICATOR
  socket.on("typing", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  // ❌ On user disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    // Remove the socket from map
    for (const user in userSocketMap) {
      if (userSocketMap[user] === socket.id) {
        delete userSocketMap[user];
        break;
      }
    }

    // Send updated list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
