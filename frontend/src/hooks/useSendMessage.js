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
        credentials: "include",
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Add message immediately to sender's chat for instant feedback
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id?.toString() === data._id?.toString());
          return exists ? prev : [...prev, data];
        });
        
        // ✅ Also emit to socket for receiver (backend also handles this, but this ensures it)
        socket?.emit("sendMessage", data);
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