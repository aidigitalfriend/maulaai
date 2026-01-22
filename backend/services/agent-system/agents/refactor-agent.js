/**
 * REFACTOR AGENT
 * Improves existing code structure, readability, and performance
 */

import Anthropic from '@anthropic-ai/sdk';

class RefactorAgent {
  constructor() {
    this.name = 'Refactor Agent';
    this.capabilities = [
      'Improve code readability',
      'Optimize performance',
      'Apply design patterns',
      'Remove code duplication',
      'Modernize syntax',
      'Split large functions',
      'Improve error handling',
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
   * Execute refactoring task
   */
  async execute(task, context = {}) {
    const systemPrompt = `You are an expert Refactor Agent. Your job is to improve existing code without changing its functionality.

CAPABILITIES:
- Improve readability and maintainability
- Optimize performance (time & space complexity)
- Apply SOLID principles
- Remove code smells and anti-patterns
- Modernize syntax (ES6+, async/await, etc.)
- Extract reusable functions/components
- Improve type safety

REFACTORING RULES:
1. Never change external behavior
2. Preserve all functionality
3. Improve code quality metrics
4. Add/improve documentation
5. Make incremental, safe changes
6. Explain each refactoring decision

CODE TO REFACTOR:
${context.code || 'See task description'}

Respond in JSON format:
{
  "refactoredCode": "the improved code",
  "changes": [
    {"type": "change type", "description": "what was changed", "reason": "why"}
  ],
  "improvements": {
    "readability": "description of readability improvements",
    "performance": "description of performance improvements",
    "maintainability": "description of maintainability improvements"
  },
  "warnings": ["any potential issues to be aware of"],
  "suggestions": ["additional improvements that could be made"]
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
        refactoredCode: content,
        changes: ['See refactored code for details']
      };

    } catch (error) {
      console.error('[RefactorAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze code for refactoring opportunities
   */
  async analyze(code, context = {}) {
    const systemPrompt = `Analyze this code and identify refactoring opportunities:

\`\`\`
${code}
\`\`\`

Return a JSON list of opportunities:
{
  "opportunities": [
    {
      "type": "type of refactoring",
      "location": "where in the code",
      "currentIssue": "what's wrong",
      "suggestedFix": "how to improve",
      "impact": "low/medium/high",
      "effort": "low/medium/high"
    }
  ],
  "overallScore": 1-10,
  "priorityOrder": ["list of types in order of priority"]
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

export default RefactorAgent;
