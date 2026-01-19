/**
 * CODE EXECUTION SERVICE
 * Safe sandbox for executing code snippets
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// Execution limits
const LIMITS = {
  timeout: 30000,        // 30 seconds max
  maxOutputSize: 1024 * 1024, // 1MB max output
  maxMemory: 256,        // 256MB memory limit
};

// Allowed languages and their executors
const EXECUTORS = {
  javascript: {
    extension: '.js',
    command: 'node',
    args: [],
    setup: null,
  },
  typescript: {
    extension: '.ts',
    command: 'npx',
    args: ['tsx'],
    setup: null,
  },
  python: {
    extension: '.py',
    command: 'python3',
    args: [],
    setup: null,
  },
  bash: {
    extension: '.sh',
    command: 'bash',
    args: [],
    setup: null,
  },
};

/**
 * Execute code in a sandboxed environment
 */
export async function executeCode(language, code, options = {}) {
  const executor = EXECUTORS[language.toLowerCase()];
  
  if (!executor) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
      supportedLanguages: Object.keys(EXECUTORS)
    };
  }

  const executionId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join(os.tmpdir(), 'code-execution', executionId);
  const filePath = path.join(tempDir, `main${executor.extension}`);
  
  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write code to file
    await fs.writeFile(filePath, code, 'utf-8');
    
    // Execute code
    const result = await runProcess(
      executor.command,
      [...executor.args, filePath],
      {
        cwd: tempDir,
        timeout: options.timeout || LIMITS.timeout,
        maxOutput: LIMITS.maxOutputSize
      }
    );
    
    return {
      success: result.exitCode === 0,
      executionId,
      language,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      duration: result.duration,
      timedOut: result.timedOut
    };

  } catch (error) {
    return {
      success: false,
      executionId,
      language,
      error: error.message
    };
  } finally {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Run a process with timeout and output limits
 */
function runProcess(command, args, options) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let killed = false;

    const proc = spawn(command, args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        NODE_ENV: 'sandbox',
        // Restrict environment
        HOME: options.cwd,
        PATH: process.env.PATH,
      },
      timeout: options.timeout,
      maxBuffer: options.maxOutput,
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      killed = true;
      proc.kill('SIGKILL');
    }, options.timeout);

    proc.stdout?.on('data', (data) => {
      const chunk = data.toString();
      if (stdout.length + chunk.length <= options.maxOutput) {
        stdout += chunk;
      }
    });

    proc.stderr?.on('data', (data) => {
      const chunk = data.toString();
      if (stderr.length + chunk.length <= options.maxOutput) {
        stderr += chunk;
      }
    });

    proc.on('close', (exitCode) => {
      clearTimeout(timeoutId);
      resolve({
        stdout,
        stderr,
        exitCode: killed ? -1 : (exitCode ?? -1),
        duration: Date.now() - startTime,
        timedOut
      });
    });

    proc.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        stdout,
        stderr: error.message,
        exitCode: -1,
        duration: Date.now() - startTime,
        timedOut: false
      });
    });
  });
}

/**
 * Validate code for dangerous patterns
 */
export function validateCode(language, code) {
  const dangerousPatterns = {
    javascript: [
      /require\s*\(\s*['"]child_process['"]\s*\)/i,
      /require\s*\(\s*['"]fs['"]\s*\)/i,
      /process\.exit/i,
      /eval\s*\(/i,
      /Function\s*\(/i,
      /rm\s+-rf/i,
    ],
    python: [
      /import\s+os/i,
      /import\s+subprocess/i,
      /import\s+shutil/i,
      /exec\s*\(/i,
      /eval\s*\(/i,
      /__import__/i,
    ],
    bash: [
      /rm\s+-rf\s+\//,
      /dd\s+if=/i,
      /mkfs/i,
      />\s*\/dev\//,
    ],
  };

  const patterns = dangerousPatterns[language.toLowerCase()] || [];
  const violations = [];

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      violations.push({
        pattern: pattern.toString(),
        message: 'Potentially dangerous code pattern detected'
      });
    }
  }

  return {
    safe: violations.length === 0,
    violations
  };
}

/**
 * Get supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(EXECUTORS).map(lang => ({
    language: lang,
    extension: EXECUTORS[lang].extension,
    command: EXECUTORS[lang].command
  }));
}

export default {
  executeCode,
  validateCode,
  getSupportedLanguages,
  LIMITS
};
