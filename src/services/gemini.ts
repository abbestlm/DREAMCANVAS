import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (prompt: string) => {
  // Using Pollinations.ai for free, unrestricted image generation
  // This bypasses Google's regional restrictions for Gemini Free Tier in Algeria/Mexico
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
  
  // We fetch it to ensure the image is ready and to handle errors
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to generate image");
  
  return url;
};

export const analyzeImage = async (imagePrompt: string, base64Image: string) => {
  const ai = getAI();
  const [mimeType, data] = base64Image.split(";base64,");
  const actualMimeType = mimeType.split(":")[1];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: actualMimeType,
            data: data,
          },
        },
        { text: imagePrompt },
      ],
    },
  });

  return response.text;
};

export const chatWithAI = async (message: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
  });
  return response.text;
};
