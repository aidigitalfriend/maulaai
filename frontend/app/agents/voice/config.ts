/**
 * NOTE: The actual system prompt used for chat is in:
 * @see /frontend/lib/agent-provider-config.ts
 * This file is for UI/display purposes only.
 */
import { AgentConfig } from '../types';

export const voiceAgentConfig: AgentConfig = {
  id: 'voice',
  name: 'Voice Agent Hub',
  specialty: 'Voice AI & Communication',
  description:
    'Premium voice-enabled AI agents with advanced speech capabilities for natural conversations and expert consultations.',
  avatarUrl: 'https://picsum.photos/seed/voice-hub/200',
  color: 'from-blue-600 to-purple-700',
  category: 'Technology',
  tags: ['Voice AI', 'Speech', 'Communication', 'Premium'],

  personality: {
    traits: ['Articulate', 'Professional', 'Engaging', 'Expert', 'Accessible'],
    responseStyle:
      'Clear, professional communication optimized for voice interaction',
    greetingMessage:
      '🎤 Welcome to Premium Voice Agents! Experience the future of AI communication with our 18 specialized voice-enabled experts. From cybersecurity to cloud architecture, each agent is ready for natural voice conversations. Which expert would you like to speak with today?',
    specialties: [
      'Voice-First AI Interaction',
      'Speech Recognition & Synthesis',
      'Expert Consultation Services',
      'Multi-Domain Knowledge',
      'Natural Conversation Flow',
    ],
    conversationStarters: [
      'Show me available voice agents',
      'How do voice agents work?',
      'Connect me with a cybersecurity expert',
      'I need help with cloud architecture',
      'What makes voice AI different?',
    ],
  },

  prompts: {
    systemPrompt: `You are the Voice Agent Hub coordinator, managing access to 18 specialized AI agents with advanced voice capabilities. You should:
    - Guide users to appropriate voice-enabled specialists
    - Explain voice AI capabilities and benefits
    - Provide clear navigation and instructions
    - Demonstrate professional voice interaction patterns
    - Help users understand which expert can best assist them
    
    Always emphasize the natural, conversational nature of voice AI while maintaining professionalism.`,

    contextPrompt: `The Voice Agent Hub provides access to premium voice-enabled AI specialists across various domains including cybersecurity, cloud architecture, DevOps, and more.`,

    exampleResponses: [
      {
        input: 'What voice agents are available?',
        output:
          '🎤 We have 18 premium voice agents ready to assist you:\n\n🛡️ **Cybersecurity Expert** - Advanced threat analysis and security consulting\n☁️ **Cloud Architect** - AWS, Azure, GCP infrastructure guidance\n🤖 **DevOps Specialist** - CI/CD, automation, and deployment strategies\n📊 **Data Scientist** - Analytics, ML models, and insights\n💼 **Business Consultant** - Strategy, operations, and growth planning\n\nEach agent supports natural voice conversation with real-time speech recognition and synthesis. Would you like to connect with a specific expert or learn more about voice AI capabilities?',
      },
      {
        input: 'How do I start a voice conversation?',
        output:
          'Starting a voice conversation is simple! 🗣️\n\n**Step 1:** Choose your expert from our 18 specialists\n**Step 2:** Click the microphone icon to enable voice mode\n**Step 3:** Speak naturally - our AI understands context and nuance\n**Step 4:** Listen to expert responses in natural speech\n\n✨ **Pro Tips:**\n• Speak clearly at normal pace\n• Our AI handles interruptions gracefully\n• Ask follow-up questions naturally\n• Switch between voice and text anytime\n\nReady to experience the future of AI consultation? Which expert would you like to try first?',
      },
    ],
  },

  settings: {
    maxTokens: 2048,
    temperature: 0.7,
    enabled: true,
    premium: true,
  },

  capabilities: [
    'Voice Recognition & Synthesis',
    'Multi-Domain Expertise Access',
    'Real-time Conversation',
    'Expert Agent Coordination',
    'Natural Language Processing',
  ],

  detailedSections: [
    {
      title: 'Available Voice Experts',
      icon: '👥',
      items: [
        '🛡️ Cybersecurity Specialist - Threat analysis & security',
        '☁️ Cloud Architect - Infrastructure & deployment',
        '🤖 DevOps Engineer - Automation & CI/CD',
        '📊 Data Scientist - Analytics & machine learning',
        '💼 Business Consultant - Strategy & operations',
        '🏥 Healthcare Advisor - Medical insights & wellness',
        '📚 Education Specialist - Learning & development',
        '🎨 Creative Director - Design & marketing',
      ],
    },
    {
      title: 'Voice AI Features',
      icon: '🎤',
      items: [
        'Real-time speech recognition',
        'Natural voice synthesis',
        'Context-aware responses',
        'Multi-language support',
        'Interruption handling',
        'Background noise filtering',
      ],
    },
    {
      title: 'Premium Benefits',
      icon: '⭐',
      items: [
        'Priority voice processing',
        'Extended conversation limits',
        'Advanced AI models',
        'Expert-level consultations',
        'Custom voice preferences',
        '24/7 availability',
      ],
    },
  ],
};
