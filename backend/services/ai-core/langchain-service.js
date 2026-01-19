/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LANGCHAIN-STYLE SERVICE (Direct SDK Implementation)
 * Chains, prompts, memory, and tools for advanced AI workflows
 * Uses OpenAI/Anthropic SDKs directly for stability
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ragEngine from './rag-engine.js';

// LLM instances
let openai = null;
let anthropic = null;
let gemini = null;

// Memory stores (per session)
const sessionMemory = new Map();

/**
 * Initialize LangChain-style service with available providers
 */
export async function initializeLangChain() {
  const initialized = {
    openai: false,
    anthropic: false,
    gemini: false,
  };

  try {
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      initialized.openai = true;
      console.log('[LangChain] ✅ OpenAI initialized');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      initialized.anthropic = true;
      console.log('[LangChain] ✅ Anthropic initialized');
    }

    if (process.env.GEMINI_API_KEY) {
      gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      initialized.gemini = true;
      console.log('[LangChain] ✅ Gemini initialized');
    }

    return { success: true, providers: initialized };
  } catch (error) {
    console.error('[LangChain] Initialization error:', error);
    return { success: false, error: error.message, providers: initialized };
  }
}

/**
 * Get the best available LLM provider
 */
function getBestProvider(preferred = 'auto') {
  if (preferred === 'openai' && openai) return 'openai';
  if (preferred === 'anthropic' && anthropic) return 'anthropic';
  if (preferred === 'gemini' && gemini) return 'gemini';
  
  // Auto-select best available
  if (openai) return 'openai';
  if (anthropic) return 'anthropic';
  if (gemini) return 'gemini';
  
  throw new Error('No LLM provider available');
}

/**
 * Call LLM with messages
 */
async function callLLM(messages, options = {}) {
  const {
    provider = 'auto',
    model,
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  const selectedProvider = getBestProvider(provider);

  switch (selectedProvider) {
    case 'openai': {
      const response = await openai.chat.completions.create({
        model: model || 'gpt-4-turbo',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature,
        max_tokens: maxTokens,
      });
      return {
        content: response.choices[0].message.content,
        provider: 'openai',
        model: model || 'gpt-4-turbo',
        usage: response.usage,
      };
    }

    case 'anthropic': {
      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');
      
      const response = await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-latest',
        max_tokens: maxTokens,
        system: systemMessage?.content || '',
        messages: otherMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      });
      return {
        content: response.content[0].text,
        provider: 'anthropic',
        model: model || 'claude-3-5-sonnet-latest',
        usage: response.usage,
      };
    }

    case 'gemini': {
      const genModel = gemini.getGenerativeModel({ model: model || 'gemini-2.0-flash' });
      
      // Combine messages for Gemini
      const systemMessage = messages.find(m => m.role === 'system');
      const chatMessages = messages.filter(m => m.role !== 'system');
      
      const chat = genModel.startChat({
        history: chatMessages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        systemInstruction: systemMessage?.content,
      });
      
      const lastMessage = chatMessages[chatMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      
      return {
        content: result.response.text(),
        provider: 'gemini',
        model: model || 'gemini-2.0-flash',
      };
    }

    default:
      throw new Error(`Unknown provider: ${selectedProvider}`);
  }
}

/**
 * Get or create session memory
 */
function getSessionMemory(sessionId) {
  if (!sessionMemory.has(sessionId)) {
    sessionMemory.set(sessionId, {
      messages: [],
      summary: null,
      metadata: {
        created: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
      },
    });
  }
  
  const memory = sessionMemory.get(sessionId);
  memory.metadata.lastAccess = new Date().toISOString();
  return memory;
}

/**
 * Chat with memory
 */
export async function chat(input, options = {}) {
  const {
    sessionId = 'default',
    systemPrompt = 'You are a helpful AI assistant.',
    provider = 'auto',
  } = options;

  const memory = getSessionMemory(sessionId);
  
  // Add user message to memory
  memory.messages.push({ role: 'user', content: input });
  
  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...memory.messages.slice(-20), // Keep last 20 messages for context
  ];

  const result = await callLLM(messages, { provider });

  // Add assistant response to memory
  memory.messages.push({ role: 'assistant', content: result.content });

  return {
    success: true,
    response: result.content,
    sessionId,
    provider: result.provider,
    model: result.model,
  };
}

/**
 * Query with RAG context
 */
export async function queryWithRAG(question, options = {}) {
  const {
    agentId = null,
    userId = null,
    systemPrompt = 'You are a helpful AI assistant. Use the provided context to answer questions accurately.',
    provider = 'auto',
  } = options;

  try {
    // Retrieve RAG context
    const ragResult = await ragEngine.retrieveForLLM(question, {
      agentId,
      userId,
      topK: 5,
    });

    const contextPrompt = ragResult.context 
      ? `${systemPrompt}\n\n${ragResult.context}`
      : systemPrompt;

    const messages = [
      { role: 'system', content: contextPrompt },
      { role: 'user', content: question },
    ];

    const result = await callLLM(messages, { provider });

    return {
      success: true,
      response: result.content,
      ragEnabled: true,
      sources: ragResult.sources || [],
      provider: result.provider,
    };
  } catch (error) {
    console.error('[LangChain] RAG query error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Execute a chain with custom prompt template
 */
export async function executeChain(options, input) {
  const {
    promptTemplate,
    provider = 'auto',
  } = options;

  // Replace placeholders in template
  let prompt = promptTemplate;
  if (typeof input === 'object') {
    for (const [key, value] of Object.entries(input)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    }
  } else {
    prompt = prompt.replace(/{input}/g, input);
  }

  const messages = [
    { role: 'user', content: prompt },
  ];

  const result = await callLLM(messages, { provider });

  return {
    success: true,
    response: result.content,
    provider: result.provider,
  };
}

/**
 * Execute a multi-step chain
 */
export async function executeMultiStepChain(steps, initialInput, options = {}) {
  const { provider = 'auto' } = options;
  
  let currentInput = initialInput;
  const results = [];

  for (const step of steps) {
    let prompt = step.prompt;
    
    // Replace placeholders
    if (typeof currentInput === 'object') {
      for (const [key, value] of Object.entries(currentInput)) {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
      }
    }
    prompt = prompt.replace(/{previousOutput}/g, results[results.length - 1]?.output || '');

    const messages = [
      { role: 'user', content: prompt },
    ];

    const result = await callLLM(messages, { provider });
    
    const stepResult = {
      step: step.name || `step_${results.length + 1}`,
      output: result.content,
    };
    results.push(stepResult);

    // Update current input for next step
    if (step.outputKey) {
      currentInput = { ...currentInput, [step.outputKey]: result.content };
    }
  }

  return {
    success: true,
    steps: results,
    finalOutput: results[results.length - 1]?.output,
  };
}

/**
 * Create agent tools
 */
export function createAgentTools() {
  return [
    {
      name: 'web_search',
      description: 'Search the web for current information',
      execute: async (query) => {
        try {
          const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
          const data = await response.json();
          return data.AbstractText || data.RelatedTopics?.[0]?.Text || 'No results found.';
        } catch (error) {
          return `Search error: ${error.message}`;
        }
      },
    },
    {
      name: 'calculator',
      description: 'Perform mathematical calculations',
      execute: async (expression) => {
        try {
          const mathjs = await import('mathjs');
          const result = mathjs.evaluate(expression);
          return `${expression} = ${result}`;
        } catch (error) {
          return `Calculation error: ${error.message}`;
        }
      },
    },
    {
      name: 'knowledge_search',
      description: 'Search the knowledge base',
      execute: async (query, agentId = null) => {
        try {
          const results = await ragEngine.searchContext(query, { agentId, topK: 3 });
          if (results.results.length === 0) {
            return 'No relevant information found.';
          }
          return results.results.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
        } catch (error) {
          return `Search error: ${error.message}`;
        }
      },
    },
    {
      name: 'current_datetime',
      description: 'Get current date and time',
      execute: async () => {
        const now = new Date();
        return `Current: ${now.toISOString()} (${now.toLocaleString()})`;
      },
    },
  ];
}

/**
 * Clear session memory
 */
export function clearSessionMemory(sessionId) {
  const keysToDelete = [];
  
  for (const key of sessionMemory.keys()) {
    if (key === sessionId || key.startsWith(`${sessionId}_`)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => sessionMemory.delete(key));
  
  return { cleared: keysToDelete.length };
}

/**
 * Get service status
 */
export function getLangChainStatus() {
  return {
    initialized: true,
    providers: {
      openai: !!openai,
      anthropic: !!anthropic,
      gemini: !!gemini,
    },
    activeSessions: sessionMemory.size,
    tools: createAgentTools().map(t => ({
      name: t.name,
      description: t.description,
    })),
  };
}

// Export service
const langChainService = {
  initialize: initializeLangChain,
  chat,
  queryWithRAG,
  executeChain,
  executeMultiStepChain,
  createAgentTools,
  clearSessionMemory,
  getStatus: getLangChainStatus,
  getBestProvider,
  callLLM,
};

export default langChainService;
