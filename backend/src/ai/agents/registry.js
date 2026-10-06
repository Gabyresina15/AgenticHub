import { runCuratorAgent } from "../ai/agents/curatorAgent.js";
import { runCommercialAgent } from "../ai/agents/commercialAgent.js";
import { runGeneralAgent } from "../ai/agents/generalAgent.js";

const agents = {
  curator: runCuratorAgent,
  commercial: runCommercialAgent,
  general: runGeneralAgent,
};

export function getAgentRunner(agentName) {
  return agents[agentName] || agents.general;
}
