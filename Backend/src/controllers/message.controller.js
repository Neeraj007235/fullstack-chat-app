import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { generateResult, generateImage } from "../lib/ai.js";  // Import AI function
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

    // Regular image upload to Cloudinary
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Save the regular message (either text or image uploaded by user)
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage); // Emit to receiver
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage); // Emit to sender
    }

    // Respond to the client at this point, after all the database and socket actions
    res.status(201).json(newMessage);

    // If message starts with @ai (AI text response)
    if (text.startsWith("@ai ")) {
      const aiPrompt = text.replace("@ai ", "").trim();
      const aiReply = await generateResult(aiPrompt); // Get AI text reply

      const aiMessage = new Message({
        senderId: receiverId, // AI responds as the receiver
        receiverId: senderId, // The message is for the sender
        text: aiReply,
        isAI: true,  // Mark message as AI-generated
        senderName: "AI", // Sender's name is "AI"
      });

      await aiMessage.save();

      // Emit the AI response to both users
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", aiMessage);
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", aiMessage);
      }
    }

    // If message starts with @imagine (Image generation via Hugging Face)
    if (text.startsWith("@imagine ")) {
      const imagePrompt = text.replace("@imagine ", "").trim();
      const imageUrlFromHuggingFace = await generateImage(imagePrompt); // Get image URL from Hugging Face

      // Save the generated image URL
      const imageMessage = new Message({
        senderId: receiverId, // AI responds as the receiver
        receiverId: senderId, // The message is for the sender
        image: imageUrlFromHuggingFace, // Store the image URL from Cloudinary
        isAI: true,  // Mark as AI message
        senderName: "AI",  // Sender's name is "AI"
      });

      await imageMessage.save();

      // Emit the generated image to both users
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", imageMessage);
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", imageMessage);
      }
    }
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
