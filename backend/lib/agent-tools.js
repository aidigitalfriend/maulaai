/**
 * AGENT TOOLS CONFIGURATION
 * Defines available tools for agent tool calling
 */

export const AVAILABLE_TOOLS = [
  // ═══════════════════════════════════════════════════════════════════
  // 🔧 CORE TOOLS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'execute_code',
    description: 'Execute code in a sandboxed environment. Supports JavaScript, Python, and other languages.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The code to execute' },
        language: { type: 'string', description: 'Programming language (javascript, python, etc.)', default: 'javascript' },
      },
      required: ['code'],
    },
  },
  {
    name: 'web_search',
    description: 'Search the web for current information, facts, news, or research. Use when you need up-to-date info.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        num_results: { type: 'number', description: 'Number of results (1-10)', default: 5 },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_url',
    description: 'Fetch and extract content from a URL. Use when user shares a link or asks about a webpage.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to fetch' },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_current_time',
    description: 'Get the current date and time. Use when user asks about time or you need temporal context.',
    parameters: {
      type: 'object',
      properties: {
        timezone: { type: 'string', description: 'Timezone (e.g., America/New_York)', default: 'UTC' },
      },
    },
  },
  {
    name: 'calculate',
    description: 'Perform mathematical calculations. Use for any math operations, equations, or formulas.',
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Math expression to evaluate (e.g., "2+2", "sqrt(16)", "sin(45)")' },
      },
      required: ['expression'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 📁 FILE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'create_file',
    description: 'Create a new file with specified content. Use when user asks to create, write, save a file, or wants downloadable content (text, code, data).',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Name of the file to create (e.g., "script.py", "notes.txt", "data.json")' },
        content: { type: 'string', description: 'Content to write to the file' },
        folder: { type: 'string', description: 'Folder path (optional)', default: '' },
      },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'read_file',
    description: 'Read and return the contents of a file. Use when user asks to view, read, or open a file.',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Name or path of the file to read' },
      },
      required: ['filename'],
    },
  },
  {
    name: 'modify_file',
    description: 'Modify an existing file by replacing content or appending to it. Use when user asks to edit, update, or change a file.',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Name or path of the file to modify' },
        content: { type: 'string', description: 'New content (replaces file) or content to append' },
        mode: { type: 'string', description: 'Operation mode: "replace" or "append"', default: 'replace' },
      },
      required: ['filename', 'content'],
    },
  },
  {
    name: 'delete_file',
    description: 'Delete a file. Use when user explicitly asks to delete or remove a file.',
    parameters: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Name or path of the file to delete' },
      },
      required: ['filename'],
    },
  },
  {
    name: 'list_files',
    description: 'List files and folders in a directory. Use when user asks to see files, browse folders, or check what exists.',
    parameters: {
      type: 'object',
      properties: {
        folder: { type: 'string', description: 'Folder path to list (defaults to workspace root)', default: '' },
      },
    },
  },
  {
    name: 'move_file',
    description: 'Move a file from one location to another.',
    parameters: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Current file path' },
        destination: { type: 'string', description: 'New file path' },
      },
      required: ['source', 'destination'],
    },
  },
  {
    name: 'copy_file',
    description: 'Copy a file to a new location.',
    parameters: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Source file path' },
        destination: { type: 'string', description: 'Destination file path' },
      },
      required: ['source', 'destination'],
    },
  },
  {
    name: 'zip_files',
    description: 'Compress files into a ZIP archive. Use when user wants to create a zip or bundle files.',
    parameters: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string' }, description: 'Array of file paths to compress' },
        output_name: { type: 'string', description: 'Name of the output ZIP file', default: 'archive.zip' },
      },
      required: ['files'],
    },
  },
  {
    name: 'unzip_files',
    description: 'Extract files from a ZIP archive.',
    parameters: {
      type: 'object',
      properties: {
        zip_file: { type: 'string', description: 'Path to the ZIP file' },
        destination: { type: 'string', description: 'Folder to extract files to', default: '' },
      },
      required: ['zip_file'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🖼️ IMAGE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'generate_image',
    description: 'Generate an AI image from a text description. Use when user asks to create, generate, or make an image, picture, artwork, or illustration.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Detailed description of the image to generate' },
        style: { type: 'string', description: 'Art style: realistic, artistic, anime, oil-painting, watercolor, digital-art, 3d-render, pixel-art', default: 'realistic' },
        width: { type: 'number', description: 'Image width (512-1024)', default: 1024 },
        height: { type: 'number', description: 'Image height (512-1024)', default: 1024 },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'convert_image',
    description: 'Convert an image to a different format (PNG, JPEG, WebP). Use when user asks to convert image format, save as PNG/JPG, or change image type.',
    parameters: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'URL or base64 data URL of the image to convert' },
        format: { type: 'string', description: 'Target format: png, jpeg, webp', default: 'png' },
        quality: { type: 'number', description: 'Quality for JPEG/WebP (1-100)', default: 90 },
      },
      required: ['image_url'],
    },
  },
  {
    name: 'edit_image',
    description: 'Apply edits to an image (brightness, contrast, blur, sharpen, rotate, flip). Use for image modifications and adjustments.',
    parameters: {
      type: 'object',
      properties: {
        image_path: { type: 'string', description: 'Path or URL of the image' },
        operations: { 
          type: 'array', 
          description: 'Array of operations: [{type: "brightness", value: 1.2}, {type: "contrast", value: 1.1}, {type: "blur", value: 5}, {type: "sharpen"}, {type: "rotate", degrees: 90}, {type: "flip", direction: "horizontal"}]',
          items: { type: 'object' },
        },
      },
      required: ['image_path', 'operations'],
    },
  },
  {
    name: 'resize_image',
    description: 'Resize an image to specified dimensions.',
    parameters: {
      type: 'object',
      properties: {
        image_path: { type: 'string', description: 'Path to the image' },
        width: { type: 'number', description: 'New width in pixels' },
        height: { type: 'number', description: 'New height in pixels' },
      },
      required: ['image_path', 'width', 'height'],
    },
  },
  {
    name: 'crop_image',
    description: 'Crop an image to specified region.',
    parameters: {
      type: 'object',
      properties: {
        image_path: { type: 'string', description: 'Path to the image' },
        x: { type: 'number', description: 'X coordinate of crop start' },
        y: { type: 'number', description: 'Y coordinate of crop start' },
        width: { type: 'number', description: 'Crop width' },
        height: { type: 'number', description: 'Crop height' },
      },
      required: ['image_path', 'x', 'y', 'width', 'height'],
    },
  },
  {
    name: 'ocr_image',
    description: 'Extract text from an image using OCR. Use when user wants to read text in an image, screenshot, or scanned document.',
    parameters: {
      type: 'object',
      properties: {
        image_path: { type: 'string', description: 'Path or URL of the image' },
        language: { type: 'string', description: 'Language code (en, es, fr, etc.)', default: 'en' },
      },
      required: ['image_path'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 📄 DOCUMENT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'parse_pdf',
    description: 'Extract text content from a PDF file. Use when user uploads or references a PDF document.',
    parameters: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the PDF file' },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'parse_docx',
    description: 'Extract text content from a Word document (.docx). Use when user uploads a Word file.',
    parameters: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the DOCX file' },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'parse_csv',
    description: 'Parse CSV data and return structured results. Use for spreadsheet/data analysis.',
    parameters: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the CSV file' },
        limit: { type: 'number', description: 'Max rows to return', default: 100 },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'extract_text',
    description: 'Extract plain text from any document format (PDF, DOCX, CSV, etc.). Universal text extractor.',
    parameters: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the document' },
      },
      required: ['file_path'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🎥 VIDEO OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'generate_video',
    description: 'Generate a short AI video from a text description. Use when user asks to create a video or animation.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Detailed description of the video to generate' },
        duration: { type: 'number', description: 'Video duration in seconds (2-10)', default: 4 },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'convert_video',
    description: 'Convert video to different format (MP4, WebM, AVI, MOV).',
    parameters: {
      type: 'object',
      properties: {
        video_path: { type: 'string', description: 'Path to the video' },
        format: { type: 'string', description: 'Target format: mp4, webm, avi, mov', default: 'mp4' },
      },
      required: ['video_path'],
    },
  },
  {
    name: 'trim_video',
    description: 'Trim video to specified start and end times.',
    parameters: {
      type: 'object',
      properties: {
        video_path: { type: 'string', description: 'Path to the video' },
        start_time: { type: 'string', description: 'Start time (HH:MM:SS or seconds)' },
        end_time: { type: 'string', description: 'End time (HH:MM:SS or seconds)' },
      },
      required: ['video_path', 'start_time', 'end_time'],
    },
  },
  {
    name: 'extract_frames',
    description: 'Extract frames/screenshots from a video at specified timestamps.',
    parameters: {
      type: 'object',
      properties: {
        video_path: { type: 'string', description: 'Path to the video' },
        timestamps: { type: 'array', items: { type: 'string' }, description: 'Array of timestamps to extract frames at' },
      },
      required: ['video_path', 'timestamps'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🔊 AUDIO OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'transcribe_audio',
    description: 'Convert speech to text using AI transcription. Use for audio-to-text, voice transcription, or meeting notes.',
    parameters: {
      type: 'object',
      properties: {
        audio_path: { type: 'string', description: 'Path to the audio file' },
        language: { type: 'string', description: 'Language code (en, es, fr, etc.)', default: 'en' },
      },
      required: ['audio_path'],
    },
  },
  {
    name: 'convert_audio',
    description: 'Convert audio to different format (MP3, WAV, OGG, FLAC).',
    parameters: {
      type: 'object',
      properties: {
        audio_path: { type: 'string', description: 'Path to the audio file' },
        format: { type: 'string', description: 'Target format: mp3, wav, ogg, flac', default: 'mp3' },
      },
      required: ['audio_path'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 💻 CODE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'analyze_code',
    description: 'Analyze code for quality, complexity, bugs, and issues. Use for code review, debugging help, or understanding code.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code content or file path' },
        language: { type: 'string', description: 'Programming language', default: 'auto' },
      },
      required: ['code'],
    },
  },
  {
    name: 'format_code',
    description: 'Format/prettify code according to language standards. Use for code formatting and beautification.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to format' },
        language: { type: 'string', description: 'Programming language (javascript, python, css, html, json, etc.)' },
      },
      required: ['code', 'language'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🎨 CANVAS OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'canvas_save',
    description: 'Save a canvas project to the file system.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        description: { type: 'string', description: 'Project description' },
        code: { type: 'string', description: 'HTML/CSS/JavaScript code' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Project tags' },
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
        projectId: { type: 'string', description: 'Project ID to load' },
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
        projectId: { type: 'string', description: 'Project ID to export' },
        format: { type: 'string', description: 'Export format: html, json', default: 'html' },
      },
      required: ['projectId'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🤖 AGENT / ORCHESTRATION
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'agent_orchestrator',
    description: 'Execute complex multi-step tasks using the agent orchestrator system.',
    parameters: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Description of the task to execute' },
        context: { type: 'object', description: 'Additional context for the task' },
      },
      required: ['task'],
    },
  },
];

/**
 * Get tools for a specific agent type
 * All agents get comprehensive access to tools - the AI will decide which to use contextually
 */
export function getToolsForAgent(agentId) {
  // ═══════════════════════════════════════════════════════════════════
  // CORE TOOLS - Available to ALL agents
  // ═══════════════════════════════════════════════════════════════════
  const coreTools = [
    // Essentials
    'execute_code',
    'web_search',
    'fetch_url',
    'get_current_time',
    'calculate',
    'agent_orchestrator',
    
    // File operations
    'create_file',
    'read_file',
    'modify_file',
    'delete_file',
    'list_files',
    'move_file',
    'copy_file',
    'zip_files',
    'unzip_files',
    
    // Document processing
    'parse_pdf',
    'parse_docx',
    'parse_csv',
    'extract_text',
    
    // Code operations
    'analyze_code',
    'format_code',
  ];

  // ═══════════════════════════════════════════════════════════════════
  // MEDIA TOOLS - Creative and media manipulation
  // ═══════════════════════════════════════════════════════════════════
  const mediaTools = [
    // Image operations
    'generate_image',
    'convert_image',
    'edit_image',
    'resize_image',
    'crop_image',
    'ocr_image',
    
    // Video operations  
    'generate_video',
    'convert_video',
    'trim_video',
    'extract_frames',
    
    // Audio operations
    'transcribe_audio',
    'convert_audio',
  ];

  // ═══════════════════════════════════════════════════════════════════
  // CANVAS TOOLS - For UI/design agents
  // ═══════════════════════════════════════════════════════════════════
  const canvasTools = [
    'canvas_save',
    'canvas_load',
    'canvas_list',
    'canvas_export',
  ];

  // Agent-specific tool assignments
  const agentToolProfiles = {
    // Development agents - get everything except media generation
    'tech-wizard': [...coreTools, ...mediaTools, ...canvasTools],
    'code-generation-agent': [...coreTools, ...mediaTools, ...canvasTools],
    'debug-agent': [...coreTools, 'convert_image', 'ocr_image'],
    'test-agent': [...coreTools],
    'build-agent': [...coreTools],
    'deploy-agent': [...coreTools],
    
    // Creative agents - full media access
    'ui-agent': [...coreTools, ...mediaTools, ...canvasTools],
    'design-agent': [...coreTools, ...mediaTools, ...canvasTools],
    'creative-agent': [...coreTools, ...mediaTools, ...canvasTools],
    
    // Content agents
    'documentation-agent': [...coreTools, 'generate_image', 'ocr_image'],
    'writing-agent': [...coreTools, 'generate_image'],
    'research-agent': [...coreTools, 'ocr_image', 'transcribe_audio'],
    
    // Assistant agents - comprehensive access
    'general-assistant': [...coreTools, ...mediaTools, ...canvasTools],
    'nova': [...coreTools, ...mediaTools, ...canvasTools],
  };

  // Get tools for this agent, or default to full access for unknown agents
  const allowedToolNames = agentToolProfiles[agentId] || [...coreTools, ...mediaTools, ...canvasTools];

  // Deduplicate and filter
  const uniqueTools = [...new Set(allowedToolNames)];
  return AVAILABLE_TOOLS.filter(tool => uniqueTools.includes(tool.name));
}

/**
 * Get all available tools
 */
export function getAllTools() {
  return AVAILABLE_TOOLS;
}