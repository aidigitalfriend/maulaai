/**
 * BUILD AGENT
 * Handles build processes, bundling, compilation, and project setup
 */

import Anthropic from '@anthropic-ai/sdk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class BuildAgent {
  constructor() {
    this.name = 'Build Agent';
    this.capabilities = [
      'Configure build tools (webpack, vite, rollup)',
      'Setup package.json',
      'Configure TypeScript',
      'Setup ESLint/Prettier',
      'Configure CI/CD pipelines',
      'Manage dependencies',
      'Optimize builds',
    ];
  }

  /**
   * Execute build task
   */
  async execute(task, context = {}) {
    const systemPrompt = `You are an expert Build Agent. Your job is to configure and optimize build processes.

CAPABILITIES:
- Configure bundlers (webpack, vite, rollup, esbuild)
- Setup package.json with correct scripts
- Configure TypeScript (tsconfig.json)
- Setup linting (ESLint) and formatting (Prettier)
- Configure testing frameworks
- Optimize production builds
- Setup CI/CD pipelines

PROJECT CONTEXT:
${context.projectType ? `Project Type: ${context.projectType}` : ''}
${context.framework ? `Framework: ${context.framework}` : ''}
${context.packageJson ? `Package.json: ${JSON.stringify(context.packageJson)}` : ''}

Respond in JSON format:
{
  "files": [
    {
      "filename": "file to create/modify",
      "content": "file content",
      "type": "create/modify"
    }
  ],
  "dependencies": {
    "dependencies": {"package": "version"},
    "devDependencies": {"package": "version"}
  },
  "scripts": {"script-name": "command"},
  "commands": ["commands to run in order"],
  "explanation": "what this configuration does",
  "optimizations": ["build optimizations applied"]
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nTASK: ${task}` }
        ]
      });

      const content = response.content[0].text;
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return {
            success: true,
            ...JSON.parse(jsonMatch[0])
          };
        }
      } catch {
        // Not JSON
      }

      return {
        success: true,
        configuration: content
      };

    } catch (error) {
      console.error('[BuildAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run a build command safely
   */
  async runBuildCommand(command, workingDir = process.cwd()) {
    // Validate command (only allow specific build commands)
    const allowedCommands = ['npm', 'yarn', 'pnpm', 'npx', 'node', 'tsc', 'eslint', 'prettier'];
    const firstWord = command.split(' ')[0];
    
    if (!allowedCommands.includes(firstWord)) {
      return {
        success: false,
        error: `Command not allowed: ${firstWord}. Allowed: ${allowedCommands.join(', ')}`
      };
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: workingDir,
        timeout: 120000, // 2 minute timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      return {
        success: true,
        stdout,
        stderr,
        command
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }

  /**
   * Analyze package.json for issues
   */
  async analyzePackageJson(packageJson, context = {}) {
    const systemPrompt = `Analyze this package.json for issues and improvements:

\`\`\`json
${JSON.stringify(packageJson, null, 2)}
\`\`\`

Return a JSON analysis:
{
  "issues": [
    {"type": "issue type", "description": "what's wrong", "fix": "how to fix"}
  ],
  "outdatedDeps": ["potentially outdated dependencies"],
  "securityConcerns": ["security-related issues"],
  "suggestions": ["improvements to make"],
  "missingScripts": ["useful scripts to add"],
  "duplicateDeps": ["dependencies that might be duplicated"]
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return {
          success: true,
          ...JSON.parse(jsonMatch[0])
        };
      }

      return {
        success: true,
        analysis: content
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default BuildAgent;
