import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { generateResult } from "../lib/ai.js";  // Import AI function
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

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

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Save the user's message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage); // Emit to receiver immediately
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage); // Emit to sender immediately
    }

    res.status(201).json(newMessage);

    // Check if the message is an AI prompt
    if (text.startsWith("@ai ")) {
      const aiPrompt = text.replace("@ai ", "").trim();
      const aiReply = await generateResult(aiPrompt); // Generate AI reply

      // Create AI message
      const aiMessage = new Message({
        senderId: receiverId, // AI acts as the receiver
        receiverId: senderId, // Reply to the original sender
        text: aiReply,
        isAI: true, // Mark message as AI
        senderName: "AI", // Mark sender as AI
      });

      await aiMessage.save();

      // Emit AI message to both sender and receiver
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", aiMessage); // Emit AI message to sender
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", aiMessage); // Emit AI message to receiver
      }
    }
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
