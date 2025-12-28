import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";
import useTyping from "../../hooks/useTyping";

const Messages = () => {
  const { messages, loading } = useGetMessages();
  const { messages: liveMessages } = useConversation(); // ✅ listen to real-time updates
  useListenMessages();
  const { typingUsers } = useTyping();

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
    <div className="px-4 flex-1 overflow-y-auto min-h-0">
      {!loading && displayMessages.length > 0 && 
        displayMessages.map((message) => (
          <div key={message._id || Math.random()} ref={lastMessageRef}>
            <Message message={message} />
          </div>
        ))
      }

      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {!loading && displayMessages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-center text-gray-400">Send a message to start the conversation</p>
        </div>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>typing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
