/**
 * AGENT TOOLS CONFIGURATION
 * Defines available tools for agent tool calling
 */

export const AVAILABLE_TOOLS = [
  {
    name: 'execute_code',
    description: 'Execute code in a sandboxed environment. Supports JavaScript, Python, and other languages.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to execute',
        },
        language: {
          type: 'string',
          description: 'Programming language (javascript, python, etc.)',
          default: 'javascript',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'search_web',
    description: 'Search the web for information and return relevant results.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'generate_image',
    description: 'Generate an image based on a text description using AI.',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Text description of the image to generate',
        },
        style: {
          type: 'string',
          description: 'Art style (realistic, cartoon, abstract, etc.)',
          default: 'realistic',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'file_system',
    description: 'Perform file system operations like reading, writing, or listing files.',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Operation to perform (read, write, list, delete)',
          enum: ['read', 'write', 'list', 'delete'],
        },
        path: {
          type: 'string',
          description: 'File or directory path',
        },
        content: {
          type: 'string',
          description: 'Content to write (for write operations)',
        },
      },
      required: ['operation', 'path'],
    },
  },
  {
    name: 'agent_orchestrator',
    description: 'Execute complex tasks using the agent orchestrator system.',
    parameters: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Description of the task to execute',
        },
        context: {
          type: 'object',
          description: 'Additional context for the task',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'database_query',
    description: 'Execute database queries and return results.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute',
        },
        database: {
          type: 'string',
          description: 'Database name',
          default: 'default',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'api_call',
    description: 'Make HTTP API calls to external services.',
    parameters: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          default: 'GET',
        },
        url: {
          type: 'string',
          description: 'API endpoint URL',
        },
        headers: {
          type: 'object',
          description: 'HTTP headers',
        },
        body: {
          type: 'string',
          description: 'Request body (for POST/PUT)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'canvas_save',
    description: 'Save a canvas project to the file system.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Project name',
        },
        description: {
          type: 'string',
          description: 'Project description',
        },
        code: {
          type: 'string',
          description: 'HTML/CSS/JavaScript code',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Project tags',
        },
      },
      required: ['name', 'code'],
    },
  },
  {
    name: 'canvas_load',
    description: 'Load a canvas project from the file system.',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to load',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'canvas_list',
    description: 'List all canvas projects for the user.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'canvas_export',
    description: 'Export a canvas project as HTML or JSON.',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to export',
        },
        format: {
          type: 'string',
          description: 'Export format',
          enum: ['html', 'json'],
          default: 'html',
        },
      },
      required: ['projectId'],
    },
  },
];

/**
 * Get tools for a specific agent type
 */
export function getToolsForAgent(agentId) {
  // Base tools available to all agents
  const baseTools = ['search_web', 'agent_orchestrator'];

  // Agent-specific tools
  const agentTools = {
    'tech-wizard': ['execute_code', 'file_system', 'database_query', 'api_call', 'canvas_save', 'canvas_load', 'canvas_list', 'canvas_export'],
    'code-generation-agent': ['execute_code', 'file_system', 'canvas_save', 'canvas_load'],
    'debug-agent': ['execute_code', 'file_system'],
    'test-agent': ['execute_code', 'file_system'],
    'build-agent': ['execute_code', 'file_system'],
    'deploy-agent': ['execute_code', 'file_system', 'api_call'],
    'ui-agent': ['generate_image', 'file_system', 'canvas_save', 'canvas_load', 'canvas_list', 'canvas_export'],
    'documentation-agent': ['file_system', 'search_web'],
  };

  const allowedToolNames = [...baseTools, ...(agentTools[agentId] || [])];

  return AVAILABLE_TOOLS.filter(tool => allowedToolNames.includes(tool.name));
}

/**
 * Get all available tools
 */
export function getAllTools() {
  return AVAILABLE_TOOLS;
}