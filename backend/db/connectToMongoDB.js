import mongoose from "mongoose";

const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI, {
			serverSelectionTimeoutMS: 8000,
			ssl: true,
			tlsAllowInvalidCertificates: true, // ✅ fix for Windows trust issue
		});
		console.log("✅ Connected to MongoDB successfully");
	} catch (error) {
		console.error("❌ Error connecting to MongoDB:", error.message);
	}
};

export default connectToMongoDB;
