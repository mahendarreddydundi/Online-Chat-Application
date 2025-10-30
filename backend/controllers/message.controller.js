import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		// 🔹 Find or create conversation
		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		// 🔹 Create message document
		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		conversation.messages.push(newMessage._id);

		// Save both in parallel for performance
		await Promise.all([conversation.save(), newMessage.save()]);

		// 🔥 SOCKET.IO REAL-TIME MESSAGE EMIT
		const receiverSocketId = getReceiverSocketId(receiverId);

		if (receiverSocketId) {
			// Send message to receiver (so they see it instantly)
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		// 👇 Send message to sender also (so no refresh needed)
		io.to(getReceiverSocketId(senderId))?.emit("newMessage", newMessage);

		// ✅ Return saved message to sender
		res.status(201).json(newMessage);
	} catch (error) {
		console.error("Error in sendMessage controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");

		if (!conversation) return res.status(200).json([]);

		res.status(200).json(conversation.messages);
	} catch (error) {
		console.error("Error in getMessages controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
