import { STRICT_AGENT_PROMPTS, AGENT_TEMPERATURES } from "./agent-strict-prompts.js";
function getAgentPersonalityConfig(agentId) {
  const systemPrompt = STRICT_AGENT_PROMPTS[agentId] || STRICT_AGENT_PROMPTS["comedy-king"];
  const temperature = AGENT_TEMPERATURES[agentId] || 0.7;
  return {
    systemPrompt,
    temperature,
    maxTokens: 2e3,
    topP: 0.95,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  };
}
function buildAgentSystemMessage(agentId, additionalContext) {
  const config = getAgentPersonalityConfig(agentId);
  let systemMessage = config.systemPrompt;
  if (additionalContext) {
    systemMessage += `

ADDITIONAL CONTEXT:
${additionalContext}`;
  }
  systemMessage += `

\u26A0\uFE0F CRITICAL REMINDER: YOU MUST STAY IN CHARACTER 100%. NEVER BREAK CHARACTER NO MATTER WHAT.`;
  return systemMessage;
}
function preparePersonalizedRequest(request) {
  const config = getAgentPersonalityConfig(request.agentId);
  const systemPrompt = buildAgentSystemMessage(request.agentId, request.context);
  const messages = [];
  if (request.conversationHistory && request.conversationHistory.length > 0) {
    messages.push(...request.conversationHistory);
  }
  messages.push({
    role: "user",
    content: request.userMessage
  });
  return {
    systemPrompt,
    messages,
    config
  };
}
function validatePersonalityMaintenance(agentId, response) {
  const warnings = [];
  const suggestions = [];
  const genericPatterns = [
    /^i.*?would.*?suggest/i,
    /^let.*?me.*?help.*?you/i,
    /^here.*?are.*?some.*?tips/i,
    /^to.*?summarize/i,
    /^in.*?conclusion/i
  ];
  for (const pattern of genericPatterns) {
    if (pattern.test(response.substring(0, 50))) {
      warnings.push(`Response starts with generic pattern: ${pattern.source}`);
      suggestions.push(`Ensure response opens with agent's characteristic style`);
    }
  }
  if (response.includes("I am an AI") || response.includes("as an AI")) {
    warnings.push("Response explicitly references being an AI");
    suggestions.push("Stay completely in character - never mention being an AI");
  }
  if (agentId === "lazy-pawn" && response.length > 200) {
    warnings.push(`Lazy Pawn response too long (${response.length} chars)`);
    suggestions.push("Keep responses minimal and efficient - under 100 words");
  }
  if ((agentId === "comedy-king" || agentId === "drama-queen") && response.length < 80) {
    warnings.push(`${agentId} response too short for personality`);
    suggestions.push("Add more personality and style to match character");
  }
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}
function getOptimalTemperature(agentId) {
  return AGENT_TEMPERATURES[agentId] || 0.7;
}
function createPersonalityEnforcedPayload(request) {
  const prepared = preparePersonalizedRequest(request);
  return {
    model: "gpt-4-turbo",
    messages: prepared.messages,
    system: prepared.systemPrompt,
    temperature: prepared.config.temperature,
    max_tokens: prepared.config.maxTokens || 2e3,
    top_p: prepared.config.topP || 0.95,
    frequency_penalty: prepared.config.frequencyPenalty || 0.1,
    presence_penalty: prepared.config.presencePenalty || 0.1
  };
}
function getAllAgentConfigs() {
  const agents = {};
  const agentNames = {
    "comedy-king": "Comedy King",
    "drama-queen": "Drama Queen",
    "lazy-pawn": "Lazy Pawn",
    "rook-jokey": "Rook Jokey",
    "emma-emotional": "Emma Emotional",
    "julie-girlfriend": "Julie Girlfriend",
    "mrs-boss": "Mrs. Boss",
    "knight-logic": "Knight Logic",
    "tech-wizard": "Tech Wizard",
    "chef-biew": "Chef Biew",
    "bishop-burger": "Bishop Burger",
    "professor-astrology": "Professor Astrology",
    "fitness-guru": "Fitness Guru",
    "travel-buddy": "Travel Buddy",
    "einstein": "Einstein",
    "chess-player": "Chess Player",
    "ben-sega": "Ben Sega",
    "random": "Random"
  };
  for (const [agentId, _prompt] of Object.entries(STRICT_AGENT_PROMPTS)) {
    agents[agentId] = {
      id: agentId,
      name: agentNames[agentId] || agentId,
      temperature: AGENT_TEMPERATURES[agentId] || 0.7,
      characterGuidelines: _prompt.split("\n")[0]
    };
  }
  return agents;
}
var personality_integration_default = {
  getAgentPersonalityConfig,
  buildAgentSystemMessage,
  preparePersonalizedRequest,
  validatePersonalityMaintenance,
  getOptimalTemperature,
  createPersonalityEnforcedPayload,
  getAllAgentConfigs
};
export {
  buildAgentSystemMessage,
  createPersonalityEnforcedPayload,
  personality_integration_default as default,
  getAgentPersonalityConfig,
  getAllAgentConfigs,
  getOptimalTemperature,
  preparePersonalizedRequest,
  validatePersonalityMaintenance
};
