import { useState, useEffect, useRef } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthContext } from "../../context/AuthContext";
import useConversation from "../../zustand/useConversation";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const typingTimeoutRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault(); // ✅ prevents page refresh
		if (!message.trim()) return; // ignore empty messages
		
		// Stop typing indicator
		if (socket && selectedConversation) {
			socket.emit("stopTyping", {
				receiverId: selectedConversation._id,
				senderId: authUser._id,
			});
		}
		
		await sendMessage(message);
		setMessage("");
		
		// Clear typing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
		}
	};

	const handleChange = (e) => {
		setMessage(e.target.value);

		// Emit typing indicator
		if (socket && selectedConversation && e.target.value.trim()) {
			socket.emit("typing", {
				receiverId: selectedConversation._id,
				senderId: authUser._id,
			});

			// Clear existing timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			// Stop typing after 2 seconds of inactivity
			typingTimeoutRef.current = setTimeout(() => {
				if (socket && selectedConversation) {
					socket.emit("stopTyping", {
						receiverId: selectedConversation._id,
						senderId: authUser._id,
					});
				}
			}, 2000);
		} else if (socket && selectedConversation) {
			// Stop typing if message is empty
			socket.emit("stopTyping", {
				receiverId: selectedConversation._id,
				senderId: authUser._id,
			});
		}
	};

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	return (
		<form className="px-4 py-3 flex-shrink-0 border-t border-slate-500" onSubmit={handleSubmit}>
			<div className="w-full relative">
				<input
					type="text"
					className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white pr-10"
					placeholder="Send a message"
					value={message}
					onChange={handleChange}
				/>
				<button
					type="submit"
					disabled={loading}
					className="absolute inset-y-0 end-0 flex items-center pe-3 text-white hover:text-sky-400"
				>
					{loading ? <div className="loading loading-spinner loading-sm"></div> : <BsSend className="w-5 h-5" />}
				</button>
			</div>
		</form>
	);
};

export default MessageInput;
