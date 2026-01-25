/**
 * AGENT CHAT WITH TOOL CALLING
 * Advanced chat endpoint with integrated tool calling capabilities
 * Supports multimodal AI with agent system integration
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import agentAIService from '../lib/agent-ai-provider-service.js';
import orchestrator from '../services/agent-system/orchestrator.js';
import { MultiModalAIService } from '../lib/multimodal-ai-service.js';
import { getToolsForAgent } from '../lib/agent-tools.js';

const router = express.Router();

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * POST /api/agent/chat
 * Main chat endpoint with tool calling support
 */
router.post('/chat', requireAuth, [
  body('message').isString().isLength({ min: 1, max: 10000 }),
  body('agentId').optional().isString(),
  body('conversationId').optional().isString(),
  body('tools').optional().isArray(),
  body('config').optional().isObject(),
], validateRequest, async (req, res) => {
  try {
    const { message, agentId, conversationId, tools = [], config = {} } = req.body;
    const userId = req.userId;

    // Get agent-specific tools if no custom tools provided
    const agentTools = tools.length > 0 ? tools : getToolsForAgent(agentId);

    console.log(`[AgentChat] Processing message for agent ${agentId || 'default'} with ${agentTools.length} tools`);

    // Build system prompt with tool calling instructions
    const systemPrompt = buildSystemPromptWithTools(agentId, agentTools);

    // Get AI response with tool calling capability
    const aiResponse = await getChatWithToolCalling(
      message,
      agentId,
      systemPrompt,
      { ...config, tools: agentTools },
      userId,
    );

    // Check if response contains tool calls
    const toolCalls = detectToolCalls(aiResponse);

    let finalResponse = aiResponse;
    let toolResults = [];

    if (toolCalls.length > 0) {
      console.log(`[AgentChat] Detected ${toolCalls.length} tool calls`);

      // Execute tools
      toolResults = await executeTools(toolCalls, {
        userId,
        agentId,
        conversationId,
        message,
      });

      // Generate follow-up response with tool results
      finalResponse = await generateFollowUpResponse(
        message,
        aiResponse,
        toolResults,
        agentId,
        systemPrompt,
        config,
      );
    }

    res.json({
      success: true,
      response: finalResponse,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      agentId,
      conversationId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[AgentChat] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat request',
      message: error.message,
    });
  }
});

/**
 * POST /api/agent/chat-stream
 * Streaming chat endpoint with tool calling support
 */
router.post('/chat-stream', requireAuth, [
  body('message').isString().isLength({ min: 1, max: 10000 }),
  body('agentId').optional().isString(),
  body('conversationId').optional().isString(),
  body('tools').optional().isArray(),
  body('config').optional().isObject(),
], validateRequest, async (req, res) => {
  try {
    const { message, agentId, conversationId, tools = [], config = {} } = req.body;
    const userId = req.userId;

    // Get agent-specific tools if no custom tools provided
    const agentTools = tools.length > 0 ? tools : getToolsForAgent(agentId);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log(`[AgentChatStream] Starting stream for agent ${agentId || 'default'} with ${agentTools.length} tools`);

    // Build system prompt with tool calling instructions
    const systemPrompt = buildSystemPromptWithTools(agentId, agentTools);

    // Get streaming AI response
    const stream = await getStreamingChatWithTools(
      message,
      agentId,
      systemPrompt,
      { ...config, tools: agentTools },
      userId,
    );

    let accumulatedResponse = '';
    const toolCalls = [];

    // Process the stream
    for await (const chunk of stream) {
      if (chunk.type === 'content') {
        accumulatedResponse += chunk.content;
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      } else if (chunk.type === 'tool_call') {
        toolCalls.push(chunk.toolCall);
        res.write(`data: ${JSON.stringify({ 
          event: 'tool_call', 
          tool_name: chunk.toolCall.name, 
          tool_args: chunk.toolCall.arguments, 
        })}\n\n`);
      }
    }

    // If tool calls were detected, execute them
    if (toolCalls.length > 0) {
      console.log(`[AgentChatStream] Executing ${toolCalls.length} tool calls`);

      res.write(`data: ${JSON.stringify({ event: 'tool_execution_start' })}\n\n`);

      const toolResults = await executeTools(toolCalls, {
        userId,
        agentId,
        conversationId,
        message,
      });

      // Send tool results
      res.write(`data: ${JSON.stringify({ 
        event: 'tool_results', 
        tool_name: toolCalls[0].name,
        results: toolResults.map(r => r.result || r.error).join('\n'), 
      })}\n\n`);

      // Generate and stream follow-up response
      const followUpStream = await generateStreamingFollowUp(
        message,
        accumulatedResponse,
        toolResults,
        agentId,
        systemPrompt,
        config,
      );

      for await (const chunk of followUpStream) {
        res.write(`data: ${JSON.stringify({ event: 'follow_up', content: chunk.content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[AgentChatStream] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
});

/**
 * Build system prompt with tool calling instructions
 */
function buildSystemPromptWithTools(agentId, tools) {
  let basePrompt = 'You are an AI assistant';

  if (agentId) {
    // Get agent-specific personality
    const personality = getAgentPersonality(agentId);
    basePrompt = personality.systemPrompt || basePrompt;
  }

  if (tools && tools.length > 0) {
    basePrompt += `

You have access to the following tools:
${tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

When you need to use a tool, respond with a JSON object in this format:
{
  "tool_call": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1",
      "param2": "value2"
    }
  }
}

You can make multiple tool calls if needed. After receiving tool results, provide a natural language response.`;
  }

  return basePrompt;
}

/**
 * Get chat response with tool calling capability
 */
async function getChatWithToolCalling(message, agentId, systemPrompt, config, userId) {
  try {
    // Use the agent AI service with tool calling support
    const response = await agentAIService.sendAgentMessageWithTools(
      agentId,
      message,
      systemPrompt,
      config.tools || [],
      {
        ...config,
        userId,
      },
    );

    return response.response;
  } catch (error) {
    console.error('[ToolChat] Agent AI service error:', error);
    // Fallback to basic multimodal service
    const multiModalService = new MultiModalAIService();
    return await multiModalService.getChatResponse(message, agentId, {
      ...config,
      systemPrompt,
    });
  }
}

/**
 * Get streaming chat with tool detection
 */
async function getStreamingChatWithTools(message, agentId, systemPrompt, config, userId) {
  // Get the AI response
  const response = await getChatWithToolCalling(message, agentId, systemPrompt, config, userId);

  // Parse tool calls from the response
  const toolCalls = detectToolCalls(response);

  // Create a streaming response
  const chunks = response.split(' ');
  const stream = {
    async *[Symbol.asyncIterator]() {
      // Stream the main response
      for (const chunk of chunks) {
        yield { type: 'content', content: chunk + ' ' };
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
      }

      // If tool calls were detected, yield them
      for (const toolCall of toolCalls) {
        yield { type: 'tool_call', toolCall };
      }
    },
  };

  return stream;
}

/**
 * Detect tool calls in AI response
 */
function detectToolCalls(response) {
  const toolCalls = [];

  try {
    // Look for JSON tool call objects in the response
    const jsonMatches = response.match(/\{[\s\S]*?\}/g);

    if (jsonMatches) {
      for (const match of jsonMatches) {
        try {
          const parsed = JSON.parse(match);
          if (parsed.tool_call) {
            toolCalls.push({
              id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: parsed.tool_call.name,
              arguments: parsed.tool_call.arguments || {},
            });
          }
        } catch (_e) {
          // Not valid JSON, continue
        }
      }
    }
  } catch (error) {
    console.warn('[ToolDetection] Error parsing tool calls:', error);
  }

  return toolCalls;
}

/**
 * Execute tools using the agent orchestrator
 */
async function executeTools(toolCalls, context) {
  const results = [];

  for (const toolCall of toolCalls) {
    try {
      console.log(`[ToolExecution] Executing ${toolCall.name} with args:`, toolCall.arguments);

      let result;

      // Route tool calls to appropriate handlers
      switch (toolCall.name) {
      case 'execute_code':
        result = await executeCodeTool(toolCall.arguments, context);
        break;
      case 'search_web':
        result = await executeWebSearchTool(toolCall.arguments, context);
        break;
      case 'generate_image':
        result = await executeImageGenerationTool(toolCall.arguments, context);
        break;
      case 'file_system':
        result = await executeFileSystemTool(toolCall.arguments, context);
        break;
      case 'canvas_save':
        result = await executeCanvasSaveTool(toolCall.arguments, context);
        break;
      case 'canvas_load':
        result = await executeCanvasLoadTool(toolCall.arguments, context);
        break;
      case 'canvas_list':
        result = await executeCanvasListTool(toolCall.arguments, context);
        break;
      case 'canvas_export':
        result = await executeCanvasExportTool(toolCall.arguments, context);
        break;
      case 'agent_orchestrator':
        result = await orchestrator.execute(toolCall.arguments.task || 'Help with this request', {
          ...context,
          ...toolCall.arguments,
        });
        break;
      default:
        // Try to execute via agent system
        result = await orchestrator.execute(`Execute ${toolCall.name}: ${JSON.stringify(toolCall.arguments)}`, context);
      }

      results.push({
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        success: true,
        result,
      });

    } catch (error) {
      console.error(`[ToolExecution] Error executing ${toolCall.name}:`, error);
      results.push({
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Generate follow-up response after tool execution
 */
async function generateFollowUpResponse(message, aiResponse, toolResults, agentId, systemPrompt, config) {
  const toolSummary = toolResults.map(result =>
    `${result.toolName}: ${result.success ? 'Success' : 'Failed'}${result.result ? ` - ${JSON.stringify(result.result).substring(0, 200)}` : ''}`,
  ).join('\n');

  const followUpPrompt = `${systemPrompt}

Original user message: ${message}
Your initial response: ${aiResponse}

Tool execution results:
${toolSummary}

Based on the tool results above, provide a comprehensive response to the user.`;

  try {
    const response = await getChatWithToolCalling(followUpPrompt, agentId, '', config, null);
    return response;
  } catch (error) {
    console.error('[FollowUp] Error generating follow-up:', error);
    return `I executed the requested tools. Here are the results:\n\n${toolSummary}`;
  }
}

/**
 * Generate streaming follow-up response
 */
async function generateStreamingFollowUp(message, aiResponse, toolResults, agentId, systemPrompt, config) {
  const followUpResponse = await generateFollowUpResponse(message, aiResponse, toolResults, agentId, systemPrompt, config);

  // Simulate streaming
  const chunks = followUpResponse.split(' ');
  const stream = {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        yield { type: 'content', content: chunk + ' ' };
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    },
  };

  return stream;
}

// Tool execution functions
async function executeCodeTool(args, _context) {
  // Use the code execution service
  const { executeCode } = await import('../services/agent-system/code-execution-service.js');
  return await executeCode(args.language || 'javascript', args.code);
}

async function executeWebSearchTool(args, _context) {
  // Use agent tools service for web search
  const { webSearch } = await import('../lib/agent-tools-service.js');
  return await webSearch(args.query, args.limit || 5);
}

async function executeImageGenerationTool(args, context) {
  // Use agent tools service for image generation
  const { generateImage } = await import('../lib/agent-tools-service.js');
  return await generateImage(args.prompt, args.style || 'realistic', args.width || 1024, args.height || 1024, context.userId);
}

async function executeFileSystemTool(args, context) {
  // Use file system agent
  const { default: FileSystemAgent } = await import('../services/agent-system/agents/filesystem-agent.js');
  const agent = new FileSystemAgent();
  const task = `${args.operation} ${args.path || ''} ${args.content ? 'with content: ' + args.content : ''}`.trim();
  return await agent.execute(task, { ...context, ...args });
}

// Canvas tool execution functions
async function executeCanvasSaveTool(args, context) {
  const { default: CanvasFileManager } = await import('../services/canvas/canvas-file-manager.js');
  const canvasManager = new CanvasFileManager();
  return await canvasManager.saveProject(args, context.userId);
}

async function executeCanvasLoadTool(args, context) {
  const { default: CanvasFileManager } = await import('../services/canvas/canvas-file-manager.js');
  const canvasManager = new CanvasFileManager();
  return await canvasManager.loadProject(args.projectId, context.userId);
}

async function executeCanvasListTool(args, context) {
  const { default: CanvasFileManager } = await import('../services/canvas/canvas-file-manager.js');
  const canvasManager = new CanvasFileManager();
  return await canvasManager.listProjects(context.userId);
}

async function executeCanvasExportTool(args, context) {
  const { default: CanvasFileManager } = await import('../services/canvas/canvas-file-manager.js');
  const canvasManager = new CanvasFileManager();
  return await canvasManager.exportProject(args.projectId, context.userId, args.format || 'html');
}

// Helper function to get agent personality
function getAgentPersonality(_agentId) {
  // This would integrate with the personality system
  return {
    systemPrompt: 'You are a helpful AI assistant with access to various tools and capabilities.',
  };
}
