import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}

		if (!process.env.JWT_SECRET) {
			console.error("JWT_SECRET is not defined in environment variables");
			return res.status(500).json({ error: "Server configuration error" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded || !decoded.userId) {
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		// JWT verification errors should return 401, not 500
		if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Unauthorized - Invalid or Expired Token" });
		}
		res.status(500).json({ error: "Internal server error" });
	}
};

export default protectRoute;
