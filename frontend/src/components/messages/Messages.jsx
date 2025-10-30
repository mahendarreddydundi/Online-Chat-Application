import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
  const { messages, loading } = useGetMessages();
  const { messages: liveMessages } = useConversation(); // ✅ listen to real-time updates
  useListenMessages();

  const lastMessageRef = useRef();

  useEffect(() => {
    // Scroll to the newest message smoothly
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [liveMessages]);

  // ✅ Safely ensure messages is always an array
  const displayMessages = Array.isArray(liveMessages) ? liveMessages : [];

  return (
    <div className="px-4 flex-1 overflow-auto">
      {!loading && displayMessages.length > 0 && 
        displayMessages.map((message) => (
          <div key={message._id || Math.random()} ref={lastMessageRef}>
            <Message message={message} />
          </div>
        ))
      }

      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {!loading && displayMessages.length === 0 && (
        <p className="text-center text-gray-400">Send a message to start the conversation</p>
      )}
    </div>
  );
};

export default Messages;
