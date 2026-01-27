'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, AlertTriangle, Search, CheckCircle, XCircle, MessageSquare, Zap, RefreshCw, Shield, ChevronDown, ChevronUp } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function TroubleshootingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const commonIssues = [
    {
      title: 'Agent Not Responding',
      icon: MessageSquare,
      symptoms: ['No response after sending message', 'Loading indicator stuck', 'Timeout errors'],
      solutions: [
        'Check your internet connection and API status',
        'Verify your API key is valid and not expired',
        'Ensure rate limits haven\'t been exceeded',
        'Try refreshing the page or starting a new session'
      ],
      color: '#ef4444'
    },
    {
      title: 'Slow Response Times',
      icon: Zap,
      symptoms: ['Responses take over 30 seconds', 'Inconsistent response times', 'Timeouts on complex queries'],
      solutions: [
        'Reduce the max_tokens parameter for shorter responses',
        'Simplify your prompts and reduce context length',
        'Check current API status for any slowdowns',
        'Consider upgrading to a higher tier for better performance'
      ],
      color: '#f59e0b'
    },
    {
      title: 'Unexpected Responses',
      icon: RefreshCw,
      symptoms: ['Off-topic replies', 'Inconsistent behavior', 'Hallucinations or incorrect info'],
      solutions: [
        'Review and refine your system prompt for clarity',
        'Lower the temperature setting for more consistent outputs',
        'Provide more specific examples in your prompt',
        'Add explicit constraints about what the agent should NOT do'
      ],
      color: '#a855f7'
    },
    {
      title: 'Authentication Errors',
      icon: Shield,
      symptoms: ['401 Unauthorized errors', 'Invalid API key messages', 'Permission denied'],
      solutions: [
        'Regenerate your API key from the settings page',
        'Ensure the API key is correctly formatted in headers',
        'Check that your subscription is active',
        'Verify you have the required permissions for the endpoint'
      ],
      color: '#00d4ff'
    }
  ];

  const faqs = [
    {
      q: 'Why does my agent forget previous context?',
      a: 'Agents have a limited context window. For long conversations, enable memory in your agent settings. This stores conversation history and maintains context across sessions. You can also increase the context window size in configuration.'
    },
    {
      q: 'How do I handle rate limit errors?',
      a: 'Rate limits are based on your subscription tier. If you\'re hitting limits, consider upgrading your plan, implementing request queuing, or adding exponential backoff to your retry logic. You can monitor your usage in the dashboard.'
    },
    {
      q: 'My agent is giving biased or inappropriate responses',
      a: 'Enable stricter content filters in your agent\'s safety settings. You can also add explicit guidelines in your system prompt about avoiding certain topics. If issues persist, report them through our support channel.'
    },
    {
      q: 'Can I use agents offline?',
      a: 'Currently, agents require an internet connection to function. The AI models run on our servers to ensure optimal performance and security. Offline mode is on our roadmap for enterprise customers.'
    },
    {
      q: 'How do I export conversation history?',
      a: 'Go to Settings > Data > Export. You can export conversations in JSON, CSV, or Markdown format. For API users, use the GET /api/conversations endpoint to retrieve history programmatically.'
    }
  ];

  const debugSteps = [
    { num: 1, title: 'Check API Status', desc: 'Visit our status page to verify all services are operational.' },
    { num: 2, title: 'Verify Configuration', desc: 'Review your agent settings and ensure all parameters are valid.' },
    { num: 3, title: 'Test in Isolation', desc: 'Try a simple "Hello" message to rule out prompt issues.' },
    { num: 4, title: 'Check Logs', desc: 'Review error logs in your dashboard for specific error codes.' },
    { num: 5, title: 'Contact Support', desc: 'If issues persist, reach out with error details and agent ID.' }
  ];

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.issue-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.issues-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.step-item',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.debug-section', start: 'top 85%' } }
    );

    gsap.fromTo('.faq-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.faq-section', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ef4444] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-gray-300">Problem Solving</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Troubleshooting</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Quick solutions to common issues and debugging guides
            </p>
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Common Issues</h2>
            <p className="text-gray-400">Quick fixes for frequently encountered problems</p>
          </div>
          <div className="issues-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonIssues.map((issue, i) => {
              const Icon = issue.icon;
              return (
                <div key={i} className="issue-card glass-card rounded-2xl p-6 opacity-0">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${issue.color}20`, border: `1px solid ${issue.color}40` }}>
                      <Icon className="w-6 h-6" style={{ color: issue.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Symptoms</h4>
                    <ul className="space-y-1">
                      {issue.symptoms.map((s, j) => (
                        <li key={j} className="flex items-center gap-2 text-gray-500 text-sm">
                          <XCircle className="w-3 h-3 text-red-400" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Solutions</h4>
                    <ul className="space-y-1">
                      {issue.solutions.map((s, j) => (
                        <li key={j} className="flex items-start gap-2 text-gray-400 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Debug Steps */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] debug-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Debugging Workflow</h2>
            <p className="text-gray-400">Step-by-step guide to identify and fix issues</p>
          </div>
          <div className="space-y-4">
            {debugSteps.map((step, i) => (
              <div key={i} className="step-item glass-card rounded-xl p-5 flex items-center gap-6 opacity-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0066ff] rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{step.title}</h4>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 faq-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold metallic-text mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Quick answers to common questions</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item glass-card rounded-xl overflow-hidden opacity-0">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-400 text-sm border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold metallic-text mb-4">Still Having Issues?</h2>
          <p className="text-gray-400 mb-8">Our support team is here to help</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support" className="px-8 py-4 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] rounded-xl font-semibold hover:opacity-90 transition-all">
              Contact Support
            </Link>
            <Link href="/community" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Community Forums →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
