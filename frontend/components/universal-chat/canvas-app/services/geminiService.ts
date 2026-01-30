
// Use the backend API to support all providers (Anthropic, OpenAI, Gemini, xAI, Groq, Mistral)

const SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer and UI/UX designer. 
Your task is to generate or modify a complete, high-quality, single-file HTML application.

Rules for generated code:
1. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
2. Use Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script>).
3. Ensure the design is modern, professional, and mobile-responsive.
4. Include all necessary JavaScript.
5. The output MUST be a single, valid HTML file containing <html>, <head>, and <body> tags.
6. Return ONLY the code. No explanations, no markdown blocks.
7. Always return the FULL updated file.`;

// Map frontend model IDs to backend provider/model format
const MODEL_MAP: Record<string, { provider: string; model: string }> = {
  // Anthropic
  'claude-3-5-sonnet': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  'claude-3-opus': { provider: 'anthropic', model: 'claude-opus-4-20250514' },
  // OpenAI
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
  // Gemini
  'gemini-1.5-flash': { provider: 'google', model: 'gemini-1.5-flash' },
  'gemini-1.5-pro': { provider: 'google', model: 'gemini-1.5-pro' },
  // xAI
  'grok-3': { provider: 'xai', model: 'grok-3' },
  // Groq
  'llama-3.3-70b': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
};

export async function generateAppCode(
  prompt: string, 
  modelId: string, 
  isThinking: boolean, 
  currentCode?: string, 
  history: any[] = []
): Promise<string> {
  // Get the backend API base URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Map the model ID to backend format
  const modelConfig = MODEL_MAP[modelId] || { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };
  
  // Build messages array for the backend
  const messages: { role: string; content: string }[] = [];
  
  // Add system context
  messages.push({
    role: 'system',
    content: SYSTEM_INSTRUCTION
  });
  
  // Add current code context if exists
  if (currentCode) {
    messages.push({
      role: 'user',
      content: `Current code:\n${currentCode}`
    });
    messages.push({
      role: 'assistant',
      content: 'I have the current code. What modifications would you like me to make?'
    });
  }

  // Add conversation history
  history.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  });

  // Add the current prompt
  messages.push({
    role: 'user',
    content: prompt
  });

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messages,
        model: modelConfig.model,
        provider: modelConfig.provider,
        temperature: isThinking ? 1 : 0.7,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.content || data.message || data.response || '';
    return cleanCode(content);
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to process request. Please try again or select a different model.");
  }
}

function cleanCode(text: string): string {
  return text.replace(/```html/g, "").replace(/```/g, "").trim();
}
