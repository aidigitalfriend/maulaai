/**
 * DEBUG AGENT
 * Finds and fixes bugs, errors, and issues in code
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

class DebugAgent {
  constructor() {
    this.name = 'Debug Agent';
    this.capabilities = [
      'Identify bugs and errors',
      'Analyze stack traces',
      'Find logic errors',
      'Detect memory leaks',
      'Fix runtime exceptions',
      'Debug async issues',
      'Trace data flow problems',
    ];
  }

  // Lazy initialization of OpenAI client
  get openai() {
    if (!this._openai) {
      this._openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this._openai;
  }

  // Lazy initialization of Anthropic client
  get anthropic() {
    if (!this._anthropic) {
      this._anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this._anthropic;
  }

  /**
   * Execute debugging task
   */
  async execute(task, context = {}) {
    const systemPrompt = `You are an expert Debug Agent. Your job is to find and fix bugs in code.

CAPABILITIES:
- Analyze error messages and stack traces
- Identify root causes of bugs
- Find logic errors and edge cases
- Detect race conditions and async issues
- Identify memory leaks and performance bugs
- Fix security vulnerabilities

DEBUGGING PROCESS:
1. Understand the expected vs actual behavior
2. Analyze the code flow
3. Identify potential failure points
4. Narrow down to root cause
5. Propose and validate fix
6. Prevent similar issues

ERROR CONTEXT:
${context.error ? `Error: ${context.error}` : ''}
${context.stackTrace ? `Stack Trace:\n${context.stackTrace}` : ''}
${context.code ? `Code:\n${context.code}` : ''}
${context.logs ? `Logs:\n${context.logs}` : ''}

Respond in JSON format:
{
  "diagnosis": {
    "bugType": "type of bug",
    "rootCause": "explanation of what's causing the issue",
    "affectedCode": "which parts of code are affected",
    "severity": "critical/high/medium/low"
  },
  "fix": {
    "description": "what needs to be changed",
    "code": "the fixed code",
    "explanation": "why this fix works"
  },
  "prevention": {
    "testCases": ["test cases to add"],
    "improvements": ["code improvements to prevent similar bugs"]
  },
  "confidence": 0.0-1.0
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nPROBLEM: ${task}` }
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
        analysis: content
      };

    } catch (error) {
      console.error('[DebugAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze error message
   */
  async analyzeError(errorMessage, stackTrace = '', context = {}) {
    return this.execute(`Debug this error: ${errorMessage}`, {
      ...context,
      error: errorMessage,
      stackTrace
    });
  }

  /**
   * Review code for potential bugs
   */
  async reviewForBugs(code, context = {}) {
    const systemPrompt = `Review this code for potential bugs and issues:

\`\`\`
${code}
\`\`\`

Return a JSON analysis:
{
  "potentialBugs": [
    {
      "location": "line/function",
      "issue": "description",
      "severity": "critical/high/medium/low",
      "suggestedFix": "how to fix"
    }
  ],
  "edgeCases": ["edge cases not handled"],
  "securityIssues": ["security concerns"],
  "overallRisk": "low/medium/high"
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
        review: content
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default DebugAgent;
