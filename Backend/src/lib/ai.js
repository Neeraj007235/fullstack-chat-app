import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import cloudinary from "../lib/cloudinary.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const hfAPIUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const hfToken = process.env.Test; // Your Hugging Face API token

export const generateResult = async (prompt) => {
  // Define a system instruction to guide the model
  const systemInstruction = `
    You are an AI assistant that provides the latest and most up-to-date information. 
    Always base your responses on the most current knowledge available up to today. 
    If real-time data is requested, acknowledge your limitations but attempt to provide
    accurate predictions or guidance based on recent trends and information.
  `;

  // Combine the system instruction with the user prompt
  const enrichedPrompt = `${systemInstruction}\n\nUser Prompt: ${prompt}`;

  // Generate content using the Gemini model
  const result = await model.generateContent(enrichedPrompt);
  return result.response.text();
};


// Generate image using Hugging Face API
export const generateImage = async (prompt) => {
  try {
    const response = await axios.post(
      hfAPIUrl,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
        },
        responseType: "arraybuffer", // Correct response type for binary data
      }
    );

    // Convert the response data (ArrayBuffer) to a Buffer
    const buffer = Buffer.from(response.data);

    // Convert the buffer to a base64 string
    const base64Image = buffer.toString("base64");

    // Upload the base64 image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
      resource_type: "image",  // Cloudinary expects images by default
    });

    // Return the Cloudinary image URL
    const imageUrl = uploadResponse.secure_url;
    return imageUrl;
  } catch (error) {
    console.error("Error generating image from Hugging Face:", error.message);
    throw new Error("Error generating image.");
  }
};
