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
		const receiverSocketId = getReceiverSocketId(receiverId.toString());
		const senderSocketId = getReceiverSocketId(senderId.toString());

		// Send message to receiver (so they see it instantly)
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		// Send message to sender also (so they see it instantly in their own chat)
		if (senderSocketId) {
			io.to(senderSocketId).emit("newMessage", newMessage);
		}

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

		// Filter out deleted messages
		const messages = conversation.messages.filter(msg => !msg.deleted);

		res.status(200).json(messages);
	} catch (error) {
		console.error("Error in getMessages controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const userId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Check if user is the sender
		if (message.senderId.toString() !== userId.toString()) {
			return res.status(403).json({ error: "Unauthorized - You can only delete your own messages" });
		}

		// Soft delete
		message.deleted = true;
		message.message = "This message was deleted";
		await message.save();

		// Emit to both users
		const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
		const senderSocketId = getReceiverSocketId(message.senderId.toString());

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageDeleted", message);
		}
		if (senderSocketId) {
			io.to(senderSocketId).emit("messageDeleted", message);
		}

		res.status(200).json(message);
	} catch (error) {
		console.error("Error in deleteMessage controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const editMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { message: newMessage } = req.body;
		const userId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Check if user is the sender
		if (message.senderId.toString() !== userId.toString()) {
			return res.status(403).json({ error: "Unauthorized - You can only edit your own messages" });
		}

		// Check if message is deleted
		if (message.deleted) {
			return res.status(400).json({ error: "Cannot edit deleted message" });
		}

		message.message = newMessage;
		message.edited = true;
		await message.save();

		// Emit to both users
		const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
		const senderSocketId = getReceiverSocketId(message.senderId.toString());

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageEdited", message);
		}
		if (senderSocketId) {
			io.to(senderSocketId).emit("messageEdited", message);
		}

		res.status(200).json(message);
	} catch (error) {
		console.error("Error in editMessage controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const addReaction = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { emoji } = req.body;
		const userId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Remove existing reaction from this user if any
		message.reactions = message.reactions.filter(
			reaction => reaction.userId.toString() !== userId.toString()
		);

		// Add new reaction
		message.reactions.push({ userId, emoji });
		await message.save();

		// Emit to both users
		const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
		const senderSocketId = getReceiverSocketId(message.senderId.toString());

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageReaction", message);
		}
		if (senderSocketId) {
			io.to(senderSocketId).emit("messageReaction", message);
		}

		res.status(200).json(message);
	} catch (error) {
		console.error("Error in addReaction controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const removeReaction = async (req, res) => {
	try {
		const { messageId } = req.params;
		const userId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Remove user's reaction
		message.reactions = message.reactions.filter(
			reaction => reaction.userId.toString() !== userId.toString()
		);
		await message.save();

		// Emit to both users
		const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
		const senderSocketId = getReceiverSocketId(message.senderId.toString());

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageReaction", message);
		}
		if (senderSocketId) {
			io.to(senderSocketId).emit("messageReaction", message);
		}

		res.status(200).json(message);
	} catch (error) {
		console.error("Error in removeReaction controller:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
