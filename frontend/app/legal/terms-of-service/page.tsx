"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  FileText, 
  Zap, 
  DollarSign, 
  User, 
  ShieldCheck, 
  Copyright, 
  AlertTriangle, 
  Scale, 
  RefreshCw, 
  Mail,
  X,
  ExternalLink,
  Bot,
  Wrench,
  Mic,
  Users,
  Check,
  Shield,
  Clock,
  CreditCard
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Article references for legal terms
interface ArticleReference {
  title: string;
  content: string;
  source: string;
}

const articles: Record<string, ArticleReference> = {
  dmca: {
    title: "DMCA (Digital Millennium Copyright Act)",
    content: `The Digital Millennium Copyright Act (DMCA) is a United States copyright law that implements two 1996 treaties of the World Intellectual Property Organization (WIPO).

Key Provisions:
• Safe harbor provisions for online service providers
• Notice and takedown procedures for copyright infringement
• Anti-circumvention provisions
• Protection for technological measures

Notice Requirements:
To file a DMCA takedown notice, you must provide:
• Physical or electronic signature of copyright owner
• Identification of copyrighted work
• Identification of infringing material
• Contact information
• Statement of good faith belief
• Statement of accuracy under penalty of perjury

Our Compliance:
We respond to valid DMCA notices within 24-48 hours and implement a repeat infringer policy.`,
    source: "17 U.S.C. § 512",
  },
  liability: {
    title: "Limitation of Liability - Section 230",
    content: `Section 230 of the Communications Decency Act provides immunity from liability for providers and users of interactive computer services who publish information provided by third parties.

Key Points:
• "No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider."
• Protection applies to:
  - User-generated content
  - Third-party content
  - Moderation decisions
  - Good faith content filtering

Exceptions:
• Federal criminal law
• Intellectual property law
• Communications privacy law

Application to AI Services:
While AI-generated content is novel, platforms generally retain Section 230 protections for user-directed AI outputs.`,
    source: "47 U.S.C. § 230",
  },
  arbitration: {
    title: "Arbitration and Class Action Waiver",
    content: `Arbitration is a method of dispute resolution where parties agree to resolve disputes outside of court through a neutral third-party arbitrator.

Key Aspects:
• Binding decision by arbitrator
• Limited grounds for appeal
• Generally faster and less expensive than litigation
• Confidential proceedings

Class Action Waiver:
Users agree to resolve disputes on an individual basis and waive the right to participate in class actions or collective proceedings.

Enforceability:
The Federal Arbitration Act (FAA) generally enforces arbitration agreements. However, some jurisdictions may limit enforceability, particularly for consumer contracts.

Opt-Out:
Many services allow users to opt out of arbitration within a specified period (typically 30 days) by sending written notice.`,
    source: "9 U.S.C. §§ 1-16 (Federal Arbitration Act)",
  },
};

function ArticlePopup({
  article,
  onClose,
}: {
  article: ArticleReference;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white pr-10">{article.title}</h3>
          <button
            onClick={onClose}
            aria-label="Close popup"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-gray-300 whitespace-pre-line leading-relaxed">
            {article.content}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-[#00d4ff] font-medium">Source: {article.source}</p>
          </div>
        </div>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Clickable article reference
function ArticleRef({
  articleKey,
  label,
  onClick,
}: {
  articleKey: string;
  label: string;
  onClick: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(articleKey)}
      className="inline-flex items-center gap-1 text-[#00d4ff] hover:text-[#00d4ff]/80 underline underline-offset-2 transition-colors"
    >
      {label}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  useGSAP(() => {
    // Hero entrance animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    heroTl
      .fromTo('.hero-badge', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6 }
      )
      .fromTo('.hero-title', 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.8 }, 
        '-=0.3'
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6 }, 
        '-=0.4'
      )
      .fromTo('.hero-meta', 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.5 }, 
        '-=0.2'
      );

    // Bento cards stagger animation
    gsap.fromTo('.bento-card', 
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.bento-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Section animations
    gsap.utils.toArray<HTMLElement>('.section-animate').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Feature cards
    gsap.fromTo('.feature-card', 
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // List items stagger
    gsap.utils.toArray<HTMLElement>('.list-section').forEach((section) => {
      gsap.fromTo(section.querySelectorAll('.list-item'), 
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

  }, { scope: containerRef });

  const handleArticleClick = (key: string) => {
    setSelectedArticle(key);
  };

  // Service features for bento grid
  const serviceFeatures = [
    { icon: Bot, title: "AI Agents", desc: "Specialized AI personalities for various industries" },
    { icon: Wrench, title: "Developer Tools", desc: "Network utilities, WHOIS, domain research" },
    { icon: Mic, title: "Voice Interaction", desc: "Emotional TTS with 15+ voices" },
    { icon: Users, title: "Community", desc: "Connect and collaborate with users" },
  ];

  // Pricing tiers
  const pricingTiers = [
    { duration: "1 Day", price: "$1", icon: Clock },
    { duration: "1 Week", price: "$5", icon: Clock },
    { duration: "1 Month", price: "$15", icon: CreditCard },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="pt-24 pb-16 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <FileText className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">Service Agreement</span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Terms of Service
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            Please read these terms carefully before using our platform. By accessing or using One Last AI, you agree to be bound by these terms.
          </p>
          
          <p className="hero-meta text-sm text-gray-500">
            Last updated: November 6, 2025 • Effective Date: November 6, 2025
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ACCEPTANCE OF TERMS - BENTO CARD
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12 relative overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#00d4ff]" />
                </div>
                <h2 className="text-3xl font-bold">1. Acceptance of Terms</h2>
              </div>
              
              <p className="text-gray-300 text-lg mb-6 max-w-3xl">
                Welcome to One Last AI. By accessing or using our platform at{" "}
                <a href="https://onelastai.com" className="text-[#00d4ff] hover:underline">onelastai.com</a>, 
                you agree to be bound by these Terms of Service, our{" "}
                <a href="/legal/privacy-policy" className="text-[#00d4ff] hover:underline">Privacy Policy</a>, 
                and all applicable laws and regulations.
              </p>
              
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <div className="flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white text-lg mb-2">Important Notice</p>
                    <p className="text-gray-400">
                      If you do not agree to these Terms, you may not access or use our services. 
                      By creating an account or using our platform, you confirm that you are at least 
                      18 years old and have the legal capacity to enter into this agreement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SERVICE DESCRIPTION - BENTO GRID
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
              <Zap className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#00d4ff] font-medium">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">2. Service Description</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              One Last AI provides a global multi-agent AI platform featuring the following capabilities
            </p>
          </div>
          
          <div className="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceFeatures.map((feature, i) => (
              <div key={i} className="bento-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#00d4ff]" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#00d4ff] transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-500 mt-8 text-sm">
            We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PRICING - SPLIT SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="section-animate">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
                <DollarSign className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-sm text-[#00d4ff] font-medium">Pricing Model</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">3. Pricing & $1 Daily Trial</h2>
              <p className="text-gray-400 mb-8">
                New users can access our platform for just <strong className="text-[#00d4ff]">$1.00 USD per day</strong>. 
                This low-cost trial gives you full access to all platform features.
              </p>
              
              <div className="space-y-4 list-section">
                {["All AI agents and personalities", "Developer tools and network utilities", "Voice interaction features", "Community platform access", "API access (rate-limited)"].map((item, i) => (
                  <div key={i} className="list-item flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Check className="w-4 h-4 text-[#00d4ff]" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="section-animate space-y-4">
              {/* Pricing cards */}
              <div className="grid grid-cols-3 gap-4">
                {pricingTiers.map((tier, i) => (
                  <div key={i} className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 text-center hover:border-[#00d4ff]/30 transition-all">
                    <tier.icon className="w-8 h-8 text-[#00d4ff] mx-auto mb-3" />
                    <div className="text-3xl font-bold text-[#00d4ff]">{tier.price}</div>
                    <div className="text-sm text-gray-500">{tier.duration}</div>
                  </div>
                ))}
              </div>
              
              {/* Terms */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 list-section">
                <h4 className="font-semibold mb-4">One-Time Purchase Terms</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {[
                    "Access begins immediately upon payment",
                    "NO auto-renewal - charged only once",
                    "Cancel access at any time",
                    "Access expires at end of period",
                    "Re-purchase anytime to continue"
                  ].map((item, i) => (
                    <li key={i} className="list-item flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* No refund notice */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
                <h4 className="text-amber-400 font-semibold mb-2">No Refund Policy</h4>
                <p className="text-sm text-gray-400">
                  All payments are final and non-refundable. See our{" "}
                  <a href="/legal/payments-refunds" className="text-[#00d4ff] hover:underline">Payments & Refunds Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ACCOUNT RESPONSIBILITIES
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">4. Account Responsibilities</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Your obligations when using our platform</p>
          </div>
          
          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Security Card */}
            <div className="feature-card group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00d4ff]/30 hover:bg-white/[0.04] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-[#00d4ff] transition-colors">Account Security</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Maintain password confidentiality</li>
                <li>• Responsible for all account activity</li>
                <li>• Report unauthorized access immediately</li>
                <li>• Keep information accurate & current</li>
              </ul>
            </div>
            
            {/* Age Requirement Card */}
            <div className="feature-card group p-6 rounded-2xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-red-400">Age Requirement</h3>
              <p className="text-sm text-gray-400">
                You must be at least <strong className="text-white">18 years old</strong> to create an account 
                and use our services. We do not knowingly collect information from minors.
              </p>
            </div>
            
            {/* Termination Card */}
            <div className="feature-card group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00d4ff]/30 hover:bg-white/[0.04] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <X className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-[#00d4ff] transition-colors">Account Termination</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Violating Terms of Service</li>
                <li>• Fraudulent or illegal activity</li>
                <li>• Abuse or misuse of services</li>
                <li>• Providing false information</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ACCEPTABLE USE POLICY
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-red-500/10 to-transparent opacity-30"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold">5. Acceptable Use Policy</h2>
              </div>
              
              <p className="text-gray-400 text-lg mb-8">You agree NOT to:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 list-section">
                {[
                  "Use services for illegal purposes",
                  "Harass, abuse, or threaten others",
                  "Generate malicious content or spam",
                  "Hack or compromise our systems",
                  "Scrape data without authorization",
                  "Impersonate others",
                  "Share or resell account access",
                  "Infringe intellectual property",
                  "Create deepfakes without disclosure",
                  "Overload or interfere with systems"
                ].map((item, i) => (
                  <div key={i} className="list-item flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 transition-colors">
                    <span className="text-red-400 text-lg">✕</span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-6 text-center">
                Violation may result in immediate account suspension without refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          INTELLECTUAL PROPERTY
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">6. Intellectual Property</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Understanding ownership and rights</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Our IP */}
            <div className="section-animate rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 hover:border-[#00d4ff]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-4">
                <Copyright className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our IP</h3>
              <p className="text-gray-400 text-sm mb-4">Platform content and features are protected by:</p>
              <div className="flex flex-wrap gap-2">
                {["Copyright", "Trademark", "Patent", "Trade Secret"].map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Your Content */}
            <div className="section-animate rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 hover:border-[#00d4ff]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="text-xl font-bold mb-4">Your Content</h3>
              <p className="text-gray-400 text-sm mb-4">You retain ownership. You grant us:</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• License to provide services</li>
                <li>• Right to store & process</li>
                <li>• Anonymized data for training</li>
              </ul>
            </div>
            
            {/* AI-Generated */}
            <div className="section-animate rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 hover:border-[#00d4ff]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI-Generated Content</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• You receive non-exclusive license</li>
                <li>• We don&apos;t claim ownership</li>
                <li>• You ensure legal compliance</li>
                <li>• No IP guarantee on outputs</li>
              </ul>
            </div>
          </div>
          
          {/* DMCA Notice */}
          <div className="mt-8 section-animate rounded-2xl bg-white/[0.02] border border-white/5 p-8 text-center">
            <h4 className="text-lg font-semibold mb-2">DMCA Compliance</h4>
            <p className="text-gray-400 mb-2">
              We respect intellectual property rights and comply with the{" "}
              <ArticleRef articleKey="dmca" label="Digital Millennium Copyright Act (DMCA)" onClick={handleArticleClick} />.
            </p>
            <p className="text-gray-400">
              Report infringement: <a href="mailto:dmca@onelastai.com" className="text-[#00d4ff] hover:underline">dmca@onelastai.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          DISCLAIMERS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* As-Is Disclaimer */}
            <div className="section-animate rounded-2xl bg-amber-500/10 border border-amber-500/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <h3 className="text-2xl font-bold">7. Disclaimers</h3>
              </div>
              <h4 className="text-lg font-semibold text-amber-400 mb-4">&ldquo;As Is&rdquo; Service</h4>
              <p className="text-gray-400 text-sm mb-4">Services provided WITHOUT warranties including:</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Accuracy of AI-generated content</li>
                <li>• Uninterrupted operation</li>
                <li>• Security of data transmission</li>
                <li>• Fitness for particular purpose</li>
              </ul>
            </div>
            
            {/* Limitation of Liability */}
            <div className="section-animate rounded-2xl bg-red-500/10 border border-red-500/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-8 h-8 text-red-400" />
                <h3 className="text-2xl font-bold text-red-400">Limitation of Liability</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">We are NOT liable for:</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Indirect, incidental, or consequential damages</li>
                <li>• Loss of profits, data, or opportunities</li>
                <li>• Damages exceeding your payments (12 months)</li>
                <li>• Third-party actions or content</li>
              </ul>
              <p className="text-gray-500 text-sm mt-4">
                See <ArticleRef articleKey="liability" label="Section 230 Protections" onClick={handleArticleClick} />
              </p>
            </div>
          </div>
          
          {/* AI Limitations */}
          <div className="mt-8 section-animate rounded-2xl bg-white/[0.02] border border-white/5 p-8">
            <h4 className="text-xl font-bold mb-4">AI Limitations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "AI may produce errors or hallucinations",
                "Verify important information independently",
                "Not a replacement for professional advice",
                "We're not responsible for decisions based on AI"
              ].map((item, i) => (
                <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-400">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          DISPUTE RESOLUTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                <Scale className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-3xl font-bold">8. Dispute Resolution</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Informal Resolution</h4>
                <p className="text-gray-400 mb-4">
                  Before filing a claim, please contact us at{" "}
                  <a href="mailto:legal@onelastai.com" className="text-[#00d4ff] hover:underline">legal@onelastai.com</a>{" "}
                  to attempt informal resolution.
                </p>
                
                <h4 className="text-lg font-semibold mb-4 mt-8">Governing Law</h4>
                <p className="text-gray-400">
                  These Terms are governed by the laws of the jurisdiction where One Last AI is incorporated.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Binding Arbitration</h4>
                <p className="text-gray-400 mb-4">
                  Disputes shall be resolved through binding{" "}
                  <ArticleRef articleKey="arbitration" label="arbitration" onClick={handleArticleClick} />, not in court.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-2" />
                    <span>American Arbitration Association (AAA) rules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-2" />
                    <span>Individual basis only (no class actions)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-2" />
                    <span>Conducted remotely or in your jurisdiction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-2" />
                    <span>30-day opt-out period available</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CHANGES TO TERMS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-[#00d4ff]" />
            </div>
            <h2 className="text-3xl font-bold mb-4">9. Changes to Terms</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              We may update these Terms periodically. Significant changes will be communicated via:
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {["Email notification", "Platform notice", "Updated date"].map((item, i) => (
                <div key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-gray-300">
                  {item}
                </div>
              ))}
            </div>
            
            <p className="text-gray-500 text-sm mt-8">
              Continued use after changes constitutes acceptance of updated Terms.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CONTACT - CTA SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#00d4ff]/20 via-transparent to-transparent blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#00d4ff]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">10. Contact Us</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                Questions about these Terms? Reach out to our team.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { label: "Legal", email: "legal@onelastai.com" },
                  { label: "Support", email: "support@onelastai.com" },
                  { label: "DMCA", email: "dmca@onelastai.com" },
                  { label: "Website", email: "onelastai.com" },
                ].map((contact, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#00d4ff]/30 transition-colors">
                    <p className="text-sm text-gray-500 mb-1">{contact.label}</p>
                    <a href={contact.email.includes("@") ? `mailto:${contact.email}` : `https://${contact.email}`} className="text-[#00d4ff] text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Popup */}
      {selectedArticle && articles[selectedArticle] && (
        <ArticlePopup
          article={articles[selectedArticle]}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* CSS for gradient-radial */}
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
