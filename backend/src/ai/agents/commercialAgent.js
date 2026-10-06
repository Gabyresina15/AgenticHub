import { GoogleGenAI } from "@google/genai";
import { COMMERCIAL_SYSTEM_PROMPT } from "../../prompts/index.js";
import { getMockTool, mockToolDefinitions } from "../../tools/mockTools.js";
import { runTool } from "../../tools/toolRunner.js";

function toContents(context, message) {
  const history = context
    .filter((item) => item.role === "user" || item.role === "model")
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.content }],
    }));
  history.push({ role: "user", parts: [{ text: message }] });
  return history;
}

export async function runCommercialAgent({ message, context = [] }) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = toContents(context, message);
  const tools = [{ functionDeclarations: mockToolDefinitions.map(({ name, description, parameters }) => ({ name, description, parameters })) }];
  const trace = [];

  for (let step = 0; step < 4; step += 1) {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents,
      config: { systemInstruction: COMMERCIAL_SYSTEM_PROMPT, tools },
    });
    const calls = response.functionCalls || [];
    if (!calls.length) {
      return { text: response.text || "No pude armar la cotizacion.", trace };
    }

    contents.push(response.candidates[0].content);
    for (const call of calls) {
      const tool = getMockTool(call.name);
      const result = tool
        ? await runTool(tool, call.args)
        : { ok: false, error: `Herramienta desconocida: ${call.name}` };
      trace.push({ name: call.name, args: call.args, result });
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: call.name, response: result } }],
      });
    }
  }

  return { text: "No pude cerrar la cotizacion en los ciclos disponibles.", trace };
}
