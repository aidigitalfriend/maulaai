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
  code_generation: 'You are an expert code generation agent. Generate clean, efficient, well-documented code based on the requirements. Include error handling and follow best practices.',
  refactor: 'You are an expert refactoring agent. Improve code structure, readability, and performance while maintaining the same functionality. Explain your changes.',
  debug: 'You are an expert debugging agent. Analyze the code or error, identify the root cause, and provide a fix with explanation.',
  test: 'You are an expert testing agent. Generate comprehensive unit tests with good coverage. Use appropriate testing frameworks and patterns.',
  documentation: 'You are an expert documentation agent. Write clear, comprehensive documentation including usage examples and API references.',
  ui: 'You are an expert UI/UX agent. Generate clean React/HTML/CSS code with modern design patterns and accessibility in mind.',
  deploy: 'You are an expert deployment agent. Provide deployment configurations, scripts, and best practices for production environments.',
  build: 'You are an expert build agent. Configure build tools, manage dependencies, and optimize build processes.',
  general: 'You are a helpful AI assistant. Provide accurate, helpful responses.',
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
          approved: isApproved, 
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
 * Execute Research Workflow
 * Multi-step research with source synthesis
 */
export async function executeResearchWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Break down research question
    state.update({ status: 'analyzing_question' });
    
    const analysisResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a research analyst. Break down this research question into 3-5 specific sub-questions that need to be answered.' },
      { role: 'user', content: input },
    ]);

    const subQuestions = analysisResult.content;

    // Step 2: Retrieve RAG context for each sub-question
    state.update({ status: 'gathering_sources' });
    const contexts = [];
    
    try {
      const ragResult = await ragEngine.retrieveForLLM(input, { topK: 5, minScore: 0.5 });
      if (ragResult.context) contexts.push(ragResult.context);
    } catch (e) {
      console.warn('[LangGraph] RAG retrieval failed:', e.message);
    }

    // Step 3: Synthesize research
    state.update({ status: 'synthesizing' });
    
    const synthesisPrompt = `You are a research expert. Based on the following research question and sub-questions, provide a comprehensive research report.

Research Question: ${input}

Sub-questions identified:
${subQuestions}

${contexts.length > 0 ? `\nRelevant Context:\n${contexts.join('\n\n')}` : ''}

Provide a well-structured research report with:
1. Executive Summary
2. Key Findings
3. Detailed Analysis
4. Conclusions
5. Recommendations`;

    const finalResult = await langChainService.callLLM([
      { role: 'system', content: 'You are an expert research synthesizer.' },
      { role: 'user', content: synthesisPrompt },
    ]);

    state.update({
      finalResult: finalResult.content,
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'research',
      result: {
        question: input,
        subQuestions,
        report: finalResult.content,
        sourcesUsed: contexts.length,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Research workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute Creative Writing Workflow
 * Multi-stage creative content generation
 */
export async function executeCreativeWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Ideation - Generate creative concepts
    state.update({ status: 'ideating' });
    
    const ideationResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a creative director. Generate 3 unique creative concepts or angles for this request.' },
      { role: 'user', content: input },
    ]);

    // Step 2: Outline - Create structure
    state.update({ status: 'outlining' });
    
    const outlineResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a content strategist. Create a detailed outline for the best concept.' },
      { role: 'user', content: `Based on these concepts:\n${ideationResult.content}\n\nCreate a detailed outline for the most promising one.` },
    ]);

    // Step 3: Draft - Write full content
    state.update({ status: 'drafting' });
    
    const draftResult = await langChainService.callLLM([
      { role: 'system', content: 'You are an expert creative writer. Write engaging, polished content.' },
      { role: 'user', content: `Write the full content based on this outline:\n${outlineResult.content}\n\nOriginal request: ${input}` },
    ]);

    // Step 4: Polish - Final edits
    state.update({ status: 'polishing' });
    
    const finalResult = await langChainService.callLLM([
      { role: 'system', content: 'You are an editor. Polish this content for clarity, flow, and impact. Keep the same structure but improve the prose.' },
      { role: 'user', content: draftResult.content },
    ]);

    state.update({
      finalResult: finalResult.content,
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'creative',
      result: {
        concepts: ideationResult.content,
        outline: outlineResult.content,
        finalContent: finalResult.content,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Creative workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute Data Analysis Workflow
 * Analyze data and generate insights
 */
export async function executeAnalysisWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Understand the data/question
    state.update({ status: 'understanding' });
    
    const understandingResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a data analyst. Identify what data is being discussed, what questions are being asked, and what analysis approach would be best.' },
      { role: 'user', content: input },
    ]);

    // Step 2: Perform analysis
    state.update({ status: 'analyzing' });
    
    const analysisResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a senior data scientist. Perform detailed analysis and calculations. Show your work.' },
      { role: 'user', content: `Based on this understanding:\n${understandingResult.content}\n\nPerform the analysis for: ${input}` },
    ]);

    // Step 3: Generate insights and recommendations
    state.update({ status: 'generating_insights' });
    
    const insightsResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a business intelligence expert. Extract key insights and provide actionable recommendations.' },
      { role: 'user', content: `Analysis results:\n${analysisResult.content}\n\nProvide key insights and recommendations.` },
    ]);

    state.update({
      finalResult: insightsResult.content,
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'analysis',
      result: {
        understanding: understandingResult.content,
        analysis: analysisResult.content,
        insights: insightsResult.content,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Analysis workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute Planning Workflow
 * Create detailed project plans
 */
export async function executePlanningWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Scope definition
    state.update({ status: 'scoping' });
    
    const scopeResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a project manager. Define the scope, objectives, and constraints for this project.' },
      { role: 'user', content: input },
    ]);

    // Step 2: Task breakdown
    state.update({ status: 'breaking_down' });
    
    const tasksResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a project planner. Break this project into specific tasks with estimates and dependencies.' },
      { role: 'user', content: `Project scope:\n${scopeResult.content}\n\nCreate a detailed task breakdown.` },
    ]);

    // Step 3: Resource and timeline planning
    state.update({ status: 'planning' });
    
    const planResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a project management expert. Create a comprehensive project plan with timeline, milestones, and resource allocation.' },
      { role: 'user', content: `Tasks:\n${tasksResult.content}\n\nCreate a complete project plan.` },
    ]);

    // Step 4: Risk assessment
    state.update({ status: 'assessing_risks' });
    
    const risksResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a risk analyst. Identify potential risks and mitigation strategies.' },
      { role: 'user', content: `Project plan:\n${planResult.content}\n\nIdentify risks and mitigation strategies.` },
    ]);

    state.update({
      finalResult: planResult.content,
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'planning',
      result: {
        scope: scopeResult.content,
        tasks: tasksResult.content,
        plan: planResult.content,
        risks: risksResult.content,
      },
    };
  } catch (error) {
    console.error('[LangGraph] Planning workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute QA/Testing Workflow
 * Generate comprehensive test cases and quality checks
 */
export async function executeQAWorkflow(input, options = {}) {
  const state = new WorkflowState({
    messages: [{ role: 'user', content: input }],
    ...options,
  });

  try {
    // Step 1: Understand requirements
    state.update({ status: 'understanding_requirements' });
    
    const requirementsResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a QA lead. Identify all testable requirements and acceptance criteria from this input.' },
      { role: 'user', content: input },
    ]);

    // Step 2: Generate test cases
    state.update({ status: 'generating_tests' });
    
    const testCasesResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a test engineer. Generate comprehensive test cases including happy path, edge cases, and negative tests.' },
      { role: 'user', content: `Requirements:\n${requirementsResult.content}\n\nGenerate detailed test cases.` },
    ]);

    // Step 3: Create test code
    state.update({ status: 'writing_test_code' });
    
    const testCodeResult = await langChainService.callLLM([
      { role: 'system', content: 'You are a test automation engineer. Write executable test code using Jest/Mocha/Pytest as appropriate.' },
      { role: 'user', content: `Test cases:\n${testCasesResult.content}\n\nWrite automated test code.` },
    ]);

    state.update({
      finalResult: testCodeResult.content,
      status: 'completed',
    });

    return {
      success: true,
      workflowType: 'qa',
      result: {
        requirements: requirementsResult.content,
        testCases: testCasesResult.content,
        testCode: testCodeResult.content,
      },
    };
  } catch (error) {
    console.error('[LangGraph] QA workflow error:', error);
    return { success: false, error: error.message };
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
  case 'research':
    return executeResearchWorkflow(input, options);
  case 'creative':
    return executeCreativeWorkflow(input, options);
  case 'analysis':
    return executeAnalysisWorkflow(input, options);
  case 'planning':
    return executePlanningWorkflow(input, options);
  case 'qa':
    return executeQAWorkflow(input, options);
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
      {
        name: 'research',
        description: 'Multi-step research with source synthesis',
        nodes: ['analyze_question', 'gather_sources', 'synthesize'],
      },
      {
        name: 'creative',
        description: 'Multi-stage creative content generation',
        nodes: ['ideate', 'outline', 'draft', 'polish'],
      },
      {
        name: 'analysis',
        description: 'Data analysis with insights generation',
        nodes: ['understand', 'analyze', 'generate_insights'],
      },
      {
        name: 'planning',
        description: 'Project planning with risk assessment',
        nodes: ['scope', 'breakdown', 'plan', 'assess_risks'],
      },
      {
        name: 'qa',
        description: 'Test case generation and automation',
        nodes: ['requirements', 'test_cases', 'test_code'],
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
  executeResearchWorkflow,
  executeCreativeWorkflow,
  executeAnalysisWorkflow,
  executePlanningWorkflow,
  executeQAWorkflow,
  executeWorkflow,
  getStatus: getLangGraphStatus,
};

export default langGraphService;
