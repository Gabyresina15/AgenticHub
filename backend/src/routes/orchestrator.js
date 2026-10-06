import express from "express";
import { routeAgent } from "../ai/router/agentRouter.js";
import { getAgentRunner } from "../ai/agents/registry.js";
import { appendMessage, ensureSystemMessage, getContextWindow } from "../services/sessionContext.js";
import { sendContract } from "../utils/apiResponse.js";

const router = express.Router();

router.post("/orchestrate", async (req, res) => {
  const startedAt = Date.now();
  const { sessionId, message } = req.body || {};

  if (!sessionId || !message) {
    return sendContract(res, {
      httpStatus: 400,
      status: "error",
      data: { message: "sessionId y message son obligatorios" },
      agentUsed: null,
      startedAt,
    });
  }

  try {
    const agentUsed = await routeAgent(message);
    await ensureSystemMessage(sessionId);
    const context = await getContextWindow(sessionId);
    await appendMessage(sessionId, "user", message, agentUsed);
    const run = getAgentRunner(agentUsed);
    const result = await run({ message, context });
    await appendMessage(sessionId, "model", result.text, agentUsed);

    return sendContract(res, {
      status: "ok",
      data: {
        reply: result.text,
        sessionId,
        lesson: result.lesson || null,
        trace: result.trace || [],
      },
      agentUsed,
      startedAt,
    });
  } catch (error) {
    console.error("Error en orchestrate:", error);
    return sendContract(res, {
      httpStatus: 500,
      status: "error",
      data: { message: error.message || "Error al orquestar la solicitud" },
      agentUsed: null,
      startedAt,
    });
  }
});

export default router;
