import mongoose from "mongoose";

const connectToMongoDB = async () => {
	try {
		const mongoUri = process.env.MONGO_DB_URI;
		
		if (!mongoUri) {
			throw new Error("MONGO_DB_URI is not defined in environment variables");
		}

		// Only use SSL for MongoDB Atlas (cloud) connections
		const isAtlas = mongoUri.includes("mongodb.net");
		const connectionOptions = {
			serverSelectionTimeoutMS: 8000,
		};

		if (isAtlas) {
			connectionOptions.ssl = true;
			connectionOptions.tlsAllowInvalidCertificates = true; // ✅ fix for Windows trust issue
		}

		await mongoose.connect(mongoUri, connectionOptions);
		console.log("✅ Connected to MongoDB successfully");
	} catch (error) {
		console.error("❌ Error connecting to MongoDB:", error.message);
		process.exit(1); // Exit process on connection failure
	}
};

export default connectToMongoDB;
