export function sendContract(res, { httpStatus = 200, status = "ok", data = null, agentUsed = null, startedAt }) {
  return res.status(httpStatus).json({
    status,
    data,
    agent_used: agentUsed,
    execution_ms: Date.now() - startedAt,
  });
}
