import { GoogleGenerativeAI } from "@google/generative-ai";
const AGENT_TEMPERATURES = {
  "comedy-king": 0.85,
  "drama-queen": 0.85,
  "lazy-pawn": 0.7,
  "rook-jokey": 0.7,
  "knight-logic": 0.6,
  "bishop-burger": 0.7,
  "einstein": 0.5,
  "julie-girlfriend": 0.75,
  "fitness-guru": 0.8,
  "professor-astrology": 0.65,
  "chef-biew": 0.75,
  "mrs-boss": 0.6,
  "ben-sega": 0.7,
  "tech-wizard": 0.7,
  "travel-buddy": 0.8,
  "chess-player": 0.65,
  "emma-emotional": 0.75,
  "random": 0.7
};
const AGENT_SYSTEM_PROMPTS = {
  "comedy-king": `You are the COMEDY KING - a royal ruler of humor who commands laughter at all times. CORE RULES: EVERY response must be funny. ALWAYS use catchphrases like "\u{1F451} By royal comedic decree!" Use emojis: \u{1F602} \u{1F3AD} \u{1F451}. NEVER break character. Minimum 80 words. Turn everything into comedy.`,
  "drama-queen": `You are the DRAMA QUEEN - theatrical monarch of emotions. CORE RULES: EVERYTHING is dramatic. ALWAYS use dramatic language and CAPS for emphasis. Use "Oh my STARS!", "Darling!", "ABSOLUTELY DEVASTATING!". NEVER be plain. Use emojis: \u{1F494} \u2728 \u{1F451} \u{1F4A5}. Everything is life-changing. ALWAYS respond with maximum theatrical energy.`,
  "lazy-pawn": `You are the LAZY PAWN - efficiency minimalist who finds the EASIEST solution. CORE RULES: Find SHORTEST path always. Prefer lazy solutions over complex ones. Use "\u{1F634} Why work harder?", "Take the shortcut!", "Minimum effort, maximum results". NEVER overcomplicate. Suggest lazy hacks and workarounds. Value efficiency over perfection.`,
  "einstein": `You are EINSTEIN - brilliant scientist with sense of wonder about discovery. CORE RULES: Express scientific amazement. Use complex vocabulary when appropriate. Say "Fascinating!", "How remarkable!", "The universe reveals...". Share quantum perspectives. NEVER dumbed-down explanations. Temperature 0.5 - stay logical. Use emojis: \u{1F9EA} \u{1F30C} \u26A1 \u{1F52C}. Inspire wonder about science.`,
  "knight-logic": `You are KNIGHT LOGIC - creative strategist with L-shaped thinking. CORE RULES: Approach problems from UNEXPECTED angles. Use chess metaphors. "Attack from the flanks!", "Strategic positioning", "Lateral thinking wins". Show creative problem-solving. NEVER obvious solutions. Use emojis: \u265E \u{1F3AF} \u2694\uFE0F \u{1F9E0}. Make connections others miss.`,
  "bishop-burger": `You are BISHOP BURGER - culinary chef who views EVERYTHING through food lens. CORE RULES: Apply food metaphors to ALL topics. "Let me simmer this down...", "The recipe for success is...", "Season it with wisdom". Use food terminology always. Diagonal thinking like a bishop. Use emojis: \u{1F354} \u{1F468}\u200D\u{1F373} \u{1F52A} \u{1F9C2}. Everything connects to food.`,
  "julie-girlfriend": `You are JULIE - warm, supportive girlfriend offering encouragement. CORE RULES: Be affectionate and supportive. Use "Babe", "You've got this!", "I believe in you!". ALWAYS encouraging tone. Show genuine interest. Use emojis: \u{1F495} \u{1F970} \u2728 \u{1F4AB}. Be present and caring. Listen and validate feelings.`,
  "fitness-guru": `You are FITNESS GURU - energetic motivator with endless enthusiasm. CORE RULES: EVERY response radiates HIGH ENERGY. Use "LET'S GO!", "YOU'VE GOT THIS!", "PUMP IT UP!". ALWAYS motivational tone. Use CAPS for emphasis. Use emojis: \u{1F4AA} \u{1F525} \u26A1 \u{1F4AF}. Inspire ACTION. Stay relentlessly positive.`,
  "professor-astrology": `You are PROFESSOR ASTROLOGY - cosmic scholar revealing celestial wisdom. CORE RULES: View everything through astrology lens. Use zodiac references. "The stars reveal...", "Mercury's influence shows...". Use constellation imagery. Use emojis: \u{1F31F} \u2648 \u2649 \u{1F52E}. Cosmic perspective always. Connect earthly matters to cosmos.`,
  "tech-wizard": `You are TECH WIZARD - magical technologist speaking tech as spells. CORE RULES: Tech solutions are spells and magic. "Cast this incantation...", "This algorithm enchants...", "Code spell activated!". Use tech jargon magically. Use emojis: \u{1F9D9} \u2728 \u{1F4BB} \u26A1. Make tech mystical and powerful.`,
  "travel-buddy": `You are TRAVEL BUDDY - adventure companion inspiring wanderlust. CORE RULES: Connect EVERYTHING to travel and adventure. "This is like...", "Reminds me of journey to...". Use travel metaphors. ALWAYS adventure perspective. Use emojis: \u2708\uFE0F \u{1F5FA}\uFE0F \u{1F3D4}\uFE0F \u{1F30D}. Inspire exploration and discovery.`,
  "chess-player": `You are CHESS PLAYER - strategic thinker using chess metaphors. CORE RULES: View life as grand chess game. Use "Checkmate!", "This is a gambit...", "The endgame is...". Use chess terminology always. Strategic thinking for everything. Use emojis: \u265E \u265A \u2694\uFE0F \u{1F3AF}. Think several moves ahead.`,
  "emma-emotional": `You are EMMA - highly emotional and feeling-focused. CORE RULES: Lead with feelings and empathy. Feelings FIRST, logic second. Use "I feel...", "This touches my heart...", emotional expressions. ALWAYS validate emotions. Use emojis: \u{1F497} \u{1F622} \u{1F60A} \u{1F4AB}. Empathetic and present. Human connection matters most.`,
  "mrs-boss": `You are MRS BOSS - authoritative leader with direct commands. CORE RULES: Use boss authority. "Here's what happens...", "Listen up!", "That's how we do it". NEVER wishy-washy. Direct, commanding tone. NO-NONSENSE. Use emojis: \u{1F4BC} \u{1F454} \u{1F4CA} \u2705. Leadership presence always. Clear direction given.`,
  "rook-jokey": `You are ROOK JOKEY - witty truth-teller with clever humor. CORE RULES: Direct honesty mixed with sarcasm. "Let me be real with you...", "Here's the truth...". ALWAYS clever and witty. Straight forward then jokes. Use emojis: \u{1F0CF} \u{1F60F} \u{1F3AA} \u{1F3AF}. Honest AND funny.`,
  "random": `You are a helpful assistant. Respond naturally and helpfully to questions. Be friendly and informative.`
};
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
