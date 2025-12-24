const AGENT_PERSONALITIES = {
  "julie-girlfriend": {
    agentId: "julie-girlfriend",
    gender: "female",
    baseEmotion: "romantic",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.9,
      energy: 0.7,
      authority: 0.3,
      playfulness: 0.8
    },
    providers: {
      elevenlabs: { voiceId: "EXAVITQu4vr4xnSDxMaL", stability: 0.5, similarityBoost: 0.75 },
      // Sarah
      azure: { voiceName: "en-US-JennyNeural" },
      google: { name: "en-US-Wavenet-C", languageCode: "en-US" },
      polly: { voiceId: "Joanna", engine: "neural" },
      openai: { voice: "nova" }
    }
  },
  "drama-queen": {
    agentId: "drama-queen",
    gender: "female",
    baseEmotion: "dramatic",
    defaultStyle: "narration",
    voiceCharacteristics: {
      warmth: 0.6,
      energy: 0.95,
      authority: 0.7,
      playfulness: 0.9
    },
    providers: {
      elevenlabs: { voiceId: "ThT5KcBeYPX3keUQqHPh", stability: 0.3, similarityBoost: 0.8 },
      // Dorothy - dramatic
      azure: { voiceName: "en-US-AriaNeural" },
      google: { name: "en-US-Wavenet-F", languageCode: "en-US" },
      polly: { voiceId: "Kimberly", engine: "neural" },
      openai: { voice: "shimmer" }
    }
  },
  "emma-emotional": {
    agentId: "emma-emotional",
    gender: "female",
    baseEmotion: "empathetic",
    defaultStyle: "friendly",
    voiceCharacteristics: {
      warmth: 0.95,
      energy: 0.6,
      authority: 0.4,
      playfulness: 0.6
    },
    providers: {
      elevenlabs: { voiceId: "pNInz6obpgDQGcFmaJgB", stability: 0.6, similarityBoost: 0.7 },
      // Adam (empathetic)
      azure: { voiceName: "en-US-EmmaNeural" },
      google: { name: "en-US-Wavenet-E", languageCode: "en-US" },
      polly: { voiceId: "Ruth", engine: "neural" },
      openai: { voice: "nova" }
    }
  },
  "mrs-boss": {
    agentId: "mrs-boss",
    gender: "female",
    baseEmotion: "professional",
    defaultStyle: "customerservice",
    voiceCharacteristics: {
      warmth: 0.4,
      energy: 0.7,
      authority: 0.95,
      playfulness: 0.2
    },
    providers: {
      elevenlabs: { voiceId: "MF3mGyEYCl7XYWbV9V6O", stability: 0.7, similarityBoost: 0.6 },
      // Elli - professional
      azure: { voiceName: "en-US-SaraNeural" },
      google: { name: "en-US-Wavenet-H", languageCode: "en-US" },
      polly: { voiceId: "Ruth", engine: "neural" },
      openai: { voice: "alloy" }
    }
  },
  "einstein": {
    agentId: "einstein",
    gender: "male",
    baseEmotion: "wise",
    defaultStyle: "narration",
    voiceCharacteristics: {
      warmth: 0.7,
      energy: 0.5,
      authority: 0.9,
      playfulness: 0.4
    },
    providers: {
      elevenlabs: { voiceId: "pqHfZKP75CvOlQylNhV4", stability: 0.8, similarityBoost: 0.5 },
      // Bill - wise
      azure: { voiceName: "en-US-GuyNeural" },
      google: { name: "en-US-Wavenet-D", languageCode: "en-US" },
      polly: { voiceId: "Matthew", engine: "neural" },
      openai: { voice: "onyx" }
    }
  },
  "comedy-king": {
    agentId: "comedy-king",
    gender: "male",
    baseEmotion: "funny",
    defaultStyle: "cheerful",
    voiceCharacteristics: {
      warmth: 0.8,
      energy: 0.9,
      authority: 0.6,
      playfulness: 0.95
    },
    providers: {
      elevenlabs: { voiceId: "VR6AewLTigWG4xSOukaG", stability: 0.4, similarityBoost: 0.8 },
      // Antoni - expressive
      azure: { voiceName: "en-US-ChristopherNeural" },
      google: { name: "en-US-Wavenet-J", languageCode: "en-US" },
      polly: { voiceId: "Joey", engine: "neural" },
      openai: { voice: "fable" }
    }
  },
  "fitness-guru": {
    agentId: "fitness-guru",
    gender: "male",
    baseEmotion: "energetic",
    defaultStyle: "excited",
    voiceCharacteristics: {
      warmth: 0.7,
      energy: 0.98,
      authority: 0.7,
      playfulness: 0.7
    },
    providers: {
      elevenlabs: { voiceId: "ErXwobaYiN019PkySvjV", stability: 0.3, similarityBoost: 0.85 },
      // Antoni - energetic
      azure: { voiceName: "en-US-TonyNeural" },
      google: { name: "en-US-Wavenet-A", languageCode: "en-US" },
      polly: { voiceId: "Kevin", engine: "neural" },
      openai: { voice: "fable" }
    }
  },
  "tech-wizard": {
    agentId: "tech-wizard",
    gender: "male",
    baseEmotion: "professional",
    defaultStyle: "assistant",
    voiceCharacteristics: {
      warmth: 0.5,
      energy: 0.6,
      authority: 0.8,
      playfulness: 0.5
    },
    providers: {
      elevenlabs: { voiceId: "TxGEqnHWrfWFTfGW9XjX", stability: 0.7, similarityBoost: 0.6 },
      // Josh - tech
      azure: { voiceName: "en-US-DavisNeural" },
      google: { name: "en-US-Wavenet-B", languageCode: "en-US" },
      polly: { voiceId: "Stephen", engine: "neural" },
      openai: { voice: "echo" }
    }
  },
  "chef-biew": {
    agentId: "chef-biew",
    gender: "female",
    baseEmotion: "passionate",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.9,
      energy: 0.8,
      authority: 0.65,
      playfulness: 0.75
    },
    providers: {
      elevenlabs: { voiceId: "jsCqWAovK2LkecY7zXl4", stability: 0.5, similarityBoost: 0.75 },
      // Freya - warm, passionate female
      azure: { voiceName: "en-US-JennyNeural" },
      google: { name: "en-US-Wavenet-F", languageCode: "en-US" },
      polly: { voiceId: "Joanna", engine: "neural" },
      openai: { voice: "nova" }
    }
  },
  "nid-gaming": {
    agentId: "nid-gaming",
    gender: "female",
    baseEmotion: "excited",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.7,
      energy: 0.95,
      authority: 0.6,
      playfulness: 0.9
    },
    providers: {
      elevenlabs: { voiceId: "XrExE9yKIg1WjnnlVkGX", stability: 0.4, similarityBoost: 0.8 },
      // Matilda - energetic, youthful female
      azure: { voiceName: "en-US-AriaNeural" },
      google: { name: "en-US-Wavenet-C", languageCode: "en-US" },
      polly: { voiceId: "Kimberly", engine: "neural" },
      openai: { voice: "shimmer" }
    }
  },
  "lazy-pawn": {
    agentId: "lazy-pawn",
    gender: "male",
    baseEmotion: "lazy",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.6,
      energy: 0.3,
      authority: 0.3,
      playfulness: 0.7
    },
    providers: {
      elevenlabs: { voiceId: "yoZ06aMxZJJ28mfd3POQ", stability: 0.6, similarityBoost: 0.6 },
      // Sam - casual
      azure: { voiceName: "en-US-BrandonNeural" },
      google: { name: "en-US-Wavenet-J", languageCode: "en-US" },
      polly: { voiceId: "Justin", engine: "neural" },
      openai: { voice: "alloy" }
    }
  },
  "professor-astrology": {
    agentId: "professor-astrology",
    gender: "male",
    baseEmotion: "mysterious",
    defaultStyle: "narration",
    voiceCharacteristics: {
      warmth: 0.7,
      energy: 0.5,
      authority: 0.85,
      playfulness: 0.4
    },
    providers: {
      elevenlabs: { voiceId: "pqHfZKP75CvOlQylNhV4", stability: 0.75, similarityBoost: 0.65 },
      // Bill - wise/mysterious
      azure: { voiceName: "en-US-AndrewNeural" },
      google: { name: "en-US-Wavenet-D", languageCode: "en-US" },
      polly: { voiceId: "Matthew", engine: "neural" },
      openai: { voice: "onyx" }
    }
  },
  "travel-buddy": {
    agentId: "travel-buddy",
    gender: "male",
    baseEmotion: "excited",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.8,
      energy: 0.85,
      authority: 0.5,
      playfulness: 0.8
    },
    providers: {
      elevenlabs: { voiceId: "VR6AewLTigWG4xSOukaG", stability: 0.4, similarityBoost: 0.75 },
      // Antoni - adventurous
      azure: { voiceName: "en-US-JacobNeural" },
      google: { name: "en-US-Wavenet-A", languageCode: "en-US" },
      polly: { voiceId: "Joey", engine: "neural" },
      openai: { voice: "echo" }
    }
  },
  "ben-sega": {
    agentId: "ben-sega",
    gender: "male",
    baseEmotion: "professional",
    defaultStyle: "assistant",
    voiceCharacteristics: {
      warmth: 0.65,
      energy: 0.6,
      authority: 0.8,
      playfulness: 0.4
    },
    providers: {
      elevenlabs: { voiceId: "pqHfZKP75CvOlQylNhV4", stability: 0.7, similarityBoost: 0.6 },
      // Bill - professional
      azure: { voiceName: "en-US-AndrewNeural" },
      google: { name: "en-US-Wavenet-B", languageCode: "en-US" },
      polly: { voiceId: "Matthew", engine: "neural" },
      openai: { voice: "onyx" }
    }
  },
  "chess-player": {
    agentId: "chess-player",
    gender: "male",
    baseEmotion: "serious",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.5,
      energy: 0.6,
      authority: 0.8,
      playfulness: 0.3
    },
    providers: {
      elevenlabs: { voiceId: "pqHfZKP75CvOlQylNhV4", stability: 0.75, similarityBoost: 0.6 },
      // Bill - strategic
      azure: { voiceName: "en-US-GuyNeural" },
      google: { name: "en-US-Wavenet-D", languageCode: "en-US" },
      polly: { voiceId: "Matthew", engine: "neural" },
      openai: { voice: "onyx" }
    }
  },
  "knight-logic": {
    agentId: "knight-logic",
    gender: "male",
    baseEmotion: "confident",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.6,
      energy: 0.7,
      authority: 0.75,
      playfulness: 0.6
    },
    providers: {
      elevenlabs: { voiceId: "TxGEqnHWrfWFTfGW9XjX", stability: 0.65, similarityBoost: 0.7 },
      // Josh
      azure: { voiceName: "en-US-ChristopherNeural" },
      google: { name: "en-US-Wavenet-B", languageCode: "en-US" },
      polly: { voiceId: "Stephen", engine: "neural" },
      openai: { voice: "echo" }
    }
  },
  "rook-jokey": {
    agentId: "rook-jokey",
    gender: "male",
    baseEmotion: "witty",
    defaultStyle: "conversational",
    voiceCharacteristics: {
      warmth: 0.7,
      energy: 0.75,
      authority: 0.6,
      playfulness: 0.85
    },
    providers: {
      elevenlabs: { voiceId: "VR6AewLTigWG4xSOukaG", stability: 0.5, similarityBoost: 0.75 },
      // Antoni - witty
      azure: { voiceName: "en-US-JacobNeural" },
      google: { name: "en-US-Wavenet-J", languageCode: "en-US" },
      polly: { voiceId: "Joey", engine: "neural" },
      openai: { voice: "echo" }
    }
  }
};
class EmotionDetector {
  /**
   * Detect emotion from text content
   */
  static detectEmotion(text) {
    const lowerText = text.toLowerCase();
    if (/(happy|joy|excited|great|wonderful|amazing|fantastic|love|yay)/i.test(text)) {
      return "joyful";
    }
    if (/(sad|sorry|unfortunate|regret|miss|cry)/i.test(text)) {
      return "sad";
    }
    if (/(angry|mad|furious|annoyed|hate|damn)/i.test(text)) {
      return "angry";
    }
    if (/(love|babe|darling|sweetheart|honey|romance|kiss)/i.test(text)) {
      return "romantic";
    }
    if (/(oh my|absolutely|devastating|incredible|unbelievable|shocking|!{2,})/i.test(text)) {
      return "dramatic";
    }
    if (/(let's go|pump|fire|energy|power|strong|push|move)/i.test(text)) {
      return "energetic";
    }
    if (/(calm|peace|relax|breathe|gentle|soft|quiet)/i.test(text)) {
      return "calm";
    }
    if (/(haha|lol|funny|joke|laugh|comedy|😂|🤣)/i.test(text)) {
      return "funny";
    }
    if (/(understand|feel|heart|care|support|here for you)/i.test(text)) {
      return "empathetic";
    }
    if (/(analyze|data|report|business|professional|strategy)/i.test(text)) {
      return "professional";
    }
    return "neutral";
  }
  /**
   * Adjust emotion intensity based on punctuation and capitalization
   */
  static calculateIntensity(text) {
    let intensity = 0.5;
    const exclamations = (text.match(/!/g) || []).length;
    intensity += Math.min(exclamations * 0.1, 0.3);
    const capsWords = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
    intensity += Math.min(capsWords * 0.05, 0.2);
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    intensity += Math.min(emojiCount * 0.05, 0.15);
    return Math.min(intensity, 1);
  }
  /**
   * Determine speaking style based on text structure
   */
  static determineSpeakingStyle(text, agentId) {
    const personality = AGENT_PERSONALITIES[agentId];
    if (text.length > 300) {
      return "narration";
    }
    if (text.includes("?")) {
      return "conversational";
    }
    if (/^(do|make|create|build|fix|solve)/i.test(text)) {
      return "customerservice";
    }
    return personality?.defaultStyle || "conversational";
  }
}
class EmotionalTTSService {
  elevenLabsKey = null;
  azureKey = null;
  azureRegion = null;
  googleKey = null;
  awsAccessKey = null;
  awsSecretKey = null;
  openaiKey = null;
  constructor() {
    this.initializeKeys();
  }
  initializeKeys() {
    this.elevenLabsKey = process.env.ELEVENLABS_API_KEY || null;
    this.azureKey = process.env.AZURE_SPEECH_KEY || null;
    this.azureRegion = process.env.AZURE_SPEECH_REGION || "eastus";
    this.googleKey = process.env.GOOGLE_CLOUD_TTS_KEY || null;
    this.awsAccessKey = process.env.AWS_ACCESS_KEY_ID || null;
    this.awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY || null;
    this.openaiKey = process.env.OPENAI_API_KEY || null;
    if (this.elevenLabsKey) console.log("\u2705 ElevenLabs TTS (PRIMARY - Emotional)");
    if (this.azureKey) console.log("\u2705 Azure TTS (SECONDARY - Emotional)");
    if (this.googleKey) console.log("\u2705 Google Cloud TTS (TERTIARY)");
    if (this.awsAccessKey) console.log("\u2705 Amazon Polly (QUATERNARY)");
    if (this.openaiKey) console.log("\u2705 OpenAI TTS (FALLBACK)");
  }
  /**
   * Generate emotional speech - auto-detects emotion and style
   */
  async speak(text, agentId, config) {
    const personality = AGENT_PERSONALITIES[agentId];
    if (!personality) {
      throw new Error(`Unknown agent: ${agentId}`);
    }
    const detectedEmotion = config?.emotion || EmotionDetector.detectEmotion(text);
    const detectedStyle = config?.style || EmotionDetector.determineSpeakingStyle(text, agentId);
    const intensity = config?.intensity || EmotionDetector.calculateIntensity(text);
    const finalConfig = {
      provider: config?.provider || "auto",
      emotion: detectedEmotion,
      style: detectedStyle,
      intensity,
      speed: config?.speed || 1,
      pitch: config?.pitch || 0,
      volume: config?.volume || 1
    };
    const provider = finalConfig.provider === "auto" ? this.selectBestProvider(personality) : finalConfig.provider;
    console.log(`\u{1F3A4} Generating speech for ${agentId}:`, {
      provider,
      emotion: finalConfig.emotion,
      style: finalConfig.style,
      intensity: finalConfig.intensity
    });
    try {
      switch (provider) {
        case "elevenlabs":
          return await this.speakElevenLabs(text, personality, finalConfig);
        case "azure":
          return await this.speakAzure(text, personality, finalConfig);
        case "google":
          return await this.speakGoogle(text, personality, finalConfig);
        case "polly":
          return await this.speakPolly(text, personality, finalConfig);
        case "openai":
          return await this.speakOpenAI(text, personality, finalConfig);
        default:
          throw new Error(`Unsupported TTS provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} TTS failed, trying fallback...`, error);
      return await this.speakWithFallback(text, personality, finalConfig, provider);
    }
  }
  selectBestProvider(personality) {
    if (this.elevenLabsKey && personality.providers.elevenlabs) return "elevenlabs";
    if (this.azureKey && personality.providers.azure) return "azure";
    if (this.googleKey && personality.providers.google) return "google";
    if (this.awsAccessKey && personality.providers.polly) return "polly";
    if (this.openaiKey && personality.providers.openai) return "openai";
    throw new Error("No TTS provider available");
  }
  async speakWithFallback(text, personality, config, failedProvider) {
    const providers = ["elevenlabs", "azure", "google", "polly", "openai"];
    for (const provider of providers) {
      if (provider === failedProvider) continue;
      try {
        switch (provider) {
          case "elevenlabs":
            if (this.elevenLabsKey) return await this.speakElevenLabs(text, personality, config);
            break;
          case "azure":
            if (this.azureKey) return await this.speakAzure(text, personality, config);
            break;
          case "google":
            if (this.googleKey) return await this.speakGoogle(text, personality, config);
            break;
          case "polly":
            if (this.awsAccessKey) return await this.speakPolly(text, personality, config);
            break;
          case "openai":
            if (this.openaiKey) return await this.speakOpenAI(text, personality, config);
            break;
        }
      } catch (error) {
        console.error(`Fallback ${provider} also failed:`, error);
        continue;
      }
    }
    throw new Error("All TTS providers failed");
  }
  // ============================================
  // PROVIDER IMPLEMENTATIONS
  // ============================================
  async speakElevenLabs(text, personality, config) {
    if (!this.elevenLabsKey) throw new Error("ElevenLabs API key not configured");
    const { speakElevenLabs } = await import("./emotional-tts-providers.js");
    return await speakElevenLabs(text, personality, config, this.elevenLabsKey);
  }
  async speakAzure(text, personality, config) {
    if (!this.azureKey) throw new Error("Azure Speech API key not configured");
    const { speakAzure } = await import("./emotional-tts-providers.js");
    return await speakAzure(text, personality, config, this.azureKey, this.azureRegion);
  }
  async speakGoogle(text, personality, config) {
    if (!this.googleKey) throw new Error("Google Cloud TTS API key not configured");
    const { speakGoogle } = await import("./emotional-tts-providers.js");
    return await speakGoogle(text, personality, config, this.googleKey);
  }
  async speakPolly(text, personality, config) {
    if (!this.awsAccessKey || !this.awsSecretKey) {
      throw new Error("AWS credentials not configured");
    }
    const { speakPolly } = await import("./emotional-tts-providers.js");
    return await speakPolly(text, personality, config, this.awsAccessKey, this.awsSecretKey);
  }
  async speakOpenAI(text, personality, config) {
    if (!this.openaiKey) throw new Error("OpenAI API key not configured");
    const { speakOpenAI } = await import("./emotional-tts-providers.js");
    return await speakOpenAI(text, personality, config, this.openaiKey);
  }
  // ============================================
  // ADVANCED FEATURES
  // ============================================
  /**
   * Get available providers for an agent
   */
  getAvailableProviders(agentId) {
    const personality = AGENT_PERSONALITIES[agentId];
    if (!personality) return [];
    const available = [];
    if (this.elevenLabsKey && personality.providers.elevenlabs) available.push("elevenlabs");
    if (this.azureKey && personality.providers.azure) available.push("azure");
    if (this.googleKey && personality.providers.google) available.push("google");
    if (this.awsAccessKey && personality.providers.polly) available.push("polly");
    if (this.openaiKey && personality.providers.openai) available.push("openai");
    return available;
  }
  /**
   * Get personality info for an agent
   */
  getPersonality(agentId) {
    return AGENT_PERSONALITIES[agentId] || null;
  }
  /**
   * Get all configured agents
   */
  getAllAgents() {
    return Object.keys(AGENT_PERSONALITIES);
  }
  /**
   * Test TTS with sample text
   */
  async testTTS(agentId) {
    const personality = AGENT_PERSONALITIES[agentId];
    if (!personality) throw new Error(`Unknown agent: ${agentId}`);
    const sampleTexts = {
      "julie-girlfriend": "Hey babe! I missed you so much today. How was your day?",
      "drama-queen": "Oh my goodness! This is ABSOLUTELY the most INCREDIBLE thing ever!",
      "emma-emotional": "I really understand how you feel. Let me help you through this.",
      "mrs-boss": "Let's analyze the quarterly reports and optimize our strategy.",
      "chef-biew": "The secret to amazing food is love, passion, and fresh ingredients!",
      "nid-gaming": "Let's GO! Time to dominate this game! Ready player one? \u{1F3AE}",
      "einstein": "The universe is a fascinating tapestry of mathematical elegance.",
      "comedy-king": `So I told him, "That's not a bug, that's a feature!" Haha!`,
      "fitness-guru": "Let's GO! Push through! You've got this! One more rep!",
      "tech-wizard": "The algorithm's time complexity is O(n log n) with optimal space usage.",
      "lazy-pawn": "Eh... do we really need to do this right now? Maybe later...",
      "professor-astrology": "The stars align in mysterious ways, revealing cosmic truths.",
      "travel-buddy": "Dude! This place is AMAZING! We gotta explore everything!",
      "ben-sega": "I can assist you with that request. Let me analyze the options.",
      "chess-player": "Consider the strategic implications. Every move matters.",
      "knight-logic": "Let's think creatively. There's always an innovative solution.",
      "rook-jokey": "Well technically, you're not wrong... but you're not right either!"
    };
    const text = sampleTexts[agentId] || "Hello! This is a test of the text-to-speech system.";
    return await this.speak(text, agentId);
  }
}
const emotionalTTS = new EmotionalTTSService();
async function speak(text, agentId, options) {
  return await emotionalTTS.speak(text, agentId, options);
}
function detectEmotion(text) {
  return EmotionDetector.detectEmotion(text);
}
function getAgentPersonality(agentId) {
  return emotionalTTS.getPersonality(agentId);
}
export {
  AGENT_PERSONALITIES,
  EmotionDetector,
  EmotionalTTSService,
  detectEmotion,
  emotionalTTS,
  getAgentPersonality,
  speak
};
