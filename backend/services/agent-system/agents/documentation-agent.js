/**
 * DOCUMENTATION AGENT
 * Writes documentation, comments, README files, and API docs
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class DocumentationAgent {
  constructor() {
    this.name = 'Documentation Agent';
    this.capabilities = [
      'Generate README files',
      'Write API documentation',
      'Add code comments',
      'Create JSDoc/TSDoc',
      'Write user guides',
      'Generate changelog',
      'Create architecture docs',
      'Write inline documentation',
    ];
  }

  /**
   * Execute documentation task
   */
  async execute(task, context = {}) {
    const systemPrompt = `You are an expert Documentation Agent. Your job is to write clear, comprehensive documentation.

CAPABILITIES:
- Write clear README files
- Generate API documentation
- Add JSDoc/TSDoc comments
- Create user guides and tutorials
- Write architecture documentation
- Generate changelogs
- Document code inline

DOCUMENTATION PRINCIPLES:
1. Clear and concise language
2. Proper formatting (Markdown)
3. Include examples
4. Cover edge cases
5. Keep it up-to-date
6. Use consistent terminology
7. Include diagrams when helpful (as ASCII or Mermaid)

CODE CONTEXT:
${context.code ? `Code to document:\n${context.code}` : ''}
${context.projectName ? `Project: ${context.projectName}` : ''}
${context.audience ? `Target audience: ${context.audience}` : ''}

Respond in JSON format:
{
  "documentation": "the generated documentation",
  "format": "markdown/jsdoc/inline/etc",
  "sections": ["list of sections included"],
  "filename": "suggested filename (if applicable)",
  "additionalFiles": [
    {"name": "filename", "content": "content"}
  ]
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
        documentation: content,
        format: 'markdown'
      };

    } catch (error) {
      console.error('[DocumentationAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate README for a project
   */
  async generateReadme(projectInfo, context = {}) {
    const task = `Generate a comprehensive README.md file for this project:
    
Project Info:
- Name: ${projectInfo.name || 'Unknown'}
- Description: ${projectInfo.description || 'A software project'}
- Tech Stack: ${projectInfo.techStack || 'Not specified'}
- Features: ${projectInfo.features?.join(', ') || 'Not specified'}

Include sections for: Installation, Usage, Configuration, API (if applicable), Contributing, and License.`;

    return this.execute(task, context);
  }

  /**
   * Add JSDoc comments to code
   */
  async addJSDocComments(code, context = {}) {
    const task = `Add comprehensive JSDoc comments to this code:

\`\`\`
${code}
\`\`\`

Include:
- Function descriptions
- @param tags with types and descriptions
- @returns tags
- @throws tags if applicable
- @example tags with usage examples`;

    return this.execute(task, { ...context, code });
  }

  /**
   * Generate API documentation
   */
  async generateApiDocs(endpoints, context = {}) {
    const task = `Generate API documentation for these endpoints:

${JSON.stringify(endpoints, null, 2)}

Include for each endpoint:
- Method and URL
- Description
- Request parameters/body
- Response format
- Example request and response
- Error codes`;

    return this.execute(task, context);
  }

  /**
   * Generate changelog entry
   */
  async generateChangelog(changes, version, context = {}) {
    const task = `Generate a CHANGELOG entry for version ${version}:

Changes:
${changes.map(c => `- ${c}`).join('\n')}

Follow Keep a Changelog format with categories:
- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security`;

    return this.execute(task, context);
  }

  /**
   * Generate architecture documentation
   */
  async generateArchitectureDocs(systemInfo, context = {}) {
    const task = `Generate architecture documentation for this system:

${JSON.stringify(systemInfo, null, 2)}

Include:
1. System Overview
2. Component Diagram (as Mermaid)
3. Data Flow
4. Technology Stack
5. Key Design Decisions
6. Deployment Architecture`;

    return this.execute(task, context);
  }

  /**
   * Explain code
   */
  async explainCode(code, audience = 'developer', context = {}) {
    const task = `Explain this code to a ${audience}:

\`\`\`
${code}
\`\`\`

Provide:
1. High-level overview
2. Step-by-step walkthrough
3. Key concepts explained
4. Potential improvements`;

    return this.execute(task, { ...context, audience, code });
  }
}

export default DocumentationAgent;
