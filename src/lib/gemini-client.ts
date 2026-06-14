import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("Missing GEMINI_API_KEY environment variable");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};
