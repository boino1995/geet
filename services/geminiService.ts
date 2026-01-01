
import { GoogleGenAI, Type } from "@google/genai";
import { Channel } from "../types";

export const analyzePlaylist = async (channels: Channel[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Sample top 50 channels to save context
  const sample = channels.slice(0, 50).map(c => `${c.name} (${c.group})`).join(', ');

  const prompt = `
    Analyze this list of IPTV channels: ${sample}.
    Provide a concise "Smart Insight" for the user. 
    1. Identify the primary content themes (e.g., European Sports, US News, Kids Entertainment).
    2. Suggest a creative "curated collection" they might enjoy based on these channels.
    3. Keep it professional, helpful, and concise (under 100 words).
    Use Markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "AI insights are currently unavailable.";
  }
};

export const suggestCategory = async (channelName: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize this TV channel: "${channelName}". Reply with ONLY one word (e.g., Sports, News, Movies, Music, Kids, Documentary, Other).`,
    });
    return response.text?.trim() || "General";
};
