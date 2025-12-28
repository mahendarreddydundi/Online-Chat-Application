import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useDeleteMessage = () => {
	const [loading, setLoading] = useState(false);
	const { setMessages } = useConversation();

	const deleteMessage = async (messageId) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/messages/${messageId}`, {
				method: "DELETE",
				credentials: "include",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to delete message");
			}

			// Update messages in state
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id?.toString() === messageId?.toString() ? data : msg
				)
			);

			toast.success("Message deleted");
		} catch (error) {
			console.error("Error deleting message:", error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, deleteMessage };
};

export default useDeleteMessage;

