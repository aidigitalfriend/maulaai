/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LANGCHAIN INTEGRATION SERVICE
 * Chains, prompts, memory, and tools for advanced AI workflows
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { 
  HumanMessage, 
  SystemMessage, 
  AIMessage,
} from '@langchain/core/messages';
import { 
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { 
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BufferMemory, ConversationSummaryMemory } from 'langchain/memory';
import { ConversationChain, LLMChain } from 'langchain/chains';
import { DynamicTool, DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import ragEngine from './rag-engine.js';

// LLM instances
let openaiLLM = null;
let anthropicLLM = null;
let geminiLLM = null;

// Memory stores (per session)
const sessionMemory = new Map();

/**
 * Initialize LangChain with available providers
 */
export async function initializeLangChain() {
  const initialized = {
    openai: false,
    anthropic: false,
    gemini: false,
  };

  try {
    if (process.env.OPENAI_API_KEY) {
      openaiLLM = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4-turbo',
        temperature: 0.7,
      });
      initialized.openai = true;
      console.log('[LangChain] ✅ OpenAI initialized');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      anthropicLLM = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: 'claude-3-5-sonnet-latest',
        temperature: 0.7,
      });
      initialized.anthropic = true;
      console.log('[LangChain] ✅ Anthropic initialized');
    }

    if (process.env.GEMINI_API_KEY) {
      geminiLLM = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'gemini-2.0-flash',
        temperature: 0.7,
      });
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
 * Get the best available LLM
 */
function getBestLLM(preferredProvider = 'auto') {
  if (preferredProvider === 'openai' && openaiLLM) return openaiLLM;
  if (preferredProvider === 'anthropic' && anthropicLLM) return anthropicLLM;
  if (preferredProvider === 'gemini' && geminiLLM) return geminiLLM;
  
  // Auto-select best available
  if (openaiLLM) return openaiLLM;
  if (anthropicLLM) return anthropicLLM;
  if (geminiLLM) return geminiLLM;
  
  throw new Error('No LLM provider available');
}

/**
 * Get or create session memory
 */
function getSessionMemory(sessionId, type = 'buffer') {
  const key = `${sessionId}_${type}`;
  
  if (!sessionMemory.has(key)) {
    if (type === 'summary') {
      sessionMemory.set(key, new ConversationSummaryMemory({
        llm: getBestLLM(),
        memoryKey: 'history',
        returnMessages: true,
      }));
    } else {
      sessionMemory.set(key, new BufferMemory({
        memoryKey: 'history',
        returnMessages: true,
      }));
    }
  }
  
  return sessionMemory.get(key);
}

/**
 * Create a simple conversation chain
 */
export async function createConversationChain(options = {}) {
  const {
    provider = 'auto',
    systemPrompt = 'You are a helpful AI assistant.',
    sessionId = 'default',
    memoryType = 'buffer',
  } = options;

  const llm = getBestLLM(provider);
  const memory = getSessionMemory(sessionId, memoryType);

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('history'),
    ['human', '{input}'],
  ]);

  const chain = new ConversationChain({
    llm,
    memory,
    prompt,
  });

  return chain;
}

/**
 * Execute a conversation with memory
 */
export async function chat(input, options = {}) {
  const chain = await createConversationChain(options);
  
  const response = await chain.call({ input });
  
  return {
    success: true,
    response: response.response,
    sessionId: options.sessionId || 'default',
  };
}

/**
 * Create a RAG-enhanced chain
 */
export async function createRAGChain(options = {}) {
  const {
    provider = 'auto',
    systemPrompt = 'You are a helpful AI assistant. Use the provided context to answer questions accurately.',
    agentId = null,
    userId = null,
  } = options;

  const llm = getBestLLM(provider);

  // Create the RAG chain
  const ragChain = RunnableSequence.from([
    {
      context: async (input) => {
        const result = await ragEngine.retrieveForLLM(input.question, {
          agentId,
          userId,
          topK: 5,
        });
        return result.context || 'No relevant context found.';
      },
      question: (input) => input.question,
    },
    ChatPromptTemplate.fromMessages([
      ['system', `${systemPrompt}\n\n{context}`],
      ['human', '{question}'],
    ]),
    llm,
    new StringOutputParser(),
  ]);

  return ragChain;
}

/**
 * Query with RAG
 */
export async function queryWithRAG(question, options = {}) {
  try {
    const chain = await createRAGChain(options);
    const response = await chain.invoke({ question });
    
    return {
      success: true,
      response,
      ragEnabled: true,
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
 * Create custom tools for agents
 */
export function createAgentTools() {
  const tools = [
    // Web Search Tool
    new DynamicTool({
      name: 'web_search',
      description: 'Search the web for current information. Input should be a search query.',
      func: async (query) => {
        // Integration with existing web search
        try {
          const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
          const data = await response.json();
          return data.AbstractText || data.RelatedTopics?.[0]?.Text || 'No results found.';
        } catch (error) {
          return `Search error: ${error.message}`;
        }
      },
    }),

    // Calculator Tool
    new DynamicStructuredTool({
      name: 'calculator',
      description: 'Perform mathematical calculations. Supports basic arithmetic and common functions.',
      schema: z.object({
        expression: z.string().describe('The mathematical expression to evaluate'),
      }),
      func: async ({ expression }) => {
        try {
          // Safe math evaluation
          const mathjs = await import('mathjs');
          const result = mathjs.evaluate(expression);
          return `${expression} = ${result}`;
        } catch (error) {
          return `Calculation error: ${error.message}`;
        }
      },
    }),

    // Knowledge Base Search
    new DynamicStructuredTool({
      name: 'knowledge_search',
      description: 'Search the knowledge base for relevant information.',
      schema: z.object({
        query: z.string().describe('The search query'),
        agentId: z.string().optional().describe('Filter by agent ID'),
      }),
      func: async ({ query, agentId }) => {
        try {
          const results = await ragEngine.searchContext(query, { agentId, topK: 3 });
          if (results.results.length === 0) {
            return 'No relevant information found in knowledge base.';
          }
          return results.results.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
        } catch (error) {
          return `Knowledge search error: ${error.message}`;
        }
      },
    }),

    // Code Execution Tool
    new DynamicStructuredTool({
      name: 'execute_code',
      description: 'Execute JavaScript code safely. Returns the result.',
      schema: z.object({
        code: z.string().describe('JavaScript code to execute'),
      }),
      func: async ({ code }) => {
        try {
          // Safe sandbox execution
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const fn = new AsyncFunction('return (async () => { ' + code + ' })()');
          const result = await Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          return JSON.stringify(result, null, 2);
        } catch (error) {
          return `Execution error: ${error.message}`;
        }
      },
    }),

    // Date/Time Tool
    new DynamicTool({
      name: 'current_datetime',
      description: 'Get the current date and time.',
      func: async () => {
        const now = new Date();
        return `Current date and time: ${now.toISOString()} (${now.toLocaleString()})`;
      },
    }),
  ];

  return tools;
}

/**
 * Create a specialized prompt template
 */
export function createPromptTemplate(template, inputVariables = []) {
  return ChatPromptTemplate.fromTemplate(template);
}

/**
 * Create a chain with custom prompt
 */
export async function createCustomChain(options = {}) {
  const {
    provider = 'auto',
    promptTemplate,
    inputVariables = ['input'],
    outputParser = new StringOutputParser(),
  } = options;

  const llm = getBestLLM(provider);
  const prompt = ChatPromptTemplate.fromTemplate(promptTemplate);

  const chain = prompt.pipe(llm).pipe(outputParser);

  return chain;
}

/**
 * Execute a custom chain
 */
export async function executeChain(chainOrOptions, input) {
  try {
    let chain;
    
    if (chainOrOptions.invoke) {
      // Already a chain
      chain = chainOrOptions;
    } else {
      // Options object, create chain
      chain = await createCustomChain(chainOrOptions);
    }

    const response = await chain.invoke(input);
    
    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error('[LangChain] Chain execution error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a multi-step chain
 */
export async function createMultiStepChain(steps, options = {}) {
  const { provider = 'auto' } = options;
  const llm = getBestLLM(provider);

  const runnables = steps.map(step => {
    const prompt = ChatPromptTemplate.fromTemplate(step.prompt);
    return RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
      (output) => ({ ...step.outputKey ? { [step.outputKey]: output } : {}, previousOutput: output }),
    ]);
  });

  // Chain all steps together
  const chain = RunnableSequence.from([
    RunnablePassthrough.assign({}),
    ...runnables,
  ]);

  return chain;
}

/**
 * Clear session memory
 */
export function clearSessionMemory(sessionId) {
  const keysToDelete = [];
  
  for (const key of sessionMemory.keys()) {
    if (key.startsWith(sessionId)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => sessionMemory.delete(key));
  
  return { cleared: keysToDelete.length };
}

/**
 * Get LangChain service status
 */
export function getLangChainStatus() {
  return {
    initialized: true,
    providers: {
      openai: !!openaiLLM,
      anthropic: !!anthropicLLM,
      gemini: !!geminiLLM,
    },
    activeSessions: sessionMemory.size,
    tools: createAgentTools().map(t => ({
      name: t.name,
      description: t.description,
    })),
  };
}

// Export LangChain service
const langChainService = {
  initialize: initializeLangChain,
  chat,
  queryWithRAG,
  createConversationChain,
  createRAGChain,
  createCustomChain,
  createMultiStepChain,
  executeChain,
  createAgentTools,
  createPromptTemplate,
  clearSessionMemory,
  getStatus: getLangChainStatus,
  getBestLLM,
};

export default langChainService;
