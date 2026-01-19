/**
 * TEST AGENT
 * Generates unit tests, integration tests, and test suites
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class TestAgent {
  constructor() {
    this.name = 'Test Agent';
    this.capabilities = [
      'Generate unit tests',
      'Create integration tests',
      'Write E2E tests',
      'Generate test data/fixtures',
      'Create mock implementations',
      'Test edge cases',
      'Coverage analysis',
    ];
    this.frameworks = ['jest', 'mocha', 'vitest', 'pytest', 'playwright', 'cypress'];
  }

  /**
   * Execute test generation task
   */
  async execute(task, context = {}) {
    const framework = context.framework || 'jest';
    
    const systemPrompt = `You are an expert Test Agent. Your job is to write comprehensive tests.

CAPABILITIES:
- Write unit tests with high coverage
- Create integration tests
- Generate meaningful test data
- Create mock implementations
- Test edge cases and error scenarios
- Follow testing best practices (AAA pattern)

TESTING FRAMEWORK: ${framework}

CODE TO TEST:
${context.code || 'See task description'}

TESTING GUIDELINES:
1. Follow Arrange-Act-Assert pattern
2. Test happy path and edge cases
3. Test error handling
4. Use descriptive test names
5. Create reusable fixtures
6. Mock external dependencies
7. Aim for high code coverage

Respond in JSON format:
{
  "tests": "the complete test code",
  "filename": "suggested test filename",
  "framework": "testing framework used",
  "coverage": {
    "functions": ["list of functions tested"],
    "scenarios": ["list of scenarios covered"],
    "edgeCases": ["edge cases tested"]
  },
  "mocks": ["mocks created"],
  "fixtures": "test data/fixtures code",
  "runCommand": "command to run tests"
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
        tests: content,
        framework
      };

    } catch (error) {
      console.error('[TestAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate tests for specific code
   */
  async generateTests(code, options = {}) {
    const { framework = 'jest', type = 'unit' } = options;
    
    return this.execute(`Generate ${type} tests for this code`, {
      code,
      framework
    });
  }

  /**
   * Generate mock implementations
   */
  async generateMocks(interfaces, context = {}) {
    const task = `Create mock implementations for these interfaces/types:\n${interfaces}`;
    return this.execute(task, context);
  }

  /**
   * Analyze test coverage gaps
   */
  async analyzeCoverage(code, existingTests, context = {}) {
    const systemPrompt = `Analyze the test coverage for this code:

CODE:
\`\`\`
${code}
\`\`\`

EXISTING TESTS:
\`\`\`
${existingTests}
\`\`\`

Return a JSON analysis:
{
  "coverageGaps": [
    {
      "function": "function name",
      "missingScenarios": ["scenarios not tested"],
      "missingEdgeCases": ["edge cases not tested"]
    }
  ],
  "suggestedTests": ["additional tests to write"],
  "estimatedCoverage": "percentage estimate",
  "priority": ["tests to add in priority order"]
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

export default TestAgent;
