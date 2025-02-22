import cloudinary from "../lib/cloudinary.js";
import { generateResult, generateImage } from "../lib/ai.js";
import Message from "../models/message.model.js";
import { io } from "../lib/socket.js";

export const saveMessage = async (senderId, receiverId, text, imageUrl = null) => {
  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  await newMessage.save();
  return newMessage;
};

export const handleAIResponse = async (senderId, receiverId, text) => {
  const aiPrompt = text.replace("@ai ", "").trim();
  const aiReply = await generateResult(aiPrompt);

  const aiMessage = new Message({
    senderId: receiverId,
    receiverId: senderId,
    text: aiReply,
    isAI: true,
    senderName: "AI",
  });

  await aiMessage.save();
  return aiMessage;
};

export const handleImageGeneration = async (senderId, receiverId, text) => {
  const imagePrompt = text.replace("@imagine ", "").trim();
  const imageUrl = await generateImage(imagePrompt);

  const imageMessage = new Message({
    senderId: receiverId,
    receiverId: senderId,
    image: imageUrl,
    isAI: true,
    senderName: "AI",
  });

  await imageMessage.save();
  return imageMessage;
};

export const uploadImage = async (image) => {
  const uploadResponse = await cloudinary.uploader.upload(image);
  return uploadResponse.secure_url;
};

export const emitToSockets = (senderSocketId, receiverSocketId, message) => {
  if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", message);
  }

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }
};
