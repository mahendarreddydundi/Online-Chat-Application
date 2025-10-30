import { useState } from "react";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { setMessages, selectedConversation } = useConversation();
  const { socket } = useSocketContext();

  const sendMessage = async (message) => {
    if (!selectedConversation?._id) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/messages/send/${selectedConversation._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Don’t add message manually here (socket will handle it)
        socket?.emit("sendMessage", data); // still notify receiver
      } else {
        console.error("Failed to send message:", data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessage };
};

export default useSendMessage;
