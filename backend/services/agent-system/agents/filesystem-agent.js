/**
 * FILE SYSTEM AGENT
 * Reads, writes, and manages files and directories
 */

import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Allowed base directories for security
const ALLOWED_BASES = [
  process.cwd(),
  '/tmp',
  process.env.WORKSPACE_DIR
].filter(Boolean);

class FileSystemAgent {
  constructor() {
    this.name = 'File System Agent';
    this.capabilities = [
      'Read files',
      'Write files',
      'Create directories',
      'List directory contents',
      'Search for files',
      'Move/rename files',
      'Delete files (with caution)',
      'Analyze file structure',
    ];
  }

  // Lazy initialization of Anthropic client
  get anthropic() {
    if (!this._anthropic) {
      this._anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this._anthropic;
  }

  /**
   * Validate path is within allowed directories
   */
  isPathAllowed(filePath) {
    const resolved = path.resolve(filePath);
    return ALLOWED_BASES.some(base => resolved.startsWith(base));
  }

  /**
   * Execute file system task
   */
  async execute(task, context = {}) {
    // Parse what operation is being requested
    const taskLower = task.toLowerCase();
    
    // Determine operation type
    if (taskLower.includes('read') || taskLower.includes('get content')) {
      return this.handleRead(task, context);
    } else if (taskLower.includes('write') || taskLower.includes('create file') || taskLower.includes('save')) {
      return this.handleWrite(task, context);
    } else if (taskLower.includes('list') || taskLower.includes('directory')) {
      return this.handleList(task, context);
    } else if (taskLower.includes('delete') || taskLower.includes('remove')) {
      return this.handleDelete(task, context);
    } else if (taskLower.includes('move') || taskLower.includes('rename')) {
      return this.handleMove(task, context);
    } else if (taskLower.includes('search') || taskLower.includes('find')) {
      return this.handleSearch(task, context);
    } else {
      // Use AI to determine operation
      return this.handleGeneric(task, context);
    }
  }

  /**
   * Handle read operations
   */
  async handleRead(task, context) {
    const filePath = context.path || this.extractPath(task);
    
    if (!filePath) {
      return {
        success: false,
        error: 'No file path specified'
      };
    }

    if (!this.isPathAllowed(filePath)) {
      return {
        success: false,
        error: 'Access to this path is not allowed'
      };
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        content,
        size: stats.size,
        modified: stats.mtime,
        extension: path.extname(filePath)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * Handle write operations
   */
  async handleWrite(task, context) {
    const filePath = context.path || this.extractPath(task);
    const content = context.content;
    
    if (!filePath) {
      return {
        success: false,
        error: 'No file path specified'
      };
    }

    if (!content) {
      return {
        success: false,
        error: 'No content to write'
      };
    }

    if (!this.isPathAllowed(filePath)) {
      return {
        success: false,
        error: 'Access to this path is not allowed'
      };
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, content, 'utf-8');
      
      return {
        success: true,
        path: filePath,
        message: `File written successfully`,
        bytesWritten: Buffer.byteLength(content)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * Handle list/directory operations
   */
  async handleList(task, context) {
    const dirPath = context.path || this.extractPath(task) || process.cwd();
    
    if (!this.isPathAllowed(dirPath)) {
      return {
        success: false,
        error: 'Access to this path is not allowed'
      };
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      const files = [];
      const directories = [];
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath).catch(() => null);
        
        const item = {
          name: entry.name,
          path: fullPath,
          size: stats?.size,
          modified: stats?.mtime
        };
        
        if (entry.isDirectory()) {
          directories.push(item);
        } else {
          files.push(item);
        }
      }
      
      return {
        success: true,
        path: dirPath,
        directories,
        files,
        totalDirectories: directories.length,
        totalFiles: files.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: dirPath
      };
    }
  }

  /**
   * Handle delete operations (with safeguards)
   */
  async handleDelete(task, context) {
    const filePath = context.path || this.extractPath(task);
    
    if (!filePath) {
      return {
        success: false,
        error: 'No file path specified'
      };
    }

    if (!this.isPathAllowed(filePath)) {
      return {
        success: false,
        error: 'Access to this path is not allowed'
      };
    }

    // Extra safeguards for delete
    const dangerous = ['node_modules', '.git', 'package.json', '.env'];
    if (dangerous.some(d => filePath.includes(d))) {
      return {
        success: false,
        error: 'Cannot delete protected files/directories',
        path: filePath
      };
    }

    try {
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        // For directories, require explicit confirmation
        if (!context.confirmDelete) {
          return {
            success: false,
            error: 'Directory deletion requires explicit confirmation',
            requiresConfirmation: true,
            path: filePath
          };
        }
        await fs.rm(filePath, { recursive: true });
      } else {
        await fs.unlink(filePath);
      }
      
      return {
        success: true,
        path: filePath,
        message: 'Deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * Handle move/rename operations
   */
  async handleMove(task, context) {
    const sourcePath = context.sourcePath || context.path;
    const destPath = context.destPath || context.newPath;
    
    if (!sourcePath || !destPath) {
      return {
        success: false,
        error: 'Both source and destination paths are required'
      };
    }

    if (!this.isPathAllowed(sourcePath) || !this.isPathAllowed(destPath)) {
      return {
        success: false,
        error: 'Access to these paths is not allowed'
      };
    }

    try {
      await fs.rename(sourcePath, destPath);
      
      return {
        success: true,
        sourcePath,
        destPath,
        message: 'Moved/renamed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle search operations
   */
  async handleSearch(task, context) {
    const searchDir = context.path || process.cwd();
    const pattern = context.pattern || this.extractPattern(task);
    
    if (!this.isPathAllowed(searchDir)) {
      return {
        success: false,
        error: 'Access to this path is not allowed'
      };
    }

    try {
      const matches = [];
      await this.searchRecursive(searchDir, pattern, matches, 0, 5); // max depth 5
      
      return {
        success: true,
        searchDir,
        pattern,
        matches,
        totalMatches: matches.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Recursive file search
   */
  async searchRecursive(dir, pattern, matches, depth, maxDepth) {
    if (depth > maxDepth) return;
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules and .git
        if (['node_modules', '.git', '.next'].includes(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.name.includes(pattern) || entry.name.match(new RegExp(pattern, 'i'))) {
          matches.push({
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory()
          });
        }
        
        if (entry.isDirectory()) {
          await this.searchRecursive(fullPath, pattern, matches, depth + 1, maxDepth);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  /**
   * Handle generic/complex file operations using AI
   */
  async handleGeneric(task, context) {
    const systemPrompt = `You are a File System Agent. Analyze this request and determine the file operation needed.

Task: ${task}
Context: ${JSON.stringify(context)}

Return a JSON response:
{
  "operation": "read|write|list|delete|move|search|analyze",
  "path": "file/directory path",
  "content": "content to write (if applicable)",
  "additionalParams": {}
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Execute the determined operation
        return this.execute(parsed.operation, {
          ...context,
          ...parsed,
          ...parsed.additionalParams
        });
      }

      return {
        success: false,
        error: 'Could not determine file operation'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract file path from task description
   */
  extractPath(task) {
    // Look for common path patterns
    const patterns = [
      /['"]([^'"]+\.[a-zA-Z]+)['"]/,  // Quoted path with extension
      /['"]([^'"\/]+\/[^'"]+)['"]/,     // Quoted path with slash
      /(\S+\.[a-zA-Z]{1,5})/,          // Path with extension
      /\/(\S+)/,                         // Absolute path
    ];

    for (const pattern of patterns) {
      const match = task.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Extract search pattern from task
   */
  extractPattern(task) {
    const patterns = [
      /find\s+['"]?([^'"]+)['"]?/i,
      /search\s+for\s+['"]?([^'"]+)['"]?/i,
      /named\s+['"]?([^'"]+)['"]?/i,
    ];

    for (const pattern of patterns) {
      const match = task.match(pattern);
      if (match) return match[1];
    }

    return '';
  }
}

export default FileSystemAgent;
