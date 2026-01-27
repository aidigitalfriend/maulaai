'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function LiveSupportPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi there! I'm your AI support assistant. How can I help you today?\n\nI can assist with:\n• Account & billing questions\n• Technical support\n• Feature guidance\n• AI Agents setup\n• General inquiries",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const quickActions = [
    { label: 'Account Help', icon: '👤' },
    { label: 'Billing', icon: '💳' },
    { label: 'Technical', icon: '🔧' },
    { label: 'Feature Request', icon: '✨' }
  ]

  useGSAP(() => {
    gsap.fromTo('.hero-content', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    gsap.fromTo('.chat-section',
      { opacity: 0, y: 40, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.3, ease: 'power3.out' }
    )
    gsap.fromTo('.sidebar-card',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: 'power3.out' }
    )
  }, { scope: containerRef })

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const responses = [
        "Thanks for reaching out! I understand your concern. Let me help you with that. Could you provide a bit more detail?",
        "Great question! Here's what you need to know:\n\n1. Navigate to your dashboard\n2. Click on Settings\n3. Find the relevant option\n\nLet me know if you need more help!",
        "I'd be happy to assist with that! This is a common question. Would you like me to walk you through the steps?",
        "I see what you mean. For this type of request, I recommend creating a support ticket so our team can look into it more thoroughly.",
        "That's a great point! I'll make a note of this feedback. Is there anything else I can help you with?"
      ]
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .chat-bubble-user {
          background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);
          border-radius: 20px 20px 4px 20px;
        }
        .chat-bubble-ai {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px 20px 20px 4px;
        }
        .input-field {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
          outline: none;
        }
        .typing-dot {
          animation: typingBounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Hero */}
      <section className="pt-28 pb-8 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent)] blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="hero-content text-center opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-4">
              <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
              Live Support Available
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
              Live Support Chat
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Chat with our AI assistant for instant help. For complex issues, we&apos;ll connect you with a human.
            </p>
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-8 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat */}
            <div className="lg:col-span-3 chat-section opacity-0">
              <div className="glass-card rounded-2xl overflow-hidden h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00d4ff] to-[#0066ff]">
                      <span>🤖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Support Assistant</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#00ff88] rounded-full"></span>
                        Online
                      </p>
                    </div>
                  </div>
                  <Link href="/support/create-ticket" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-all">
                    Create Ticket
                  </Link>
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 ${msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-gray-200'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1">
                        <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="px-6 py-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputValue(`I need help with ${action.label.toLowerCase()}`)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1"
                      >
                        <span>{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="px-6 py-4 border-t border-white/5">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 input-field"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="sidebar-card glass-card rounded-xl p-5 opacity-0">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span>⚡</span> Quick Links
                </h3>
                <div className="space-y-2">
                  <Link href="/support/faqs" className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    📚 FAQs
                  </Link>
                  <Link href="/support/help-center" className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    🎓 Help Center
                  </Link>
                  <Link href="/support/contact-us" className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    ✉️ Contact Us
                  </Link>
                </div>
              </div>

              <div className="sidebar-card glass-card rounded-xl p-5 opacity-0" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,102,255,0.08) 100%)' }}>
                <h3 className="font-bold text-white mb-2">Need Human Support?</h3>
                <p className="text-sm text-gray-400 mb-4">For complex issues, create a ticket and our team will respond within 2-4 hours.</p>
                <Link href="/support/create-ticket" className="block w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-center font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all">
                  Create Ticket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
