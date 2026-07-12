/**
 * @file    gemini.ts
 * @desc    Google Gemini SDK client configuration and helper utilities.
 *          Initializes the new @google/genai SDK wrapper.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

// Initialize Gemini client singleton
export const geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Generate text using the Gemini 2.0 Flash model.
 *
 * @param prompt            The prompt containing user message + db contexts.
 * @param systemInstruction The persona instruction for formatting/security.
 */
export async function generateGeminiText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  // If the key is still placeholder, return a friendly placeholder note
  if (env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || !env.GEMINI_API_KEY) {
    return "[System Message: GEMINI_API_KEY is not configured in the backend .env. Please configure your Google Gemini API key to activate AI replies.]";
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        // Set maximum token count to keep responses within around 120 words limit
        maxOutputTokens: 250,
        temperature: 0.2, // Lower temperature for factual accuracy
      },
    });

    return response.text || "I couldn't generate a reply at this time.";
  } catch (err: any) {
    console.error("❌  Gemini SDK Generation failed:", err);
    throw err;
  }
}
