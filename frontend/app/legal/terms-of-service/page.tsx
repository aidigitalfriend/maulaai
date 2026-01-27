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
  ChevronDown,
  X,
  ExternalLink,
  Bot,
  Wrench,
  Mic,
  Users
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
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
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
            <p className="text-sm text-cyan-400 font-medium">Source: {article.source}</p>
          </div>
        </div>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Section wrapper component
function Section({
  id,
  icon: Icon,
  title,
  children,
  className = "",
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`section-card bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 md:p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="text-gray-300 space-y-4 leading-relaxed">{children}</div>
    </section>
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
      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
    >
      {label}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  useGSAP(
    () => {
      // Hero animation
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Section cards animation
      gsap.utils.toArray<HTMLElement>(".section-card").forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      });

      // TOC animation
      gsap.from(".toc-item", {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.5,
      });
    },
    { scope: containerRef }
  );

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", icon: FileText },
    { id: "service-description", title: "2. Service Description", icon: Zap },
    { id: "pricing", title: "3. Pricing & Trial", icon: DollarSign },
    { id: "account", title: "4. Account Responsibilities", icon: User },
    { id: "acceptable-use", title: "5. Acceptable Use", icon: ShieldCheck },
    { id: "ip", title: "6. Intellectual Property", icon: Copyright },
    { id: "disclaimers", title: "7. Disclaimers", icon: AlertTriangle },
    { id: "disputes", title: "8. Dispute Resolution", icon: Scale },
    { id: "changes", title: "9. Changes to Terms", icon: RefreshCw },
    { id: "contact", title: "10. Contact", icon: Mail },
  ];

  const handleArticleClick = (key: string) => {
    setSelectedArticle(key);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30" />
        
        <div className="hero-content relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Service Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Please read these terms carefully before using our platform. By accessing or using One Last AI, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-500">
            Last updated: November 6, 2025 • Effective Date: November 6, 2025
          </p>
        </div>
      </div>

      {/* Table of Contents - Mobile */}
      <div className="lg:hidden px-4 mb-8">
        <details className="bg-white/5 border border-white/10 rounded-xl">
          <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium">
            <span>Table of Contents</span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </summary>
          <div className="p-4 pt-0 space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block py-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
              >
                {section.title}
              </a>
            ))}
          </div>
        </details>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex gap-12">
          {/* Sticky TOC - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-medium">On this page</p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="toc-item block py-2 px-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-8 max-w-3xl">
            {/* 1. Acceptance of Terms */}
            <Section id="acceptance" icon={FileText} title="1. Acceptance of Terms">
              <p>
                Welcome to One Last AI. By accessing or using our platform at{" "}
                <a href="https://onelastai.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  onelastai.com
                </a>
                , you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;), our{" "}
                <a href="/legal/privacy-policy" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  Privacy Policy
                </a>
                , and all applicable laws and regulations.
              </p>
              
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-1">Important Notice</p>
                    <p className="text-gray-400 text-sm">
                      If you do not agree to these Terms, you may not access or use our services. By creating an account or using our platform, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* 2. Service Description */}
            <Section id="service-description" icon={Zap} title="2. Service Description">
              <p className="mb-4">One Last AI provides a global multi-agent AI platform featuring:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-semibold text-white">AI Agents</h4>
                  </div>
                  <p className="text-sm text-gray-400">Specialized AI personalities for various industries and use cases</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-semibold text-white">Developer Tools</h4>
                  </div>
                  <p className="text-sm text-gray-400">Network utilities, WHOIS lookups, domain research, and more</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-semibold text-white">Voice Interaction</h4>
                  </div>
                  <p className="text-sm text-gray-400">Emotional text-to-speech with 15+ voices and mood customization</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-semibold text-white">Community Platform</h4>
                  </div>
                  <p className="text-sm text-gray-400">Connect with other users, share ideas, and collaborate</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.
              </p>
            </Section>

            {/* 3. Pricing and Trial */}
            <Section id="pricing" icon={DollarSign} title="3. Pricing and $1 Daily Trial">
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-white mb-3">💵 $1 Daily Trial</h3>
                <p className="text-gray-300 mb-4">
                  New users can access our platform for just <strong className="text-cyan-400">$1.00 USD per day</strong>. This low-cost trial gives you full access to:
                </p>
                <ul className="space-y-2">
                  {["All AI agents and personalities", "Developer tools and network utilities", "Voice interaction features", "Community platform access", "API access (rate-limited)"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">3.1 One-Time Purchase Terms</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Access begins immediately upon payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400"><strong className="text-white">NO auto-renewal</strong> - you&apos;re charged only once per purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">You may cancel access at any time (no refund)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Choose from $1/day, $5/week, or $15/month per agent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Access expires automatically at the end of your chosen period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Re-purchase anytime to continue access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">All prices in USD unless otherwise stated</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">3.2 Payment Methods</h4>
                  <p className="text-gray-400 mb-2">We accept:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Credit/Debit cards (Visa, MasterCard, American Express)</li>
                    <li>• PayPal</li>
                    <li>• Other payment methods as available</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">3.3 No Refund Policy</h4>
                  <p className="text-gray-400 mb-2">
                    <strong className="text-white">All payments are final and non-refundable.</strong> Given the low-cost nature of our service ($1 per day) and immediate access to platform features, we do not offer refunds for any reason.
                  </p>
                  <p className="text-gray-400">
                    For detailed refund policy information, see our{" "}
                    <a href="/legal/payments-refunds" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                      Payments & Refunds Policy
                    </a>.
                  </p>
                </div>
              </div>
            </Section>

            {/* 4. Account Responsibilities */}
            <Section id="account" icon={User} title="4. Account Responsibilities">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">4.1 Account Security</h4>
                  <p className="text-gray-400 mb-2">You are responsible for:</p>
                  <ul className="space-y-2">
                    {[
                      "Maintaining the confidentiality of your password",
                      "All activities that occur under your account",
                      "Notifying us immediately of unauthorized access",
                      "Ensuring your account information is accurate and current"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-white mb-2">4.2 Age Requirement</h4>
                  <p className="text-gray-400">
                    You must be at least <strong className="text-white">18 years old</strong> to create an account and use our services. We do not knowingly collect information from minors.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">4.3 Account Termination</h4>
                  <p className="text-gray-400 mb-2">We may suspend or terminate your account if you:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Violate these Terms of Service</li>
                    <li>• Engage in fraudulent or illegal activity</li>
                    <li>• Abuse or misuse our services</li>
                    <li>• Provide false or misleading information</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* 5. Acceptable Use */}
            <Section id="acceptable-use" icon={ShieldCheck} title="5. Acceptable Use Policy">
              <p className="mb-4">You agree NOT to:</p>
              
              <div className="space-y-3">
                {[
                  "Use our services for illegal purposes or to violate any laws",
                  "Harass, abuse, threaten, or harm others",
                  "Generate or distribute malicious content, malware, or spam",
                  "Attempt to hack, reverse engineer, or compromise our systems",
                  "Scrape, crawl, or collect data without authorization",
                  "Impersonate others or provide false information",
                  "Share account credentials or resell access",
                  "Generate content that infringes intellectual property rights",
                  "Use services to create deepfakes or misleading content without disclosure",
                  "Overload our systems or interfere with other users' access"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <span className="text-red-400">❌</span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Violation of this policy may result in immediate account suspension or termination without refund.
              </p>
            </Section>

            {/* 6. Intellectual Property */}
            <Section id="ip" icon={Copyright} title="6. Intellectual Property Rights">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">6.1 Our IP</h4>
                  <p className="text-gray-400 mb-2">All platform content, features, and functionality are owned by One Last AI and protected by:</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["Copyright laws", "Trademark laws", "Patent laws", "Trade secret laws", "Other IP rights"].map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">6.2 Your Content</h4>
                  <p className="text-gray-400 mb-2">You retain ownership of content you submit. By using our services, you grant us:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">A worldwide, non-exclusive license to use your content to provide services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Right to store, process, and transmit your content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Right to use anonymized/aggregated data for AI training</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">6.3 AI-Generated Content</h4>
                  <p className="text-gray-400 mb-2">Content generated by our AI agents:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">You receive a non-exclusive license to use AI-generated outputs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">We do not claim ownership of AI-generated content you create</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">You are responsible for ensuring outputs comply with applicable laws</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">We do not guarantee outputs are free from third-party IP claims</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">6.4 DMCA Compliance</h4>
                  <p className="text-gray-400 mb-2">
                    We respect intellectual property rights and comply with the{" "}
                    <ArticleRef articleKey="dmca" label="Digital Millennium Copyright Act (DMCA)" onClick={handleArticleClick} />.
                  </p>
                  <p className="text-gray-400">
                    To file a copyright infringement notice, email:{" "}
                    <a href="mailto:dmca@onelastai.com" className="text-cyan-400 hover:text-cyan-300">dmca@onelastai.com</a>
                  </p>
                </div>
              </div>
            </Section>

            {/* 7. Disclaimers */}
            <Section id="disclaimers" icon={AlertTriangle} title="7. Disclaimers and Limitations">
              <div className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-amber-400 mb-3">7.1 &ldquo;As Is&rdquo; Service</h4>
                  <p className="text-gray-400 uppercase text-sm mb-2">
                    Our services are provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without warranties of any kind, including:
                  </p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Accuracy, reliability, or completeness of AI-generated content</li>
                    <li>• Uninterrupted or error-free operation</li>
                    <li>• Security of data transmission</li>
                    <li>• Fitness for a particular purpose</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">7.2 AI Limitations</h4>
                  <p className="text-gray-400 mb-2">AI systems may produce inaccurate, biased, or inappropriate outputs. You acknowledge that:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">AI responses may contain errors or hallucinations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">You should verify important information independently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">AI should not replace professional advice (legal, medical, financial)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">We are not responsible for decisions based on AI outputs</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-red-400 mb-3">7.3 Limitation of Liability</h4>
                  <p className="text-gray-400 uppercase text-sm mb-2">
                    To the maximum extent permitted by law, One Last AI shall not be liable for:
                  </p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Indirect, incidental, special, consequential, or punitive damages</li>
                    <li>• Loss of profits, data, or business opportunities</li>
                    <li>• Damages exceeding the amount you paid us in the past 12 months</li>
                    <li>• Third-party actions or content</li>
                  </ul>
                  <p className="text-gray-400 mt-3">
                    See <ArticleRef articleKey="liability" label="Section 230 Protections" onClick={handleArticleClick} /> for legal framework.
                  </p>
                </div>
              </div>
            </Section>

            {/* 8. Dispute Resolution */}
            <Section id="disputes" icon={Scale} title="8. Dispute Resolution">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">8.1 Informal Resolution</h4>
                  <p className="text-gray-400">
                    Before filing a claim, please contact us at{" "}
                    <a href="mailto:legal@onelastai.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                      legal@onelastai.com
                    </a>{" "}
                    to attempt informal resolution.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">8.2 Binding Arbitration</h4>
                  <p className="text-gray-400 mb-3">
                    Any disputes arising from these Terms or our services shall be resolved through binding{" "}
                    <ArticleRef articleKey="arbitration" label="arbitration" onClick={handleArticleClick} />, not in court.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Arbitration under American Arbitration Association (AAA) rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Individual basis only (no class actions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Conducted remotely or in your jurisdiction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">You may opt out within 30 days by written notice</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">8.3 Governing Law</h4>
                  <p className="text-gray-400">
                    These Terms are governed by the laws of the jurisdiction where One Last AI is incorporated, without regard to conflict of law principles.
                  </p>
                </div>
              </div>
            </Section>

            {/* 9. Changes to Terms */}
            <Section id="changes" icon={RefreshCw} title="9. Changes to Terms">
              <p className="mb-4">We may update these Terms periodically. Significant changes will be communicated via:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span className="text-gray-400">Email notification</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span className="text-gray-400">Prominent platform notice</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span className="text-gray-400">Updated &ldquo;Last Modified&rdquo; date</span>
                </li>
              </ul>
              <p className="mt-4">Continued use after changes constitutes acceptance of updated Terms.</p>
            </Section>

            {/* 10. Contact */}
            <Section id="contact" icon={Mail} title="10. Contact Information">
              <p className="mb-6">For questions about these Terms, please contact us:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Legal</h4>
                  <a href="mailto:legal@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    legal@onelastai.com
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Support</h4>
                  <a href="mailto:support@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    support@onelastai.com
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">DMCA</h4>
                  <a href="mailto:dmca@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    dmca@onelastai.com
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Website</h4>
                  <a href="https://onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    onelastai.com
                  </a>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Article Popup */}
      {selectedArticle && articles[selectedArticle] && (
        <ArticlePopup
          article={articles[selectedArticle]}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
