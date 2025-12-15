import { GoogleGenAI } from "@google/genai";

// Safe API key retrieval that works in browsers, Vite, and standard environments
const getApiKey = () => {
  try {
    // Check standard process.env (Node/CRA)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Check Vite specific env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Error reading environment variables", e);
  }
  return ''; // Return empty string if not found (will be handled by API error)
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getMedicalAdviceStream = async (
  query: string, 
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const model = 'gemini-2.5-flash'; 
    const systemInstruction = `
      You are an emergency medical assistant. 
      CRITICAL PROTOCOL:
      1. Keep answers SHORT. Bullet points only.
      2. If life-threatening, start with "CALL 911/EMERGENCY NOW".
      3. No fluff. Direct actions only.
      4. Tone: Calm, Authoritative, Urgent.
    `;

    const response = await ai.models.generateContentStream({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [{ text: query }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("Connection Error. Call Emergency Services immediately.");
  }
};