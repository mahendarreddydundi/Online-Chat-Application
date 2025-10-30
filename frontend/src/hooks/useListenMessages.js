import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { selectedConversation, setMessages } = useConversation();

	useEffect(() => {
		if (!socket) return;

		const handleNewMessage = (newMessage) => {
			// ✅ Ignore message if it’s from the same sender (you)
			const loggedInUserId = localStorage.getItem("userId"); // or get from your auth context
			if (newMessage.senderId === loggedInUserId) return;

			// ✅ Only add messages for the current open conversation
			if (
				newMessage.senderId === selectedConversation?._id ||
				newMessage.receiverId === selectedConversation?._id
			) {
				newMessage.shouldShake = true;

				// 🔊 Play notification sound safely
				try {
					const sound = new Audio(notificationSound);
					sound.play().catch(() => {});
				} catch (e) {
					console.warn("Notification sound error:", e);
				}

				// ✅ Prevent duplicates
				setMessages((prev) => {
					const exists = prev.some((msg) => msg._id === newMessage._id);
					return exists ? prev : [...prev, newMessage];
				});
			}
		};

		socket.on("newMessage", handleNewMessage);

		return () => socket.off("newMessage", handleNewMessage);
	}, [socket, setMessages, selectedConversation]);
};

export default useListenMessages;
