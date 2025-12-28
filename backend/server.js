import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables (ensure correct path)
// Try multiple possible paths for .env file
const envPath = path.join(__dirname, ".env");
const rootEnvPath = path.resolve(path.join(__dirname, "../.env"));
const currentEnvPath = path.resolve(".env");

// Try backend/.env first, then root .env, then current directory
if (fs.existsSync(envPath)) {
	dotenv.config({ path: envPath });
} else if (fs.existsSync(rootEnvPath)) {
	dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(currentEnvPath)) {
	dotenv.config({ path: currentEnvPath });
} else {
	dotenv.config(); // Use default .env in current directory
}

// ✅ Debug log to confirm env file loaded
console.log("Mongo URI:", process.env.MONGO_DB_URI ? "Loaded ✅" : "❌ Not Loaded");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ✅ Serve frontend build (for production only)
if (process.env.NODE_ENV === "production") {
	const distPath = path.resolve(path.join(__dirname, "../frontend/dist"));
	if (fs.existsSync(distPath)) {
		app.use(express.static(distPath));
		
		// Catch-all handler: send back React's index.html file for non-API routes
		app.get("*", (req, res, next) => {
			// Skip API routes
			if (req.path.startsWith("/api")) {
				return next();
			}
			res.sendFile(path.join(distPath, "index.html"));
		});
	}
}

// ✅ Start server
server.listen(PORT, async () => {
	console.log(`🚀 Server Running on port ${PORT}`);
	await connectToMongoDB();
});
