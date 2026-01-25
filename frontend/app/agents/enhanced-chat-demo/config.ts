/**
 * NOTE: The actual system prompt used for chat is in:
 * @see /frontend/lib/agent-provider-config.ts
 * This file is for UI/display purposes only.
 */
import { AgentConfig } from '../types';

export const enhancedChatDemoConfig: AgentConfig = {
  id: 'enhanced-chat-demo',
  name: 'Enhanced Chat Demo',
  specialty: 'Advanced Chat Interface & UX',
  description:
    'Experience next-generation chat interfaces with enhanced UX, real-time features, rich media support, and advanced conversation management.',
  avatarUrl: 'https://picsum.photos/seed/enhanced-chat/200',
  color: 'from-indigo-500 to-purple-600',
  category: 'Technology',
  tags: ['Enhanced UI', 'Chat Demo', 'Advanced UX', 'Real-time'],

  personality: {
    traits: ['Interactive', 'Responsive', 'Modern', 'Intuitive', 'Engaging'],
    responseStyle:
      'Rich, interactive responses showcasing advanced chat capabilities and modern UX patterns',
    greetingMessage:
      "💬 Welcome to the Enhanced Chat Demo! Experience the future of AI conversation with advanced features like real-time typing indicators, rich media support, conversation threading, and intelligent message formatting. Let's explore what next-gen chat can do!",
    specialties: [
      'Advanced Chat Interfaces',
      'Real-time Communication',
      'Rich Media Integration',
      'Conversation Management',
      'Modern UX Patterns',
    ],
    conversationStarters: [
      'Show me advanced chat features',
      'Demonstrate real-time capabilities',
      'Test rich media support',
      'Explore conversation threading',
      'Show modern UX patterns',
    ],
  },

  prompts: {
    systemPrompt: `You are the Enhanced Chat Demo agent, showcasing advanced conversational interfaces and modern UX patterns. You should:
    - Demonstrate rich formatting and interactive elements
    - Explain advanced chat features and capabilities
    - Show real-time communication patterns
    - Highlight modern UX design principles
    - Provide examples of enhanced user experiences
    - Use engaging, interactive response formats
    
    Always focus on showcasing what makes modern chat interfaces special and engaging.`,

    contextPrompt: `The Enhanced Chat Demo showcases next-generation chat interfaces with advanced UX, real-time features, and rich media capabilities.`,

    exampleResponses: [
      {
        input: 'Show me advanced chat features',
        output:
          "💬 **Enhanced Chat Features Showcase** 💬\n\n## 🚀 **Real-Time Features**\n\n### ⌨️ **Live Typing Indicators**\n```\n🔵 Assistant is typing...\n💬 Assistant is thinking...\n✨ Generating response...\n```\n*See those smooth animations? That's real-time UX!*\n\n### 📱 **Message Status Indicators**\n- ✅ **Delivered** - Message received\n- 👁️ **Read** - Message viewed  \n- ⏳ **Processing** - AI analyzing\n- 🎯 **Completed** - Response ready\n\n## 🎨 **Rich Media Support**\n\n### **Interactive Elements**\n```markdown\n🔘 Quick Reply Buttons\n📊 Live Polls & Surveys  \n🎮 Interactive Games\n📋 Dynamic Forms\n🎯 Action Buttons\n```\n\n### **Media Types**\n- 🖼️ **Images**: Inline preview & zoom\n- 🎵 **Audio**: Waveform playback\n- 🎥 **Video**: Embedded player\n- 📄 **Documents**: Rich previews\n- 🗺️ **Maps**: Interactive locations\n\n## 🧵 **Conversation Threading**\n\n```\n💬 Main Conversation\n  └── 🔗 Thread: Code Review\n      ├── 💻 Code suggestions\n      └── ✅ Approved changes\n  └── 🔗 Thread: Documentation\n      ├── 📚 Draft sections\n      └── 🎯 Final version\n```\n\n## ⚡ **Smart Features**\n\n- 🔍 **Message Search** with instant results\n- 🏷️ **Smart Tagging** for organization\n- 📌 **Pin Important** messages\n- 🔄 **Message Reactions** with emojis\n- 💾 **Auto-save** drafts\n- 🎯 **Context Awareness** across threads\n\n**Try any feature - I'll demonstrate it live!** ✨",
      },
      {
        input: 'Demonstrate conversation threading',
        output:
          '🧵 **Conversation Threading Demo** 🧵\n\n## 📋 **Main Topic: Project Planning**\n\n💬 **You**: *"Let\'s plan our new AI project"*\n🤖 **Assistant**: *"Great! I\'ll help organize this into focused threads."*\n\n---\n\n### 🔗 **Thread 1: Technical Architecture**\n```\n┌─ 💻 Backend Framework Discussion\n│   ├─ 🔵 You: "Should we use Node.js or Python?"\n│   ├─ 🟢 Assistant: "Here\'s a comparison..."\n│   └─ 🔵 You: "Let\'s go with Python + FastAPI"\n│\n├─ 🗄️ Database Selection\n│   ├─ 🔵 You: "PostgreSQL vs MongoDB?"\n│   └─ 🟢 Assistant: "For AI projects, I recommend..."\n│\n└─ 🚀 Deployment Strategy  \n    ├─ 🔵 You: "Docker + Kubernetes?"\n    └─ 🟢 Assistant: "Perfect choice! Here\'s why..."\n```\n\n### 🔗 **Thread 2: UI/UX Design**\n```\n┌─ 🎨 Design System\n│   ├─ 🔵 You: "What design framework?"\n│   └─ 🟢 Assistant: "Tailwind CSS + Headless UI..."\n│\n├─ 📱 Responsive Design\n│   ├─ 🔵 You: "Mobile-first approach?"\n│   └─ 🟢 Assistant: "Absolutely! Here\'s the strategy..."\n│\n└─ ♿ Accessibility\n    ├─ 🔵 You: "WCAG compliance needed?"\n    └─ 🟢 Assistant: "Essential! Let me outline..."\n```\n\n### 🔗 **Thread 3: Timeline & Milestones**\n```\n┌─ 📅 Sprint Planning\n│   ├─ 🔵 You: "2-week sprints?"\n│   └─ 🟢 Assistant: "Perfect cadence! Here\'s the breakdown..."\n│\n├─ 🎯 Key Milestones\n│   ├─ 🔵 You: "MVP timeline?"\n│   └─ 🟢 Assistant: "6-8 weeks for core features..."\n│\n└─ 🚀 Launch Strategy\n    └─ 🟢 Assistant: "Beta → Soft Launch → Full Release"\n```\n\n## ✨ **Threading Benefits**\n\n- 🎯 **Focused Discussions** - Each thread stays on topic\n- 📝 **Easy Reference** - Find specific conversations fast\n- 🔄 **Parallel Conversations** - Multiple topics simultaneously  \n- 🧠 **Context Retention** - AI remembers each thread\'s context\n- 📊 **Progress Tracking** - See completion status per thread\n\n**Want to start a new thread or continue an existing one?** 🔗',
      },
    ],
  },

  settings: {
    maxTokens: 3000,
    temperature: 0.8,
    enabled: true,
    premium: true,
  },

  capabilities: [
    'Advanced Chat Interfaces',
    'Real-time Communication',
    'Rich Media Integration',
    'Conversation Threading',
    'Modern UX Patterns',
  ],

  detailedSections: [
    {
      title: 'Interface Features',
      icon: '💬',
      items: [
        '⌨️ **Real-time Typing**: Live indicators and smooth animations',
        '🧵 **Threading**: Organized conversation branches',
        '📱 **Responsive Design**: Optimized for all devices',
        '🎨 **Rich Formatting**: Enhanced markdown and styling',
        '📊 **Interactive Elements**: Buttons, polls, forms',
        '🔍 **Smart Search**: Instant message discovery',
      ],
    },
    {
      title: 'Advanced Capabilities',
      icon: '⚡',
      items: [
        'Multi-media message support',
        'Voice message integration',
        'Screen sharing capabilities',
        'Collaborative editing features',
        'Real-time presence indicators',
        'Cross-platform synchronization',
      ],
    },
    {
      title: 'UX Innovations',
      icon: '🎯',
      items: [
        'Intelligent message grouping',
        'Context-aware suggestions',
        'Personalized interface themes',
        'Accessibility optimizations',
        'Performance optimizations',
        'Offline-first architecture',
      ],
    },
  ],
};
