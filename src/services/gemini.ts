import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from AI");

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
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
