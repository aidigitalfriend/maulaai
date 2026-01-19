/**
 * UI AGENT
 * Generates React components, HTML, CSS, and UI/UX code
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class UIAgent {
  constructor() {
    this.name = 'UI Agent';
    this.capabilities = [
      'Generate React components',
      'Create HTML/CSS layouts',
      'Build Tailwind CSS designs',
      'Create responsive layouts',
      'Generate form components',
      'Build navigation/menus',
      'Create data tables',
      'Design modal/dialogs',
    ];
    this.frameworks = ['react', 'vue', 'svelte', 'html', 'nextjs'];
    this.styling = ['tailwind', 'css', 'scss', 'styled-components'];
  }

  /**
   * Execute UI generation task
   */
  async execute(task, context = {}) {
    const framework = context.framework || 'react';
    const styling = context.styling || 'tailwind';
    
    const systemPrompt = `You are an expert UI Agent. Your job is to create beautiful, functional UI components.

CAPABILITIES:
- Create React/Vue/Svelte components
- Build responsive layouts
- Design with Tailwind CSS
- Create accessible components (ARIA)
- Implement animations and transitions
- Handle form validation
- Create reusable component patterns

FRAMEWORK: ${framework}
STYLING: ${styling}

DESIGN PRINCIPLES:
1. Mobile-first responsive design
2. Accessibility (WCAG 2.1)
3. Clean, modern aesthetics
4. Consistent spacing and typography
5. Interactive feedback (hover, focus states)
6. Dark mode support where applicable

COMPONENT CONTEXT:
${context.existingComponents ? `Existing components: ${context.existingComponents}` : ''}
${context.designSystem ? `Design system: ${context.designSystem}` : ''}
${context.colorScheme ? `Colors: ${context.colorScheme}` : ''}

Respond in JSON format:
{
  "component": "the component code",
  "filename": "suggested filename",
  "dependencies": ["required npm packages"],
  "props": [
    {"name": "propName", "type": "type", "required": true/false, "default": "value"}
  ],
  "usage": "example usage code",
  "styling": "additional CSS if needed",
  "variants": ["possible variants/configurations"],
  "accessibility": ["accessibility features included"]
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
        component: content,
        framework,
        styling
      };

    } catch (error) {
      console.error('[UIAgent] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a specific type of component
   */
  async generateComponent(type, requirements, context = {}) {
    const componentTypes = {
      button: 'Create a button component',
      form: 'Create a form component',
      modal: 'Create a modal/dialog component',
      card: 'Create a card component',
      table: 'Create a data table component',
      navbar: 'Create a navigation bar component',
      sidebar: 'Create a sidebar component',
      dropdown: 'Create a dropdown menu component',
      tabs: 'Create a tabs component',
      accordion: 'Create an accordion component',
      toast: 'Create a toast/notification component',
      avatar: 'Create an avatar component',
      badge: 'Create a badge component',
      pagination: 'Create a pagination component',
      skeleton: 'Create a skeleton loading component',
    };

    const baseTask = componentTypes[type] || `Create a ${type} component`;
    const fullTask = `${baseTask} with these requirements: ${requirements}`;
    
    return this.execute(fullTask, context);
  }

  /**
   * Convert design to code
   */
  async designToCode(description, context = {}) {
    const task = `Convert this design description to a React component: ${description}`;
    return this.execute(task, context);
  }

  /**
   * Generate page layout
   */
  async generatePageLayout(requirements, context = {}) {
    const task = `Create a complete page layout: ${requirements}`;
    return this.execute(task, {
      ...context,
      isPageLayout: true
    });
  }

  /**
   * Improve existing component
   */
  async improveComponent(componentCode, improvements, context = {}) {
    const systemPrompt = `Improve this React component based on the requirements:

CURRENT COMPONENT:
\`\`\`
${componentCode}
\`\`\`

IMPROVEMENTS REQUESTED: ${improvements}

Return the improved component in JSON format:
{
  "component": "improved component code",
  "changes": ["list of changes made"],
  "improvements": {
    "accessibility": "accessibility improvements",
    "performance": "performance improvements",
    "ux": "UX improvements"
  }
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
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
        improvedComponent: content
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default UIAgent;
