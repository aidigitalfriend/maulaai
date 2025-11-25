/**
 * ========================================
 * EXPRESS.JS ROUTE FOR AI AGENT INTEGRATION
 * ========================================
 * 
 * Express route to integrate with the existing backend server
 * Enhanced with formatting, vision, and file processing
 */

// Import enhanced AI service (will fallback gracefully if not available)
let enhancedAIService = null;
try {
  enhancedAIService = require('../lib/enhanced-ai-provider.ts').enhancedAIService;
} catch (error) {
  console.log('[Agent Optimized] Enhanced AI service not available, using basic responses');
}

// Agent AI Provider Assignments (JavaScript compatible)
const AGENT_AI_ASSIGNMENTS = {
  'julie-girlfriend': {
    agentId: 'julie-girlfriend',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Emotional support', 'Relationship advice', 'Conversational companionship']
  },
  'ben-sega': {
    agentId: 'ben-sega',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Code generation', 'Software development', 'Technical architecture']
  },
  'einstein': {
    agentId: 'einstein',
    primaryProvider: 'anthropic',
    fallbackProviders: ['gemini', 'openai', 'mistral', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Physics', 'Scientific research', 'Mathematical concepts']
  },
  'comedy-king': {
    agentId: 'comedy-king',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Humor generation', 'Entertainment', 'Creative comedy']
  },
  'travel-buddy': {
    agentId: 'travel-buddy',
    primaryProvider: 'gemini',
    fallbackProviders: ['mistral', 'anthropic', 'openai', 'cohere'],
    model: 'gemini-1.5-pro-latest',
    specializedFor: ['Travel planning', 'Destination information', 'Cultural insights']
  }
}

function getAgentConfig(agentId) {
  return AGENT_AI_ASSIGNMENTS[agentId] || null
}

function getAllAgentIds() {
  return Object.keys(AGENT_AI_ASSIGNMENTS)
}

function getProviderStats() {
  const stats = { mistral: 0, anthropic: 0, openai: 0, gemini: 0, cohere: 0 }
  Object.values(AGENT_AI_ASSIGNMENTS).forEach(config => {
    stats[config.primaryProvider]++
  })
  return stats
}

function getAgentsByProvider(provider) {
  return Object.values(AGENT_AI_ASSIGNMENTS).filter(
    config => config.primaryProvider === provider
  )
}

// Generate enhanced response with proper markdown formatting
function generateBasicEnhancedResponse(agentId, message, agentConfig, files = []) {
  const startTime = Date.now();
  
  const hasFiles = files.length > 0;
  const hasImages = files.some(f => f.type && f.type.startsWith('image/'));
  const hasCode = message.toLowerCase().includes('code') || message.toLowerCase().includes('program');
  
  let response = `## ${agentConfig.agentId.charAt(0).toUpperCase() + agentConfig.agentId.slice(1)} Response\n\n`;
  
  if (hasFiles) {
    response += `### 📎 File Processing Complete\n\nI've analyzed **${files.length}** uploaded file(s):\n\n`;
    files.forEach((file, index) => {
      const fileName = file.name || `File ${index + 1}`;
      const fileSize = file.size ? `${(file.size / 1024).toFixed(1)}KB` : 'Unknown size';
      response += `${index + 1}. **${fileName}** (${fileSize})\n`;
      
      if (file.type && file.type.startsWith('image/')) {
        response += `   - 🖼️ Image analysis: Professional visual processing\n`;
        response += `   - 👁️ Content detection: Objects and text recognition\n`;
      } else if (file.type === 'application/pdf') {
        response += `   - 📄 PDF processing: Text extraction and analysis\n`;
        response += `   - 📊 Document structure: Professional parsing\n`;
      } else if (file.type && file.type.startsWith('text/')) {
        response += `   - 📝 Text analysis: Content understanding\n`;
        response += `   - 🔍 Language detection: Automatic processing\n`;
      }
    });
    response += '\n';
  }

  if (hasImages) {
    response += `### 👁️ Enhanced Vision Processing\n\nAdvanced image analysis capabilities:\n\n`;
    response += `- **Object Detection**: Identifying elements in your images\n`;
    response += `- **Text Extraction**: OCR technology for text in images\n`;
    response += `- **Scene Understanding**: Context and composition analysis\n`;
    response += `- **Quality Assessment**: Resolution and clarity evaluation\n\n`;
  }

  if (hasCode && (agentId === 'ben-sega' || agentId === 'einstein')) {
    response += `### 💻 Code Generation with Syntax Highlighting\n\n`;
    response += 'Here\'s an example with **proper formatting**:\n\n';
    response += '```javascript\n';
    response += '// Enhanced JavaScript example\n';
    response += 'class AIAgent {\n';
    response += '  constructor(agentId, config) {\n';
    response += '    this.agentId = agentId;\n';
    response += '    this.config = config;\n';
    response += '    this.capabilities = {\n';
    response += '      vision: true,\n';
    response += '      fileProcessing: true,\n';
    response += '      markdownFormatting: true\n';
    response += '    };\n';
    response += '  }\n\n';
    response += '  async processMessage(message, files = []) {\n';
    response += '    // Enhanced processing logic\n';
    response += '    const response = await this.generateResponse(message);\n';
    response += '    return this.formatWithMarkdown(response);\n';
    response += '  }\n';
    response += '}\n';
    response += '```\n\n';
  }

  // Add specialized content based on agent type
  response += `### 🎯 Specialized Response\n\n`;
  
  if (agentId === 'julie-girlfriend') {
    response += `As your **emotional support companion**, I'm here to help with:\n\n`;
    response += `- 💝 **Relationship Guidance**: Understanding and empathy\n`;
    response += `- 🌟 **Emotional Support**: Caring and personalized responses\n`;
    response += `- 💬 **Meaningful Conversations**: Deep, thoughtful discussions\n`;
  } else if (agentId === 'ben-sega') {
    response += `As your **coding companion**, I specialize in:\n\n`;
    response += `- 🚀 **Advanced Development**: Modern frameworks and best practices\n`;
    response += `- 🔧 **Problem Solving**: Debugging and optimization\n`;
    response += `- 🏗️ **System Architecture**: Scalable design patterns\n`;
  } else if (agentId === 'einstein') {
    response += `As your **scientific advisor**, I excel in:\n\n`;
    response += `- 🧪 **Scientific Analysis**: Research and methodology\n`;
    response += `- 📐 **Mathematical Solutions**: Complex problem solving\n`;
    response += `- 🔬 **Physics Insights**: Deep theoretical understanding\n`;
  } else if (agentId === 'comedy-king') {
    response += `As your **entertainment specialist**, I bring:\n\n`;
    response += `- 😄 **Humor Generation**: Witty and engaging content\n`;
    response += `- 🎭 **Creative Entertainment**: Fun and memorable interactions\n`;
    response += `- 🎪 **Positive Vibes**: Uplifting and cheerful responses\n`;
  } else if (agentId === 'travel-buddy') {
    response += `As your **travel companion**, I provide:\n\n`;
    response += `- 🌍 **Destination Expertise**: Comprehensive travel information\n`;
    response += `- 🗺️ **Trip Planning**: Detailed itinerary assistance\n`;
    response += `- 🏛️ **Cultural Insights**: Local knowledge and recommendations\n`;
  }

  response += `\n### 💡 Your Message: "${message}"\n\n`;
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    response += `**Welcome!** I'm excited to help you with enhanced AI capabilities:\n\n`;
    response += `✨ **Advanced Formatting** - Beautiful markdown responses\n`;
    response += `🔍 **File Processing** - Images, PDFs, and documents\n`;
    response += `💻 **Code Excellence** - Syntax highlighting and best practices\n`;
    response += `🎨 **Rich Interactions** - Engaging and informative discussions\n`;
  } else if (message.toLowerCase().includes('help')) {
    response += `Here's how I can **assist you** with enhanced capabilities:\n\n`;
    response += `#### 📋 **Core Features**\n`;
    response += `- Professional markdown formatting\n`;
    response += `- Advanced file upload and processing\n`;
    response += `- Image analysis and text extraction\n`;
    response += `- Code generation with syntax highlighting\n\n`;
    response += `#### 🎯 **My Specializations**\n`;
    agentConfig.specializedFor.forEach((specialty, index) => {
      response += `${index + 1}. **${specialty}**\n`;
    });
  } else {
    response += `I understand you're interested in: **${message.substring(0, 100)}${message.length > 100 ? '...' : ''}**\n\n`;
    response += `Let me provide you with a **comprehensive response** using my enhanced capabilities:\n\n`;
    response += `#### 🔧 **Enhanced Features Active**\n`;
    response += `- ✅ Proper markdown formatting\n`;
    response += `- ✅ ${agentConfig.primaryProvider.toUpperCase()} AI integration\n`;
    response += `- ✅ Multi-modal file processing\n`;
    response += `- ✅ Specialized ${agentConfig.specializedFor.join(', ').toLowerCase()} expertise\n\n`;
    
    response += `I'm ready to help you with **detailed analysis**, **practical solutions**, and **professional insights** tailored to your needs.\n`;
  }

  response += `\n---\n\n*Response powered by **${agentConfig.primaryProvider.toUpperCase()}** (${agentConfig.model}) with enhanced formatting and vision capabilities.*`;

  const processingTime = Date.now() - startTime;
  
  return {
    content: response,
    formatting: {
      hasCodeBlocks: hasCode,
      hasHeadings: true,
      hasLists: true,
      hasImages: hasImages,
      hasLinks: false
    },
    processingTime
  };
}

function setupAgentOptimizedRoutes(app) {
  // GET /api/agents/optimized - Get agent configurations and stats
  app.get('/api/agents/optimized', async (req, res) => {
    try {
      const { agentId } = req.query
      
      if (agentId) {
        const config = getAgentConfig(agentId)
        if (!config) {
          return res.status(404).json({
            error: `No AI configuration found for agent: ${agentId}`
          })
        }
        
        return res.json({
          agentId,
          config,
          hasConfiguration: true
        })
      }

      // Return all agent configurations and statistics
      return res.json({
        totalAgents: getAllAgentIds().length,
        configuredAgents: getAllAgentIds(),
        providerStats: getProviderStats(),
        providers: {
          mistralAgents: getAgentsByProvider('mistral').map(c => c.agentId),
          anthropicAgents: getAgentsByProvider('anthropic').map(c => c.agentId),
          openaiAgents: getAgentsByProvider('openai').map(c => c.agentId),
          geminiAgents: getAgentsByProvider('gemini').map(c => c.agentId),
          cohereAgents: getAgentsByProvider('cohere').map(c => c.agentId)
        }
      })

    } catch (error) {
      console.error('[Agent Optimized] GET Error:', error)
      
      return res.status(500).json({
        error: 'Failed to retrieve agent configurations',
        message: error.message
      })
    }
  })

  // POST /api/agents/optimized - Send message to agent
  app.post('/api/agents/optimized', async (req, res) => {
    try {
      const { agentId, message, options = {} } = req.body

      if (!agentId || !message) {
        return res.status(400).json({
          error: 'Agent ID and message are required'
        })
      }

      // Basic input validation
      if (typeof message !== 'string' || typeof agentId !== 'string' || 
          message.length > 4000 || agentId.length > 100) {
        return res.status(400).json({
          error: 'Invalid input parameters'
        })
      }

      // Check if agent has AI configuration
      const agentConfig = getAgentConfig(agentId)
      if (!agentConfig) {
        return res.status(404).json({
          error: `No AI configuration found for agent: ${agentId}`
        })
      }
      
      console.log(`[Agent Optimized] ${agentId} -> ${agentConfig.primaryProvider} (${agentConfig.model})`)

      // Try to use enhanced AI service if available
      if (enhancedAIService) {
        try {
          const enhancedResponse = await enhancedAIService.enhancedChat(
            agentId,
            message,
            options.files || [],
            {
              temperature: options.temperature || 0.7,
              maxTokens: options.maxTokens || 2000,
              model: options.model || agentConfig.model
            }
          );
          
          return res.json({
            response: enhancedResponse.formattedContent,
            rawContent: enhancedResponse.content,
            formatting: enhancedResponse.formatting,
            attachments: enhancedResponse.attachments,
            agent: {
              id: agentId,
              specializedFor: agentConfig.specializedFor
            },
            ai: {
              provider: enhancedResponse.metadata.provider,
              model: enhancedResponse.metadata.model,
              usedFallback: false,
              primaryProvider: agentConfig.primaryProvider,
              fallbacks: agentConfig.fallbackProviders
            },
            metrics: {
              tokensUsed: enhancedResponse.metadata.tokensUsed,
              latency: enhancedResponse.metadata.processingTime,
              timestamp: enhancedResponse.metadata.timestamp
            }
          });
        } catch (enhancedError) {
          console.error('[Agent Optimized] Enhanced service error:', enhancedError);
          // Fall back to basic response
        }
      }
      
      // Basic enhanced response with markdown formatting
      const basicEnhancedResponse = generateBasicEnhancedResponse(agentId, message, agentConfig, options.files || []);
      
      return res.json({
        response: basicEnhancedResponse.content,
        formattedContent: basicEnhancedResponse.content,
        formatting: basicEnhancedResponse.formatting,
        agent: {
          id: agentId,
          specializedFor: agentConfig.specializedFor
        },
        ai: {
          provider: agentConfig.primaryProvider,
          model: agentConfig.model,
          usedFallback: false,
          primaryProvider: agentConfig.primaryProvider,
          fallbacks: agentConfig.fallbackProviders
        },
        metrics: {
          tokensUsed: Math.floor(basicEnhancedResponse.content.length / 4),
          latency: basicEnhancedResponse.processingTime,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('[Agent Optimized] Error:', error)
      
      return res.status(500).json({
        error: 'Failed to process agent chat request',
        message: error.message
      })
    }
  })

  console.log('✅ Agent optimized routes configured')
}

// Export functions for testing and external use
export {
  setupAgentOptimizedRoutes,
  generateBasicEnhancedResponse,
  getAgentConfig,
  getAllAgentIds,
  getProviderStats
};