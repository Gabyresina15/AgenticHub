import Message from "../models/Message.js";
import { SESSION_SYSTEM_PROMPT } from "../prompts/index.js";

const DEFAULT_WINDOW = Number(process.env.CONTEXT_WINDOW_SIZE || 10);

export async function ensureSystemMessage(sessionId) {
  const existing = await Message.findOne({ sessionId, index: 0 });
  if (existing) return existing;
  return Message.create({
    sessionId,
    index: 0,
    role: "system",
    content: SESSION_SYSTEM_PROMPT,
    agent: "orchestrator",
  });
}

export async function nextIndex(sessionId) {
  const latest = await Message.findOne({ sessionId }).sort({ index: -1 }).select("index");
  return latest ? latest.index + 1 : 1;
}

export async function appendMessage(sessionId, role, content, agent = null) {
  await ensureSystemMessage(sessionId);
  return Message.create({
    sessionId,
    index: await nextIndex(sessionId),
    role,
    content,
    agent,
  });
}

export async function getContextWindow(sessionId, limit = DEFAULT_WINDOW) {
  const system = await Message.findOne({ sessionId, index: 0 });
  const recent = await Message.find({ sessionId, index: { $gt: 0 } })
    .sort({ index: -1 })
    .limit(limit);
  const ordered = recent.reverse();
  return system ? [system, ...ordered] : ordered;
}
