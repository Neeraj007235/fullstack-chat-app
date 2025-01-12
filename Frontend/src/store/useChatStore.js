import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import notificationSoundFile from "../../public/sounds/notification.mp3"; // Import the sound file directly
import notificationAiSound from "../../public/sounds/notificationAI.mp3"

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Check if the message is an AI message
      const isAIMessage = newMessage.isAI;
      const notificationSound = new Audio(
        isAIMessage ? notificationAiSound : notificationSoundFile // AI or normal sound
      );

      // If the message is an AI message, play sound for both sender and receiver immediately
      if (isAIMessage) {
        notificationSound.play(); // AI sound for both sides
      }

      // Check if the receiver is online to play normal sound
      const receiverSocketId = useAuthStore.getState().onlineUsers.includes(selectedUser._id);

      // Play normal notification sound only if the receiver is online
      if (!isAIMessage && receiverSocketId) {
        notificationSound.play(); // Normal sound for receiver only if online
      }

      // Add the new message to the state and trigger UI update
      set({
        messages: [
          ...get().messages,
          { ...newMessage, shake: true }, // Mark message for shake animation
        ],
      });

      // Reset shake animation after some time (e.g., 1 second)
      setTimeout(() => {
        set({
          messages: get().messages.map((msg) =>
            msg._id === newMessage._id ? { ...msg, shake: false } : msg
          ),
        });
      }, 1000); // Duration of shake
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] })
}));
