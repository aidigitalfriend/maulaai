/**
 * CODE GENERATION AGENT
 * Generates new code based on requirements, specifications, or descriptions
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class CodeGenerationAgent {
  constructor() {
    this.name = 'Code Generation Agent';
    this.capabilities = [
      'Generate functions and classes',
      'Create React/Vue/Angular components',
      'Build API endpoints',
      'Write database queries',
      'Create utility scripts',
      'Implement algorithms',
      'Generate TypeScript interfaces',
    ];
  }

  /**
   * Execute code generation task
   */
  async execute(task, context = {}) {
    const systemPrompt = `You are an expert Code Generation Agent. Your job is to write high-quality, production-ready code.

CAPABILITIES:
- Generate clean, efficient, well-documented code
- Follow best practices and design patterns
- Support multiple languages (JavaScript, TypeScript, Python, etc.)
- Create complete implementations with error handling
- Include TypeScript types when applicable

GUIDELINES:
1. Write production-ready code, not pseudo-code
2. Include proper error handling
3. Add JSDoc/TSDoc comments
4. Follow the project's coding style if context provided
5. Include import statements
6. Make code modular and testable

CONTEXT:
${context.files ? `Files in context: ${JSON.stringify(context.files)}` : 'No file context provided'}
${context.language ? `Preferred language: ${context.language}` : ''}
${context.framework ? `Framework: ${context.framework}` : ''}

Respond in JSON format:
{
  "code": "the generated code",
  "language": "detected/used language",
  "filename": "suggested filename",
  "dependencies": ["list of required packages"],
  "explanation": "brief explanation of the code",
  "usage": "example usage of the generated code"
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
      
      // Try to parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return {
            success: true,
            ...JSON.parse(jsonMatch[0])
          };
        }
      } catch {
        // Not JSON, return as plain code
      }

      return {
        success: true,
        code: content,
        language: context.language || 'javascript',
        explanation: 'Code generated successfully'
      };

    } catch (error) {
      console.error('[CodeGenerationAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a specific type of code
   */
  async generateSpecific(type, requirements, context = {}) {
    const templates = {
      function: `Create a function that ${requirements}`,
      class: `Create a class that ${requirements}`,
      component: `Create a React component that ${requirements}`,
      api: `Create an API endpoint that ${requirements}`,
      hook: `Create a React hook that ${requirements}`,
      util: `Create a utility function that ${requirements}`,
    };

    const task = templates[type] || requirements;
    return this.execute(task, context);
  }
}

export default CodeGenerationAgent;
