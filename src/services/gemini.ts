import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
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
