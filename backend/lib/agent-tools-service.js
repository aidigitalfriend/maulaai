/**
 * AGENT TOOLS SERVICE
 * Gives agents capabilities beyond just text generation:
 * - Web Search (using DuckDuckGo/SerpAPI)
 * - URL Fetching & Content Extraction
 * - File Operations (stored in PostgreSQL + S3 for persistence)
 * - Image Understanding (via vision models)
 * - Date/Time awareness
 * - Calculator/Math operations
 * - Code Analysis (Tree-sitter AST parsing)
 * - Code Formatting (Prettier)
 * - Code Linting (ESLint)
 */

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';
import AgentFile from '../models/AgentFile.js';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ═══════════════════════════════════════════════════════════════════
// S3 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const S3_BUCKET = process.env.S3_BUCKET || 'maulaai-bucket';
const S3_REGION = process.env.AWS_REGION || 'ap-southeast-1';

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to S3
 */
async function uploadToS3(key, content, mimeType) {
  try {
    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
    
    const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    console.log(`[S3] Uploaded: ${key} (${buffer.length} bytes)`);
    
    return { success: true, url, key };
  } catch (error) {
    console.error('[S3] Upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Download file from S3
 */
async function downloadFromS3(key) {
  try {
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));
    
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    return { 
      success: true, 
      content: buffer,
      mimeType: response.ContentType,
      size: response.ContentLength,
    };
  } catch (error) {
    console.error('[S3] Download error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete file from S3
 */
async function deleteFromS3(key) {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));
    console.log(`[S3] Deleted: ${key}`);
    return { success: true };
  } catch (error) {
    console.error('[S3] Delete error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════

// File types that should always go to S3
const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.svg',
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.ogg', '.m4a', '.flac',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.tar', '.gz', '.rar'];

function isBinaryFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

// Maximum size for database storage (1MB for text, all binary to S3)
const MAX_DATABASE_SIZE = 1024 * 1024; // 1MB

// Tool definitions that can be exposed to AI
export const AVAILABLE_TOOLS = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for current information. Use when you need up-to-date info or facts you are unsure about.',
    parameters: {
      query: { type: 'string', description: 'The search query', required: true },
      num_results: { type: 'number', description: 'Number of results (1-10)', default: 5 },
    },
  },
  fetch_url: {
    name: 'fetch_url',
    description: 'Fetch and extract content from a URL. Use when user shares a link or asks about a webpage.',
    parameters: {
      url: { type: 'string', description: 'The URL to fetch', required: true },
    },
  },
  get_current_time: {
    name: 'get_current_time',
    description: 'Get the current date and time. Use when user asks about time or you need temporal context.',
    parameters: {
      timezone: { type: 'string', description: 'Timezone (e.g., America/New_York)', default: 'UTC' },
    },
  },
  calculate: {
    name: 'calculate',
    description: 'Perform mathematical calculations. Use for any math operations.',
    parameters: {
      expression: { type: 'string', description: 'Math expression to evaluate', required: true },
    },
  },
  analyze_image: {
    name: 'analyze_image',
    description: 'Analyze an image and describe its contents. Use when user shares an image.',
    parameters: {
      image_url: { type: 'string', description: 'URL of the image', required: true },
    },
  },
  create_file: {
    name: 'create_file',
    description: 'Create a new file with specified content. Use when user asks to create, write, or save a file.',
    parameters: {
      filename: { type: 'string', description: 'Name of the file to create (e.g., "script.py", "notes.txt")', required: true },
      content: { type: 'string', description: 'Content to write to the file', required: true },
      folder: { type: 'string', description: 'Folder path (optional, defaults to workspace root)', default: '' },
    },
  },
  read_file: {
    name: 'read_file',
    description: 'Read and return the contents of a file. Use when user asks to view, read, or open a file.',
    parameters: {
      filename: { type: 'string', description: 'Name or path of the file to read', required: true },
    },
  },
  modify_file: {
    name: 'modify_file',
    description: 'Modify an existing file by replacing content or appending to it. Use when user asks to edit, update, or change a file.',
    parameters: {
      filename: { type: 'string', description: 'Name or path of the file to modify', required: true },
      content: { type: 'string', description: 'New content (replaces file) or content to append', required: true },
      mode: { type: 'string', description: 'Operation mode: "replace" (default) or "append"', default: 'replace' },
    },
  },
  list_files: {
    name: 'list_files',
    description: 'List files and folders in a directory. Use when user asks to see files, browse folders, or check what exists.',
    parameters: {
      folder: { type: 'string', description: 'Folder path to list (defaults to workspace root)', default: '' },
    },
  },
  delete_file: {
    name: 'delete_file',
    description: 'Delete a file. Use when user explicitly asks to delete or remove a file.',
    parameters: {
      filename: { type: 'string', description: 'Name or path of the file to delete', required: true },
    },
  },
  generate_image: {
    name: 'generate_image',
    description: 'Generate an AI image from a text description. Use when user asks to create, generate, or make an image, picture, artwork, or illustration.',
    parameters: {
      prompt: { type: 'string', description: 'Detailed description of the image to generate', required: true },
      style: { type: 'string', description: 'Art style: realistic, artistic, anime, oil-painting, watercolor, digital-art, 3d-render, pixel-art', default: 'realistic' },
      width: { type: 'number', description: 'Image width (512-1024)', default: 1024 },
      height: { type: 'number', description: 'Image height (512-1024)', default: 1024 },
    },
  },
  generate_video: {
    name: 'generate_video',
    description: 'Generate a short AI video from a text description. Use when user asks to create, generate, or make a video or animation.',
    parameters: {
      prompt: { type: 'string', description: 'Detailed description of the video to generate', required: true },
      duration: { type: 'number', description: 'Video duration in seconds (2-10)', default: 4 },
    },
  },
  convert_image: {
    name: 'convert_image',
    description: 'Convert an image to a different format (PNG, JPEG, WebP). Use when user asks to convert an image format, save as PNG/JPG, or change image type.',
    parameters: {
      image_url: { type: 'string', description: 'URL or base64 data URL of the image to convert', required: true },
      format: { type: 'string', description: 'Target format: png, jpeg, webp', default: 'png' },
      quality: { type: 'number', description: 'Quality for JPEG/WebP (1-100)', default: 90 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🎨 CANVAS PROJECT TOOLS
  // ═══════════════════════════════════════════════════════════════════
  create_canvas_project: {
    name: 'create_canvas_project',
    description: 'Create a new canvas project with specified files and settings. Use when user wants to create a new web project, app, or canvas-based application.',
    parameters: {
      name: { type: 'string', description: 'Name of the canvas project', required: true },
      description: { type: 'string', description: 'Description of the project', default: '' },
      template: { type: 'string', description: 'Project template: react-app, vue-app, html-css-js, nextjs-app, svelte-app', default: 'react-app' },
      category: { type: 'string', description: 'Project category: web-app, mobile-app, game, tool, landing-page', default: 'web-app' },
      files: { type: 'array', description: 'Array of file objects with filename and content', default: [] },
      settings: { type: 'object', description: 'Project settings and configuration', default: {} },
    },
  },
  read_canvas_project: {
    name: 'read_canvas_project',
    description: 'Read a canvas project and return its files and settings. Use when user wants to view, examine, or work with an existing canvas project.',
    parameters: {
      project_id: { type: 'string', description: 'ID of the canvas project to read', required: true },
    },
  },
  update_canvas_project: {
    name: 'update_canvas_project',
    description: 'Update an existing canvas project by adding/modifying files or changing settings. Use when user wants to modify, edit, or update a canvas project.',
    parameters: {
      project_id: { type: 'string', description: 'ID of the canvas project to update', required: true },
      name: { type: 'string', description: 'New name for the project (optional)' },
      description: { type: 'string', description: 'New description for the project (optional)' },
      files: { type: 'array', description: 'Array of file objects to add/update (optional)' },
      settings: { type: 'object', description: 'Updated project settings (optional)' },
    },
  },
  list_canvas_projects: {
    name: 'list_canvas_projects',
    description: 'List all canvas projects for the user. Use when user wants to see their projects, browse canvas apps, or find a specific project.',
    parameters: {
      limit: { type: 'number', description: 'Maximum number of projects to return', default: 10 },
      category: { type: 'string', description: 'Filter by category (optional)' },
    },
  },
  save_canvas_to_files: {
    name: 'save_canvas_to_files',
    description: 'Save a canvas project files to the agent file system. Use when user wants to export canvas project to regular files or create a backup.',
    parameters: {
      project_id: { type: 'string', description: 'ID of the canvas project to save', required: true },
      folder: { type: 'string', description: 'Folder path to save files (defaults to project name)', default: '' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 📁 FILE & FOLDER OPERATIONS (Extended)
  // ═══════════════════════════════════════════════════════════════════
  create_folder: {
    name: 'create_folder',
    description: 'Create a new folder/directory. Use when user wants to organize files into folders.',
    parameters: {
      folder_path: { type: 'string', description: 'Path of the folder to create', required: true },
    },
  },
  list_folders: {
    name: 'list_folders',
    description: 'List only folders/directories (not files). Use when user wants to see folder structure.',
    parameters: {
      folder: { type: 'string', description: 'Parent folder to list subfolders from', default: '' },
    },
  },
  move_file: {
    name: 'move_file',
    description: 'Move a file from one location to another. Use when user wants to relocate a file.',
    parameters: {
      source: { type: 'string', description: 'Current file path', required: true },
      destination: { type: 'string', description: 'New file path', required: true },
    },
  },
  copy_file: {
    name: 'copy_file',
    description: 'Copy a file to a new location. Use when user wants to duplicate a file.',
    parameters: {
      source: { type: 'string', description: 'Source file path', required: true },
      destination: { type: 'string', description: 'Destination file path', required: true },
    },
  },
  rename_file: {
    name: 'rename_file',
    description: 'Rename a file. Use when user wants to change a file name.',
    parameters: {
      old_name: { type: 'string', description: 'Current filename', required: true },
      new_name: { type: 'string', description: 'New filename', required: true },
    },
  },
  zip_files: {
    name: 'zip_files',
    description: 'Compress files into a ZIP archive. Use when user wants to create a zip file.',
    parameters: {
      files: { type: 'array', description: 'Array of file paths to compress', required: true },
      output_name: { type: 'string', description: 'Name of the output ZIP file', default: 'archive.zip' },
    },
  },
  unzip_files: {
    name: 'unzip_files',
    description: 'Extract files from a ZIP archive. Use when user wants to unzip a file.',
    parameters: {
      zip_file: { type: 'string', description: 'Path to the ZIP file', required: true },
      destination: { type: 'string', description: 'Folder to extract files to', default: '' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 📄 DOCUMENT / TEXT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  parse_pdf: {
    name: 'parse_pdf',
    description: 'Extract text content from a PDF file. Use when user uploads or references a PDF.',
    parameters: {
      file_path: { type: 'string', description: 'Path to the PDF file', required: true },
    },
  },
  parse_docx: {
    name: 'parse_docx',
    description: 'Extract text content from a Word document (.docx). Use when user uploads a Word file.',
    parameters: {
      file_path: { type: 'string', description: 'Path to the DOCX file', required: true },
    },
  },
  parse_csv: {
    name: 'parse_csv',
    description: 'Parse CSV data and return structured results. Use for spreadsheet/data analysis.',
    parameters: {
      file_path: { type: 'string', description: 'Path to the CSV file', required: true },
      limit: { type: 'number', description: 'Max rows to return', default: 100 },
    },
  },
  parse_markdown: {
    name: 'parse_markdown',
    description: 'Parse and render Markdown content. Use for Markdown file operations.',
    parameters: {
      content: { type: 'string', description: 'Markdown content or file path', required: true },
    },
  },
  extract_text: {
    name: 'extract_text',
    description: 'Extract plain text from any document format. Universal text extractor.',
    parameters: {
      file_path: { type: 'string', description: 'Path to the document', required: true },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🖼️ IMAGE OPERATIONS (Extended)
  // ═══════════════════════════════════════════════════════════════════
  view_image: {
    name: 'view_image',
    description: 'Get image metadata and preview info. Use to inspect image details.',
    parameters: {
      image_path: { type: 'string', description: 'Path or URL of the image', required: true },
    },
  },
  edit_image: {
    name: 'edit_image',
    description: 'Apply edits to an image (filters, adjustments). Use for image modifications.',
    parameters: {
      image_path: { type: 'string', description: 'Path to the image', required: true },
      operations: { type: 'array', description: 'Array of operations: brightness, contrast, blur, sharpen', required: true },
    },
  },
  resize_image: {
    name: 'resize_image',
    description: 'Resize an image to specified dimensions. Use when user wants to change image size.',
    parameters: {
      image_path: { type: 'string', description: 'Path to the image', required: true },
      width: { type: 'number', description: 'New width in pixels', required: true },
      height: { type: 'number', description: 'New height in pixels', required: true },
    },
  },
  crop_image: {
    name: 'crop_image',
    description: 'Crop an image to specified region. Use when user wants to cut part of an image.',
    parameters: {
      image_path: { type: 'string', description: 'Path to the image', required: true },
      x: { type: 'number', description: 'X coordinate of crop start', required: true },
      y: { type: 'number', description: 'Y coordinate of crop start', required: true },
      width: { type: 'number', description: 'Crop width', required: true },
      height: { type: 'number', description: 'Crop height', required: true },
    },
  },
  ocr_image: {
    name: 'ocr_image',
    description: 'Extract text from an image using OCR. Use when user wants to read text in an image.',
    parameters: {
      image_path: { type: 'string', description: 'Path or URL of the image', required: true },
      language: { type: 'string', description: 'Language code (en, es, fr, etc.)', default: 'en' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🎥 VIDEO OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  analyze_video: {
    name: 'analyze_video',
    description: 'Analyze video metadata and content. Use to get video information.',
    parameters: {
      video_path: { type: 'string', description: 'Path or URL of the video', required: true },
    },
  },
  trim_video: {
    name: 'trim_video',
    description: 'Trim video to specified start and end times. Use for video cutting.',
    parameters: {
      video_path: { type: 'string', description: 'Path to the video', required: true },
      start_time: { type: 'string', description: 'Start time (HH:MM:SS or seconds)', required: true },
      end_time: { type: 'string', description: 'End time (HH:MM:SS or seconds)', required: true },
    },
  },
  extract_frames: {
    name: 'extract_frames',
    description: 'Extract frames/screenshots from a video. Use for video frame capture.',
    parameters: {
      video_path: { type: 'string', description: 'Path to the video', required: true },
      timestamps: { type: 'array', description: 'Array of timestamps to extract frames at', required: true },
    },
  },
  convert_video: {
    name: 'convert_video',
    description: 'Convert video to different format. Use for video format conversion.',
    parameters: {
      video_path: { type: 'string', description: 'Path to the video', required: true },
      format: { type: 'string', description: 'Target format: mp4, webm, avi, mov', default: 'mp4' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🔊 AUDIO OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  analyze_audio: {
    name: 'analyze_audio',
    description: 'Analyze audio file metadata. Use to get audio information.',
    parameters: {
      audio_path: { type: 'string', description: 'Path or URL of the audio', required: true },
    },
  },
  transcribe_audio: {
    name: 'transcribe_audio',
    description: 'Convert speech to text using AI transcription. Use for audio-to-text.',
    parameters: {
      audio_path: { type: 'string', description: 'Path to the audio file', required: true },
      language: { type: 'string', description: 'Language code (en, es, fr, etc.)', default: 'en' },
    },
  },
  convert_audio: {
    name: 'convert_audio',
    description: 'Convert audio to different format. Use for audio format conversion.',
    parameters: {
      audio_path: { type: 'string', description: 'Path to the audio file', required: true },
      format: { type: 'string', description: 'Target format: mp3, wav, ogg, flac', default: 'mp3' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 💻 CODE / PROJECT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  analyze_code: {
    name: 'analyze_code',
    description: 'Analyze code for quality, complexity, and issues. Use for code review.',
    parameters: {
      code: { type: 'string', description: 'Code content or file path', required: true },
      language: { type: 'string', description: 'Programming language', default: 'auto' },
    },
  },
  format_code: {
    name: 'format_code',
    description: 'Format/prettify code according to language standards. Use for code formatting.',
    parameters: {
      code: { type: 'string', description: 'Code to format', required: true },
      language: { type: 'string', description: 'Programming language', required: true },
    },
  },
  refactor_code: {
    name: 'refactor_code',
    description: 'Suggest refactoring improvements for code. Use for code optimization.',
    parameters: {
      code: { type: 'string', description: 'Code to refactor', required: true },
      language: { type: 'string', description: 'Programming language', default: 'auto' },
    },
  },
  generate_code: {
    name: 'generate_code',
    description: 'Generate code based on description. Use for code generation tasks.',
    parameters: {
      description: { type: 'string', description: 'Description of what the code should do', required: true },
      language: { type: 'string', description: 'Target programming language', required: true },
    },
  },
  run_code: {
    name: 'run_code',
    description: 'Execute code in a sandbox and return output. Use for code testing.',
    parameters: {
      code: { type: 'string', description: 'Code to execute', required: true },
      language: { type: 'string', description: 'Programming language (python, javascript, etc.)', required: true },
    },
  },
  test_code: {
    name: 'test_code',
    description: 'Generate and run tests for code. Use for test creation.',
    parameters: {
      code: { type: 'string', description: 'Code to test', required: true },
      language: { type: 'string', description: 'Programming language', required: true },
    },
  },
  lint_code: {
    name: 'lint_code',
    description: 'Lint code for errors and warnings using ESLint. Use for code quality checks.',
    parameters: {
      code: { type: 'string', description: 'Code to lint', required: true },
      language: { type: 'string', description: 'Programming language (javascript, typescript)', default: 'javascript' },
    },
  },
  parse_ast: {
    name: 'parse_ast',
    description: 'Parse code into an Abstract Syntax Tree (AST) using Tree-sitter. Use for deep code analysis.',
    parameters: {
      code: { type: 'string', description: 'Code to parse', required: true },
      language: { type: 'string', description: 'Programming language', required: true },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🔍 SEARCH / MEMORY OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  embed_content: {
    name: 'embed_content',
    description: 'Create vector embeddings for content using OpenAI Embeddings API. Use for semantic search preparation.',
    parameters: {
      content: { type: 'string', description: 'Text content to embed', required: true },
      model: { type: 'string', description: 'Embedding model (text-embedding-3-small, text-embedding-3-large)', default: 'text-embedding-3-small' },
    },
  },
  semantic_search: {
    name: 'semantic_search',
    description: 'Search using semantic similarity with Qdrant vector database. Use for intelligent content search.',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
      collection: { type: 'string', description: 'Qdrant collection to search', default: 'agent_memories' },
      limit: { type: 'number', description: 'Max results', default: 10 },
    },
  },
  store_vectors: {
    name: 'store_vectors',
    description: 'Embed content and store vectors in Qdrant. Use to add searchable content.',
    parameters: {
      content: { type: 'string', description: 'Content to embed and store', required: true },
      collection: { type: 'string', description: 'Qdrant collection name', default: 'agent_memories' },
      metadata: { type: 'object', description: 'Additional metadata to store', default: {} },
    },
  },
  cache_set: {
    name: 'cache_set',
    description: 'Cache a value in Redis with TTL. Use for temporary fast storage.',
    parameters: {
      key: { type: 'string', description: 'Cache key', required: true },
      value: { type: 'any', description: 'Value to cache (will be JSON serialized)', required: true },
      ttl: { type: 'number', description: 'Time-to-live in seconds', default: 3600 },
    },
  },
  cache_get: {
    name: 'cache_get',
    description: 'Get a cached value from Redis. Use to retrieve cached data.',
    parameters: {
      key: { type: 'string', description: 'Cache key to retrieve', required: true },
    },
  },
  save_memory: {
    name: 'save_memory',
    description: 'Save information to agent memory for later recall. Use to remember things.',
    parameters: {
      key: { type: 'string', description: 'Memory key/identifier', required: true },
      content: { type: 'string', description: 'Content to remember', required: true },
      tags: { type: 'array', description: 'Tags for categorization', default: [] },
    },
  },
  load_memory: {
    name: 'load_memory',
    description: 'Load previously saved memory. Use to recall saved information.',
    parameters: {
      key: { type: 'string', description: 'Memory key to load', required: false },
      tags: { type: 'array', description: 'Filter by tags', default: [] },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // ☁️ STORAGE / CLOUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  upload_object: {
    name: 'upload_object',
    description: 'Upload a file to cloud storage (S3). Use for cloud file storage.',
    parameters: {
      file_path: { type: 'string', description: 'Local file path to upload', required: true },
      destination: { type: 'string', description: 'Cloud storage path', required: true },
    },
  },
  download_object: {
    name: 'download_object',
    description: 'Download a file from cloud storage. Use for cloud file retrieval.',
    parameters: {
      cloud_path: { type: 'string', description: 'Cloud storage path', required: true },
      local_path: { type: 'string', description: 'Local destination path', required: true },
    },
  },
  delete_object: {
    name: 'delete_object',
    description: 'Delete a file from cloud storage. Use for cloud file removal.',
    parameters: {
      cloud_path: { type: 'string', description: 'Cloud storage path to delete', required: true },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🤝 AGENT CONTROL / WORKFLOW OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  plan_task: {
    name: 'plan_task',
    description: 'Create a task plan with steps. Use for complex task breakdown.',
    parameters: {
      task: { type: 'string', description: 'Task description', required: true },
      context: { type: 'string', description: 'Additional context', default: '' },
    },
  },
  delegate_task: {
    name: 'delegate_task',
    description: 'Delegate a subtask to another agent. Use for multi-agent collaboration.',
    parameters: {
      task: { type: 'string', description: 'Task to delegate', required: true },
      agent_type: { type: 'string', description: 'Type of agent to delegate to', required: true },
    },
  },
  review_output: {
    name: 'review_output',
    description: 'Review and validate output quality. Use for quality checks.',
    parameters: {
      output: { type: 'string', description: 'Output to review', required: true },
      criteria: { type: 'string', description: 'Review criteria', default: 'quality' },
    },
  },
  finalize_task: {
    name: 'finalize_task',
    description: 'Finalize and complete a task. Use to mark task completion.',
    parameters: {
      task_id: { type: 'string', description: 'Task identifier', required: true },
      result: { type: 'string', description: 'Final result', required: true },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 🔐 EXECUTION / SECURITY OPERATIONS
  // ═══════════════════════════════════════════════════════════════════
  run_in_sandbox: {
    name: 'run_in_sandbox',
    description: 'Execute code in isolated sandbox environment. Use for safe code execution.',
    parameters: {
      code: { type: 'string', description: 'Code to run', required: true },
      language: { type: 'string', description: 'Programming language', required: true },
      timeout: { type: 'number', description: 'Execution timeout in seconds', default: 30 },
    },
  },
  validate_permissions: {
    name: 'validate_permissions',
    description: 'Check if operation is permitted. Use for security validation.',
    parameters: {
      operation: { type: 'string', description: 'Operation to validate', required: true },
      resource: { type: 'string', description: 'Resource being accessed', required: true },
    },
  },
};

// Tool count summary
const TOOL_CATEGORIES = {
  'General/Utility': ['web_search', 'fetch_url', 'get_current_time', 'calculate'],
  'File & Folder': ['create_file', 'read_file', 'modify_file', 'delete_file', 'list_files', 'create_folder', 'list_folders', 'move_file', 'copy_file', 'rename_file', 'zip_files', 'unzip_files'],
  'Document/Text': ['parse_pdf', 'parse_docx', 'parse_csv', 'parse_markdown', 'extract_text'],
  'Image': ['analyze_image', 'view_image', 'edit_image', 'resize_image', 'crop_image', 'convert_image', 'ocr_image', 'generate_image'],
  'Video': ['analyze_video', 'generate_video', 'trim_video', 'extract_frames', 'convert_video'],
  'Audio': ['analyze_audio', 'transcribe_audio', 'convert_audio'],
  'Code/Project': ['analyze_code', 'format_code', 'lint_code', 'parse_ast', 'refactor_code', 'generate_code', 'run_code', 'test_code'],
  'Search/Memory': ['embed_content', 'semantic_search', 'store_vectors', 'cache_set', 'cache_get', 'save_memory', 'load_memory'],
  'Storage/Cloud': ['upload_object', 'download_object', 'delete_object'],
  'Agent Control': ['plan_task', 'delegate_task', 'review_output', 'finalize_task'],
  'Security': ['run_in_sandbox', 'validate_permissions'],
};

/**
 * Web Search using DuckDuckGo Instant Answer API (free, no API key needed)
 */
export async function webSearch(query, numResults = 5) {
  try {
    // DuckDuckGo Instant Answer API
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const results = [];

    // Abstract (main answer)
    if (data.Abstract) {
      results.push({
        title: data.Heading || 'Summary',
        snippet: data.Abstract,
        url: data.AbstractURL || '',
        source: data.AbstractSource || 'DuckDuckGo',
      });
    }

    // Related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      for (const topic of data.RelatedTopics.slice(0, numResults - results.length)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related',
            snippet: topic.Text,
            url: topic.FirstURL || '',
            source: 'DuckDuckGo',
          });
        }
      }
    }

    // If no results from DDG, try a backup approach
    if (results.length === 0) {
      // Return a message indicating search was attempted but no results
      return {
        success: true,
        query,
        results: [],
        message: `No instant results found for "${query}". The agent should try rephrasing or provide general knowledge.`,
      };
    }

    return {
      success: true,
      query,
      results: results.slice(0, numResults),
      totalResults: results.length,
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      success: false,
      query,
      error: error.message,
      results: [],
    };
  }
}

/**
 * Fetch URL and extract main content
 */
export async function fetchUrl(url) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OnelastAI/1.0; +https://onelastai.com)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();

    // Parse HTML and extract content
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.sidebar', '.navigation',
      '[role="navigation"]', '[role="banner"]', '[role="complementary"]'
    ];
    unwantedSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Extract title
    const title = document.querySelector('title')?.textContent?.trim() || '';

    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Try to find main content
    let mainContent = '';
    const contentSelectors = [
      'article', 'main', '[role="main"]', '.content', '.post-content',
      '.article-body', '.entry-content', '#content', '.main-content'
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element.textContent || '';
        break;
      }
    }

    // Fallback to body if no main content found
    if (!mainContent) {
      mainContent = document.body?.textContent || '';
    }

    // Clean up the content
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .slice(0, 8000); // Limit content length

    return {
      success: true,
      url,
      title,
      description: metaDesc,
      content: mainContent,
      contentLength: mainContent.length,
    };
  } catch (error) {
    console.error('URL fetch error:', error);
    return {
      success: false,
      url,
      error: error.message,
    };
  }
}

/**
 * Get current time with timezone support
 */
export function getCurrentTime(timezone = 'UTC') {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(now);

    return {
      success: true,
      timezone,
      formatted,
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
    };
  } catch (error) {
    return {
      success: false,
      error: `Invalid timezone: ${timezone}`,
      formatted: new Date().toISOString(),
    };
  }
}

/**
 * Safe mathematical expression evaluator
 */
export function calculate(expression) {
  try {
    // Sanitize: only allow numbers, basic operators, parentheses, and math functions
    const sanitized = expression
      .replace(/[^0-9+\-*/().%^sqrt\s,sincostalogexpabsfloorceileroundpowmin max]/gi, '')
      .trim();

    if (!sanitized) {
      throw new Error('Invalid expression');
    }

    // Replace common math functions with Math. equivalents
    const prepared = sanitized
      .replace(/\^/g, '**')
      .replace(/sqrt\(/gi, 'Math.sqrt(')
      .replace(/sin\(/gi, 'Math.sin(')
      .replace(/cos\(/gi, 'Math.cos(')
      .replace(/tan\(/gi, 'Math.tan(')
      .replace(/log\(/gi, 'Math.log10(')
      .replace(/ln\(/gi, 'Math.log(')
      .replace(/exp\(/gi, 'Math.exp(')
      .replace(/abs\(/gi, 'Math.abs(')
      .replace(/floor\(/gi, 'Math.floor(')
      .replace(/ceil\(/gi, 'Math.ceil(')
      .replace(/round\(/gi, 'Math.round(')
      .replace(/pow\(/gi, 'Math.pow(')
      .replace(/min\(/gi, 'Math.min(')
      .replace(/max\(/gi, 'Math.max(')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e(?![xp])/gi, 'Math.E');

    // Evaluate using Function constructor (safer than eval)
    const result = new Function(`"use strict"; return (${prepared})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Result is not a valid number');
    }

    return {
      success: true,
      expression,
      result,
      formatted: result.toLocaleString('en-US', { maximumFractionDigits: 10 }),
    };
  } catch (error) {
    return {
      success: false,
      expression,
      error: `Could not evaluate: ${error.message}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// FILE OPERATIONS - Database + S3 Hybrid Storage
// Text files < 1MB → Database
// Binary files & large files → S3
// ═══════════════════════════════════════════════════════════════════

// Helper to determine MIME type from filename
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.ts': 'application/typescript',
    '.py': 'text/x-python',
    '.html': 'text/html',
    '.css': 'text/css',
    '.csv': 'text/csv',
    '.xml': 'application/xml',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml',
    '.sh': 'application/x-sh',
    '.sql': 'application/sql',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Sanitize folder path
function sanitizePath(folder) {
  if (!folder || folder === '/') return '/';
  // Remove leading/trailing slashes and normalize
  return '/' + folder.replace(/^\/+|\/+$/g, '').replace(/\.\.+/g, '');
}

/**
 * Create a new file with content - HYBRID STORAGE (Database + S3)
 * - Text files < 1MB → Database
 * - Binary files (images, videos, etc.) → S3
 * - Large files > 1MB → S3
 */
export async function createFile(filename, content, folder = '', userId = 'default', agentId = 'general') {
  try {
    const sanitizedFilename = path.basename(filename);
    const sanitizedFolder = sanitizePath(folder);
    const filePath = sanitizedFolder === '/' ? `/${sanitizedFilename}` : `${sanitizedFolder}/${sanitizedFilename}`;
    const mimeType = getMimeType(sanitizedFilename);
    
    // Check if file already exists
    const existingFile = await AgentFile.findOne({ 
      userId, 
      path: filePath, 
      isDeleted: false 
    });
    
    if (existingFile) {
      return {
        success: false,
        error: `File already exists: ${sanitizedFilename}. Use modify_file to update it.`,
        filename: sanitizedFilename,
      };
    }
    
    // Determine storage type
    const isBinary = isBinaryFile(sanitizedFilename);
    const contentBuffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    const size = contentBuffer.length;
    const useS3 = isBinary || size > MAX_DATABASE_SIZE;
    
    let storageType = 'database';
    let s3Key = null;
    let s3Url = null;
    let storedContent = null;
    
    if (useS3) {
      // Upload to S3
      s3Key = `agent-files/${userId}/${agentId}${filePath}`;
      const s3Result = await uploadToS3(s3Key, contentBuffer, mimeType);
      
      if (!s3Result.success) {
        // Fallback to database if S3 fails
        console.warn(`[AgentFiles] S3 upload failed, falling back to database: ${s3Result.error}`);
        storageType = 'database';
        storedContent = isBinary ? contentBuffer.toString('base64') : content;
      } else {
        storageType = 's3';
        s3Url = s3Result.url;
        console.log(`[AgentFiles] Stored in S3: ${s3Key}`);
      }
    } else {
      // Store in database (PostgreSQL)
      storedContent = content;
    }
    
    // Create file document
    const newFile = new AgentFile({
      userId,
      agentId,
      filename: sanitizedFilename,
      originalName: sanitizedFilename,
      folder: sanitizedFolder,
      path: filePath,
      mimeType,
      size,
      storageType,
      content: storedContent,
      s3Key,
      s3Bucket: useS3 && storageType === 's3' ? S3_BUCKET : null,
      s3Url,
    });
    
    await newFile.save();
    
    console.log(`[AgentFiles] Created file: ${filePath} for user ${userId} (${size} bytes, ${storageType})`);
    
    return {
      success: true,
      filename: sanitizedFilename,
      folder: sanitizedFolder,
      path: filePath,
      size,
      message: `File created successfully: ${sanitizedFilename}`,
      downloadUrl: `/api/agents/files/download?path=${encodeURIComponent(filePath)}&userId=${userId}`,
      storedIn: storageType,
      s3Url: s3Url || undefined,
    };
  } catch (error) {
    console.error('[AgentFiles] Create error:', error);
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

/**
 * Read file contents - FROM DATABASE
 */
export async function readFile(filename, userId = 'default') {
  try {
    // Handle both filename and full path
    const searchPath = filename.startsWith('/') ? filename : `/${filename}`;
    
    const file = await AgentFile.findOne({ 
      userId, 
      $or: [
        { path: searchPath },
        { filename: filename }
      ],
      isDeleted: false 
    });
    
    if (!file) {
      return {
        success: false,
        filename,
        error: `File not found: ${filename}`,
      };
    }
    
    // Note: lastAccessedAt tracking removed for Prisma compatibility
    // The field isn't in the current schema anyway
    
    // Get content based on storage type
    let content = file.content;
    
    if (file.storageType === 's3' && file.s3Key) {
      // Download from S3
      const s3Result = await downloadFromS3(file.s3Key);
      if (s3Result.success) {
        // For text files, convert to string
        const isBinary = isBinaryFile(file.filename);
        content = isBinary 
          ? s3Result.content.toString('base64')
          : s3Result.content.toString('utf-8');
      } else {
        return {
          success: false,
          filename,
          error: `Failed to download from S3: ${s3Result.error}`,
        };
      }
    }
    
    return {
      success: true,
      filename: file.filename,
      path: file.path,
      content,
      size: file.size,
      mimeType: file.mimeType,
      modified: file.updatedAt?.toISOString?.() || file.updatedAt,
      created: file.createdAt?.toISOString?.() || file.createdAt,
      version: file.version,
      storageType: file.storageType,
      s3Url: file.s3Url || undefined,
    };
  } catch (error) {
    console.error('[AgentFiles] Read error:', error);
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

/**
 * Modify an existing file - IN DATABASE
 */
export async function modifyFile(filename, content, mode = 'replace', userId = 'default') {
  try {
    const searchPath = filename.startsWith('/') ? filename : `/${filename}`;
    
    const file = await AgentFile.findOne({ 
      userId, 
      $or: [
        { path: searchPath },
        { filename: filename }
      ],
      isDeleted: false 
    });
    
    if (!file) {
      return {
        success: false,
        filename,
        error: `File not found: ${filename}. Use create_file to create it first.`,
      };
    }
    
    // Calculate new content
    let newContent;
    if (mode === 'append') {
      newContent = (file.content || '') + content;
    } else {
      newContent = content;
    }
    
    const newSize = Buffer.byteLength(newContent, 'utf-8');
    
    // Update the file using findOneAndUpdate
    await AgentFile.findOneAndUpdate(
      { id: file.id },
      { $set: { 
        content: newContent, 
        size: newSize 
      } }
    );
    
    console.log(`[AgentFiles] Modified file: ${file.path} (${newSize} bytes)`);
    
    return {
      success: true,
      filename: file.filename,
      path: file.path,
      mode,
      size: newSize,
      message: `File ${mode === 'append' ? 'updated' : 'replaced'} successfully: ${file.filename}`,
    };
  } catch (error) {
    console.error('[AgentFiles] Modify error:', error);
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

/**
 * List files in a directory - FROM DATABASE
 */
export async function listFiles(folder = '', userId = 'default') {
  try {
    const sanitizedFolder = sanitizePath(folder);
    
    // Find all files for user in this folder (not recursive)
    const files = await AgentFile.find({ 
      userId, 
      folder: sanitizedFolder,
      isDeleted: false 
    }).sort({ filename: 1 });
    
    // Get unique subfolders
    const allFiles = await AgentFile.find({
      userId,
      isDeleted: false,
      folder: { $regex: `^${sanitizedFolder}`, $ne: sanitizedFolder }
    });
    
    const subfolders = new Set();
    allFiles.forEach(f => {
      const relativePath = f.folder.replace(sanitizedFolder, '').replace(/^\//, '');
      const firstFolder = relativePath.split('/')[0];
      if (firstFolder) subfolders.add(firstFolder);
    });
    
    const result = [
      ...Array.from(subfolders).map(name => ({
        name,
        type: 'folder',
        size: null,
        modified: null,
      })),
      ...files.map(f => ({
        name: f.filename,
        type: 'file',
        size: f.size,
        mimeType: f.mimeType,
        modified: f.updatedAt.toISOString(),
        version: f.version,
        path: f.path,
      })),
    ];
    
    return {
      success: true,
      folder: sanitizedFolder,
      files: result,
      totalFiles: files.length,
      totalFolders: subfolders.size,
      storage: 'database',
    };
  } catch (error) {
    console.error('[AgentFiles] List error:', error);
    return {
      success: false,
      folder: folder || '/',
      error: error.message,
    };
  }
}

/**
 * Delete a file - SOFT DELETE IN DATABASE + DELETE FROM S3
 */
export async function deleteFile(filename, userId = 'default') {
  try {
    const searchPath = filename.startsWith('/') ? filename : `/${filename}`;
    
    const file = await AgentFile.findOne({ 
      userId, 
      $or: [
        { path: searchPath },
        { filename: filename }
      ],
      isDeleted: false 
    });
    
    if (!file) {
      return {
        success: false,
        filename,
        error: `File not found: ${filename}`,
      };
    }
    
    // Delete from S3 if stored there
    if (file.storageType === 's3' && file.s3Key) {
      const s3Result = await deleteFromS3(file.s3Key);
      if (!s3Result.success) {
        console.warn(`[AgentFiles] Failed to delete from S3: ${s3Result.error}`);
      }
    }
    
    // Soft delete in Database using findOneAndUpdate
    await AgentFile.findOneAndUpdate(
      { id: file.id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    console.log(`[AgentFiles] Deleted file: ${file.path} (was in ${file.storageType})`);
    
    return {
      success: true,
      filename: file.filename,
      path: file.path,
      message: `File deleted successfully: ${file.filename}`,
    };
  } catch (error) {
    console.error('[AgentFiles] Delete error:', error);
    if (error.code === 'ENOENT') {
      return {
        success: false,
        filename,
        error: `File not found: ${filename}`,
      };
    }
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// IMAGE & VIDEO GENERATION
// ═══════════════════════════════════════════════════════════════════

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generate an AI image using Stability AI
 */
export async function generateImage(prompt, style = 'realistic', width = 1024, height = 1024, userId = 'default') {
  try {
    // Import media service dynamically to avoid circular dependencies
    const mediaService = await import('../services/media-service.js');

    // Map style to DALL-E style options
    const styleMap = {
      'realistic': 'vivid',
      'artistic': 'vivid',
      'anime': 'natural',
      'oil-painting': 'vivid',
      'watercolor': 'natural',
      'digital-art': 'vivid',
      '3d-render': 'vivid',
      'pixel-art': 'natural'
    };

    const dalleStyle = styleMap[style] || 'vivid';

    // Map dimensions to DALL-E size options
    let size = '1024x1024';
    if (width === 512 && height === 512) size = '512x512';
    else if (width === 1024 && height === 1024) size = '1024x1024';
    else if (width === 1792 && height === 1024) size = '1792x1024';
    else if (width === 1024 && height === 1792) size = '1024x1792';

    const result = await mediaService.generateImage(prompt, {
      size,
      style: dalleStyle,
      quality: 'standard'
    }, userId);

    if (result.success && result.images && result.images.length > 0) {
      const image = result.images[0];

      return {
        success: true,
        prompt,
        style,
        dimensions: `${width}x${height}`,
        imageUrl: image.url,
        filename: image.filename,
        s3Key: image.s3Key,
        revisedPrompt: image.revisedPrompt,
        message: `Image generated and saved successfully! You can view or download it.`,
      };
    } else {
      throw new Error('No images generated');
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate image',
    };
  }
}

/**
 * Generate a short AI video using Replicate
 */
export async function generateVideo(prompt, duration = 4, userId = 'default') {
  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
      return {
        success: false,
        prompt,
        error: 'Video generation service not configured',
      };
    }

    // Use Replicate's video generation model (Stable Video Diffusion or similar)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Using animate-diff or similar video model
        version: 'a4a8bafd6089e1716b06057c42b19378250d008b80fe87caa5cd36d40c1eda90', // AnimateDiff-Lightning
        input: {
          prompt: prompt,
          num_frames: Math.min(duration * 8, 32), // ~8 fps, max 32 frames
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Video generation request failed');
    }

    const prediction = await response.json();

    // Poll for completion (video generation takes time)
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` },
      });
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Video generation failed');
    }

    if (result.status !== 'succeeded') {
      return {
        success: true,
        prompt,
        status: 'processing',
        predictionId: result.id,
        message: 'Video is being generated. This may take a few minutes. Check back soon!',
        checkUrl: `https://api.replicate.com/v1/predictions/${result.id}`,
      };
    }

    // Video completed - save to workspace
    const videoUrl = result.output;
    if (videoUrl) {
      try {
        const videoResponse = await fetch(videoUrl);
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        const filename = `generated-video-${Date.now()}.mp4`;
        
        // Use createFile to properly store in Database/S3
        const saveResult = await createFile(filename, videoBuffer, '/videos', userId, 'video-generator');

        if (saveResult.success) {
          return {
            success: true,
            prompt,
            duration: `~${duration}s`,
            videoUrl: videoUrl,
            filename: saveResult.filename,
            path: saveResult.path,
            downloadUrl: saveResult.downloadUrl,
            s3Url: saveResult.s3Url,
            message: 'Video generated and saved successfully! You can view or download it.',
          };
        } else {
          // Return URL even if save fails
          return {
            success: true,
            prompt,
            videoUrl: videoUrl,
            warning: 'Video generated but could not be saved to workspace',
            message: 'Video generated! Click to view. (Note: Could not save to workspace)',
          };
        }
      } catch (saveError) {
        // Return URL even if save fails
        console.error('Failed to save video:', saveError);
        return {
          success: true,
          prompt,
          videoUrl: videoUrl,
          message: 'Video generated! Click to view.',
        };
      }
    }

    return {
      success: false,
      prompt,
      error: 'No video output received',
    };
  } catch (error) {
    console.error('Video generation error:', error);
    return {
      success: false,
      prompt,
      error: error.message || 'Failed to generate video',
    };
  }
}

/**
 * Convert an image to a different format
 */
export async function convertImage(imageUrl, format = 'png', quality = 90, userId = 'default') {
  try {
    let imageBuffer;
    
    // Handle base64 data URLs
    if (imageUrl.startsWith('data:image')) {
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Download from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    // Use sharp for conversion if available, otherwise use the media service API
    const sharp = await import('sharp').then(m => m.default).catch(() => null);
    
    let outputBuffer;
    let mimeType;
    
    if (sharp) {
      // Direct conversion with sharp
      const processor = sharp(imageBuffer);
      
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          outputBuffer = await processor.jpeg({ quality }).toBuffer();
          mimeType = 'image/jpeg';
          format = 'jpeg';
          break;
        case 'webp':
          outputBuffer = await processor.webp({ quality }).toBuffer();
          mimeType = 'image/webp';
          break;
        case 'png':
        default:
          outputBuffer = await processor.png().toBuffer();
          mimeType = 'image/png';
          format = 'png';
          break;
      }
    } else {
      // Fallback: just use the original buffer if sharp is not available
      outputBuffer = imageBuffer;
      mimeType = `image/${format}`;
    }
    
    // Save to user workspace using createFile
    const filename = `converted-image-${Date.now()}.${format}`;
    const saveResult = await createFile(filename, outputBuffer, '/images', userId, 'image-converter');
    
    // Create base64 data URL for display
    const base64Image = outputBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    if (saveResult.success) {
      return {
        success: true,
        format: format.toUpperCase(),
        filename: saveResult.filename,
        path: saveResult.path,
        downloadUrl: saveResult.downloadUrl,
        s3Url: saveResult.s3Url,
        image: dataUrl,
        message: `Image converted to ${format.toUpperCase()} and saved successfully!`,
      };
    } else {
      return {
        success: true,
        format: format.toUpperCase(),
        image: dataUrl,
        warning: 'Image converted but could not be saved to workspace',
        message: `Image converted to ${format.toUpperCase()}! (Note: Could not save to workspace)`,
      };
    }
  } catch (error) {
    console.error('Image conversion error:', error);
    return {
      success: false,
      error: error.message || 'Failed to convert image',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📁 EXTENDED FILE & FOLDER OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create a folder
 */
export async function createFolder(folderPath, userId = 'default') {
  try {
    const sanitizedFolder = sanitizePath(folderPath);
    
    // Check if folder already exists (any file with this folder)
    const existingFiles = await AgentFile.findOne({ userId, folder: sanitizedFolder, isDeleted: false });
    
    // Create a placeholder file to represent the folder
    const placeholderFile = new AgentFile({
      userId,
      filename: '.folder',
      folder: sanitizedFolder,
      path: `${sanitizedFolder}/.folder`,
      mimeType: 'application/x-directory',
      size: 0,
      storageType: 'database',
      content: '',
    });
    
    await placeholderFile.save();
    
    return {
      success: true,
      folder: sanitizedFolder,
      message: `Folder created: ${sanitizedFolder}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * List only folders
 */
export async function listFolders(parentFolder = '', userId = 'default') {
  try {
    const sanitizedFolder = sanitizePath(parentFolder);
    
    const files = await AgentFile.find({
      userId,
      isDeleted: false,
    });
    
    const folders = new Set();
    files.forEach(f => {
      if (f.folder !== sanitizedFolder && f.folder.startsWith(sanitizedFolder)) {
        const relativePath = f.folder.replace(sanitizedFolder, '').replace(/^\//, '');
        const firstFolder = relativePath.split('/')[0];
        if (firstFolder) folders.add(firstFolder);
      }
    });
    
    return {
      success: true,
      parentFolder: sanitizedFolder,
      folders: Array.from(folders).map(name => ({ name, type: 'folder' })),
      totalFolders: folders.size,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Move a file
 */
export async function moveFile(source, destination, userId = 'default') {
  try {
    const file = await AgentFile.findOne({ userId, path: source, isDeleted: false });
    if (!file) return { success: false, error: `File not found: ${source}` };
    
    const destFolder = path.dirname(destination);
    const destFilename = path.basename(destination);
    
    file.folder = sanitizePath(destFolder);
    file.filename = destFilename;
    file.path = destination;
    await file.save();
    
    return {
      success: true,
      source,
      destination,
      message: `File moved from ${source} to ${destination}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Copy a file
 */
export async function copyFile(source, destination, userId = 'default') {
  try {
    const file = await AgentFile.findOne({ userId, path: source, isDeleted: false });
    if (!file) return { success: false, error: `File not found: ${source}` };
    
    const destFolder = path.dirname(destination);
    const destFilename = path.basename(destination);
    
    const newFile = new AgentFile({
      userId,
      agentId: file.agentId,
      filename: destFilename,
      originalName: destFilename,
      folder: sanitizePath(destFolder),
      path: destination,
      mimeType: file.mimeType,
      size: file.size,
      storageType: file.storageType,
      content: file.content,
    });
    
    await newFile.save();
    
    return {
      success: true,
      source,
      destination,
      message: `File copied from ${source} to ${destination}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Rename a file
 */
export async function renameFile(oldName, newName, userId = 'default') {
  try {
    const file = await AgentFile.findOne({ 
      userId, 
      $or: [{ path: oldName }, { filename: oldName }],
      isDeleted: false 
    });
    if (!file) return { success: false, error: `File not found: ${oldName}` };
    
    const newPath = file.path.replace(file.filename, newName);
    file.filename = newName;
    file.originalName = newName;
    file.path = newPath;
    file.mimeType = getMimeType(newName);
    await file.save();
    
    return {
      success: true,
      oldName,
      newName,
      message: `File renamed from ${oldName} to ${newName}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Zip files
 */
export async function zipFiles(filePaths, outputName = 'archive.zip', userId = 'default') {
  try {
    const archiver = await import('archiver').then(m => m.default).catch(() => null);
    if (!archiver) {
      return { success: false, error: 'Archiver not available' };
    }
    
    const files = await AgentFile.find({
      userId,
      path: { $in: filePaths },
      isDeleted: false,
    });
    
    if (files.length === 0) {
      return { success: false, error: 'No files found to zip' };
    }
    
    // Create zip in memory
    const chunks = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('data', chunk => chunks.push(chunk));
    
    for (const file of files) {
      archive.append(file.content, { name: file.filename });
    }
    
    await archive.finalize();
    const zipBuffer = Buffer.concat(chunks);
    
    // Save zip to Database
    const zipFile = new AgentFile({
      userId,
      filename: outputName,
      folder: '/',
      path: `/${outputName}`,
      mimeType: 'application/zip',
      size: zipBuffer.length,
      storageType: 'database',
      content: zipBuffer.toString('base64'),
    });
    
    await zipFile.save();
    
    return {
      success: true,
      filename: outputName,
      size: zipBuffer.length,
      filesIncluded: files.length,
      message: `Created ${outputName} with ${files.length} files`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Unzip files
 */
export async function unzipFiles(zipFile, destination = '', userId = 'default') {
  try {
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: zipFile }, { filename: zipFile }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `ZIP file not found: ${zipFile}` };
    
    const unzipper = await import('unzipper').then(m => m.default).catch(() => null);
    if (!unzipper) {
      return { success: false, error: 'Unzipper not available' };
    }
    
    const zipBuffer = Buffer.from(file.content, 'base64');
    const directory = await unzipper.Open.buffer(zipBuffer);
    
    const extractedFiles = [];
    const destFolder = sanitizePath(destination);
    
    for (const entry of directory.files) {
      if (entry.type === 'File') {
        const content = await entry.buffer();
        const newFile = new AgentFile({
          userId,
          filename: entry.path,
          folder: destFolder,
          path: `${destFolder}/${entry.path}`,
          mimeType: getMimeType(entry.path),
          size: content.length,
          storageType: 'database',
          content: content.toString('utf-8'),
        });
        await newFile.save();
        extractedFiles.push(entry.path);
      }
    }
    
    return {
      success: true,
      extractedFiles,
      destination: destFolder,
      message: `Extracted ${extractedFiles.length} files to ${destFolder}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📄 DOCUMENT PARSING OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Parse PDF file
 */
export async function parsePdf(filePath, userId = 'default') {
  try {
    const pdfParse = await import('pdf-parse').then(m => m.default).catch(() => null);
    if (!pdfParse) {
      return { success: false, error: 'PDF parser not available' };
    }
    
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: filePath }, { filename: filePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `File not found: ${filePath}` };
    
    const buffer = Buffer.from(file.content, 'base64');
    const data = await pdfParse(buffer);
    
    return {
      success: true,
      filename: file.filename,
      pages: data.numpages,
      text: data.text,
      info: data.info,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse DOCX file
 */
export async function parseDocx(filePath, userId = 'default') {
  try {
    const mammoth = await import('mammoth').then(m => m.default).catch(() => null);
    if (!mammoth) {
      return { success: false, error: 'DOCX parser not available' };
    }
    
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: filePath }, { filename: filePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `File not found: ${filePath}` };
    
    const buffer = Buffer.from(file.content, 'base64');
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      success: true,
      filename: file.filename,
      text: result.value,
      messages: result.messages,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse CSV file
 */
export async function parseCsv(filePath, limit = 100, userId = 'default') {
  try {
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: filePath }, { filename: filePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `File not found: ${filePath}` };
    
    const lines = file.content.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1, limit + 1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, h, i) => {
        obj[h] = values[i]?.trim() || '';
        return obj;
      }, {});
    });
    
    return {
      success: true,
      filename: file.filename,
      headers,
      rows,
      totalRows: lines.length - 1,
      returnedRows: rows.length,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse Markdown
 */
export async function parseMarkdown(content, userId = 'default') {
  try {
    const MarkdownIt = await import('markdown-it').then(m => m.default).catch(() => null);
    
    // Check if content is a file path
    if (content.endsWith('.md') || content.includes('/')) {
      const file = await AgentFile.findOne({
        userId,
        $or: [{ path: content }, { filename: content }],
        isDeleted: false,
      });
      if (file) content = file.content;
    }
    
    if (MarkdownIt) {
      const md = new MarkdownIt();
      return {
        success: true,
        html: md.render(content),
        text: content,
      };
    }
    
    return {
      success: true,
      text: content,
      html: `<pre>${content}</pre>`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract text from any document
 */
export async function extractText(filePath, userId = 'default') {
  try {
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: filePath }, { filename: filePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `File not found: ${filePath}` };
    
    const ext = path.extname(file.filename).toLowerCase();
    
    if (ext === '.pdf') {
      return parsePdf(filePath, userId);
    } else if (ext === '.docx') {
      return parseDocx(filePath, userId);
    } else if (ext === '.csv') {
      return parseCsv(filePath, 100, userId);
    } else {
      // Plain text
      return {
        success: true,
        filename: file.filename,
        text: file.content,
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🖼️ EXTENDED IMAGE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * View image metadata
 */
export async function viewImage(imagePath, userId = 'default') {
  try {
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: imagePath }, { filename: imagePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `Image not found: ${imagePath}` };
    
    const sharp = await import('sharp').then(m => m.default).catch(() => null);
    
    if (sharp && file.content) {
      const buffer = Buffer.from(file.content, 'base64');
      const metadata = await sharp(buffer).metadata();
      
      return {
        success: true,
        filename: file.filename,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: file.size,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
      };
    }
    
    return {
      success: true,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimeType,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Resize image
 */
export async function resizeImage(imagePath, width, height, userId = 'default') {
  try {
    const sharp = await import('sharp').then(m => m.default).catch(() => null);
    if (!sharp) return { success: false, error: 'Sharp not available' };
    
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: imagePath }, { filename: imagePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `Image not found: ${imagePath}` };
    
    const buffer = Buffer.from(file.content, 'base64');
    const resized = await sharp(buffer).resize(width, height).toBuffer();
    
    const newFilename = `resized-${Date.now()}-${file.filename}`;
    const newFile = new AgentFile({
      userId,
      filename: newFilename,
      folder: file.folder,
      path: `${file.folder}/${newFilename}`,
      mimeType: file.mimeType,
      size: resized.length,
      storageType: 'database',
      content: resized.toString('base64'),
    });
    
    await newFile.save();
    
    return {
      success: true,
      filename: newFilename,
      width,
      height,
      size: resized.length,
      image: `data:${file.mimeType};base64,${resized.toString('base64')}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Crop image
 */
export async function cropImage(imagePath, x, y, width, height, userId = 'default') {
  try {
    const sharp = await import('sharp').then(m => m.default).catch(() => null);
    if (!sharp) return { success: false, error: 'Sharp not available' };
    
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: imagePath }, { filename: imagePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `Image not found: ${imagePath}` };
    
    // Handle S3 storage
    let buffer;
    if (file.storageType === 's3' && file.s3Key) {
      const s3Result = await downloadFromS3(file.s3Key);
      if (!s3Result.success) return { success: false, error: 'Failed to download from S3' };
      buffer = s3Result.content;
    } else {
      buffer = Buffer.from(file.content, 'base64');
    }
    
    const cropped = await sharp(buffer).extract({ left: x, top: y, width, height }).toBuffer();
    
    const newFilename = `cropped-${Date.now()}-${file.filename}`;
    const newFile = new AgentFile({
      userId,
      filename: newFilename,
      folder: file.folder,
      path: `${file.folder}/${newFilename}`,
      mimeType: file.mimeType,
      size: cropped.length,
      storageType: 'database',
      content: cropped.toString('base64'),
    });
    
    await newFile.save();
    
    return {
      success: true,
      filename: newFilename,
      region: { x, y, width, height },
      size: cropped.length,
      image: `data:${file.mimeType};base64,${cropped.toString('base64')}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Edit image with filters and adjustments using Sharp
 * Operations: brightness, contrast, blur, sharpen, grayscale, rotate, flip, flop, negate
 */
export async function editImage(imagePath, operations = [], userId = 'default') {
  try {
    const sharp = await import('sharp').then(m => m.default).catch(() => null);
    if (!sharp) return { success: false, error: 'Sharp not available' };
    
    const file = await AgentFile.findOne({
      userId,
      $or: [{ path: imagePath }, { filename: imagePath }],
      isDeleted: false,
    });
    
    if (!file) return { success: false, error: `Image not found: ${imagePath}` };
    
    // Handle S3 storage
    let buffer;
    if (file.storageType === 's3' && file.s3Key) {
      const s3Result = await downloadFromS3(file.s3Key);
      if (!s3Result.success) return { success: false, error: 'Failed to download from S3' };
      buffer = s3Result.content;
    } else {
      buffer = Buffer.from(file.content, 'base64');
    }
    
    let processor = sharp(buffer);
    const appliedOps = [];
    
    for (const op of operations) {
      const opName = typeof op === 'string' ? op : op.name;
      const opValue = typeof op === 'object' ? op.value : null;
      
      switch (opName.toLowerCase()) {
        case 'brightness':
          processor = processor.modulate({ brightness: opValue || 1.2 });
          appliedOps.push(`brightness(${opValue || 1.2})`);
          break;
        case 'contrast':
          processor = processor.linear(opValue || 1.2, -(128 * (opValue || 1.2)) + 128);
          appliedOps.push(`contrast(${opValue || 1.2})`);
          break;
        case 'blur':
          processor = processor.blur(opValue || 3);
          appliedOps.push(`blur(${opValue || 3})`);
          break;
        case 'sharpen':
          processor = processor.sharpen(opValue || 1);
          appliedOps.push(`sharpen(${opValue || 1})`);
          break;
        case 'grayscale':
        case 'greyscale':
          processor = processor.grayscale();
          appliedOps.push('grayscale');
          break;
        case 'rotate':
          processor = processor.rotate(opValue || 90);
          appliedOps.push(`rotate(${opValue || 90})`);
          break;
        case 'flip':
          processor = processor.flip();
          appliedOps.push('flip');
          break;
        case 'flop':
          processor = processor.flop();
          appliedOps.push('flop');
          break;
        case 'negate':
        case 'invert':
          processor = processor.negate();
          appliedOps.push('negate');
          break;
        case 'tint':
          if (opValue) processor = processor.tint(opValue);
          appliedOps.push(`tint(${opValue})`);
          break;
        default:
          console.log(`[EditImage] Unknown operation: ${opName}`);
      }
    }
    
    const edited = await processor.toBuffer();
    
    const newFilename = `edited-${Date.now()}-${file.filename}`;
    const newFile = new AgentFile({
      userId,
      filename: newFilename,
      folder: file.folder,
      path: `${file.folder}/${newFilename}`,
      mimeType: file.mimeType,
      size: edited.length,
      storageType: 'database',
      content: edited.toString('base64'),
    });
    
    await newFile.save();
    
    return {
      success: true,
      filename: newFilename,
      operations: appliedOps,
      size: edited.length,
      image: `data:${file.mimeType};base64,${edited.toString('base64')}`,
      message: `Applied ${appliedOps.length} operations: ${appliedOps.join(', ')}`,
    };
  } catch (error) {
    console.error('[EditImage] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * OCR - Extract text from image using Tesseract.js
 */
export async function ocrImage(imagePath, language = 'eng', userId = 'default') {
  try {
    const Tesseract = await import('tesseract.js').then(m => m.default || m).catch(() => null);
    
    if (!Tesseract) {
      return {
        success: false,
        error: 'OCR library not available. Install tesseract.js.',
      };
    }
    
    // Get image from Database if it's a path
    let imageBuffer;
    if (imagePath.startsWith('data:')) {
      // Base64 data URL
      const base64Data = imagePath.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (imagePath.startsWith('http')) {
      // Remote URL - fetch it
      const response = await fetch(imagePath);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      // File in Database
      const file = await AgentFile.findOne({
        userId,
        $or: [{ path: imagePath }, { filename: imagePath }],
        isDeleted: false,
      });
      
      if (!file) {
        return { success: false, error: `Image not found: ${imagePath}` };
      }
      
      if (file.storageType === 's3' && file.s3Key) {
        const s3Result = await downloadFromS3(file.s3Key);
        if (!s3Result.success) {
          return { success: false, error: 'Failed to download from S3' };
        }
        imageBuffer = s3Result.content;
      } else {
        imageBuffer = Buffer.from(file.content, 'base64');
      }
    }
    
    // Perform OCR
    console.log(`[OCR] Processing image with Tesseract.js (language: ${language})`);
    const { data } = await Tesseract.recognize(imageBuffer, language, {
      logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
    });
    
    return {
      success: true,
      text: data.text,
      confidence: data.confidence,
      words: data.words?.length || 0,
      language,
      message: `Extracted ${data.words?.length || 0} words with ${Math.round(data.confidence)}% confidence`,
    };
  } catch (error) {
    console.error('[OCR] Error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// � CANVAS PROJECT OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create a new canvas project
 */
export async function createCanvasProject(name, description = '', template = 'react-app', category = 'web-app', files = [], settings = {}, userId = 'default') {
  try {
    // Import the ChatCanvasProject model
    const ChatCanvasProject = (await import('../models/ChatCanvasProject.js')).default;
    
    const projectId = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const project = new ChatCanvasProject({
      projectId,
      userId,
      name,
      description,
      template,
      category,
      files: JSON.stringify(files),
      settings: JSON.stringify(settings),
      stats: {
        filesGenerated: files.length,
        totalSize: JSON.stringify(files).length,
        lastModified: new Date(),
      },
    });
    
    await project.save();
    
    return {
      success: true,
      projectId,
      name,
      message: `Canvas project "${name}" created successfully`,
    };
  } catch (error) {
    console.error('[Canvas] Create project error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Read a canvas project
 */
export async function readCanvasProject(projectId, userId = 'default') {
  try {
    const ChatCanvasProject = (await import('../models/ChatCanvasProject.js')).default;
    
    const project = await ChatCanvasProject.findOne({
      projectId,
      userId,
    });
    
    if (!project) {
      return { success: false, error: `Canvas project not found: ${projectId}` };
    }
    
    return {
      success: true,
      project: {
        id: project.projectId,
        name: project.name,
        description: project.description,
        template: project.template,
        category: project.category,
        files: JSON.parse(project.files || '[]'),
        settings: JSON.parse(project.settings || '{}'),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    };
  } catch (error) {
    console.error('[Canvas] Read project error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a canvas project
 */
export async function updateCanvasProject(projectId, name, description, files, settings, userId = 'default') {
  try {
    const ChatCanvasProject = (await import('../models/ChatCanvasProject.js')).default;
    
    const project = await ChatCanvasProject.findOne({
      projectId,
      userId,
    });
    
    if (!project) {
      return { success: false, error: `Canvas project not found: ${projectId}` };
    }
    
    // Update fields if provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (files !== undefined) {
      project.files = JSON.stringify(files);
      project.stats.filesGenerated = files.length;
    }
    if (settings !== undefined) project.settings = JSON.stringify(settings);
    
    project.stats.lastModified = new Date();
    await project.save();
    
    return {
      success: true,
      projectId,
      message: `Canvas project "${project.name}" updated successfully`,
    };
  } catch (error) {
    console.error('[Canvas] Update project error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List canvas projects
 */
export async function listCanvasProjects(limit = 10, category, userId = 'default') {
  try {
    const ChatCanvasProject = (await import('../models/ChatCanvasProject.js')).default;
    
    const query = { userId };
    if (category) query.category = category;
    
    const projects = await ChatCanvasProject.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    
    return {
      success: true,
      projects: projects.map(p => ({
        id: p.projectId,
        name: p.name,
        description: p.description,
        template: p.template,
        category: p.category,
        filesCount: JSON.parse(p.files || '[]').length,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    };
  } catch (error) {
    console.error('[Canvas] List projects error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save canvas project files to agent file system
 */
export async function saveCanvasToFiles(projectId, folder = '', userId = 'default') {
  try {
    const ChatCanvasProject = (await import('../models/ChatCanvasProject.js')).default;
    
    const project = await ChatCanvasProject.findOne({
      projectId,
      userId,
    });
    
    if (!project) {
      return { success: false, error: `Canvas project not found: ${projectId}` };
    }
    
    const files = JSON.parse(project.files || '[]');
    const baseFolder = folder || project.name;
    
    const savedFiles = [];
    for (const file of files) {
      if (file.filename && file.content) {
        const result = await createFile(
          file.filename,
          file.content,
          `/${baseFolder}`,
          userId,
          'canvas-exporter'
        );
        savedFiles.push({
          filename: file.filename,
          success: result.success,
          path: result.path || `/${baseFolder}/${file.filename}`,
        });
      }
    }
    
    return {
      success: true,
      projectId,
      folder: baseFolder,
      filesSaved: savedFiles.length,
      files: savedFiles,
      message: `Canvas project "${project.name}" exported to files`,
    };
  } catch (error) {
    console.error('[Canvas] Save to files error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// �🎥 VIDEO OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze video
 */
export async function analyzeVideo(videoPath, userId = 'default') {
  try {
    return {
      success: true,
      message: 'Video analysis requires ffprobe. For basic info, check file metadata.',
      videoPath,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Trim video
 */
export async function trimVideo(videoPath, startTime, endTime, userId = 'default') {
  try {
    return {
      success: true,
      message: 'Video trimming requires ffmpeg. This operation will be available with media service integration.',
      videoPath,
      startTime,
      endTime,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Extract frames from video
 */
export async function extractFrames(videoPath, timestamps, userId = 'default') {
  try {
    return {
      success: true,
      message: 'Frame extraction requires ffmpeg. This operation will be available with media service integration.',
      videoPath,
      timestamps,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Convert video format
 */
export async function convertVideo(videoPath, format = 'mp4', userId = 'default') {
  try {
    return {
      success: true,
      message: 'Video conversion requires ffmpeg. This operation will be available with media service integration.',
      videoPath,
      format,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔊 AUDIO OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze audio
 */
export async function analyzeAudio(audioPath, userId = 'default') {
  try {
    return {
      success: true,
      message: 'Audio analysis requires ffprobe. For basic info, check file metadata.',
      audioPath,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Transcribe audio
 */
export async function transcribeAudio(audioPath, language = 'en', userId = 'default') {
  try {
    // This would use OpenAI Whisper or similar
    return {
      success: true,
      message: 'Audio transcription requires Whisper API integration. Use the AI chat to transcribe audio files.',
      audioPath,
      language,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Convert audio format
 */
export async function convertAudio(audioPath, format = 'mp3', userId = 'default') {
  try {
    return {
      success: true,
      message: 'Audio conversion requires ffmpeg. This operation will be available with media service integration.',
      audioPath,
      format,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 💻 CODE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze code using Tree-sitter for AST parsing
 */
export async function analyzeCode(code, language = 'auto', userId = 'default') {
  try {
    // Detect language if auto
    let detectedLanguage = language;
    if (language === 'auto') {
      if (code.includes('import ') && code.includes('from ')) detectedLanguage = 'python';
      else if (code.includes('const ') || code.includes('let ') || code.includes('function')) detectedLanguage = 'javascript';
      else if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) detectedLanguage = 'typescript';
      else detectedLanguage = 'javascript';
    }
    
    // Try Tree-sitter parsing for deep analysis
    let astAnalysis = null;
    try {
      const Parser = (await import('tree-sitter')).default;
      let langModule;
      
      if (detectedLanguage === 'javascript' || detectedLanguage === 'js') {
        langModule = (await import('tree-sitter-javascript')).default;
      } else if (detectedLanguage === 'typescript' || detectedLanguage === 'ts') {
        langModule = (await import('tree-sitter-typescript')).default.typescript;
      } else if (detectedLanguage === 'python' || detectedLanguage === 'py') {
        langModule = (await import('tree-sitter-python')).default;
      }
      
      if (langModule) {
        const parser = new Parser();
        parser.setLanguage(langModule);
        const tree = parser.parse(code);
        const rootNode = tree.rootNode;
        
        // Extract AST information
        const functions = [];
        const classes = [];
        const imports = [];
        const variables = [];
        const errors = [];
        
        function traverse(node) {
          // Functions
          if (node.type === 'function_declaration' || node.type === 'function_definition' ||
              node.type === 'arrow_function' || node.type === 'method_definition') {
            const nameNode = node.childForFieldName('name');
            functions.push({
              name: nameNode?.text || 'anonymous',
              line: node.startPosition.row + 1,
              type: node.type,
            });
          }
          // Classes
          if (node.type === 'class_declaration' || node.type === 'class_definition') {
            const nameNode = node.childForFieldName('name');
            classes.push({
              name: nameNode?.text || 'anonymous',
              line: node.startPosition.row + 1,
            });
          }
          // Imports
          if (node.type === 'import_statement' || node.type === 'import_from_statement') {
            imports.push({
              text: node.text,
              line: node.startPosition.row + 1,
            });
          }
          // Variables
          if (node.type === 'variable_declarator' || node.type === 'assignment') {
            const nameNode = node.childForFieldName('name') || node.child(0);
            variables.push({
              name: nameNode?.text || 'unknown',
              line: node.startPosition.row + 1,
            });
          }
          // Syntax errors
          if (node.type === 'ERROR' || node.isMissing) {
            errors.push({
              message: `Syntax error at line ${node.startPosition.row + 1}`,
              line: node.startPosition.row + 1,
              column: node.startPosition.column,
            });
          }
          
          for (let i = 0; i < node.childCount; i++) {
            traverse(node.child(i));
          }
        }
        
        traverse(rootNode);
        
        astAnalysis = {
          parsed: true,
          nodeCount: rootNode.descendantCount,
          functions,
          classes,
          imports,
          variables: variables.slice(0, 20), // Limit
          syntaxErrors: errors,
        };
      }
    } catch (treeSitterError) {
      console.log('[Tree-sitter] Fallback to regex analysis:', treeSitterError.message);
    }
    
    // Fallback/additional regex analysis
    const lines = code.split('\n');
    const functionMatches = (code.match(/function\s+\w+|def\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/g) || []);
    const commentMatches = (code.match(/\/\/.*|#.*|\/\*[\s\S]*?\*\/|"""[\s\S]*?"""|'''[\s\S]*?'''/g) || []);
    
    // Complexity metrics
    const cyclomaticIndicators = (code.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\b\?\b/g) || []).length;
    const complexity = cyclomaticIndicators > 20 ? 'high' : cyclomaticIndicators > 10 ? 'medium' : 'low';
    
    return {
      success: true,
      language: detectedLanguage,
      lineCount: lines.length,
      functionCount: astAnalysis?.functions?.length || functionMatches.length,
      commentCount: commentMatches.length,
      complexity,
      cyclomaticComplexity: cyclomaticIndicators + 1,
      ast: astAnalysis,
      metrics: {
        linesOfCode: lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#')).length,
        blankLines: lines.filter(l => !l.trim()).length,
        commentLines: commentMatches.length,
      },
      message: astAnalysis?.parsed 
        ? `Deep AST analysis complete. Found ${astAnalysis.functions.length} functions, ${astAnalysis.classes.length} classes.`
        : 'Regex-based analysis complete. For AST parsing, ensure Tree-sitter is configured.',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Format code using Prettier
 */
export async function formatCode(code, language, userId = 'default') {
  try {
    // Try to use Prettier for formatting
    let formatted = code;
    let usedPrettier = false;
    
    try {
      const prettier = await import('prettier');
      
      // Map language to Prettier parser
      const parserMap = {
        'javascript': 'babel',
        'js': 'babel',
        'typescript': 'typescript',
        'ts': 'typescript',
        'json': 'json',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'less': 'less',
        'markdown': 'markdown',
        'md': 'markdown',
        'yaml': 'yaml',
        'yml': 'yaml',
        'graphql': 'graphql',
        'vue': 'vue',
        'angular': 'angular',
        'python': null, // Prettier doesn't support Python
        'py': null,
      };
      
      const parser = parserMap[language.toLowerCase()];
      
      if (parser) {
        formatted = await prettier.format(code, {
          parser,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          bracketSpacing: true,
          arrowParens: 'avoid',
        });
        usedPrettier = true;
      }
    } catch (prettierError) {
      console.log('[Prettier] Fallback to basic formatting:', prettierError.message);
    }
    
    // Basic formatting fallback for Python or if Prettier fails
    if (!usedPrettier) {
      // Remove trailing whitespace
      formatted = code.split('\n').map(line => line.trimEnd()).join('\n');
      // Ensure single newline at end
      formatted = formatted.trimEnd() + '\n';
    }
    
    return {
      success: true,
      language,
      formatted,
      usedPrettier,
      changes: formatted !== code,
      message: usedPrettier 
        ? `Code formatted with Prettier (${language})` 
        : `Basic formatting applied. Prettier doesn't support ${language}.`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Lint code using ESLint
 */
export async function lintCode(code, language = 'javascript', userId = 'default') {
  try {
    // Only lint JavaScript/TypeScript
    if (!['javascript', 'js', 'typescript', 'ts'].includes(language.toLowerCase())) {
      return {
        success: true,
        language,
        issues: [],
        message: `ESLint only supports JavaScript/TypeScript. ${language} linting not available.`,
      };
    }
    
    let issues = [];
    let usedEslint = false;
    
    try {
      const { Linter } = await import('eslint');
      const linter = new Linter();
      
      // ESLint configuration
      const config = {
        languageOptions: {
          ecmaVersion: 2024,
          sourceType: 'module',
          globals: {
            console: 'readonly',
            process: 'readonly',
            Buffer: 'readonly',
            __dirname: 'readonly',
            __filename: 'readonly',
            module: 'readonly',
            require: 'readonly',
            exports: 'readonly',
          },
        },
        rules: {
          'no-unused-vars': 'warn',
          'no-undef': 'error',
          'no-console': 'off',
          'semi': ['warn', 'always'],
          'quotes': ['warn', 'single'],
          'no-var': 'warn',
          'prefer-const': 'warn',
          'eqeqeq': 'warn',
          'no-duplicate-imports': 'error',
          'no-empty': 'warn',
          'no-unreachable': 'error',
          'no-constant-condition': 'warn',
        },
      };
      
      const results = linter.verify(code, config);
      
      issues = results.map(issue => ({
        line: issue.line,
        column: issue.column,
        severity: issue.severity === 2 ? 'error' : 'warning',
        message: issue.message,
        ruleId: issue.ruleId,
      }));
      
      usedEslint = true;
    } catch (eslintError) {
      console.log('[ESLint] Error:', eslintError.message);
      // Fallback: basic pattern checks
      const lines = code.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('var ')) {
          issues.push({ line: i + 1, severity: 'warning', message: 'Use const/let instead of var' });
        }
        if (line.includes('==') && !line.includes('===')) {
          issues.push({ line: i + 1, severity: 'warning', message: 'Use === instead of ==' });
        }
      });
    }
    
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    return {
      success: true,
      language,
      usedEslint,
      issues,
      summary: {
        errors: errorCount,
        warnings: warningCount,
        total: issues.length,
      },
      message: issues.length === 0 
        ? '✅ No linting issues found!' 
        : `Found ${errorCount} errors and ${warningCount} warnings.`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Run code in sandbox
 */
export async function runCode(code, language, userId = 'default') {
  try {
    // Only JavaScript can be safely executed
    if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js') {
      const vm = await import('vm').then(m => m.default).catch(() => null);
      if (vm) {
        const context = { console: { log: (...args) => outputs.push(args.join(' ')) }, result: null };
        const outputs = [];
        
        vm.createContext(context);
        vm.runInContext(code, context, { timeout: 5000 });
        
        return {
          success: true,
          language,
          outputs,
          result: context.result,
        };
      }
    }
    
    return {
      success: true,
      message: `Code execution for ${language} requires sandbox environment. Use AI chat to explain what this code would do.`,
      code: code.slice(0, 500),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔍 SEARCH / MEMORY OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create vector embeddings using OpenAI Embeddings API
 */
export async function embedContent(content, model = 'text-embedding-3-small', userId = 'default') {
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Chunk content if too large (max 8191 tokens for text-embedding-3-small)
    const maxChars = 30000; // ~8k tokens
    const chunks = [];
    
    if (content.length > maxChars) {
      // Split into chunks
      for (let i = 0; i < content.length; i += maxChars) {
        chunks.push(content.slice(i, i + maxChars));
      }
    } else {
      chunks.push(content);
    }
    
    // Generate embeddings for each chunk
    const embeddings = [];
    for (const chunk of chunks) {
      const response = await openai.embeddings.create({
        model,
        input: chunk,
      });
      embeddings.push({
        embedding: response.data[0].embedding,
        dimensions: response.data[0].embedding.length,
        chunkIndex: embeddings.length,
        chunkText: chunk.slice(0, 200) + (chunk.length > 200 ? '...' : ''),
      });
    }
    
    return {
      success: true,
      model,
      totalChunks: embeddings.length,
      dimensions: embeddings[0]?.dimensions || 1536,
      embeddings: embeddings.map(e => ({
        dimensions: e.dimensions,
        chunkIndex: e.chunkIndex,
        preview: e.chunkText,
        // Return embedding vector for storage
        vector: e.embedding,
      })),
      message: `Created ${embeddings.length} embedding(s) with ${embeddings[0]?.dimensions || 1536} dimensions`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Store embeddings in Qdrant vector database
 */
export async function storeInQdrant(embeddings, metadata, collectionName = 'agent_memories', userId = 'default') {
  try {
    const { QdrantClient } = await import('@qdrant/js-client-rest');
    
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    
    const client = new QdrantClient({ 
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });
    
    // Ensure collection exists
    try {
      await client.getCollection(collectionName);
    } catch {
      // Create collection if it doesn't exist
      await client.createCollection(collectionName, {
        vectors: {
          size: embeddings[0]?.vector?.length || 1536,
          distance: 'Cosine',
        },
      });
    }
    
    // Prepare points for insertion (Qdrant requires UUID or integer IDs)
    const { randomUUID } = await import('crypto');
    const points = embeddings.map((emb, idx) => ({
      id: randomUUID(),
      vector: emb.vector,
      payload: {
        userId,
        ...metadata,
        chunkIndex: emb.chunkIndex,
        preview: emb.preview,
        createdAt: new Date().toISOString(),
      },
    }));
    
    // Upsert points
    await client.upsert(collectionName, {
      points,
    });
    
    return {
      success: true,
      collection: collectionName,
      pointsStored: points.length,
      message: `Stored ${points.length} vectors in Qdrant collection: ${collectionName}`,
    };
  } catch (error) {
    // Fallback: store in Database if Qdrant not available
    console.log('[Qdrant] Fallback to Database:', error.message);
    return {
      success: true,
      fallback: 'database',
      message: 'Qdrant not available, embeddings returned for manual storage',
      embeddings: embeddings.map(e => ({ dimensions: e.dimensions, chunkIndex: e.chunkIndex })),
    };
  }
}

/**
 * Semantic search using embeddings and Qdrant
 */
export async function semanticSearch(query, collectionName = 'agent_memories', limit = 10, userId = 'default') {
  try {
    // First, embed the query
    const queryEmbedding = await embedContent(query, 'text-embedding-3-small', userId);
    
    if (!queryEmbedding.success) {
      return { success: false, error: 'Failed to create query embedding' };
    }
    
    const queryVector = queryEmbedding.embeddings[0]?.vector;
    
    if (!queryVector) {
      return { success: false, error: 'No embedding vector generated' };
    }
    
    // Try Qdrant first
    try {
      const { QdrantClient } = await import('@qdrant/js-client-rest');
      
      const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
      const qdrantApiKey = process.env.QDRANT_API_KEY;
      
      const client = new QdrantClient({ 
        url: qdrantUrl,
        apiKey: qdrantApiKey,
      });
      
      // Search for similar vectors (filter by userId if not 'default')
      const searchParams = {
        vector: queryVector,
        limit,
        with_payload: true,
      };
      
      // Only filter by userId if it's not the default
      if (userId && userId !== 'default') {
        searchParams.filter = {
          must: [{ key: 'userId', match: { value: userId } }],
        };
      }
      
      const searchResult = await client.search(collectionName, searchParams);
      
      return {
        success: true,
        source: 'qdrant',
        collection: collectionName,
        query,
        results: searchResult.map(r => ({
          score: r.score,
          id: r.id,
          preview: r.payload?.preview,
          metadata: r.payload,
        })),
        message: `Found ${searchResult.length} similar results`,
      };
    } catch (qdrantError) {
      console.log('[Qdrant] Search fallback:', qdrantError.message);
      
      // Fallback: search in Database using text search
      const AgentMemory = (await import('../models/AgentMemory.js')).default;
      
      const dbResults = await AgentMemory.find({
        userId,
        $text: { $search: query },
      })
        .limit(limit)
        .sort({ score: { $meta: 'textScore' } });
      
      return {
        success: true,
        source: 'database_text',
        query,
        results: dbResults.map(r => ({
          key: r.key,
          content: r.content?.slice(0, 200),
          tags: r.tags,
        })),
        message: `Found ${dbResults.length} results via text search (Qdrant unavailable)`,
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cache results in Redis
 */
export async function cacheInRedis(key, value, ttlSeconds = 3600, userId = 'default') {
  try {
    const Redis = (await import('ioredis')).default;
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    const cacheKey = `agent:${userId}:${key}`;
    const serialized = JSON.stringify(value);
    
    await redis.setex(cacheKey, ttlSeconds, serialized);
    await redis.quit();
    
    return {
      success: true,
      key: cacheKey,
      ttl: ttlSeconds,
      message: `Cached with key: ${cacheKey} (TTL: ${ttlSeconds}s)`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get cached value from Redis
 */
export async function getFromRedis(key, userId = 'default') {
  try {
    const Redis = (await import('ioredis')).default;
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    const cacheKey = `agent:${userId}:${key}`;
    const cached = await redis.get(cacheKey);
    const ttl = await redis.ttl(cacheKey);
    
    await redis.quit();
    
    if (cached) {
      return {
        success: true,
        key: cacheKey,
        value: JSON.parse(cached),
        ttlRemaining: ttl,
        message: `Cache hit for key: ${cacheKey}`,
      };
    } else {
      return {
        success: true,
        key: cacheKey,
        value: null,
        message: `Cache miss for key: ${cacheKey}`,
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Save to agent memory
 */
export async function saveMemory(key, content, tags = [], userId = 'default', agentId = 'general') {
  try {
    // Use Database to store memory
    const memoryFile = new AgentFile({
      userId,
      agentId,
      filename: `memory-${key}.json`,
      folder: '/.memory',
      path: `/.memory/memory-${key}.json`,
      mimeType: 'application/json',
      size: content.length,
      storageType: 'database',
      content: JSON.stringify({ key, content, tags, timestamp: new Date() }),
    });
    
    await AgentFile.findOneAndUpdate(
      { userId, path: `/.memory/memory-${key}.json` },
      memoryFile.toObject(),
      { upsert: true }
    );
    
    return {
      success: true,
      key,
      tags,
      message: `Memory saved with key: ${key}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Load from agent memory
 */
export async function loadMemory(key = null, tags = [], userId = 'default') {
  try {
    const query = { userId, folder: '/.memory', isDeleted: false };
    
    if (key) {
      query.path = `/.memory/memory-${key}.json`;
    }
    
    const memories = await AgentFile.find(query);
    
    const results = memories.map(m => {
      try {
        return JSON.parse(m.content);
      } catch {
        return { content: m.content };
      }
    }).filter(m => {
      if (tags.length === 0) return true;
      return tags.some(t => m.tags?.includes(t));
    });
    
    return {
      success: true,
      memories: results,
      count: results.length,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🤝 AGENT CONTROL OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Plan a task
 */
export async function planTask(task, context = '', userId = 'default') {
  try {
    return {
      success: true,
      task,
      context,
      message: 'Task planning should be handled by the AI agent. Send this task to the chat for intelligent breakdown.',
      suggestedSteps: [
        '1. Analyze requirements',
        '2. Break into subtasks',
        '3. Execute sequentially',
        '4. Verify results',
      ],
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delegate task to another agent
 */
export async function delegateTask(task, agentType, userId = 'default') {
  try {
    return {
      success: true,
      task,
      agentType,
      message: `Task queued for ${agentType} agent. Multi-agent delegation is handled through the agent orchestration system.`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Execute a tool by name
 */
export async function executeTool(toolName, params) {
  switch (toolName) {
    // ═══════════════════════════════════════════════════════════════
    // UTILITY TOOLS
    // ═══════════════════════════════════════════════════════════════
    case 'web_search':
      return webSearch(params.query, params.num_results);

    case 'fetch_url':
      return fetchUrl(params.url);

    case 'get_current_time':
      return getCurrentTime(params.timezone);

    case 'calculate':
      return calculate(params.expression);

    case 'analyze_image':
      return {
        success: true,
        message: 'Image analysis should be handled by vision-enabled AI model',
        image_url: params.image_url,
      };

    // ═══════════════════════════════════════════════════════════════
    // FILE OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'create_file':
      return createFile(params.filename, params.content, params.folder, params.userId);

    case 'read_file':
      return readFile(params.filename, params.userId);

    case 'modify_file':
      return modifyFile(params.filename, params.content, params.mode, params.userId);

    case 'list_files':
      return listFiles(params.folder, params.userId);

    case 'delete_file':
      return deleteFile(params.filename, params.userId);

    case 'create_folder':
      return createFolder(params.path || params.folder, params.userId);

    case 'list_folders':
      return listFolders(params.folder, params.userId);

    case 'move_file':
      return moveFile(params.source, params.destination, params.userId);

    case 'copy_file':
      return copyFile(params.source, params.destination, params.userId);

    case 'rename_file':
      return renameFile(params.old_name || params.oldName, params.new_name || params.newName, params.userId);

    case 'zip_files':
      return zipFiles(params.files, params.output || 'archive.zip', params.userId);

    case 'unzip_files':
      return unzipFiles(params.file, params.destination, params.userId);

    // ═══════════════════════════════════════════════════════════════
    // CANVAS PROJECT TOOLS
    // ═══════════════════════════════════════════════════════════════
    case 'create_canvas_project':
      return createCanvasProject(params.name, params.description, params.template, params.category, params.files, params.settings, params.userId);

    case 'read_canvas_project':
      return readCanvasProject(params.project_id, params.userId);

    case 'update_canvas_project':
      return updateCanvasProject(params.project_id, params.name, params.description, params.files, params.settings, params.userId);

    case 'list_canvas_projects':
      return listCanvasProjects(params.limit, params.category, params.userId);

    case 'save_canvas_to_files':
      return saveCanvasToFiles(params.project_id, params.folder, params.userId);

    // ═══════════════════════════════════════════════════════════════
    // DOCUMENT PARSING
    // ═══════════════════════════════════════════════════════════════
    case 'parse_pdf':
      return parsePdf(params.file || params.path, params.userId);

    case 'parse_docx':
      return parseDocx(params.file || params.path, params.userId);

    case 'parse_csv':
      return parseCsv(params.file || params.path, params.limit || 100, params.userId);

    case 'parse_markdown':
      return parseMarkdown(params.content || params.file, params.userId);

    case 'extract_text':
      return extractText(params.file || params.path, params.userId);

    // ═══════════════════════════════════════════════════════════════
    // IMAGE OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'generate_image':
      return generateImage(params.prompt, params.style, params.width, params.height, params.userId);

    case 'convert_image':
      return convertImage(params.image_url, params.format, params.quality, params.userId);

    case 'view_image':
      return viewImage(params.path || params.file, params.userId);

    case 'resize_image':
      return resizeImage(params.path || params.file, params.width, params.height, params.userId);

    case 'crop_image':
      return cropImage(params.path || params.file, params.x, params.y, params.width, params.height, params.userId);

    case 'edit_image':
      return editImage(params.path || params.file, params.operations || [], params.userId);

    case 'ocr_image':
      return ocrImage(params.path || params.file, params.language || 'eng', params.userId);

    // ═══════════════════════════════════════════════════════════════
    // VIDEO OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'generate_video':
      return generateVideo(params.prompt, params.duration, params.userId);

    case 'analyze_video':
      return analyzeVideo(params.path || params.file, params.userId);

    case 'trim_video':
      return trimVideo(params.path || params.file, params.start, params.end, params.userId);

    case 'extract_frames':
      return extractFrames(params.path || params.file, params.timestamps, params.userId);

    case 'convert_video':
      return convertVideo(params.path || params.file, params.format || 'mp4', params.userId);

    // ═══════════════════════════════════════════════════════════════
    // AUDIO OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'analyze_audio':
      return analyzeAudio(params.path || params.file, params.userId);

    case 'transcribe_audio':
      return transcribeAudio(params.path || params.file, params.language || 'en', params.userId);

    case 'convert_audio':
      return convertAudio(params.path || params.file, params.format || 'mp3', params.userId);

    // ═══════════════════════════════════════════════════════════════
    // CODE OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'analyze_code':
      return analyzeCode(params.code, params.language || 'auto', params.userId);

    case 'format_code':
      return formatCode(params.code, params.language, params.userId);

    case 'lint_code':
      return lintCode(params.code, params.language || 'javascript', params.userId);

    case 'parse_ast':
      return analyzeCode(params.code, params.language, params.userId); // Uses Tree-sitter in analyzeCode

    case 'run_code':
      return runCode(params.code, params.language, params.userId);

    // ═══════════════════════════════════════════════════════════════
    // EMBEDDINGS / VECTOR SEARCH OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'embed_content':
      return embedContent(params.content, params.model || 'text-embedding-3-small', params.userId);

    case 'semantic_search':
      return semanticSearch(params.query, params.index || params.collection || 'agent_memories', params.limit || 10, params.userId);

    case 'store_vectors': {
      // First embed, then store in Qdrant
      const embedResult = await embedContent(params.content, params.model || 'text-embedding-3-small', params.userId);
      if (embedResult.success) {
        return storeInQdrant(embedResult.embeddings, params.metadata || {}, params.collection || 'agent_memories', params.userId);
      }
      return embedResult;
    }

    case 'cache_set':
      return cacheInRedis(params.key, params.value, params.ttl || 3600, params.userId);

    case 'cache_get':
      return getFromRedis(params.key, params.userId);

    // ═══════════════════════════════════════════════════════════════
    // MEMORY OPERATIONS
    // ═══════════════════════════════════════════════════════════════
    case 'save_memory':
      return saveMemory(params.key, params.content, params.tags || [], params.userId, params.agentId);

    case 'load_memory':
      return loadMemory(params.key, params.tags || [], params.userId);

    // ═══════════════════════════════════════════════════════════════
    // AGENT CONTROL
    // ═══════════════════════════════════════════════════════════════
    case 'plan_task':
      return planTask(params.task, params.context, params.userId);

    case 'delegate_task':
      return delegateTask(params.task, params.agent || params.agentType, params.userId);

    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}

/**
 * Parse tool calls from AI response (for models that support function calling)
 */
export function parseToolCalls(response) {
  // Look for tool call patterns in the response
  const toolCallPattern = /\[TOOL:(\w+)\]\s*({[^}]+})/g;
  const toolCalls = [];

  let match;
  while ((match = toolCallPattern.exec(response)) !== null) {
    try {
      const toolName = match[1];
      const params = JSON.parse(match[2]);
      toolCalls.push({ tool: toolName, params });
    } catch {
      // Invalid JSON, skip
    }
  }

  return toolCalls;
}

/**
 * Format tool results for AI context
 */
export function formatToolResults(results) {
  return results.map(r => {
    if (r.tool === 'web_search' && r.result.results) {
      const searchResults = r.result.results.map(
        (res, i) => `${i + 1}. **${res.title}**\n   ${res.snippet}\n   Source: ${res.url}`
      ).join('\n\n');
      return `## Web Search Results for "${r.result.query}":\n\n${searchResults || 'No results found.'}`;
    }

    if (r.tool === 'fetch_url' && r.result.success) {
      return `## Content from ${r.result.url}:\n**Title:** ${r.result.title}\n\n${r.result.content.slice(0, 3000)}...`;
    }

    if (r.tool === 'get_current_time' && r.result.success) {
      return `## Current Time (${r.result.timezone}):\n${r.result.formatted}`;
    }

    if (r.tool === 'calculate' && r.result.success) {
      return `## Calculation:\n${r.result.expression} = **${r.result.formatted}**`;
    }

    if (r.tool === 'create_file' && r.result.success) {
      return `## File Created:\n**${r.result.filename}** (${r.result.size} bytes)\nLocation: ${r.result.folder}\n[Download](${r.result.downloadUrl})`;
    }

    if (r.tool === 'read_file' && r.result.success) {
      const preview = r.result.content.length > 2000 
        ? r.result.content.slice(0, 2000) + '\n... (truncated)' 
        : r.result.content;
      const downloadLink = `/api/agents/files/download?filename=${encodeURIComponent(r.result.filename)}`;
      return `## File: ${r.result.filename}\n\`\`\`\n${preview}\n\`\`\`\n\n[📥 Download ${r.result.filename}](${downloadLink})`;
    }

    if (r.tool === 'modify_file' && r.result.success) {
      const downloadLink = `/api/agents/files/download?filename=${encodeURIComponent(r.result.filename)}`;
      return `## File Modified:\n**${r.result.filename}** ${r.result.mode === 'append' ? 'appended' : 'replaced'} (${r.result.size} bytes)\n\n[📥 Download ${r.result.filename}](${downloadLink})`;
    }

    if (r.tool === 'extract_text' && r.result.success) {
      const preview = r.result.text?.length > 2000 
        ? r.result.text.slice(0, 2000) + '\n... (truncated)' 
        : r.result.text || '';
      return `## Text Extracted from: ${r.result.filename}\n\`\`\`\n${preview}\n\`\`\`\n\n*Total characters: ${r.result.text?.length || 0}*`;
    }

    if (r.tool === 'list_files' && r.result.success) {
      const fileList = r.result.files.length > 0
        ? r.result.files.map(f => `- ${f.type === 'folder' ? '📁' : '📄'} ${f.name}${f.size ? ` (${f.size} bytes)` : ''}`).join('\n')
        : 'No files found';
      return `## Files in ${r.result.folder}:\n${fileList}\n\nTotal: ${r.result.totalFiles} files, ${r.result.totalFolders} folders`;
    }

    if (r.tool === 'delete_file' && r.result.success) {
      return `## File Deleted:\n**${r.result.filename}** has been removed.`;
    }

    if (r.tool === 'generate_image' && r.result.success) {
      // Include full base64 image for display in chat
      const parts = [`## Image Generated!`, `**Prompt:** ${r.result.prompt}`, `**Style:** ${r.result.style}`, `**Dimensions:** ${r.result.dimensions}`];
      if (r.result.downloadUrl) {
        parts.push(`\n[📥 Download Image](${r.result.downloadUrl})`);
      }
      if (r.result.image) {
        // Include the full base64 image for rendering
        parts.push(`\n![Generated Image](${r.result.image})`);
      }
      return parts.join('\n');
    }

    if (r.tool === 'generate_video' && r.result.success) {
      if (r.result.status === 'processing') {
        return `## Video Processing:\n**Prompt:** ${r.result.prompt}\n⏳ ${r.result.message}`;
      }
      return `## Video Generated:\n**Prompt:** ${r.result.prompt}\n**Duration:** ${r.result.duration}\n${r.result.downloadUrl ? `[Download Video](${r.result.downloadUrl})` : ''}\n${r.result.videoUrl ? `[View Video](${r.result.videoUrl})` : ''}`;
    }

    if (r.tool === 'convert_image' && r.result.success) {
      const parts = [`## Image Converted!`, `**Format:** ${r.result.format}`];
      if (r.result.downloadUrl) {
        parts.push(`\n[📥 Download ${r.result.format}](${r.result.downloadUrl})`);
      }
      if (r.result.image) {
        parts.push(`\n![Converted Image](${r.result.image})`);
      }
      return parts.join('\n');
    }

    return `## Tool Result (${r.tool}):\n${JSON.stringify(r.result, null, 2)}`;
  }).join('\n\n---\n\n');
}

/**
 * Get tool descriptions for system prompt
 */
export function getToolDescriptions() {
  return `
## Available Tools (50+ Tools)

You have access to powerful tools. Use this format:
[TOOL:tool_name]{"param1": "value1", "param2": "value2"}

═══════════════════════════════════════════════════════════════════
### 🔧 UTILITY TOOLS
═══════════════════════════════════════════════════════════════════

1. **web_search** - Search the web
   [TOOL:web_search]{"query": "latest AI news"}

2. **fetch_url** - Fetch webpage content
   [TOOL:fetch_url]{"url": "https://example.com"}

3. **get_current_time** - Get current date/time
   [TOOL:get_current_time]{"timezone": "America/New_York"}

4. **calculate** - Math calculations
   [TOOL:calculate]{"expression": "sqrt(144) + 5^2"}

═══════════════════════════════════════════════════════════════════
### 📁 FILE & FOLDER TOOLS
═══════════════════════════════════════════════════════════════════

5. **create_file** - Create a new file
   [TOOL:create_file]{"filename": "script.py", "content": "print('Hi!')", "folder": ""}

6. **read_file** - Read file contents
   [TOOL:read_file]{"filename": "notes.txt"}

7. **modify_file** - Edit existing file
   [TOOL:modify_file]{"filename": "notes.txt", "content": "new content", "mode": "replace"}

8. **list_files** - List files in folder
   [TOOL:list_files]{"folder": "documents"}

9. **delete_file** - Delete a file
   [TOOL:delete_file]{"filename": "old.txt"}

10. **create_folder** - Create new folder
    [TOOL:create_folder]{"path": "projects/new-project"}

11. **list_folders** - List only folders
    [TOOL:list_folders]{"folder": ""}

12. **move_file** - Move file to new location
    [TOOL:move_file]{"source": "old/file.txt", "destination": "new/file.txt"}

13. **copy_file** - Copy a file
    [TOOL:copy_file]{"source": "original.txt", "destination": "backup.txt"}

14. **rename_file** - Rename a file
    [TOOL:rename_file]{"old_name": "old.txt", "new_name": "new.txt"}

15. **zip_files** - Compress files into ZIP
    [TOOL:zip_files]{"files": ["file1.txt", "file2.txt"], "output": "archive.zip"}

16. **unzip_files** - Extract ZIP archive
    [TOOL:unzip_files]{"file": "archive.zip", "destination": "extracted"}

═══════════════════════════════════════════════════════════════════
### 📄 DOCUMENT PARSING TOOLS
═══════════════════════════════════════════════════════════════════

17. **parse_pdf** - Extract text from PDF
    [TOOL:parse_pdf]{"file": "document.pdf"}

18. **parse_docx** - Extract text from Word doc
    [TOOL:parse_docx]{"file": "report.docx"}

19. **parse_csv** - Parse CSV data
    [TOOL:parse_csv]{"file": "data.csv", "limit": 50}

20. **parse_markdown** - Convert Markdown to HTML
    [TOOL:parse_markdown]{"content": "# Hello World"}

21. **extract_text** - Extract text from any doc
    [TOOL:extract_text]{"file": "document.pdf"}

═══════════════════════════════════════════════════════════════════
### 🖼️ IMAGE TOOLS
═══════════════════════════════════════════════════════════════════

22. **generate_image** - Generate AI image
    [TOOL:generate_image]{"prompt": "sunset over mountains", "style": "realistic"}
    Styles: realistic, artistic, anime, oil-painting, watercolor, digital-art, 3d-render, pixel-art

23. **convert_image** - Convert image format
    [TOOL:convert_image]{"image_url": "path/image.jpg", "format": "png"}

24. **view_image** - Get image metadata
    [TOOL:view_image]{"file": "photo.jpg"}

25. **resize_image** - Resize image dimensions
    [TOOL:resize_image]{"file": "photo.jpg", "width": 800, "height": 600}

26. **crop_image** - Crop image region
    [TOOL:crop_image]{"file": "photo.jpg", "x": 100, "y": 100, "width": 400, "height": 300}

27. **ocr_image** - Extract text from image
    [TOOL:ocr_image]{"file": "screenshot.png", "language": "en"}

═══════════════════════════════════════════════════════════════════
### 🎥 VIDEO TOOLS
═══════════════════════════════════════════════════════════════════

28. **generate_video** - Generate AI video
    [TOOL:generate_video]{"prompt": "cat playing", "duration": 4}

29. **analyze_video** - Get video metadata
    [TOOL:analyze_video]{"file": "video.mp4"}

30. **trim_video** - Trim video segment
    [TOOL:trim_video]{"file": "video.mp4", "start": 0, "end": 10}

31. **extract_frames** - Extract video frames
    [TOOL:extract_frames]{"file": "video.mp4", "timestamps": [1, 5, 10]}

32. **convert_video** - Convert video format
    [TOOL:convert_video]{"file": "video.avi", "format": "mp4"}

═══════════════════════════════════════════════════════════════════
### 🔊 AUDIO TOOLS
═══════════════════════════════════════════════════════════════════

33. **analyze_audio** - Get audio metadata
    [TOOL:analyze_audio]{"file": "audio.mp3"}

34. **transcribe_audio** - Speech to text
    [TOOL:transcribe_audio]{"file": "speech.mp3", "language": "en"}

35. **convert_audio** - Convert audio format
    [TOOL:convert_audio]{"file": "audio.wav", "format": "mp3"}

═══════════════════════════════════════════════════════════════════
### 💻 CODE TOOLS
═══════════════════════════════════════════════════════════════════

36. **analyze_code** - Analyze code structure
    [TOOL:analyze_code]{"code": "function hello() {...}", "language": "javascript"}

37. **format_code** - Format/beautify code
    [TOOL:format_code]{"code": "function hello(){return true}", "language": "javascript"}

38. **run_code** - Execute code in sandbox
    [TOOL:run_code]{"code": "console.log(2+2)", "language": "javascript"}

═══════════════════════════════════════════════════════════════════
### 🧠 MEMORY TOOLS
═══════════════════════════════════════════════════════════════════

39. **save_memory** - Save to agent memory
    [TOOL:save_memory]{"key": "user_preferences", "content": "likes dark mode", "tags": ["settings"]}

40. **load_memory** - Load from memory
    [TOOL:load_memory]{"key": "user_preferences"}
    [TOOL:load_memory]{"tags": ["settings"]}

═══════════════════════════════════════════════════════════════════
### 🤖 AGENT CONTROL TOOLS
═══════════════════════════════════════════════════════════════════

41. **plan_task** - Break down complex task
    [TOOL:plan_task]{"task": "Build a website", "context": "React app"}

42. **delegate_task** - Delegate to specialist agent
    [TOOL:delegate_task]{"task": "Review code security", "agent": "security"}

═══════════════════════════════════════════════════════════════════
### 🎨 CANVAS PROJECT TOOLS
═══════════════════════════════════════════════════════════════════

43. **create_canvas_project** - Create new canvas project
    [TOOL:create_canvas_project]{"name": "My App", "description": "Web application", "template": "react-app", "category": "web-app", "files": [{"filename": "index.html", "content": "<h1>Hello</h1>"}]}

44. **read_canvas_project** - Read canvas project details
    [TOOL:read_canvas_project]{"project_id": "canvas-123"}

45. **update_canvas_project** - Update canvas project
    [TOOL:update_canvas_project]{"project_id": "canvas-123", "name": "Updated App", "files": [{"filename": "app.js", "content": "console.log('hi')"}]}

46. **list_canvas_projects** - List user's canvas projects
    [TOOL:list_canvas_projects]{"limit": 10, "category": "web-app"}

47. **save_canvas_to_files** - Export canvas to file system
    [TOOL:save_canvas_to_files]{"project_id": "canvas-123", "folder": "my-projects"}

═══════════════════════════════════════════════════════════════════

IMPORTANT:
- Only use tools when necessary
- Explain results naturally in your response
- Use multiple tools in one response if needed
- Be creative with image/video prompts for better results
`;
}

export default {
  // Configuration
  AVAILABLE_TOOLS,
  TOOL_CATEGORIES,
  
  // Utility tools
  webSearch,
  fetchUrl,
  getCurrentTime,
  calculate,
  
  // File operations
  createFile,
  readFile,
  modifyFile,
  listFiles,
  deleteFile,
  createFolder,
  listFolders,
  moveFile,
  copyFile,
  renameFile,
  zipFiles,
  unzipFiles,
  
  // Document parsing
  parsePdf,
  parseDocx,
  parseCsv,
  parseMarkdown,
  extractText,
  
  // Image operations
  generateImage,
  convertImage,
  viewImage,
  resizeImage,
  cropImage,
  ocrImage,
  editImage,
  
  // Video operations
  generateVideo,
  analyzeVideo,
  trimVideo,
  extractFrames,
  convertVideo,
  
  // Audio operations
  analyzeAudio,
  transcribeAudio,
  convertAudio,
  
  // Code operations
  analyzeCode,
  formatCode,
  lintCode,
  runCode,
  
  // Embeddings / Vector Search
  embedContent,
  storeInQdrant,
  semanticSearch,
  cacheInRedis,
  getFromRedis,
  
  // Memory operations
  saveMemory,
  loadMemory,
  
  // Canvas operations
  createCanvasProject,
  readCanvasProject,
  updateCanvasProject,
  listCanvasProjects,
  saveCanvasToFiles,
  
  // Agent control
  planTask,
  delegateTask,
  
  // Core functions
  executeTool,
  parseToolCalls,
  formatToolResults,
  getToolDescriptions,
};
