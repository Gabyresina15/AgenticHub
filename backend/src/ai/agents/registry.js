import { runCuratorAgent } from "./curatorAgent.js";
import { runCommercialAgent } from "./commercialAgent.js";
import { runGeneralAgent } from "./generalAgent.js";

const agents = {
  curator: runCuratorAgent,
  commercial: runCommercialAgent,
  general: runGeneralAgent,
};

export function getAgentRunner(agentName) {
  return agents[agentName] || agents.general;
}
