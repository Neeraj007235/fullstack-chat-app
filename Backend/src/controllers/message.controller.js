import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId } from "../lib/socket.js";
import { saveMessage, handleAIResponse, handleImageGeneration, uploadImage, emitToSockets } from "../services/message.service.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Upload image if provided
    let imageUrl;
    if (image) {
      imageUrl = await uploadImage(image);
    }

    // Save the regular message
    const newMessage = await saveMessage(senderId, receiverId, text, imageUrl);

    // Emit the message to both sender and receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);
    emitToSockets(senderSocketId, receiverSocketId, newMessage);

    res.status(201).json(newMessage);

    // Handle AI text response
    if (text.startsWith("@ai ")) {
      const aiMessage = await handleAIResponse(senderId, receiverId, text);
      emitToSockets(senderSocketId, receiverSocketId, aiMessage);
    }

    // Handle image generation
    if (text.startsWith("@imagine ")) {
      const imageMessage = await handleImageGeneration(senderId, receiverId, text);
      emitToSockets(senderSocketId, receiverSocketId, imageMessage);
    }
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};