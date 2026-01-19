/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LANGGRAPH WORKFLOW ENGINE
 * Graph-based agent workflows with state machines and conditional routing
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import langChainService from './langchain-service.js';
import ragEngine from './rag-engine.js';

// State type for agent workflows
const AgentState = {
  messages: [],
  currentAgent: null,
  taskType: null,
  context: null,
  results: [],
  iteration: 0,
  maxIterations: 10,
  status: 'pending',
};

/**
 * Initialize LangGraph with available LLMs
 */
let primaryLLM = null;

export async function initializeLangGraph() {
  try {
    // Use LangChain's initialized LLMs
    await langChainService.initialize();
    primaryLLM = langChainService.getBestLLM();
    
    console.log('[LangGraph] ✅ Initialized with primary LLM');
    return { success: true };
  } catch (error) {
    console.error('[LangGraph] Initialization error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a coding agent workflow graph
 */
export function createCodingAgentGraph() {
  // Define the graph
  const graph = new StateGraph({
    channels: {
      messages: { value: (a, b) => [...a, ...b], default: () => [] },
      currentAgent: { value: (a, b) => b ?? a, default: () => null },
      taskType: { value: (a, b) => b ?? a, default: () => null },
      context: { value: (a, b) => b ?? a, default: () => null },
      results: { value: (a, b) => [...a, ...b], default: () => [] },
      iteration: { value: (a, b) => b ?? a, default: () => 0 },
      status: { value: (a, b) => b ?? a, default: () => 'pending' },
    },
  });

  // Node: Analyze task and determine which agent to use
  const analyzeTask = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const userInput = lastMessage?.content || '';

    // Simple task classification
    const taskPatterns = {
      code_generation: /create|generate|write|build|implement|new/i,
      refactor: /refactor|improve|optimize|clean|restructure/i,
      debug: /debug|fix|error|bug|issue|broken|crash/i,
      test: /test|unit test|spec|coverage|jest|mocha/i,
      documentation: /document|readme|comment|explain|describe/i,
      ui: /ui|component|react|html|css|frontend|design/i,
      deploy: /deploy|production|server|hosting|aws|docker/i,
      build: /build|compile|bundle|webpack|package/i,
    };

    let detectedTask = 'general';
    for (const [task, pattern] of Object.entries(taskPatterns)) {
      if (pattern.test(userInput)) {
        detectedTask = task;
        break;
      }
    }

    return {
      taskType: detectedTask,
      currentAgent: detectedTask,
      status: 'analyzing',
    };
  };

  // Node: Retrieve relevant context from RAG
  const retrieveContext = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const userInput = lastMessage?.content || '';

    try {
      const ragResult = await ragEngine.retrieveForLLM(userInput, {
        topK: 3,
        minScore: 0.6,
      });

      return {
        context: ragResult.context || 'No relevant context found.',
        status: 'context_retrieved',
      };
    } catch (error) {
      console.error('[LangGraph] RAG retrieval error:', error);
      return {
        context: null,
        status: 'context_retrieval_failed',
      };
    }
  };

  // Node: Execute the specialized agent
  const executeAgent = async (state) => {
    const { taskType, messages, context } = state;
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || '';

    // Build system prompt based on task type
    const systemPrompts = {
      code_generation: `You are an expert code generation agent. Generate clean, efficient, well-documented code based on the requirements. Include error handling and follow best practices.`,
      refactor: `You are an expert refactoring agent. Improve code structure, readability, and performance while maintaining the same functionality. Explain your changes.`,
      debug: `You are an expert debugging agent. Analyze the code or error, identify the root cause, and provide a fix with explanation.`,
      test: `You are an expert testing agent. Generate comprehensive unit tests with good coverage. Use appropriate testing frameworks and patterns.`,
      documentation: `You are an expert documentation agent. Write clear, comprehensive documentation including usage examples and API references.`,
      ui: `You are an expert UI/UX agent. Generate clean React/HTML/CSS code with modern design patterns and accessibility in mind.`,
      deploy: `You are an expert deployment agent. Provide deployment configurations, scripts, and best practices for production environments.`,
      build: `You are an expert build agent. Configure build tools, manage dependencies, and optimize build processes.`,
      general: `You are a helpful AI assistant. Provide accurate, helpful responses.`,
    };

    const systemPrompt = systemPrompts[taskType] || systemPrompts.general;

    try {
      if (!primaryLLM) {
        throw new Error('LLM not initialized');
      }

      const fullPrompt = context 
        ? `${systemPrompt}\n\nRelevant Context:\n${context}\n\nUser Request: ${userInput}`
        : `${systemPrompt}\n\nUser Request: ${userInput}`;

      const response = await primaryLLM.invoke([
        new SystemMessage(systemPrompt),
        ...(context ? [new SystemMessage(`Context: ${context}`)] : []),
        new HumanMessage(userInput),
      ]);

      return {
        messages: [new AIMessage(response.content)],
        results: [{ agent: taskType, response: response.content }],
        iteration: state.iteration + 1,
        status: 'completed',
      };
    } catch (error) {
      console.error('[LangGraph] Agent execution error:', error);
      return {
        messages: [new AIMessage(`Error executing ${taskType} agent: ${error.message}`)],
        status: 'error',
      };
    }
  };

  // Node: Check if task needs more iterations
  const shouldContinue = (state) => {
    if (state.status === 'completed' || state.status === 'error') {
      return 'end';
    }
    if (state.iteration >= state.maxIterations) {
      return 'end';
    }
    return 'continue';
  };

  // Add nodes to graph
  graph.addNode('analyze', analyzeTask);
  graph.addNode('retrieve_context', retrieveContext);
  graph.addNode('execute', executeAgent);

  // Add edges
  graph.setEntryPoint('analyze');
  graph.addEdge('analyze', 'retrieve_context');
  graph.addEdge('retrieve_context', 'execute');
  graph.addConditionalEdges('execute', shouldContinue, {
    continue: 'analyze',
    end: END,
  });

  return graph.compile();
}

/**
 * Create a multi-agent collaboration workflow
 */
export function createCollaborationGraph() {
  const graph = new StateGraph({
    channels: {
      messages: { value: (a, b) => [...a, ...b], default: () => [] },
      plan: { value: (a, b) => b ?? a, default: () => null },
      agents: { value: (a, b) => b ?? a, default: () => [] },
      currentAgentIndex: { value: (a, b) => b ?? a, default: () => 0 },
      results: { value: (a, b) => [...a, ...b], default: () => [] },
      finalResult: { value: (a, b) => b ?? a, default: () => null },
      status: { value: (a, b) => b ?? a, default: () => 'pending' },
    },
  });

  // Node: Plan the workflow
  const planWorkflow = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const userInput = lastMessage?.content || '';

    try {
      const planPrompt = `Analyze this task and create a plan for which agents should handle it and in what order.
      
Available agents:
- code_generation: Creates new code
- refactor: Improves existing code
- debug: Fixes bugs and errors
- test: Generates tests
- documentation: Writes docs
- ui: Creates UI components

Task: ${userInput}

Respond with a JSON object:
{
  "agents": ["agent1", "agent2"],
  "reasoning": "explanation"
}`;

      const response = await primaryLLM.invoke([
        new SystemMessage('You are a task planning agent. Analyze tasks and determine the best agent sequence.'),
        new HumanMessage(planPrompt),
      ]);

      // Parse the plan
      let plan;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        plan = jsonMatch ? JSON.parse(jsonMatch[0]) : { agents: ['code_generation'], reasoning: 'Default' };
      } catch {
        plan = { agents: ['code_generation'], reasoning: 'Parse failed, using default' };
      }

      return {
        plan: plan,
        agents: plan.agents,
        status: 'planned',
      };
    } catch (error) {
      return {
        plan: { agents: ['code_generation'], reasoning: error.message },
        agents: ['code_generation'],
        status: 'plan_error',
      };
    }
  };

  // Node: Execute current agent in sequence
  const executeCurrentAgent = async (state) => {
    const { agents, currentAgentIndex, messages } = state;
    const currentAgent = agents[currentAgentIndex];
    const lastUserMessage = messages.find(m => m instanceof HumanMessage);
    const userInput = lastUserMessage?.content || '';

    const systemPrompts = {
      code_generation: 'You are a code generation expert. Generate clean, efficient code.',
      refactor: 'You are a refactoring expert. Improve code quality and structure.',
      debug: 'You are a debugging expert. Find and fix issues.',
      test: 'You are a testing expert. Generate comprehensive tests.',
      documentation: 'You are a documentation expert. Write clear docs.',
      ui: 'You are a UI expert. Create beautiful, functional interfaces.',
    };

    try {
      const response = await primaryLLM.invoke([
        new SystemMessage(systemPrompts[currentAgent] || 'You are a helpful assistant.'),
        new HumanMessage(`Previous context: ${state.results.map(r => r.response).join('\n\n')}\n\nTask: ${userInput}`),
      ]);

      return {
        results: [{ agent: currentAgent, response: response.content }],
        currentAgentIndex: currentAgentIndex + 1,
        status: currentAgentIndex + 1 >= agents.length ? 'agents_complete' : 'executing',
      };
    } catch (error) {
      return {
        results: [{ agent: currentAgent, error: error.message }],
        currentAgentIndex: currentAgentIndex + 1,
        status: 'agent_error',
      };
    }
  };

  // Node: Combine results
  const combineResults = async (state) => {
    const { results, messages } = state;
    const lastUserMessage = messages.find(m => m instanceof HumanMessage);
    const userInput = lastUserMessage?.content || '';

    try {
      const combinePrompt = `Combine and synthesize these results into a cohesive final response:

Original Task: ${userInput}

Agent Results:
${results.map(r => `[${r.agent}]: ${r.response || r.error}`).join('\n\n')}

Provide a unified, well-organized final response.`;

      const response = await primaryLLM.invoke([
        new SystemMessage('You are an expert at synthesizing multiple perspectives into a cohesive response.'),
        new HumanMessage(combinePrompt),
      ]);

      return {
        finalResult: response.content,
        messages: [new AIMessage(response.content)],
        status: 'completed',
      };
    } catch (error) {
      return {
        finalResult: results.map(r => r.response).join('\n\n'),
        status: 'combine_error',
      };
    }
  };

  // Routing logic
  const shouldContinueExecution = (state) => {
    if (state.status === 'agents_complete' || state.status === 'agent_error') {
      return 'combine';
    }
    if (state.currentAgentIndex < state.agents.length) {
      return 'execute';
    }
    return 'combine';
  };

  // Add nodes
  graph.addNode('plan', planWorkflow);
  graph.addNode('execute', executeCurrentAgent);
  graph.addNode('combine', combineResults);

  // Add edges
  graph.setEntryPoint('plan');
  graph.addEdge('plan', 'execute');
  graph.addConditionalEdges('execute', shouldContinueExecution, {
    execute: 'execute',
    combine: 'combine',
  });
  graph.addEdge('combine', END);

  return graph.compile();
}

/**
 * Create a review and iterate workflow
 */
export function createReviewIterateGraph() {
  const graph = new StateGraph({
    channels: {
      messages: { value: (a, b) => [...a, ...b], default: () => [] },
      code: { value: (a, b) => b ?? a, default: () => null },
      reviews: { value: (a, b) => [...a, ...b], default: () => [] },
      iteration: { value: (a, b) => b ?? a, default: () => 0 },
      maxIterations: { value: (a, b) => b ?? a, default: () => 3 },
      approved: { value: (a, b) => b ?? a, default: () => false },
      status: { value: (a, b) => b ?? a, default: () => 'pending' },
    },
  });

  // Node: Generate initial code
  const generateCode = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const userInput = lastMessage?.content || '';

    try {
      const response = await primaryLLM.invoke([
        new SystemMessage('You are an expert programmer. Generate clean, efficient code based on the requirements.'),
        new HumanMessage(userInput),
      ]);

      return {
        code: response.content,
        status: 'generated',
      };
    } catch (error) {
      return {
        code: null,
        status: 'generation_error',
      };
    }
  };

  // Node: Review the code
  const reviewCode = async (state) => {
    const { code } = state;

    try {
      const response = await primaryLLM.invoke([
        new SystemMessage(`You are a strict code reviewer. Review this code and either:
1. APPROVE if it's production-ready (respond with "APPROVED" at the start)
2. Provide specific improvements needed

Be thorough but concise.`),
        new HumanMessage(`Review this code:\n\n${code}`),
      ]);

      const isApproved = response.content.toUpperCase().includes('APPROVED');

      return {
        reviews: [{ iteration: state.iteration, feedback: response.content, approved: isApproved }],
        approved: isApproved,
        status: isApproved ? 'approved' : 'needs_revision',
      };
    } catch (error) {
      return {
        reviews: [{ iteration: state.iteration, feedback: error.message, approved: false }],
        status: 'review_error',
      };
    }
  };

  // Node: Revise the code
  const reviseCode = async (state) => {
    const { code, reviews } = state;
    const lastReview = reviews[reviews.length - 1];

    try {
      const response = await primaryLLM.invoke([
        new SystemMessage('You are an expert programmer. Revise this code based on the review feedback.'),
        new HumanMessage(`Original code:\n${code}\n\nReview feedback:\n${lastReview.feedback}\n\nProvide the improved code:`),
      ]);

      return {
        code: response.content,
        iteration: state.iteration + 1,
        status: 'revised',
      };
    } catch (error) {
      return {
        status: 'revision_error',
      };
    }
  };

  // Routing
  const shouldContinueReview = (state) => {
    if (state.approved) return 'end';
    if (state.iteration >= state.maxIterations) return 'end';
    if (state.status === 'needs_revision') return 'revise';
    return 'end';
  };

  // Add nodes
  graph.addNode('generate', generateCode);
  graph.addNode('review', reviewCode);
  graph.addNode('revise', reviseCode);

  // Add edges
  graph.setEntryPoint('generate');
  graph.addEdge('generate', 'review');
  graph.addConditionalEdges('review', shouldContinueReview, {
    revise: 'revise',
    end: END,
  });
  graph.addEdge('revise', 'review');

  return graph.compile();
}

/**
 * Execute a workflow graph
 */
export async function executeWorkflow(workflowType, input, options = {}) {
  let graph;

  switch (workflowType) {
    case 'coding':
      graph = createCodingAgentGraph();
      break;
    case 'collaboration':
      graph = createCollaborationGraph();
      break;
    case 'review':
      graph = createReviewIterateGraph();
      break;
    default:
      graph = createCodingAgentGraph();
  }

  try {
    const initialState = {
      messages: [new HumanMessage(input)],
      ...options,
    };

    const result = await graph.invoke(initialState);

    return {
      success: true,
      workflowType,
      result: {
        messages: result.messages?.map(m => ({
          role: m instanceof HumanMessage ? 'user' : m instanceof AIMessage ? 'assistant' : 'system',
          content: m.content,
        })),
        status: result.status,
        results: result.results,
        finalResult: result.finalResult,
        iterations: result.iteration,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Workflow execution error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get LangGraph service status
 */
export function getLangGraphStatus() {
  return {
    initialized: !!primaryLLM,
    workflows: [
      {
        name: 'coding',
        description: 'Single-agent coding workflow with RAG context',
        nodes: ['analyze', 'retrieve_context', 'execute'],
      },
      {
        name: 'collaboration',
        description: 'Multi-agent collaboration with planning and synthesis',
        nodes: ['plan', 'execute (multiple)', 'combine'],
      },
      {
        name: 'review',
        description: 'Code generation with iterative review and improvement',
        nodes: ['generate', 'review', 'revise (loop)'],
      },
    ],
  };
}

// Export LangGraph service
const langGraphService = {
  initialize: initializeLangGraph,
  createCodingAgentGraph,
  createCollaborationGraph,
  createReviewIterateGraph,
  executeWorkflow,
  getStatus: getLangGraphStatus,
};

export default langGraphService;
