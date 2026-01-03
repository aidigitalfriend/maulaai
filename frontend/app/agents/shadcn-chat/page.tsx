'use client';

import ShadcnAgentChat from '@/components/ui/ShadcnAgentChat';
import type { AgentConfig } from '@/components/ui/ShadcnAgentChat';

// Example agent configuration
const demoAgent: AgentConfig = {
  id: 'universal-assistant',
  name: 'AI Assistant',
  description: 'Your intelligent AI companion for any task',
  systemPrompt: `You are a helpful, intelligent AI assistant. You can help with:
- Coding and technical questions
- Writing and creative tasks
- Research and analysis
- General knowledge questions
- Problem solving

Be friendly, professional, and thorough in your responses.`,
  welcomeMessage: `👋 **Welcome to the Universal AI Chat!**

I'm your AI assistant, ready to help with anything you need.

**What I can help with:**
• 💻 **Coding** - Debug, explain, or write code in any language
• ✍️ **Writing** - Draft, edit, or improve any text
• 🔍 **Research** - Find information and explain complex topics
• 🧠 **Problem Solving** - Work through challenges together

---

*How can I assist you today?*`,
  model: 'mistral-large-latest',
  provider: 'mistral',
  color: '#6366f1',
  capabilities: ['Coding', 'Writing', 'Research', 'Analysis'],
};

export default function ShadcnChatDemoPage() {
  return (
    <div className="h-screen w-full">
      <ShadcnAgentChat agent={demoAgent} />
    </div>
  );
}
