import { GoogleGenAI } from "@google/genai";
import { ALLOWED_AGENTS, ROUTER_SYSTEM_PROMPT } from "../../prompts/index.js";

const allowed = new Set(ALLOWED_AGENTS);

function normalize(raw) {
  const token = String(raw || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z]/g, "");
  return allowed.has(token) ? token : "general";
}

async function classifyWithOllama(message) {
  const response = await fetch(process.env.OLLAMA_ROUTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_ROUTER_MODEL || "llama3",
      prompt: `${ROUTER_SYSTEM_PROMPT}\nMensaje: ${message}\nToken:`,
      stream: false,
      options: { temperature: 0, num_predict: 4 },
    }),
  });
  if (!response.ok) throw new Error(`Ollama respondio ${response.status}`);
  const data = await response.json();
  return normalize(data.response);
}

async function classifyWithGemini(message) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_ROUTER_MODEL || "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: message }] }],
    config: {
      systemInstruction: ROUTER_SYSTEM_PROMPT,
      temperature: 0,
    },
  });
  return normalize(response.text);
}

export async function routeAgent(message) {
  if (process.env.OLLAMA_ROUTER_URL) {
    try {
      return await classifyWithOllama(message);
    } catch (error) {
      console.error("Router local fallo, fallback a Gemini:", error.message);
    }
  }
  if (!process.env.GEMINI_API_KEY) return "general";
  return classifyWithGemini(message);
}
