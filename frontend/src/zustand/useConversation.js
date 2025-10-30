import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),

  messages: [],

  // ✅ Handles both direct and functional updates safely
  setMessages: (updater) =>
    set((state) => {
      if (typeof updater === "function") {
        // Functional update (e.g., setMessages(prev => [...prev, newMsg]))
        return { messages: updater(state.messages) };
      }

      // Direct set (e.g., setMessages([...newMessages]))
      return {
        messages: Array.isArray(updater)
          ? updater
          : updater
          ? [updater] // Wrap single message in array
          : [],
      };
    }),
}));

export default useConversation;
