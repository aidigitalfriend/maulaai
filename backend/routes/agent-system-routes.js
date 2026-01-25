/**
 * AGENT SYSTEM API ROUTES
 * REST API for the AI Agent Orchestration System
 */

import express from 'express';
import orchestrator from '../services/agent-system/orchestrator.js';
import codeExecutionService from '../services/agent-system/code-execution-service.js';

// Import individual agents for direct access
import CodeGenerationAgent from '../services/agent-system/agents/code-generation-agent.js';
import RefactorAgent from '../services/agent-system/agents/refactor-agent.js';
import DebugAgent from '../services/agent-system/agents/debug-agent.js';
import TestAgent from '../services/agent-system/agents/test-agent.js';
import BuildAgent from '../services/agent-system/agents/build-agent.js';
import DeployAgent from '../services/agent-system/agents/deploy-agent.js';
import FileSystemAgent from '../services/agent-system/agents/filesystem-agent.js';
import UIAgent from '../services/agent-system/agents/ui-agent.js';
import DocumentationAgent from '../services/agent-system/agents/documentation-agent.js';

const router = express.Router();

// Agent instances for direct access
const agents = {
  code_generation: new CodeGenerationAgent(),
  refactor: new RefactorAgent(),
  debug: new DebugAgent(),
  test: new TestAgent(),
  build: new BuildAgent(),
  deploy: new DeployAgent(),
  filesystem: new FileSystemAgent(),
  ui: new UIAgent(),
  documentation: new DocumentationAgent(),
};

/**
 * GET /api/agent-system/status
 * Get agent system status and capabilities
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    version: '1.0.0',
    agents: orchestrator.getAgentCapabilities(),
    totalAgents: Object.keys(agents).length,
  });
});

/**
 * GET /api/agent-system/agents
 * List all available agents and their capabilities
 */
router.get('/agents', (req, res) => {
  const agentList = Object.entries(agents).map(([key, agent]) => ({
    id: key,
    name: agent.name,
    capabilities: agent.capabilities,
  }));

  res.json({
    success: true,
    agents: agentList,
  });
});

/**
 * POST /api/agent-system/execute
 * Execute a task using the orchestrator (auto-routes to appropriate agents)
 */
router.post('/execute', async (req, res) => {
  try {
    const { task, context = {} } = req.body;

    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task is required',
      });
    }

    console.log(`[AgentSystem] Executing task: ${task.substring(0, 100)}...`);
    
    const result = await orchestrator.execute(task, context);
    
    res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('[AgentSystem] Execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent-system/agent/:agentId/execute
 * Execute a task using a specific agent directly
 */
router.post('/agent/:agentId/execute', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task, context = {} } = req.body;

    if (!agents[agentId]) {
      return res.status(404).json({
        success: false,
        error: `Agent not found: ${agentId}`,
        availableAgents: Object.keys(agents),
      });
    }

    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task is required',
      });
    }

    console.log(`[AgentSystem] Direct execution - Agent: ${agentId}, Task: ${task.substring(0, 100)}...`);
    
    const agent = agents[agentId];
    const result = await agent.execute(task, context);
    
    res.json({
      success: true,
      agent: agentId,
      ...result,
    });

  } catch (error) {
    console.error('[AgentSystem] Agent execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent-system/code/generate
 * Generate code (shortcut to code generation agent)
 */
router.post('/code/generate', async (req, res) => {
  try {
    const { requirements, language, framework, type } = req.body;

    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Requirements are required',
      });
    }

    const agent = agents.code_generation;
    
    if (type) {
      const result = await agent.generateSpecific(type, requirements, { language, framework });
      return res.json({ success: true, ...result });
    }

    const result = await agent.execute(requirements, { language, framework });
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/code/refactor
 * Refactor existing code
 */
router.post('/code/refactor', async (req, res) => {
  try {
    const { code, instructions } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const agent = agents.refactor;
    const result = await agent.execute(instructions || 'Refactor this code', { code });
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/code/debug
 * Debug code or error
 */
router.post('/code/debug', async (req, res) => {
  try {
    const { error: errorMessage, code, stackTrace, description } = req.body;

    if (!errorMessage && !code && !description) {
      return res.status(400).json({
        success: false,
        error: 'Error message, code, or description is required',
      });
    }

    const agent = agents.debug;
    const result = await agent.execute(description || `Debug: ${errorMessage}`, {
      error: errorMessage,
      code,
      stackTrace,
    });
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/code/test
 * Generate tests for code
 */
router.post('/code/test', async (req, res) => {
  try {
    const { code, framework = 'jest', type = 'unit' } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const agent = agents.test;
    const result = await agent.generateTests(code, { framework, type });
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/ui/component
 * Generate UI component
 */
router.post('/ui/component', async (req, res) => {
  try {
    const { type, requirements, framework = 'react', styling = 'tailwind' } = req.body;

    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Requirements are required',
      });
    }

    const agent = agents.ui;
    
    if (type) {
      const result = await agent.generateComponent(type, requirements, { framework, styling });
      return res.json({ success: true, ...result });
    }

    const result = await agent.execute(requirements, { framework, styling });
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/docs/generate
 * Generate documentation
 */
router.post('/docs/generate', async (req, res) => {
  try {
    const { code, type, projectInfo } = req.body;

    const agent = agents.documentation;
    
    if (type === 'readme' && projectInfo) {
      const result = await agent.generateReadme(projectInfo);
      return res.json({ success: true, ...result });
    }

    if (type === 'jsdoc' && code) {
      const result = await agent.addJSDocComments(code);
      return res.json({ success: true, ...result });
    }

    if (!code && !projectInfo) {
      return res.status(400).json({
        success: false,
        error: 'Code or project info is required',
      });
    }

    const result = await agent.execute(
      code ? `Document this code: ${code}` : `Create documentation for: ${JSON.stringify(projectInfo)}`,
      { code },
    );
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/build/configure
 * Configure build tools
 */
router.post('/build/configure', async (req, res) => {
  try {
    const { projectType, requirements, packageJson } = req.body;

    if (!projectType && !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Project type or requirements are required',
      });
    }

    const agent = agents.build;
    const result = await agent.execute(
      requirements || `Configure build for a ${projectType} project`,
      { projectType, packageJson },
    );
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/deploy/configure
 * Configure deployment
 */
router.post('/deploy/configure', async (req, res) => {
  try {
    const { platform, projectType, requirements } = req.body;

    if (!platform && !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Platform or requirements are required',
      });
    }

    const agent = agents.deploy;
    const result = await agent.execute(
      requirements || `Configure deployment for ${platform}`,
      { platform, projectType },
    );
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/agent-system/file/operation
 * File system operations
 */
router.post('/file/operation', async (req, res) => {
  try {
    const { operation, path, content, sourcePath, destPath, pattern } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required',
      });
    }

    const agent = agents.filesystem;
    const result = await agent.execute(operation, {
      path,
      content,
      sourcePath,
      destPath,
      pattern,
    });
    
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agent-system/history
 * Get execution history
 */
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const history = orchestrator.getHistory(limit);
  
  res.json({
    success: true,
    history,
    count: history.length,
  });
});

/**
 * POST /api/agent-system/analyze
 * Analyze a task without executing (just shows which agents would be used)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { task, context = {} } = req.body;

    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task is required',
      });
    }

    const analysis = await orchestrator.analyzeTask(task, context);
    
    res.json({
      success: true,
      analysis,
      agents: {
        primary: analysis.primaryAgent,
        secondary: analysis.secondaryAgents || [],
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CODE EXECUTION ROUTES
// ============================================

/**
 * POST /api/agent-system/code/execute
 * Execute code in a sandboxed environment
 */
router.post('/code/execute', async (req, res) => {
  try {
    const { language, code, timeout } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required',
        supportedLanguages: codeExecutionService.getSupportedLanguages(),
      });
    }

    // Validate code for dangerous patterns
    const validation = codeExecutionService.validateCode(language, code);
    if (!validation.safe) {
      return res.status(400).json({
        success: false,
        error: 'Code contains potentially dangerous patterns',
        violations: validation.violations,
      });
    }

    // Execute code
    const result = await codeExecutionService.executeCode(language, code, { timeout });
    
    res.json({
      success: result.success,
      ...result,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agent-system/code/languages
 * Get supported programming languages
 */
router.get('/code/languages', (req, res) => {
  res.json({
    success: true,
    languages: codeExecutionService.getSupportedLanguages(),
    limits: codeExecutionService.LIMITS,
  });
});

/**
 * POST /api/agent-system/code/validate
 * Validate code without executing
 */
router.post('/code/validate', (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required',
      });
    }

    const validation = codeExecutionService.validateCode(language, code);
    
    res.json({
      success: true,
      ...validation,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
