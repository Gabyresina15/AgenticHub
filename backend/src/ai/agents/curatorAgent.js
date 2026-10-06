import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import Topic from "../../models/Topic.js";
import {
  CURATOR_JSON_PROMPT,
  CURATOR_LESSON_PROMPT,
  CURATOR_SYSTEM_PROMPT,
} from "../../prompts/index.js";
import { runTool } from "../../tools/toolRunner.js";

const webSearchTool = {
  name: "buscar_en_internet",
  schema: z.object({ query: z.string().min(1) }).strict(),
  parameters: {
    type: "OBJECT",
    properties: {
      query: { type: "STRING", description: "Consulta de busqueda." },
    },
    required: ["query"],
  },
  execute: async (args) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return { ok: false, error: "Falta TAVILY_API_KEY" };
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: args.query,
        search_depth: "basic",
        include_answer: true,
        max_results: 3,
      }),
    });
    const data = await response.json();
    if (!data.results?.length) return { ok: true, result: "Sin resultados relevantes." };
    return {
      ok: true,
      result: `Resumen: ${data.answer || ""}\n${data.results
        .map((item) => `Fuente: ${item.url}\n${item.content}`)
        .join("\n---\n")}`,
    };
  },
};

async function generate(ai, contents, withTools = false) {
  return ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: CURATOR_SYSTEM_PROMPT,
      ...(withTools
        ? { tools: [{ functionDeclarations: [{ name: webSearchTool.name, description: "Busca informacion actualizada.", parameters: webSearchTool.parameters }] }] }
        : {}),
    },
  });
}

export async function runCuratorAgent({ message, context = [] }) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const topic = await Topic.findOne({ slug: "agentes-ia" });
  let contents = [
    ...context
      .filter((item) => item.role !== "system")
      .map((item) => ({
        role: item.role === "model" ? "model" : "user",
        parts: [{ text: item.content }],
      })),
    { role: "user", parts: [{ text: CURATOR_LESSON_PROMPT(message) }] },
  ];

  let response = await generate(ai, contents, true);
  const calls = response.functionCalls || [];
  if (calls.length > 0) {
    const call = calls[0];
    const toolResult = await runTool(webSearchTool, call.args);
    contents.push(response.candidates[0].content);
    contents.push({
      role: "user",
      parts: [{ functionResponse: { name: call.name, response: toolResult } }],
    });
    response = await generate(ai, contents, false);
  }

  const contenidoTexto = response.text || "";
  const structured = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: CURATOR_JSON_PROMPT(contenidoTexto),
    config: { responseMimeType: "application/json", systemInstruction: CURATOR_SYSTEM_PROMPT },
  });
  const parsed = JSON.parse(structured.text);
  const markdown = String(parsed.contentMarkdown || contenidoTexto).split("🧠")[0].trim();

  return {
    text: parsed.title ? `${parsed.title}\n\n${markdown}` : markdown,
    lesson: {
      topicId: topic?._id || null,
      title: parsed.title || message,
      contentMarkdown: markdown,
      lessonType: "reto_codigo",
      quizData: parsed.quizData || null,
      challenge: parsed.challenge || null,
      status: "draft",
    },
  };
}
