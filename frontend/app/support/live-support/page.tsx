'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import {
  Send, Mic, Phone, MessageCircle, HelpCircle, Users, Mail,
  Copy, Loader, AlertCircle, CheckCircle, Zap, Clock, Moon, Heart, Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Luna's Avatar Component with breathing animation
const LunaAvatar = ({ size = 'md', isTyping = false, mood = 'happy' }: { size?: 'sm' | 'md' | 'lg', isTyping?: boolean, mood?: 'happy' | 'thinking' | 'concerned' }) => {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const moodColors = {
    happy: 'from-purple-500 via-pink-500 to-rose-400',
    thinking: 'from-blue-500 via-indigo-500 to-purple-500',
    concerned: 'from-amber-400 via-orange-400 to-pink-400'
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${moodColors[mood]} p-0.5 ${isTyping ? 'animate-pulse' : ''}`}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
          <Moon className="w-1/2 h-1/2 text-amber-200" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
        </div>
      </div>
      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isTyping ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
      {isTyping && <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-ping" />}
    </div>
  );
};

// Enhanced typing indicator
const LunaTypingIndicator = () => {
  const [dots, setDots] = useState(1);
  const messages = ["Luna is thinking...", "Luna is crafting a response...", "Luna is here for you...", "Let me think about this..."];
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 500);
    const messageInterval = setInterval(() => setMessage(messages[Math.floor(Math.random() * messages.length)]), 3000);
    return () => { clearInterval(dotInterval); clearInterval(messageInterval); };
  }, []);

  return (
    <div className="flex items-start gap-3">
      <LunaAvatar size="sm" isTyping={true} mood="thinking" />
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className={`w-2 h-2 bg-indigo-400 rounded-full ${dots >= 1 ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
            <div className={`w-2 h-2 bg-purple-400 rounded-full ${dots >= 2 ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
            <div className={`w-2 h-2 bg-pink-400 rounded-full ${dots >= 3 ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
          </div>
          <span className="text-xs text-indigo-300 italic">{message}</span>
        </div>
      </div>
    </div>
  );
};

// Get contextual greeting based on time
const getTimeBasedGreeting = (userName: string) => {
  const hour = new Date().getHours();
  const name = userName || 'there';

  if (hour >= 5 && hour < 12) return `Good morning, ${name}! ☀️ I'm Luna, and I'm so happy you're here. How can I brighten your day?`;
  if (hour >= 12 && hour < 17) return `Hey ${name}! 🌸 Luna here~ I hope your afternoon is going well. What brings you by today?`;
  if (hour >= 17 && hour < 21) return `Good evening, ${name}! 🌙 I'm Luna. Winding down from the day? I'm here if you need anything!`;
  return `Hey ${name}~ 🌙✨ Burning the midnight oil? I'm Luna, and I'm here with you. What can I help with tonight?`;
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const SOCIAL_LINKS = [
  { icon: '📘', href: 'https://facebook.com/maulaai', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
  { icon: '📸', href: 'https://instagram.com/maulaai', label: 'Instagram', color: 'bg-pink-600 hover:bg-pink-700' },
  { icon: '🐙', href: 'https://github.com/maulaai', label: 'GitHub', color: 'bg-gray-700 hover:bg-gray-800' },
  { icon: '𝕏', href: 'https://twitter.com/maulaai', label: 'X (Twitter)', color: 'bg-black hover:bg-gray-900' },
  { icon: '💬', href: 'https://line.me/maulaai', label: 'LINE', color: 'bg-green-500 hover:bg-green-600' }
];

const SUPPORT_OPTIONS = [
  { icon: MessageCircle, label: 'Create Ticket', href: '/support/create-ticket' },
  { icon: HelpCircle, label: 'FAQs', href: '/support/faqs' },
  { icon: Phone, label: 'Book Call', href: '/support/book-consultation' },
  { icon: Mail, label: 'Email Us', href: '/support/contact-us' }
];

export default function LiveSupportPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [animationsReady, setAnimationsReady] = useState(false);

  const { state: authState } = useAuth();
  const user = authState?.user;
  const isAuthenticated = authState?.isAuthenticated;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lunaMood, setLunaMood] = useState<'happy' | 'thinking' | 'concerned'>('happy');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize with Luna's greeting
  useEffect(() => {
    const greeting = getTimeBasedGreeting(user?.name || '');
    setMessages([{
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }]);
  }, [user?.name]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    setLunaMood('thinking');
    setError(null);

    // Animate send button
    gsap.to('.send-btn', {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      const response = await fetch('/api/support/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user?.id || 'guest',
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Simulate typing delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || "I'm here to help! Could you please rephrase that?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLunaMood('happy');

      // Animate new message
      requestAnimationFrame(() => {
        const lastMessage = document.querySelector('.message-bubble:last-child');
        if (lastMessage) {
          gsap.from(lastMessage, {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.4,
            ease: 'back.out(1.7)'
          });
        }
      });

    } catch (err) {
      setError('Sorry, I had trouble connecting. Please try again!');
      setLunaMood('concerned');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);

    // Copy animation
    gsap.to(`[data-message-id="${id}"]`, {
      scale: 1.02,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    setAnimationsReady(true);
  }, []);

  useEffect(() => {
    if (!animationsReady || !containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Custom effects
        CustomWiggle.create('lunaWiggle', { wiggles: 5, type: 'uniform' });

        // Hero orbs with morphing
        gsap.fromTo('.hero-orb', 
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.4,
            duration: 2,
            ease: 'elastic.out(1, 0.5)',
            stagger: 0.3
          }
        );

        gsap.to('.hero-orb', {
          borderRadius: '30% 70% 60% 40% / 50% 40% 60% 50%',
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 2
        });

        // Chat bubble particles
        const bubbles = document.querySelectorAll('.chat-particle');
        bubbles.forEach((bubble) => {
          gsap.set(bubble, {
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0.3
          });

          gsap.to(bubble, {
            y: `-=${Math.random() * 100 + 50}`,
            rotation: Math.random() * 20 - 10,
            duration: Math.random() * 5 + 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });

        // Chat container entrance
        gsap.fromTo('.chat-container', 
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.5)',
            delay: 0.3
          }
        );

        // Support options entrance
        gsap.utils.toArray('.support-option').forEach((option: any, i) => {
          gsap.fromTo(option, 
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: 'power2.out',
              scrollTrigger: { trigger: '.support-options', start: 'top 85%' },
              delay: i * 0.1
            }
          );

          option.addEventListener('mouseenter', () => {
            gsap.to(option, { x: 10, scale: 1.02, duration: 0.2 });
            gsap.to(option.querySelector('.option-icon'), {
              rotation: 15,
              scale: 1.2,
              duration: 0.3,
              ease: 'lunaWiggle'
            });
          });

          option.addEventListener('mouseleave', () => {
            gsap.to(option, { x: 0, scale: 1, duration: 0.2 });
            gsap.to(option.querySelector('.option-icon'), { rotation: 0, scale: 1, duration: 0.2 });
          });
        });

        // Social links with stagger
        gsap.utils.toArray('.social-link').forEach((link: any, i) => {
          gsap.fromTo(link, 
            { opacity: 0, scale: 0, rotation: -180 },
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.5,
              ease: 'back.out(2)',
              scrollTrigger: { trigger: '.social-container', start: 'top 85%' },
              delay: i * 0.1
            }
          );

          link.addEventListener('mouseenter', () => {
            gsap.to(link, { scale: 1.2, rotation: 10, duration: 0.2 });
          });

          link.addEventListener('mouseleave', () => {
            gsap.to(link, { scale: 1, rotation: 0, duration: 0.2 });
          });
        });

        // Online indicator pulse
        gsap.to('.online-pulse', {
          scale: 2,
          opacity: 0,
          duration: 2,
          repeat: -1,
          ease: 'power2.out'
        });

        // Input focus animation
        const chatInput = document.querySelector('.chat-input');
        if (chatInput) {
          chatInput.addEventListener('focus', () => {
            gsap.to('.input-container', {
              boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3)',
              scale: 1.01,
              duration: 0.2
            });
          });
          chatInput.addEventListener('blur', () => {
            gsap.to('.input-container', {
              boxShadow: 'none',
              scale: 1,
              duration: 0.2
            });
          });
        }

        // Send button hover
        const sendBtn = document.querySelector('.send-btn');
        if (sendBtn) {
          sendBtn.addEventListener('mouseenter', () => {
            gsap.to(sendBtn, { scale: 1.1, rotation: 15, duration: 0.2 });
          });
          sendBtn.addEventListener('mouseleave', () => {
            gsap.to(sendBtn, { scale: 1, rotation: 0, duration: 0.2 });
          });
        }

        ScrollTrigger.refresh();
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, [animationsReady]);

  return (
    <div ref={containerRef} className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Chat Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="chat-particle fixed text-2xl pointer-events-none z-0"
          style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 50}%` }}
        >
          {['💬', '✨', '🌙', '💜'][i % 4]}
        </div>
      ))}

      {/* Hero Section - Compact */}
      <section ref={heroRef} className="relative flex-shrink-0 py-6 px-4">
        {/* Gradient Orbs */}
        <div className="hero-orb absolute top-0 left-1/3 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl" />
        <div className="hero-orb absolute bottom-0 right-1/3 w-48 h-48 bg-gradient-to-br from-indigo-600/30 to-violet-600/30 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Luna Avatar */}
          <div className="luna-main-avatar mx-auto mb-3 relative inline-block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400 p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                <Moon className="w-8 h-8 text-amber-200" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0d0d12]" />
            <div className="online-pulse absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-1 leading-tight text-white">
            Chat with Luna
          </h1>
          <p className="text-sm text-gray-400">
            Your friendly AI support assistant, available 24/7 🌙
          </p>
        </div>
      </section>

      {/* Main Content - Takes remaining height */}
      <section className="flex-1 px-4 pb-4 min-h-0">
        <div className="max-w-6xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Chat Panel */}
            <div className="lg:col-span-2 h-full flex flex-col min-h-0">
              <div className="chat-container relative bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-2xl border border-gray-800 flex flex-col h-full overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg z-10" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg z-10" />
                {/* Chat Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-800 flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <LunaAvatar size="md" mood={lunaMood} isTyping={isTyping} />
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      Luna
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Online</span>
                    </h3>
                    <p className="text-xs text-gray-400">AI Support Assistant</p>
                  </div>
                </div>

                {/* Messages - Scrollable */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      data-message-id={msg.id}
                      className={`message-bubble flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'assistant' && <LunaAvatar size="sm" mood={lunaMood} />}
                      
                      <div className={`relative max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-violet-600 to-purple-700 rounded-br-sm'
                          : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-bl-sm'
                      }`}>
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <span className="text-xs text-gray-400">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && <LunaTypingIndicator />}
                  
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input - Fixed at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-gray-800">
                  <div className="input-container flex items-center gap-3 p-2 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-xl border border-gray-800">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message to Luna..."
                      className="chat-input flex-1 bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !inputValue.trim()}
                      className="send-btn p-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white disabled:opacity-50 transition-all"
                    >
                      {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Luna is here 24/7 • Press Enter to send
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar - Scrollable */}
            <div className="h-full overflow-y-auto space-y-4 pb-2">
              {/* Support Options */}
              <div className="support-options relative p-5 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-violet-400" />
                  Other Ways to Get Help
                </h3>
                <div className="space-y-2">
                  {SUPPORT_OPTIONS.map((option, i) => (
                    <Link
                      key={i}
                      href={option.href}
                      className="support-option flex items-center gap-3 p-2.5 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-xl border border-gray-800 hover:border-violet-500/50 transition-all"
                    >
                      <div className="option-icon w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <option.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300 text-sm">{option.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div className="relative p-5 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Response Times
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Luna AI</span>
                    <span className="text-green-400 font-medium">Instant</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Human Support</span>
                    <span className="text-cyan-400 font-medium">~2 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Priority Ticket</span>
                    <span className="text-violet-400 font-medium">~30 min</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-container relative p-5 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-pink-400" />
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-link w-10 h-10 ${social.color} rounded-xl flex items-center justify-center text-lg transition-all`}
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Luna's Tip */}
              <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-bold text-white mb-1 text-sm">Luna's Tip</h4>
                    <p className="text-gray-400 text-xs">
                      For faster help, be specific about your issue and include any error messages you've seen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
