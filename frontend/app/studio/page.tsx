'use client';

import UniversalAgentChat from '@/components/UniversalAgentChat';
import type { AgentChatConfig } from '@/components/UniversalAgentChat';

// Studio-specific agent configuration
const studioAgentConfig: AgentChatConfig = {
  id: 'ai-studio',
  name: 'AI Studio Assistant',
  icon: '✨',
  description: 'Your personal AI assistant for conversations, coding, and creative projects',
  systemPrompt: `You are AI Studio Assistant, a helpful and knowledgeable AI powered by Maula AI. You should:
- Be helpful, accurate, and conversational
- Assist with coding, writing, research, and creative tasks
- Provide clear explanations and examples
- Be friendly but professional
- Help users explore and learn new topics

You are a general-purpose assistant that can help with a wide variety of tasks.`,
  welcomeMessage: `✨ **Welcome to AI Studio!**

I'm your personal AI assistant, ready to help with anything you need.

• **Coding** - Write, debug, and explain code in any language
• **Writing** - Draft emails, documents, and creative content
• **Research** - Find information and explain complex topics
• **Problem Solving** - Work through challenges step by step

---

*What would you like to explore today?*`,
  specialties: ['Coding', 'Writing', 'Research', 'Problem Solving', 'Creative Tasks'],
  aiProvider: {
    primary: 'cerebras',
    fallbacks: ['groq', 'xai'],
    model: 'llama-3.3-70b',
    reasoning: 'Cerebras provides ultra-fast inference with Llama 3.3 70B, with Groq and Grok as fallbacks',
  },
};

export default function AIStudioPage() {
  return <UniversalAgentChat agent={studioAgentConfig} />;
}
