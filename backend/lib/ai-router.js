import { GoogleGenerativeAI } from "@google/generative-ai";
import { STRICT_AGENT_PROMPTS, AGENT_TEMPERATURES } from './agent-strict-prompts.js';

// Use centralized prompts from agent-strict-prompts.js
const AGENT_SYSTEM_PROMPTS = STRICT_AGENT_PROMPTS;
class AIRouter {
  providers = /* @__PURE__ */ new Map();
  config;
  geminiAI;
  constructor(config) {
    this.config = config;
    this.initializeProviders();
  }
  initializeProviders() {
    if (this.config.providers.ollama) {
      this.providers.set("ollama", {
        name: "ollama",
        priority: 1,
        available: true,
        latency: 0,
        errorCount: 0,
        circuitBreakerOpen: false
      });
    }
    if (this.config.providers.gemini?.apiKey) {
      this.geminiAI = new GoogleGenerativeAI(this.config.providers.gemini.apiKey);
      this.providers.set("gemini", {
        name: "gemini",
        priority: 2,
        available: true,
        latency: 0,
        errorCount: 0,
        circuitBreakerOpen: false
      });
    }
    if (this.config.providers.anthropic?.apiKey) {
      this.providers.set("anthropic", {
        name: "anthropic",
        priority: 3,
        available: true,
        latency: 0,
        errorCount: 0,
        circuitBreakerOpen: false
      });
    }
    if (this.config.providers.openai?.apiKey) {
      this.providers.set("openai", {
        name: "openai",
        priority: 4,
        available: true,
        latency: 0,
        errorCount: 0,
        circuitBreakerOpen: false
      });
    }
  }
  /**
   * Get the best available provider based on priority and circuit breaker status
   */
  getBestProvider() {
    const availableProviders = Array.from(this.providers.values()).filter((p) => p.available && !p.circuitBreakerOpen).sort((a, b) => a.priority - b.priority);
    return availableProviders[0] || null;
  }
  /**
   * Update provider metrics and circuit breaker status
   */
  updateProviderMetrics(providerName, success, latency) {
    const provider = this.providers.get(providerName);
    if (!provider) return;
    provider.latency = latency;
    if (success) {
      provider.errorCount = Math.max(0, provider.errorCount - 1);
    } else {
      provider.errorCount++;
      provider.lastError = /* @__PURE__ */ new Date();
      if (provider.errorCount >= this.config.circuitBreaker.errorThreshold) {
        provider.circuitBreakerOpen = true;
        console.log(`Circuit breaker opened for ${providerName}`);
        setTimeout(() => {
          provider.circuitBreakerOpen = false;
          provider.errorCount = 0;
          console.log(`Circuit breaker reset for ${providerName}`);
        }, this.config.circuitBreaker.resetTimeMs);
      }
    }
  }
  /**
   * Generate AI response using the best available provider
   */
  async generateResponse(prompt, context, systemPrompt, agentId) {
    const startTime = Date.now();
    let finalSystemPrompt = systemPrompt;
    if (!finalSystemPrompt && agentId && AGENT_SYSTEM_PROMPTS[agentId]) {
      finalSystemPrompt = AGENT_SYSTEM_PROMPTS[agentId];
    }
    const fullPrompt = this.buildPrompt(prompt, context, finalSystemPrompt);
    const providerNames = Array.from(this.providers.keys()).filter((name) => {
      const provider = this.providers.get(name);
      return provider?.available && !provider.circuitBreakerOpen;
    }).sort((a, b) => {
      const providerA = this.providers.get(a);
      const providerB = this.providers.get(b);
      return providerA.priority - providerB.priority;
    });
    for (const providerName of providerNames) {
      try {
        const response = await Promise.race([
          this.callProvider(providerName, fullPrompt),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("Timeout")), this.config.latencyBudgets.total_response_ms)
          )
        ]);
        const latency = Date.now() - startTime;
        this.updateProviderMetrics(providerName, true, latency);
        return {
          text: response,
          provider: providerName,
          latency,
          tokenCount: response.length
          // Approximate token count
        };
      } catch (error) {
        const latency = Date.now() - startTime;
        this.updateProviderMetrics(providerName, false, latency);
        console.error(`Provider ${providerName} failed:`, error);
        continue;
      }
    }
    throw new Error("All AI providers are unavailable");
  }
  /**
   * Call specific provider
   */
  async callProvider(providerName, prompt) {
    switch (providerName) {
      case "ollama":
        return this.callOllama(prompt);
      case "gemini":
        return this.callGemini(prompt);
      case "anthropic":
        return this.callAnthropic(prompt);
      case "openai":
        return this.callOpenAI(prompt);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }
  /**
   * Call Ollama local model
   */
  async callOllama(prompt) {
    if (!this.config.providers.ollama) {
      throw new Error("Ollama not configured");
    }
    const response = await fetch(`${this.config.providers.ollama.endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.providers.ollama.models[0] || "llama2",
        prompt,
        stream: false
      })
    });
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    const data = await response.json();
    return data.response || "No response from Ollama";
  }
  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    if (!this.geminiAI) {
      throw new Error("Gemini not configured");
    }
    const model = this.geminiAI.getGenerativeModel({
      model: this.config.providers.gemini?.model || "gemini-pro"
    });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }
  /**
   * Call Anthropic API (Claude)
   */
  async callAnthropic(prompt) {
    if (!this.config.providers.anthropic?.apiKey) {
      throw new Error("Anthropic not configured");
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.providers.anthropic.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.config.providers.anthropic.model || "claude-sonnet-4-20250514",
        max_tokens: 32000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }
    const data = await response.json();
    return data.content[0]?.text || "No response from Anthropic";
  }
  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    if (!this.config.providers.openai?.apiKey) {
      throw new Error("OpenAI not configured");
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.providers.openai.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.providers.openai.model || "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 32000
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from OpenAI";
  }
  /**
   * Build complete prompt with context and system instructions
   */
  buildPrompt(userPrompt, context, systemPrompt) {
    let fullPrompt = "";
    if (systemPrompt) {
      fullPrompt += `${systemPrompt}

`;
    }
    if (context) {
      fullPrompt += `Context: ${context}

`;
    }
    fullPrompt += `User: ${userPrompt}`;
    return fullPrompt;
  }
  /**
   * Get provider status for monitoring
   */
  getProviderStatus() {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      available: provider.available,
      circuitBreakerOpen: provider.circuitBreakerOpen,
      errorCount: provider.errorCount,
      averageLatency: provider.latency,
      lastError: provider.lastError
    }));
  }
  /**
   * Get system prompt for specific agent
   */
  getSystemPrompt(agentId) {
    return AGENT_SYSTEM_PROMPTS[agentId] || AGENT_SYSTEM_PROMPTS["random"];
  }
  /**
   * Get temperature setting for specific agent
   */
  getAgentTemperature(agentId) {
    return AGENT_TEMPERATURES[agentId] || 0.7;
  }
  /**
   * Get both system prompt and temperature for an agent
   */
  getAgentConfig(agentId) {
    return {
      systemPrompt: this.getSystemPrompt(agentId),
      temperature: this.getAgentTemperature(agentId)
    };
  }
}
export {
  AIRouter
};
