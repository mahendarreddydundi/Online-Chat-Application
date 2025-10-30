import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: ["http://localhost:3000"], // or your frontend URL in production
		methods: ["GET", "POST"],
	},
});

// 🧠 Track users: { userId: socketId }
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

// 🔥 Socket connection setup
io.on("connection", (socket) => {
	console.log("✅ User connected:", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId && userId !== "undefined") {
		userSocketMap[userId] = socket.id;
	}

	// Send list of online users to everyone
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// 📨 Listen for sendMessage event (from frontend)
	socket.on("sendMessage", (message) => {
		const receiverSocketId = getReceiverSocketId(message.receiverId);

		if (receiverSocketId) {
			// Send only to receiver
			io.to(receiverSocketId).emit("newMessage", message);
		}

		// Optional: send message back to sender for instant UI update
		socket.emit("newMessage", message);
	});

	// ❌ On disconnect
	socket.on("disconnect", () => {
		console.log("❌ User disconnected:", socket.id);
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };
