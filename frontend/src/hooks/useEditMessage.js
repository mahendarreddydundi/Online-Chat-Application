import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useEditMessage = () => {
	const [loading, setLoading] = useState(false);
	const { setMessages } = useConversation();

	const editMessage = async (messageId, newMessage) => {
		if (!newMessage.trim()) {
			toast.error("Message cannot be empty");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(`/api/messages/${messageId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ message: newMessage }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to edit message");
			}

			// Update messages in state
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id?.toString() === messageId?.toString() ? data : msg
				)
			);

			toast.success("Message edited");
		} catch (error) {
			console.error("Error editing message:", error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, editMessage };
};

export default useEditMessage;

