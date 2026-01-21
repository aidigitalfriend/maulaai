/**
 * AGENT TOOLS SERVICE
 * Gives agents capabilities beyond just text generation:
 * - Web Search (using DuckDuckGo/SerpAPI)
 * - URL Fetching & Content Extraction
 * - File Operations (read, analyze)
 * - Image Understanding (via vision models)
 * - Date/Time awareness
 * - Calculator/Math operations
 */

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';

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
        'User-Agent': 'Mozilla/5.0 (compatible; OneLastAI/1.0; +https://onelastai.co)',
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
// FILE OPERATIONS
// Files are stored in a sandboxed workspace directory per user/session
// ═══════════════════════════════════════════════════════════════════

// Base workspace directory for agent files
const WORKSPACE_BASE = process.env.AGENT_WORKSPACE_DIR || '/tmp/agent-workspace';

// Ensure workspace directory exists and return safe path
async function getWorkspacePath(userId = 'default', subPath = '') {
  const userWorkspace = path.join(WORKSPACE_BASE, userId);
  await fs.mkdir(userWorkspace, { recursive: true });
  
  // Prevent directory traversal attacks
  const safePath = path.normalize(subPath).replace(/^\.\.\/|^\.\//g, '');
  const fullPath = path.join(userWorkspace, safePath);
  
  // Ensure the path stays within the workspace
  if (!fullPath.startsWith(userWorkspace)) {
    throw new Error('Access denied: Path outside workspace');
  }
  
  return fullPath;
}

/**
 * Create a new file with content
 */
export async function createFile(filename, content, folder = '', userId = 'default') {
  try {
    const folderPath = await getWorkspacePath(userId, folder);
    await fs.mkdir(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, path.basename(filename));
    
    // Check if file already exists
    try {
      await fs.access(filePath);
      return {
        success: false,
        error: `File already exists: ${filename}. Use modify_file to update it.`,
        filename,
      };
    } catch {
      // File doesn't exist, good to create
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
    
    const stats = await fs.stat(filePath);
    return {
      success: true,
      filename,
      folder: folder || '/',
      size: stats.size,
      message: `File created successfully: ${filename}`,
      downloadUrl: `/api/agents/files/download?file=${encodeURIComponent(path.join(folder, filename))}&userId=${userId}`,
    };
  } catch (error) {
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

/**
 * Read file contents
 */
export async function readFile(filename, userId = 'default') {
  try {
    const filePath = await getWorkspacePath(userId, filename);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    
    return {
      success: true,
      filename,
      content,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    };
  } catch (error) {
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

/**
 * Modify an existing file
 */
export async function modifyFile(filename, content, mode = 'replace', userId = 'default') {
  try {
    const filePath = await getWorkspacePath(userId, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return {
        success: false,
        filename,
        error: `File not found: ${filename}. Use create_file to create it first.`,
      };
    }
    
    if (mode === 'append') {
      await fs.appendFile(filePath, content, 'utf-8');
    } else {
      await fs.writeFile(filePath, content, 'utf-8');
    }
    
    const stats = await fs.stat(filePath);
    return {
      success: true,
      filename,
      mode,
      size: stats.size,
      message: `File ${mode === 'append' ? 'updated' : 'replaced'} successfully: ${filename}`,
    };
  } catch (error) {
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

/**
 * List files in a directory
 */
export async function listFiles(folder = '', userId = 'default') {
  try {
    const folderPath = await getWorkspacePath(userId, folder);
    
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(folderPath, entry.name);
        const stats = await fs.stat(entryPath);
        return {
          name: entry.name,
          type: entry.isDirectory() ? 'folder' : 'file',
          size: entry.isDirectory() ? null : stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
    );
    
    return {
      success: true,
      folder: folder || '/',
      files,
      totalFiles: files.filter(f => f.type === 'file').length,
      totalFolders: files.filter(f => f.type === 'folder').length,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        success: true,
        folder: folder || '/',
        files: [],
        totalFiles: 0,
        totalFolders: 0,
        message: 'Workspace is empty',
      };
    }
    return {
      success: false,
      folder: folder || '/',
      error: error.message,
    };
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filename, userId = 'default') {
  try {
    const filePath = await getWorkspacePath(userId, filename);
    
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return {
        success: false,
        filename,
        error: 'Cannot delete directories. Only files can be deleted.',
      };
    }
    
    await fs.unlink(filePath);
    
    return {
      success: true,
      filename,
      message: `File deleted successfully: ${filename}`,
    };
  } catch (error) {
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
    // Call the frontend API which handles Stability AI
    const response = await fetch(`${FRONTEND_URL}/api/lab/image-generation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, width, height }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Image generation failed');
    }

    const data = await response.json();

    // Save the image to user workspace
    if (data.image && data.image.startsWith('data:image')) {
      const base64Data = data.image.split(',')[1];
      const filename = `generated-image-${Date.now()}.png`;
      const folderPath = await getWorkspacePath(userId, 'images');
      await fs.mkdir(folderPath, { recursive: true });
      const filePath = path.join(folderPath, filename);
      await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));

      return {
        success: true,
        prompt,
        style,
        dimensions: `${width}x${height}`,
        image: data.image,
        filename: `images/${filename}`,
        downloadUrl: `/api/agents/files/download?file=${encodeURIComponent(`images/${filename}`)}&userId=${userId}`,
        experimentId: data.experimentId,
        message: `Image generated successfully! You can view it or download it.`,
      };
    }

    return {
      success: true,
      prompt,
      style,
      image: data.image,
      experimentId: data.experimentId,
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      prompt,
      error: error.message || 'Failed to generate image',
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
        const videoBuffer = await videoResponse.arrayBuffer();
        const filename = `generated-video-${Date.now()}.mp4`;
        const folderPath = await getWorkspacePath(userId, 'videos');
        await fs.mkdir(folderPath, { recursive: true });
        const filePath = path.join(folderPath, filename);
        await fs.writeFile(filePath, Buffer.from(videoBuffer));

        return {
          success: true,
          prompt,
          duration: `~${duration}s`,
          videoUrl: videoUrl,
          filename: `videos/${filename}`,
          downloadUrl: `/api/agents/files/download?file=${encodeURIComponent(`videos/${filename}`)}&userId=${userId}`,
          message: 'Video generated successfully! You can view it or download it.',
        };
      } catch (saveError) {
        // Return URL even if save fails
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
 * Execute a tool by name
 */
export async function executeTool(toolName, params) {
  switch (toolName) {
    case 'web_search':
      return webSearch(params.query, params.num_results);

    case 'fetch_url':
      return fetchUrl(params.url);

    case 'get_current_time':
      return getCurrentTime(params.timezone);

    case 'calculate':
      return calculate(params.expression);

    case 'analyze_image':
      // This would be handled by the AI provider's vision capability
      return {
        success: true,
        message: 'Image analysis should be handled by vision-enabled AI model',
        image_url: params.image_url,
      };

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

    case 'generate_image':
      return generateImage(params.prompt, params.style, params.width, params.height, params.userId);

    case 'generate_video':
      return generateVideo(params.prompt, params.duration, params.userId);

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
      return `## File: ${r.result.filename}\n\`\`\`\n${preview}\n\`\`\``;
    }

    if (r.tool === 'modify_file' && r.result.success) {
      return `## File Modified:\n**${r.result.filename}** ${r.result.mode === 'append' ? 'appended' : 'replaced'} (${r.result.size} bytes)`;
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
      return `## Image Generated:\n**Prompt:** ${r.result.prompt}\n**Style:** ${r.result.style}\n**Dimensions:** ${r.result.dimensions}\n${r.result.downloadUrl ? `[Download Image](${r.result.downloadUrl})` : ''}\n${r.result.image ? '![Generated Image](' + r.result.image.slice(0, 100) + '...)' : ''}`;
    }

    if (r.tool === 'generate_video' && r.result.success) {
      if (r.result.status === 'processing') {
        return `## Video Processing:\n**Prompt:** ${r.result.prompt}\n⏳ ${r.result.message}`;
      }
      return `## Video Generated:\n**Prompt:** ${r.result.prompt}\n**Duration:** ${r.result.duration}\n${r.result.downloadUrl ? `[Download Video](${r.result.downloadUrl})` : ''}\n${r.result.videoUrl ? `[View Video](${r.result.videoUrl})` : ''}`;
    }

    return `## Tool Result (${r.tool}):\n${JSON.stringify(r.result, null, 2)}`;
  }).join('\n\n---\n\n');
}

/**
 * Get tool descriptions for system prompt
 */
export function getToolDescriptions() {
  return `
## Available Tools

You have access to the following tools. When you need to use a tool, include a tool call in your response using this format:
[TOOL:tool_name]{"param1": "value1", "param2": "value2"}

### Tools:

1. **web_search** - Search the web for current information
   Usage: [TOOL:web_search]{"query": "your search query"}
   Use when: You need current/recent information, facts you're unsure about, or real-time data.

2. **fetch_url** - Fetch and read content from a URL
   Usage: [TOOL:fetch_url]{"url": "https://example.com"}
   Use when: User shares a URL or asks about a specific webpage.

3. **get_current_time** - Get current date and time
   Usage: [TOOL:get_current_time]{"timezone": "America/New_York"}
   Use when: User asks about time or you need temporal context.

4. **calculate** - Perform mathematical calculations
   Usage: [TOOL:calculate]{"expression": "sqrt(144) + 5^2"}
   Use when: You need to perform any math calculations.

5. **create_file** - Create a new file with content
   Usage: [TOOL:create_file]{"filename": "script.py", "content": "print('Hello!')", "folder": ""}
   Use when: User asks to create, write, or save a file.

6. **read_file** - Read contents of a file
   Usage: [TOOL:read_file]{"filename": "notes.txt"}
   Use when: User asks to view, read, open, or show a file.

7. **modify_file** - Edit an existing file
   Usage: [TOOL:modify_file]{"filename": "notes.txt", "content": "new content", "mode": "replace"}
   Modes: "replace" (overwrite) or "append" (add to end)
   Use when: User asks to edit, update, change, or add to a file.

8. **list_files** - List files in a folder
   Usage: [TOOL:list_files]{"folder": ""}
   Use when: User asks to see files, browse, or check what exists.

9. **delete_file** - Delete a file
   Usage: [TOOL:delete_file]{"filename": "old-file.txt"}
   Use when: User explicitly asks to delete or remove a file.

10. **generate_image** - Generate an AI image from text
    Usage: [TOOL:generate_image]{"prompt": "a sunset over mountains", "style": "realistic"}
    Styles: realistic, artistic, anime, oil-painting, watercolor, digital-art, 3d-render, pixel-art
    Use when: User asks to create, generate, or make an image, picture, or artwork.

11. **generate_video** - Generate a short AI video from text
    Usage: [TOOL:generate_video]{"prompt": "a cat playing with yarn", "duration": 4}
    Duration: 2-10 seconds
    Use when: User asks to create, generate, or make a video or animation.

IMPORTANT: 
- Only use tools when necessary - don't use them for general conversation.
- After using a tool, explain the results naturally in your response.
- You can use multiple tools in one response if needed.
- For images/videos: Be creative with prompts, add details for better results.
`;
}

export default {
  AVAILABLE_TOOLS,
  webSearch,
  fetchUrl,
  getCurrentTime,
  calculate,
  createFile,
  readFile,
  modifyFile,
  listFiles,
  deleteFile,
  generateImage,
  generateVideo,
  executeTool,
  parseToolCalls,
  formatToolResults,
  getToolDescriptions,
};
