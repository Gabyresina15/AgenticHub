import Lesson from "../models/Lesson.js";
import { runCuratorAgent } from "../ai/agents/curatorAgent.js";
import { sendContract } from "../utils/apiResponse.js";

export const investigarTema = async (req, res) => {
  const startedAt = Date.now();
  const { topic } = req.body || {};
  if (!topic) {
    return sendContract(res, {
      httpStatus: 400,
      status: "error",
      data: { message: "Falta el campo topic" },
      agentUsed: "curator",
      startedAt,
    });
  }

  try {
    const result = await runCuratorAgent({ message: topic, context: [] });
    const lesson = new Lesson({
      title: result.lesson.title,
      contentMarkdown: result.lesson.contentMarkdown,
      lessonType: "reto_codigo",
      quizData: result.lesson.quizData,
      challenge: result.lesson.challenge,
      status: "draft",
    });
    await lesson.save();
    return sendContract(res, {
      httpStatus: 201,
      status: "ok",
      data: lesson,
      agentUsed: "curator",
      startedAt,
    });
  } catch (error) {
    console.error("Error al generar leccion:", error);
    return sendContract(res, {
      httpStatus: 500,
      status: "error",
      data: { message: "Error en el servidor o IA saturada" },
      agentUsed: "curator",
      startedAt,
    });
  }
};
