import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();
	const { selectedConversation, setMessages } = useConversation();

	useEffect(() => {
		if (!socket || !authUser) return;

		const handleNewMessage = (newMessage) => {
			// Convert ObjectId to string for comparison
			const loggedInUserId = authUser._id?.toString();
			const messageSenderId = newMessage.senderId?.toString();
			const messageReceiverId = newMessage.receiverId?.toString();
			const selectedConversationId = selectedConversation?._id?.toString();

			// ✅ Only process messages for the current open conversation
			if (
				selectedConversationId &&
				(messageSenderId === selectedConversationId || messageReceiverId === selectedConversationId)
			) {
				const isFromCurrentUser = messageSenderId === loggedInUserId;

				// ✅ Add shake effect and sound only for messages from others
				if (!isFromCurrentUser) {
					newMessage.shouldShake = true;

					// 🔊 Play notification sound safely
					try {
						const sound = new Audio(notificationSound);
						sound.play().catch(() => {});
					} catch (e) {
						console.warn("Notification sound error:", e);
					}
				}

				// ✅ Prevent duplicates and add message (including sender's own messages)
				setMessages((prev) => {
					const exists = prev.some((msg) => msg._id?.toString() === newMessage._id?.toString());
					return exists ? prev : [...prev, newMessage];
				});
			}
		};

		const handleMessageDeleted = (deletedMessage) => {
			const selectedConversationId = selectedConversation?._id?.toString();
			const messageSenderId = deletedMessage.senderId?.toString();
			const messageReceiverId = deletedMessage.receiverId?.toString();

			if (
				selectedConversationId &&
				(messageSenderId === selectedConversationId || messageReceiverId === selectedConversationId)
			) {
				setMessages((prev) =>
					prev.map((msg) =>
						msg._id?.toString() === deletedMessage._id?.toString() ? deletedMessage : msg
					)
				);
			}
		};

		const handleMessageEdited = (editedMessage) => {
			const selectedConversationId = selectedConversation?._id?.toString();
			const messageSenderId = editedMessage.senderId?.toString();
			const messageReceiverId = editedMessage.receiverId?.toString();

			if (
				selectedConversationId &&
				(messageSenderId === selectedConversationId || messageReceiverId === selectedConversationId)
			) {
				setMessages((prev) =>
					prev.map((msg) =>
						msg._id?.toString() === editedMessage._id?.toString() ? editedMessage : msg
					)
				);
			}
		};

		const handleMessageReaction = (reactedMessage) => {
			const selectedConversationId = selectedConversation?._id?.toString();
			const messageSenderId = reactedMessage.senderId?.toString();
			const messageReceiverId = reactedMessage.receiverId?.toString();

			if (
				selectedConversationId &&
				(messageSenderId === selectedConversationId || messageReceiverId === selectedConversationId)
			) {
				setMessages((prev) =>
					prev.map((msg) =>
						msg._id?.toString() === reactedMessage._id?.toString() ? reactedMessage : msg
					)
				);
			}
		};

		socket.on("newMessage", handleNewMessage);
		socket.on("messageDeleted", handleMessageDeleted);
		socket.on("messageEdited", handleMessageEdited);
		socket.on("messageReaction", handleMessageReaction);

		return () => {
			socket.off("newMessage", handleNewMessage);
			socket.off("messageDeleted", handleMessageDeleted);
			socket.off("messageEdited", handleMessageEdited);
			socket.off("messageReaction", handleMessageReaction);
		};
	}, [socket, authUser, setMessages, selectedConversation]);
};

export default useListenMessages;