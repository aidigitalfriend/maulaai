/**
 * DEPLOY AGENT
 * Manages deployment to servers, cloud platforms, and production environments
 */

import Anthropic from '@anthropic-ai/sdk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class DeployAgent {
  constructor() {
    this.name = 'Deploy Agent';
    this.capabilities = [
      'Configure deployment pipelines',
      'Setup Docker containers',
      'Configure cloud platforms (AWS, Vercel, etc.)',
      'Setup environment variables',
      'Configure NGINX/reverse proxies',
      'Manage SSL certificates',
      'Setup monitoring and logging',
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
   * Execute deployment task
   */
  async execute(task, context = {}) {
    const systemPrompt = `You are an expert Deploy Agent. Your job is to configure and manage deployments.

CAPABILITIES:
- Configure deployment pipelines (GitHub Actions, GitLab CI, etc.)
- Setup Docker containers and compose files
- Configure cloud platforms (AWS, GCP, Azure, Vercel, Railway)
- Setup NGINX reverse proxy configurations
- Manage environment variables securely
- Configure SSL/TLS certificates
- Setup PM2 process management
- Configure monitoring and alerts

PROJECT CONTEXT:
${context.platform ? `Target Platform: ${context.platform}` : ''}
${context.projectType ? `Project Type: ${context.projectType}` : ''}
${context.currentConfig ? `Current Config: ${JSON.stringify(context.currentConfig)}` : ''}

Respond in JSON format:
{
  "files": [
    {
      "filename": "deployment file to create",
      "content": "file content",
      "description": "what this file does"
    }
  ],
  "envVariables": [
    {"name": "VAR_NAME", "description": "what it's for", "required": true/false}
  ],
  "deploySteps": [
    {"step": 1, "command": "command to run", "description": "what it does"}
  ],
  "preDeployChecks": ["checks to run before deploying"],
  "rollbackPlan": "how to rollback if deployment fails",
  "monitoring": {
    "healthCheck": "health check endpoint",
    "alerts": ["alerts to configure"]
  }
}`;

    try {
      const response = await this.anthropic.messages.create({
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
      console.error('[DeployAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate Dockerfile
   */
  async generateDockerfile(projectType, context = {}) {
    return this.execute(`Create a production-ready Dockerfile for a ${projectType} project`, context);
  }

  /**
   * Generate GitHub Actions workflow
   */
  async generateGitHubActions(requirements, context = {}) {
    return this.execute(`Create a GitHub Actions CI/CD workflow: ${requirements}`, context);
  }

  /**
   * Generate NGINX configuration
   */
  async generateNginxConfig(requirements, context = {}) {
    return this.execute(`Create NGINX configuration: ${requirements}`, context);
  }

  /**
   * Check deployment readiness
   */
  async checkDeploymentReadiness(projectPath, context = {}) {
    const systemPrompt = `Analyze this project for deployment readiness:

Project Path: ${projectPath}
${context.packageJson ? `Package.json: ${JSON.stringify(context.packageJson)}` : ''}
${context.envExample ? `Environment variables: ${context.envExample}` : ''}

Return a JSON checklist:
{
  "ready": true/false,
  "checklist": [
    {
      "item": "checklist item",
      "status": "pass/fail/warning",
      "details": "explanation"
    }
  ],
  "blockers": ["critical issues that must be fixed"],
  "warnings": ["non-critical issues to be aware of"],
  "recommendations": ["suggestions for better deployment"]
}`;

    try {
      const response = await this.anthropic.messages.create({
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

export default DeployAgent;
