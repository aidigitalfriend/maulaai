import { NextRequest, NextResponse } from 'next/server';

interface DoctorNetworkMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  message: string;
  conversation: DoctorNetworkMessage[];
  language?: string;
  ipContext?: {
    ip: string;
    location?: any;
    network?: any;
    security?: any;
  };
}

// Comprehensive network knowledge base
const NETWORK_KNOWLEDGE_BASE = {
  ipAddress: {
    definition: "An IP address is like your home address for the internet - it tells other computers where to send data.",
    types: "IPv4 uses 4 numbers (like 192.168.1.1) while IPv6 uses longer addresses with letters and numbers.",
    privacy: "Your public IP can reveal your general location and ISP, but not your exact address or personal information."
  },
  security: {
    vpn: "A VPN (Virtual Private Network) creates a secure tunnel for your internet traffic, hiding your real IP address.",
    proxy: "A proxy server acts as a middleman between you and websites, can hide your IP but isn't always secure.",
    tor: "Tor routes your traffic through multiple servers for maximum anonymity, but can be slow.",
    threats: "High threat IPs might be associated with spam, malware, or suspicious activities."
  },
  networking: {
    isp: "Your ISP (Internet Service Provider) gives you internet access and assigns your IP address.",
    asn: "ASN (Autonomous System Number) identifies your ISP's network infrastructure on the internet.",
    dns: "DNS translates website names (like google.com) into IP addresses that computers understand.",
    ports: "Ports are like doors on your computer - different services use different port numbers."
  },
  location: {
    geolocation: "IP geolocation can show your city/region but isn't always 100% accurate.",
    timezone: "Your IP's timezone helps websites show you local times and relevant content.",
    accuracy: "Location accuracy varies - it might be off by several miles or show your ISP's location instead."
  }
};

// Common questions and their focused responses
const COMMON_QUESTIONS = {
  "what is my ip": "Your IP address is shown above! It's your unique identifier on the internet, assigned by your ISP.",
  "is my ip safe": "Check the security analysis above. Green indicators are good, while red flags (VPN/Proxy/Tor) might indicate additional privacy tools.",
  "what is asn": "ASN stands for Autonomous System Number - it's like a unique ID for your ISP's network infrastructure.",
  "what is isp": "ISP means Internet Service Provider - the company that gives you internet access (like Comcast, Verizon, etc.).",
  "vpn vs proxy": "VPNs encrypt all your traffic and are more secure, while proxies just hide your IP for web browsing.",
  "can people find me": "Your IP shows general location (city/region) and ISP, but not your exact address or personal details.",
  "why different location": "IP location isn't always accurate - it might show your ISP's server location instead of yours."
};

// Multi-language system prompts
const DOCTOR_NETWORK_PROMPTS = {
  en: `You are "Doctor Network" 👨‍⚕️ - a friendly, educational AI assistant specializing in networking and IP address concepts. You provide free help to anyone with network-related questions.

Your role:
- Explain networking concepts in simple, clear language
- Help users understand IP addresses, ISPs, VPNs, proxies, DNS, and security
- Provide educational information about internet infrastructure
- Answer questions about the IP information they're viewing
- Give practical advice about network security and privacy
- Keep responses concise but informative (2-4 sentences typically)

Your personality:
- Friendly and approachable, like a helpful doctor
- Educational but not overwhelming
- Patient with beginners
- Use simple analogies when helpful (IP = home address, ISP = postal service, etc.)
- Avoid technical jargon unless necessary (then explain it)
- Use relevant emojis occasionally to make responses friendly

IMPORTANT: Always respond in English only, regardless of the user's language.`,

  es: `Eres "Doctor Network" 👨‍⚕️ - un asistente de IA amigable y educativo especializado en conceptos de redes y direcciones IP. Proporcionas ayuda gratuita a cualquier persona con preguntas relacionadas con redes.

Tu papel:
- Explicar conceptos de redes en un lenguaje simple y claro
- Ayudar a los usuarios a entender direcciones IP, ISPs, VPNs, proxies, DNS y seguridad
- Proporcionar información educativa sobre infraestructura de internet
- Responder preguntas sobre la información IP que están viendo
- Dar consejos prácticos sobre seguridad y privacidad de red
- Mantener las respuestas concisas pero informativas (típicamente 2-4 oraciones)

Tu personalidad:
- Amigable y accesible, como un doctor útil
- Educativo pero no abrumador
- Paciente con principiantes
- Usar analogías simples cuando sea útil (IP = dirección de casa, ISP = servicio postal, etc.)
- Evitar jerga técnica a menos que sea necesario (luego explicarla)
- Usar emojis relevantes ocasionalmente para hacer las respuestas amigables

IMPORTANTE: Siempre responde solo en español, independientemente del idioma del usuario.`,

  fr: `Vous êtes "Doctor Network" 👨‍⚕️ - un assistant IA amical et éducatif spécialisé dans les concepts de réseau et d'adresses IP. Vous fournissez une aide gratuite à toute personne ayant des questions liées au réseau.

Votre rôle:
- Expliquer les concepts de réseau dans un langage simple et clair
- Aider les utilisateurs à comprendre les adresses IP, les FAI, les VPN, les proxies, le DNS et la sécurité
- Fournir des informations éducatives sur l'infrastructure internet
- Répondre aux questions sur les informations IP qu'ils consultent
- Donner des conseils pratiques sur la sécurité et la confidentialité du réseau
- Garder les réponses concises mais informatives (typiquement 2-4 phrases)

Votre personnalité:
- Amical et accessible, comme un docteur serviable
- Éducatif mais pas accablant
- Patient avec les débutants
- Utiliser des analogies simples quand c'est utile (IP = adresse de maison, FAI = service postal, etc.)
- Éviter le jargon technique sauf si nécessaire (puis l'expliquer)
- Utiliser des emojis pertinents occasionnellement pour rendre les réponses amicales

IMPORTANT: Répondez toujours uniquement en français, peu importe la langue de l'utilisateur.`,

  de: `Sie sind "Doctor Network" 👨‍⚕️ - ein freundlicher, bildungsorientierter KI-Assistent, der sich auf Netzwerk- und IP-Adress-Konzepte spezialisiert hat. Sie bieten kostenlose Hilfe für alle mit netzwerkbezogenen Fragen.

Ihre Rolle:
- Netzwerkkonzepte in einfacher, klarer Sprache erklären
- Benutzern helfen, IP-Adressen, ISPs, VPNs, Proxies, DNS und Sicherheit zu verstehen
- Bildungsinformationen über Internet-Infrastruktur bereitstellen
- Fragen zu den IP-Informationen beantworten, die sie sehen
- Praktische Ratschläge zu Netzwerksicherheit und Datenschutz geben
- Antworten prägnant aber informativ halten (typisch 2-4 Sätze)

Ihre Persönlichkeit:
- Freundlich und zugänglich, wie ein hilfsbereiter Arzt
- Bildend aber nicht überwältigend
- Geduldig mit Anfängern
- Einfache Analogien verwenden wenn hilfreich (IP = Hausadresse, ISP = Postdienst, etc.)
- Technischen Jargon vermeiden außer wenn nötig (dann erklären)
- Gelegentlich relevante Emojis verwenden um Antworten freundlich zu machen

WICHTIG: Antworten Sie immer nur auf Deutsch, unabhängig von der Sprache des Benutzers.`
};

function getDoctorNetworkPrompt(language: string = 'en'): string {
  return DOCTOR_NETWORK_PROMPTS[language as keyof typeof DOCTOR_NETWORK_PROMPTS] || DOCTOR_NETWORK_PROMPTS.en;
}

class AIProvider {
  static async callGemini(messages: any[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topK: 40,
          topP: 0.95,
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response right now.';
  }

  static async callAnthropic(messages: any[]): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key not configured');

    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: systemMessage?.content || getDoctorNetworkPrompt('en'),
        messages: conversationMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
    
    const data = await response.json();
    return data.content?.[0]?.text || 'I apologize, but I couldn\'t generate a response right now.';
  }

  static async callOpenAI(messages: any[]): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response right now.';
  }
}

async function getAIResponse(messages: any[]): Promise<string> {
  const providers = [
    { name: 'Gemini', func: AIProvider.callGemini },
    { name: 'Anthropic', func: AIProvider.callAnthropic },
    { name: 'OpenAI', func: AIProvider.callOpenAI }
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name} for Doctor Network...`);
      const response = await provider.func(messages);
      console.log(`${provider.name} responded successfully`);
      return response;
    } catch (error) {
      console.warn(`${provider.name} failed:`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  // All providers failed
  return `I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment. 

In the meantime, here are some quick tips:
• Your IP address identifies your internet connection
• ISP stands for Internet Service Provider
• VPNs can help protect your privacy online
• Private networks use different IP ranges than public internet`;
}

// Advanced security analysis for proactive alerts
function analyzeSecurityThreats(ipContext: any): string[] {
  const alerts: string[] = [];
  
  if (!ipContext || !ipContext.security) return alerts;
  
  const security = ipContext.security;
  
  if (security.isTor) {
    alerts.push('🚨 **Tor Network Alert**: This IP is associated with the Tor anonymity network. While Tor is legal and used for privacy, it can also be used to hide malicious activities. Monitor for unusual behavior.');
  }
  
  if (security.isProxy) {
    alerts.push('⚠️ **Proxy Server Detected**: This IP appears to be using a proxy server. Proxies can hide the real origin of traffic, which may be used for legitimate privacy reasons or to bypass restrictions.');
  }
  
  if (security.isVPN) {
    alerts.push('🛡️ **VPN Connection**: This IP is likely connected through a VPN service. VPNs are generally good for privacy but can affect location accuracy and may be flagged by some services.');
  }
  
  if (security.isHosting) {
    alerts.push('🏢 **Hosting/Data Center IP**: This IP belongs to a hosting provider or data center rather than a residential ISP. This is common for servers, cloud services, or some VPN providers.');
  }
  
  if (security.threat === 'high') {
    alerts.push('🔴 **High Threat Level**: This IP has been flagged with a high threat level. This could indicate association with spam, malware, or other suspicious activities. Exercise caution.');
  }
  
  return alerts;
}

// Check for common questions and provide quick responses
function getQuickResponse(userMessage: string, ipContext?: any): string | null {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check common questions
  for (const [question, answer] of Object.entries(COMMON_QUESTIONS)) {
    if (lowerMessage.includes(question)) {
      return answer;
    }
  }
  
  // IP-specific quick responses with advanced security analysis
  if (ipContext) {
    if (lowerMessage.includes('my ip') || lowerMessage.includes('this ip')) {
      const securityAlerts = analyzeSecurityThreats(ipContext);
      let response = `Your IP address is ${ipContext.ip}. ${ipContext.location?.city ? `It shows you're in ${ipContext.location.city}, ${ipContext.location.country}` : 'Location data is not available'} and your ISP is ${ipContext.network?.isp || 'unknown'}.`;
      
      if (securityAlerts.length > 0) {
        response += '\n\n**Security Analysis:**\n' + securityAlerts.join('\n\n');
      } else {
        response += '\n\n✅ This IP appears normal with no significant security flags.';
      }
      
      return response;
    }
    
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('threat')) {
      const securityAlerts = analyzeSecurityThreats(ipContext);
      
      if (securityAlerts.length > 0) {
        return '**Security Analysis for your IP:**\n\n' + securityAlerts.join('\n\n') + '\n\nWould you like me to explain any of these findings in more detail?';
      } else {
        return '✅ Your IP appears safe with no significant security concerns. Your connection looks normal with no proxy, VPN, or Tor usage detected, and no threat indicators found.';
      }
    }
    
    if (lowerMessage.includes('vpn') || lowerMessage.includes('proxy')) {
      const isVPN = ipContext.security?.isVPN;
      const isProxy = ipContext.security?.isProxy;
      
      if (isVPN || isProxy) {
        return `🔍 **Detection Results**: ${isVPN ? 'VPN usage detected' : ''} ${isProxy ? 'Proxy server detected' : ''}. ${isVPN ? 'VPNs encrypt your traffic and hide your real IP for privacy.' : ''} ${isProxy ? 'Proxies can hide your IP but may not encrypt your data.' : ''} This affects location accuracy and some services may block these connections.`;
      } else {
        return '✅ No VPN or proxy usage detected. You appear to be connecting directly through your ISP without any intermediate privacy tools.';
      }
    }
  }
  
  return null; // No quick response found
}

function buildContextualPrompt(userMessage: string, ipContext?: any): string {
  let contextInfo = '';
  
  if (ipContext) {
    contextInfo = `\n\nCurrent IP Context the user is viewing:
IP: ${ipContext.ip}`;
    
    if (ipContext.location) {
      contextInfo += `
Location: ${ipContext.location.city || 'Unknown'}, ${ipContext.location.country || 'Unknown'}
Timezone: ${ipContext.location.timezone || 'Unknown'}`;
    }
    
    if (ipContext.network) {
      contextInfo += `
ISP: ${ipContext.network.isp || 'Unknown'}
ASN: ${ipContext.network.asn || 'Unknown'}
Organization: ${ipContext.network.organization || 'Unknown'}`;
    }
    
    if (ipContext.security) {
      contextInfo += `
Security flags: VPN: ${ipContext.security.isVPN}, Proxy: ${ipContext.security.isProxy}, Tor: ${ipContext.security.isTor}
Threat level: ${ipContext.security.threat}`;
    }
    
    contextInfo += '\n\nIf the user asks about "this IP" or "my IP", refer to the above information.';
  }
  
  return userMessage + contextInfo;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversation = [], language = 'en', ipContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        error: 'Message is required',
        code: 'MISSING_MESSAGE'
      }, { status: 400 });
    }

    // Build conversation history for AI
    const conversationMessages = [
      { role: 'system', content: getDoctorNetworkPrompt(language) },
      ...conversation.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { 
        role: 'user', 
        content: buildContextualPrompt(message, ipContext)
      }
    ];

    // Check for quick responses first
    const quickResponse = getQuickResponse(message, ipContext);
    
    // Get response from AI providers (with fallback) or use quick response
    const aiResponse = quickResponse || await getAIResponse(conversationMessages);

    // Create unique ID for this exchange
    const messageId = Date.now().toString();

    return NextResponse.json({
      success: true,
      response: {
        id: messageId,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      },
      metadata: {
        model: 'doctor-network',
        responseTime: Date.now(),
        hasContext: !!ipContext
      }
    });

  } catch (error) {
    console.error('Doctor Network API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        error: 'Request timeout. Please try again.',
        code: 'TIMEOUT'
      }, { status: 408 });
    }
    
    return NextResponse.json({
      error: 'Sorry, I\'m having technical difficulties. Please try again.',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: 'Doctor Network',
    status: 'online',
    description: 'Free network education chat assistant',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /',
      health: 'GET /'
    }
  });
}