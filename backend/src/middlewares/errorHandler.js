import { sendContract } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error global:", err.stack);
  if (res.headersSent) return next(err);
  const startedAt = req.startedAt || Date.now();
  if (req.originalUrl?.startsWith("/api/v1") || req.originalUrl?.startsWith("/api/agent")) {
    return sendContract(res, {
      httpStatus: err.statusCode || 500,
      status: "error",
      data: { message: err.message || "Error interno del servidor." },
      agentUsed: null,
      startedAt,
    });
  }
  return res.status(err.statusCode || 500).json({
    error: err.message || "Error interno del servidor.",
    status: err.statusCode || 500,
  });
};
