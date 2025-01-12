import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
