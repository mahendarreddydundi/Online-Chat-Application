import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

// ✅ Load environment variables (ensure correct path)
dotenv.config({ path: path.resolve("./backend/.env") });

// ✅ Debug log to confirm env file loaded
console.log("Mongo URI:", process.env.MONGO_DB_URI ? "Loaded ✅" : "❌ Not Loaded");

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ✅ Serve frontend build (for production)
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// ✅ Start server
server.listen(PORT, async () => {
	console.log(`🚀 Server Running on port ${PORT}`);
	await connectToMongoDB();
});
