import { useEffect, useState } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";

const useTyping = () => {
	const [typingUsers, setTypingUsers] = useState([]);
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();

	useEffect(() => {
		if (!socket || !selectedConversation) return;

		const handleTyping = ({ senderId }) => {
			if (senderId?.toString() === selectedConversation._id?.toString()) {
				setTypingUsers((prev) => {
					if (!prev.includes(senderId)) {
						return [...prev, senderId];
					}
					return prev;
				});
			}
		};

		const handleStopTyping = ({ senderId }) => {
			if (senderId?.toString() === selectedConversation._id?.toString()) {
				setTypingUsers((prev) => prev.filter((id) => id?.toString() !== senderId?.toString()));
			}
		};

		socket.on("typing", handleTyping);
		socket.on("stopTyping", handleStopTyping);

		return () => {
			socket.off("typing", handleTyping);
			socket.off("stopTyping", handleStopTyping);
			setTypingUsers([]);
		};
	}, [socket, selectedConversation]);

	return { typingUsers };
};

export default useTyping;

