import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser && authUser._id) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: authUser._id.toString() },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
      });

      // Online users
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // 🔥 Listen for messages from backend
      newSocket.on("newMessage", (message) => {
        console.log("📩 New message received:", message);

        // Dispatch custom event
        window.dispatchEvent(
          new CustomEvent("messageReceived", { detail: message })
        );
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      return () => {
        newSocket.disconnect();
        console.log("🧹 Socket cleaned up");
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
