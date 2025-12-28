import { useState } from "react";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";

const useMessageReaction = () => {
	const [loading, setLoading] = useState(false);
	const { setMessages } = useConversation();
	const { authUser } = useAuthContext();

	const addReaction = async (messageId, emoji) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/messages/${messageId}/reaction`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ emoji }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to add reaction");
			}

			// Update messages in state
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id?.toString() === messageId?.toString() ? data : msg
				)
			);
		} catch (error) {
			console.error("Error adding reaction:", error);
		} finally {
			setLoading(false);
		}
	};

	const removeReaction = async (messageId) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/messages/${messageId}/reaction`, {
				method: "DELETE",
				credentials: "include",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to remove reaction");
			}

			// Update messages in state
			setMessages((prev) =>
				prev.map((msg) =>
					msg._id?.toString() === messageId?.toString() ? data : msg
				)
			);
		} catch (error) {
			console.error("Error removing reaction:", error);
		} finally {
			setLoading(false);
		}
	};

	const toggleReaction = async (messageId, emoji, currentReactions) => {
		const hasReaction = currentReactions?.some(
			(r) => r.userId?.toString() === authUser._id?.toString() && r.emoji === emoji
		);

		if (hasReaction) {
			await removeReaction(messageId);
		} else {
			await addReaction(messageId, emoji);
		}
	};

	return { loading, addReaction, removeReaction, toggleReaction };
};

export default useMessageReaction;

