import { useChatStore } from "../store/useChatStore";
import { useState, useEffect, useRef } from "react";
import Markdown from 'markdown-to-jsx';
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatHeaderDate } from "../lib/utils";
import { Download, X } from "lucide-react"; // Import Lucide icons

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Define selectedImage state
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageClick = (image) => {
    console.log("Image clicked:", image); // Debugging
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    console.log("Closing modal"); // Debugging
    setSelectedImage(null);
  };

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "image.jpg"; // Set the default file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Chat messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isNewDay = index === 0 || formatHeaderDate(messages[index - 1].createdAt) !== formatHeaderDate(message.createdAt);

          return (
            <div key={message._id}>
              {/* Display date (Today, Yesterday, etc.) */}
              {isNewDay && (
                <div className="py-2 text-center text-sm text-gray-700 font-semibold mb-4">
                  {formatHeaderDate(message.createdAt)}
                </div>
              )}
              <div
                className={`chat ${message.isAI
                  ? "chat-start chat-ai" // AI messages always on the left
                  : message.senderId === authUser._id
                    ? "chat-end" // User's own messages on the right
                    : "chat-start" // Other user's messages on the left
                  } ${message.shake ? "shake" : ""}`}
                ref={messageEndRef}
              >
                <div className="chat-image avatar flex flex-col items-center space-y-1">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full border">
                    <img
                      src={
                        message.isAI
                          ? "chatgpt-icon.png" // Use your custom AI image here
                          : message.senderId === authUser._id
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Styled AI Name Below Profile Picture */}
                  {message.isAI && (
                    <span className="text-sm font-bold text-blue-600 mt-1  px-2 py-0.5 rounded">
                      AI
                    </span>
                  )}
                </div>


                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>

                <div className="chat-bubble flex flex-col">
                  {/* Image from AI */}
                  {message.image && (
                    <div className="flex flex-col items-center">
                      <img
                        src={message.image}
                        alt="Generated AI Image"
                        className="sm:max-w-[400px] max-h-[500px] rounded-md mb-2 cursor-pointer"
                        onClick={() => handleImageClick(message.image)}
                      />
                      {/* Optional: Add a brief caption under the image */}
                      {message.isAI && (
                        <p className="text-xs text-center text-gray-600 mt-1">
                          (AI-generated image)
                        </p>
                      )}
                    </div>
                  )}
                  {/* Use Markdown for AI messages */}
                  {message.isAI ? (
                    <Markdown className="markdown-container">{message.text}</Markdown>
                  ) : (
                    <p>{message.text}</p> // Normal message
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
      <MessageInput />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          {/* Floating Action Buttons Outside the Image */}
          <div className="absolute top-2 flex justify-center w-full space-x-4">
            {/* Download button first */}
            <button
              onClick={() => downloadImage(selectedImage)}
              className="p-3 rounded-full bg-transparent border border-white text-white hover:bg-green-500 hover:border-green-500 hover:text-white transition duration-300 shadow-md"
              aria-label="Download"
            >
              <Download size={20} />
            </button>

            {/* Cancel button second */}
            <button
              onClick={closeImageModal}
              className="p-3 rounded-full bg-transparent border border-white text-white hover:bg-red-500 hover:border-red-500 hover:text-white transition duration-300 shadow-md"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Display Selected Image */}
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-full max-h-[80vh] rounded-md object-contain"
          />
        </div>
      )}

    </div>
  );
};

export default ChatContainer;
