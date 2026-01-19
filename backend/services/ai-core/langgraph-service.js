/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LANGGRAPH-STYLE WORKFLOW ENGINE (Direct Implementation)
 * Graph-based agent workflows with state machines and conditional routing
 * Implemented without LangGraph dependencies for stability
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import langChainService from './langchain-service.js';
import ragEngine from './rag-engine.js';

/**
 * Initialize LangGraph-style service
 */
export async function initializeLangGraph() {
  try {
    await langChainService.initialize();
    console.log('[LangGraph] ✅ Workflow engine initialized');
    return { success: true };
  } catch (error) {
    console.error('[LangGraph] Initialization error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * State machine for workflow execution
 */
class WorkflowState {
  constructor(initialState = {}) {
    this.messages = initialState.messages || [];
    this.currentAgent = initialState.currentAgent || null;
    this.taskType = initialState.taskType || null;
    this.context = initialState.context || null;
    this.results = initialState.results || [];
    this.iteration = initialState.iteration || 0;
    this.maxIterations = initialState.maxIterations || 10;
    this.status = initialState.status || 'pending';
    this.plan = initialState.plan || null;
    this.agents = initialState.agents || [];
    this.currentAgentIndex = initialState.currentAgentIndex || 0;
    this.finalResult = initialState.finalResult || null;
    this.code = initialState.code || null;
    this.reviews = initialState.reviews || [];
    this.approved = initialState.approved || false;
  }

  update(updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (Array.isArray(this[key]) && Array.isArray(value)) {
        // Append arrays
        this[key] = [...this[key], ...value];
      } else {
        this[key] = value;
      }
    }
    return this;
  }
}

/**
 * Task type detection patterns
 */
const TASK_PATTERNS = {
  code_generation: /create|generate|write|build|implement|new/i,
  refactor: /refactor|improve|optimize|clean|restructure/i,
  debug: /debug|fix|error|bug|issue|broken|crash/i,
  test: /test|unit test|spec|coverage|jest|mocha/i,
  documentation: /document|readme|comment|explain|describe/i,
  ui: /ui|component|react|html|css|frontend|design/i,
  deploy: /deploy|production|server|hosting|aws|docker/i,
  build: /build|compile|bundle|webpack|package/i,
};

/**
 * System prompts for different task types
 */
const SYSTEM_PROMPTS = {
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

/**
 * Detect task type from user input
 */
function detectTaskType(input) {
  const inputLower = input.toLowerCase();
  
  for (const [taskType, pattern] of Object.entries(TASK_PATTERNS)) {
    if (pattern.test(inputLower)) {
      return taskType;
    }
  }
  
  return 'general';
}

/**
 * Execute Coding Agent Workflow
 * Single agent with RAG context
 */
export async function executeCodingWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Analyze task
    state.update({
      taskType: detectTaskType(input),
      status: 'analyzing',
    });

    // Step 2: Retrieve RAG context
    try {
      const ragResult = await ragEngine.retrieveForLLM(input, {
        topK: 3,
        minScore: 0.6,
      });
      state.update({
        context: ragResult.context,
        status: 'context_retrieved',
      });
    } catch (error) {
      console.warn('[LangGraph] RAG retrieval failed:', error.message);
    }

    // Step 3: Execute with appropriate system prompt
    const systemPrompt = SYSTEM_PROMPTS[state.taskType] || SYSTEM_PROMPTS.general;
    const fullPrompt = state.context 
      ? `${systemPrompt}\n\nRelevant Context:\n${state.context}`
      : systemPrompt;

    const result = await langChainService.callLLM([
      { role: 'system', content: fullPrompt },
      { role: 'user', content: input },
    ]);

    state.update({
      messages: [{ role: 'assistant', content: result.content }],
      results: [{ agent: state.taskType, response: result.content }],
      iteration: state.iteration + 1,
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'coding',
      result: {
        messages: state.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        status: state.status,
        taskType: state.taskType,
        ragUsed: !!state.context,
        iterations: state.iteration,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Coding workflow error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Execute Collaboration Workflow
 * Multiple agents working together
 */
export async function executeCollaborationWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Plan which agents to use
    const planPrompt = `Analyze this task and determine which agents should handle it.

Available agents: code_generation, refactor, debug, test, documentation, ui

Task: ${input}

Respond with a JSON object:
{
  "agents": ["agent1", "agent2"],
  "reasoning": "explanation"
}`;

    const planResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a task planning agent. Analyze tasks and determine the best agent sequence.' },
      { role: 'user', content: planPrompt },
    ]);

    let plan;
    try {
      const jsonMatch = planResult.content.match(/\{[\s\S]*\}/);
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : { agents: ['code_generation'], reasoning: 'Default' };
    } catch {
      plan = { agents: ['code_generation'], reasoning: 'Parse failed' };
    }

    state.update({
      plan,
      agents: plan.agents,
      status: 'planned',
    });

    // Step 2: Execute each agent in sequence
    for (let i = 0; i < state.agents.length; i++) {
      const agentType = state.agents[i];
      const systemPrompt = SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.general;
      
      const previousContext = state.results.length > 0
        ? `\n\nPrevious agent outputs:\n${state.results.map(r => `[${r.agent}]: ${r.response.substring(0, 500)}`).join('\n\n')}`
        : '';

      const result = await langChainService.callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${input}${previousContext}` },
      ]);

      state.update({
        results: [{ agent: agentType, response: result.content }],
        currentAgentIndex: i + 1,
      });
    }

    // Step 3: Combine results
    const combinePrompt = `Combine and synthesize these results into a cohesive final response:

Original Task: ${input}

Agent Results:
${state.results.map(r => `[${r.agent}]: ${r.response}`).join('\n\n')}

Provide a unified, well-organized final response.`;

    const combineResult = await langChainService.callLLM([
      { role: 'system', content: 'You are an expert at synthesizing multiple perspectives into a cohesive response.' },
      { role: 'user', content: combinePrompt },
    ]);

    state.update({
      finalResult: combineResult.content,
      messages: [{ role: 'assistant', content: combineResult.content }],
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'collaboration',
      result: {
        plan: state.plan,
        agentResults: state.results,
        finalResult: state.finalResult,
        status: state.status,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Collaboration workflow error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Execute Review and Iterate Workflow
 * Generate, review, revise loop
 */
export async function executeReviewWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    maxIterations: options.maxIterations || 3,
    ...options,
  });

  try {
    // Step 1: Generate initial code
    const generateResult = await langChainService.callLLM([
      { role: 'system', content: 'You are an expert programmer. Generate clean, efficient code based on the requirements.' },
      { role: 'user', content: input },
    ]);

    state.update({
      code: generateResult.content,
      status: 'generated',
    });

    // Step 2: Review loop
    while (state.iteration < state.maxIterations && !state.approved) {
      // Review the code
      const reviewResult = await langChainService.callLLM([
        { role: 'system', content: `You are a strict code reviewer. Review this code and either:
1. APPROVE if it's production-ready (respond with "APPROVED" at the start)
2. Provide specific improvements needed

Be thorough but concise.` },
        { role: 'user', content: `Review this code:\n\n${state.code}` },
      ]);

      const isApproved = reviewResult.content.toUpperCase().includes('APPROVED');

      state.update({
        reviews: [{ 
          iteration: state.iteration, 
          feedback: reviewResult.content, 
          approved: isApproved 
        }],
        approved: isApproved,
        status: isApproved ? 'approved' : 'needs_revision',
      });

      if (!isApproved && state.iteration < state.maxIterations - 1) {
        // Revise the code
        const reviseResult = await langChainService.callLLM([
          { role: 'system', content: 'You are an expert programmer. Revise this code based on the review feedback.' },
          { role: 'user', content: `Original code:\n${state.code}\n\nReview feedback:\n${reviewResult.content}\n\nProvide the improved code:` },
        ]);

        state.update({
          code: reviseResult.content,
          iteration: state.iteration + 1,
          status: 'revised',
        });
      } else {
        state.update({ iteration: state.iteration + 1 });
      }
    }

    state.update({
      finalResult: state.code,
      messages: [{ role: 'assistant', content: state.code }],
      status: state.approved ? 'approved' : 'max_iterations_reached',
    });

    return {
      success: true,
      workflowType: 'review',
      result: {
        code: state.code,
        reviews: state.reviews,
        approved: state.approved,
        iterations: state.iteration,
        status: state.status,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Review workflow error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main workflow executor
 */
export async function executeWorkflow(workflowType, input, options = {}) {
  switch (workflowType) {
    case 'coding':
      return executeCodingWorkflow(input, options);
    case 'collaboration':
      return executeCollaborationWorkflow(input, options);
    case 'review':
      return executeReviewWorkflow(input, options);
    default:
      return executeCodingWorkflow(input, options);
  }
}

/**
 * Get LangGraph service status
 */
export function getLangGraphStatus() {
  return {
    initialized: true,
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
  executeCodingWorkflow,
  executeCollaborationWorkflow,
  executeReviewWorkflow,
  executeWorkflow,
  getStatus: getLangGraphStatus,
};

export default langGraphService;
