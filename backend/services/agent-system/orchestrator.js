/**
 * AI AGENT ORCHESTRATOR
 * Master controller that analyzes tasks and routes them to specialized agents
 * 
 * Architecture:
 * User Request → Orchestrator → [RAG Context] → [Analyze Task] → Route to Agent(s) → Execute → Combine Results
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Import specialized agents
import CodeGenerationAgent from './agents/code-generation-agent.js';
import RefactorAgent from './agents/refactor-agent.js';
import DebugAgent from './agents/debug-agent.js';
import TestAgent from './agents/test-agent.js';
import BuildAgent from './agents/build-agent.js';
import DeployAgent from './agents/deploy-agent.js';
import FileSystemAgent from './agents/filesystem-agent.js';
import UIAgent from './agents/ui-agent.js';
import DocumentationAgent from './agents/documentation-agent.js';

// Import AI Core services
import ragEngine from '../ai-core/rag-engine.js';

/**
 * Agent Registry - All available specialized agents
 */
const AGENT_REGISTRY = {
  code_generation: {
    agent: CodeGenerationAgent,
    name: 'Code Generation Agent',
    description: 'Generates new code based on requirements, specifications, or descriptions',
    triggers: ['create', 'generate', 'write', 'build', 'implement', 'code', 'new function', 'new class', 'new component'],
  },
  refactor: {
    agent: RefactorAgent,
    name: 'Refactor Agent',
    description: 'Improves existing code structure, readability, and performance without changing behavior',
    triggers: ['refactor', 'improve', 'optimize', 'clean up', 'restructure', 'simplify', 'modernize'],
  },
  debug: {
    agent: DebugAgent,
    name: 'Debug Agent',
    description: 'Finds and fixes bugs, errors, and issues in code',
    triggers: ['debug', 'fix', 'error', 'bug', 'issue', 'not working', 'broken', 'crash', 'exception'],
  },
  test: {
    agent: TestAgent,
    name: 'Test Agent',
    description: 'Generates unit tests, integration tests, and test suites',
    triggers: ['test', 'unit test', 'integration test', 'testing', 'coverage', 'spec', 'jest', 'mocha'],
  },
  build: {
    agent: BuildAgent,
    name: 'Build Agent',
    description: 'Handles build processes, bundling, compilation, and project setup',
    triggers: ['build', 'compile', 'bundle', 'webpack', 'vite', 'package', 'npm', 'yarn', 'dependency'],
  },
  deploy: {
    agent: DeployAgent,
    name: 'Deploy Agent',
    description: 'Manages deployment to servers, cloud platforms, and production environments',
    triggers: ['deploy', 'deployment', 'production', 'server', 'hosting', 'aws', 'vercel', 'docker', 'ci/cd'],
  },
  filesystem: {
    agent: FileSystemAgent,
    name: 'File System Agent',
    description: 'Reads, writes, and manages files and directories',
    triggers: ['file', 'read', 'write', 'create file', 'delete', 'rename', 'move', 'copy', 'directory', 'folder'],
  },
  ui: {
    agent: UIAgent,
    name: 'UI Agent',
    description: 'Generates React components, HTML, CSS, and UI/UX code',
    triggers: ['ui', 'component', 'react', 'html', 'css', 'tailwind', 'design', 'layout', 'style', 'frontend'],
  },
  documentation: {
    agent: DocumentationAgent,
    name: 'Documentation Agent',
    description: 'Writes documentation, comments, README files, and API docs',
    triggers: ['document', 'documentation', 'readme', 'comment', 'jsdoc', 'api docs', 'explain', 'describe'],
  },
};

/**
 * Orchestrator Class - The Brain of the Agent System
 */
class AgentOrchestrator {
  constructor() {
    this.agents = AGENT_REGISTRY;
    this.executionHistory = [];
    this.maxParallelAgents = 3;
  }

  // Lazy initialization of OpenAI client
  get openai() {
    if (!this._openai) {
      this._openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this._openai;
  }

  // Lazy initialization of Anthropic client
  get anthropic() {
    if (!this._anthropic) {
      this._anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this._anthropic;
  }

  /**
   * Analyze user request and determine which agents to use
   */
  async analyzeTask(userRequest, context = {}) {
    const systemPrompt = `You are an AI task analyzer. Analyze the user's request and determine which specialized agents should handle it.

Available Agents:
${Object.entries(this.agents).map(([key, info]) => 
  `- ${key}: ${info.description}`
).join('\n')}

Respond in JSON format:
{
  "primaryAgent": "agent_key",
  "secondaryAgents": ["agent_key1", "agent_key2"],
  "taskBreakdown": [
    {"agent": "agent_key", "task": "specific task description", "priority": 1}
  ],
  "requiresSequential": true/false,
  "reasoning": "explanation of why these agents were chosen"
}

Rules:
1. Always select at least one primary agent
2. Use multiple agents for complex tasks
3. Set requiresSequential=true if tasks depend on each other
4. Be specific in task breakdown`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Request: ${userRequest}\n\nContext: ${JSON.stringify(context)}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Task analysis error:', error);
      // Fallback: keyword-based agent selection
      return this.fallbackAnalysis(userRequest);
    }
  }

  /**
   * Fallback keyword-based analysis
   */
  fallbackAnalysis(userRequest) {
    const request = userRequest.toLowerCase();
    const matchedAgents = [];

    for (const [key, info] of Object.entries(this.agents)) {
      const matchScore = info.triggers.filter(trigger => 
        request.includes(trigger.toLowerCase())
      ).length;
      
      if (matchScore > 0) {
        matchedAgents.push({ key, score: matchScore });
      }
    }

    matchedAgents.sort((a, b) => b.score - a.score);
    
    return {
      primaryAgent: matchedAgents[0]?.key || 'code_generation',
      secondaryAgents: matchedAgents.slice(1, 3).map(a => a.key),
      taskBreakdown: [{
        agent: matchedAgents[0]?.key || 'code_generation',
        task: userRequest,
        priority: 1
      }],
      requiresSequential: false,
      reasoning: 'Fallback keyword-based analysis'
    };
  }

  /**
   * Execute a task using the orchestrated agents
   */
  async execute(userRequest, context = {}) {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Step 0: Retrieve RAG context (if available)
      let ragContext = null;
      try {
        const ragResult = await ragEngine.retrieveForLLM(userRequest, {
          agentId: context.agentId,
          userId: context.userId,
          topK: 5,
          minScore: 0.6,
        });
        if (ragResult.success && ragResult.context) {
          ragContext = ragResult.context;
          console.log(`[Orchestrator] RAG context retrieved: ${ragResult.totalSources} sources`);
        }
      } catch (ragError) {
        console.warn('[Orchestrator] RAG retrieval failed, continuing without context:', ragError.message);
      }

      // Step 1: Analyze the task
      console.log(`[Orchestrator] Analyzing task: ${userRequest.substring(0, 100)}...`);
      const analysis = await this.analyzeTask(userRequest, { ...context, ragContext });
      
      console.log(`[Orchestrator] Analysis complete:`, {
        primary: analysis.primaryAgent,
        secondary: analysis.secondaryAgents,
        sequential: analysis.requiresSequential
      });

      // Step 2: Execute agents
      const results = [];
      const enhancedContext = { ...context, ragContext };
      
      if (analysis.requiresSequential) {
        // Sequential execution
        for (const task of analysis.taskBreakdown.sort((a, b) => a.priority - b.priority)) {
          const agentInfo = this.agents[task.agent];
          if (agentInfo) {
            const result = await this.executeAgent(task.agent, task.task, {
              ...enhancedContext,
              previousResults: results
            });
            results.push({
              agent: task.agent,
              agentName: agentInfo.name,
              task: task.task,
              result
            });
          }
        }
      } else {
        // Parallel execution
        const tasks = analysis.taskBreakdown.slice(0, this.maxParallelAgents);
        const parallelResults = await Promise.all(
          tasks.map(async (task) => {
            const agentInfo = this.agents[task.agent];
            if (agentInfo) {
              const result = await this.executeAgent(task.agent, task.task, enhancedContext);
              return {
                agent: task.agent,
                agentName: agentInfo.name,
                task: task.task,
                result
              };
            }
            return null;
          })
        );
        results.push(...parallelResults.filter(Boolean));
      }

      // Step 3: Combine results
      const combinedResult = await this.combineResults(userRequest, results, enhancedContext);

      // Record execution
      const execution = {
        id: executionId,
        request: userRequest,
        analysis,
        results,
        combinedResult,
        ragUsed: !!ragContext,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      this.executionHistory.push(execution);

      return {
        success: true,
        executionId,
        analysis,
        agentResults: results,
        finalResult: combinedResult,
        duration: execution.duration
      };

    } catch (error) {
      console.error('[Orchestrator] Execution error:', error);
      return {
        success: false,
        executionId,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Execute a single specialized agent
   */
  async executeAgent(agentKey, task, context) {
    const agentInfo = this.agents[agentKey];
    if (!agentInfo) {
      throw new Error(`Unknown agent: ${agentKey}`);
    }

    console.log(`[Orchestrator] Executing ${agentInfo.name}...`);
    
    try {
      const agent = new agentInfo.agent();
      const result = await agent.execute(task, context);
      return result;
    } catch (error) {
      console.error(`[${agentInfo.name}] Error:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Combine results from multiple agents into a cohesive response
   */
  async combineResults(originalRequest, agentResults, context) {
    if (agentResults.length === 0) {
      return { message: 'No agents were able to process the request.' };
    }

    if (agentResults.length === 1) {
      return agentResults[0].result;
    }

    // Use AI to combine multiple agent results
    const systemPrompt = `You are combining results from multiple specialized AI agents into a cohesive response.

Original request: ${originalRequest}

Agent results:
${agentResults.map(r => `
### ${r.agentName}
Task: ${r.task}
Result: ${JSON.stringify(r.result, null, 2)}
`).join('\n')}

Combine these results into a single, well-organized response that addresses the original request.
Include all relevant code, explanations, and recommendations from each agent.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      });

      return {
        combined: true,
        agentCount: agentResults.length,
        response: response.content[0].text,
        individualResults: agentResults.map(r => ({
          agent: r.agentName,
          summary: r.result?.summary || r.result?.message || 'Completed'
        }))
      };
    } catch (error) {
      // Fallback: just return all results
      return {
        combined: false,
        results: agentResults.map(r => ({
          agent: r.agentName,
          result: r.result
        }))
      };
    }
  }

  /**
   * Get available agents and their capabilities
   */
  getAgentCapabilities() {
    return Object.entries(this.agents).map(([key, info]) => ({
      id: key,
      name: info.name,
      description: info.description,
      triggers: info.triggers
    }));
  }

  /**
   * Get execution history
   */
  getHistory(limit = 10) {
    return this.executionHistory.slice(-limit);
  }
}

// Export singleton instance
const orchestrator = new AgentOrchestrator();
export default orchestrator;
export { AgentOrchestrator, AGENT_REGISTRY };
