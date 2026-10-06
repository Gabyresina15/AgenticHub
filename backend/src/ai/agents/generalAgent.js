import { GoogleGenAI } from "@google/genai";
import { GENERAL_SYSTEM_PROMPT } from "../../prompts/index.js";

export async function runGeneralAgent({ message, context = [] }) {
  if (!process.env.GEMINI_API_KEY) {
    return { text: "Agente general activo. Configura GEMINI_API_KEY para respuestas del modelo." };
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = context
    .filter((item) => item.role === "user" || item.role === "model")
    .map((item) => ({ role: item.role, parts: [{ text: item.content }] }));
  contents.push({ role: "user", parts: [{ text: message }] });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents,
    config: { systemInstruction: GENERAL_SYSTEM_PROMPT, temperature: 0.2 },
  });
  return { text: response.text || "Sin respuesta." };
}
