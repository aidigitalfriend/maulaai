"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Shield, Database, Users, Lock, Globe, Baby, Cookie, Bell, Mail, ChevronDown, X, ExternalLink } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Article popup for legal references
const articles: Record<string, { title: string; content: string }> = {
  GDPR: {
    title: "General Data Protection Regulation (GDPR)",
    content:
      "The GDPR is a regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area. It addresses the transfer of personal data outside the EU and EEA areas. The GDPR aims primarily to give control to individuals over their personal data and to simplify the regulatory environment for international business.",
  },
  CCPA: {
    title: "California Consumer Privacy Act (CCPA)",
    content:
      "The CCPA is a state statute intended to enhance privacy rights and consumer protection for residents of California, United States. It grants California residents rights including knowing what personal data is being collected, knowing whether their personal data is sold or disclosed, saying no to the sale of personal data, accessing their personal data, requesting deletion of their personal data, and not being discriminated against for exercising their privacy rights.",
  },
  COPPA: {
    title: "Children's Online Privacy Protection Act (COPPA)",
    content:
      "COPPA is a United States federal law that imposes certain requirements on operators of websites or online services directed to children under 13 years of age, and on operators of other websites or online services that have actual knowledge that they are collecting personal information online from a child under 13 years of age.",
  },
};

function ArticlePopup({
  articleKey,
  onClose,
}: {
  articleKey: string;
  onClose: () => void;
}) {
  const article = articles[articleKey];
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h3 className="text-xl font-bold text-white mb-4 pr-10">{article.title}</h3>
        <p className="text-gray-300 leading-relaxed">{article.content}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors"
        >
          Got it
        </button>
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
  article,
  onClick,
}: {
  article: string;
  onClick: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(article)}
      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
    >
      {article}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

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
    { id: "introduction", title: "Introduction", icon: Shield },
    { id: "information-collected", title: "Information We Collect", icon: Database },
    { id: "how-we-use", title: "How We Use Your Information", icon: Users },
    { id: "sharing", title: "Information Sharing", icon: Globe },
    { id: "retention", title: "Data Retention", icon: Database },
    { id: "rights", title: "Your Rights", icon: Lock },
    { id: "security", title: "Security", icon: Shield },
    { id: "transfers", title: "International Transfers", icon: Globe },
    { id: "children", title: "Children's Privacy", icon: Baby },
    { id: "cookies", title: "Cookies", icon: Cookie },
    { id: "changes", title: "Changes to Policy", icon: Bell },
    { id: "contact", title: "Contact Us", icon: Mail },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30" />
        
        <div className="hero-content relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Privacy Policy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Privacy Matters
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            We are committed to protecting your personal information and being transparent about how we collect, use, and share it.
          </p>
          <p className="text-sm text-gray-500">
            Last updated: December 28, 2024
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
            {/* Introduction */}
            <Section id="introduction" icon={Shield} title="Introduction">
              <p>
                Welcome to One Last AI (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p>
                This policy is designed to comply with various privacy regulations, including the{" "}
                <ArticleRef article="GDPR" onClick={setActiveArticle} />,{" "}
                <ArticleRef article="CCPA" onClick={setActiveArticle} />, and other applicable laws. Please read this privacy policy carefully to understand our policies and practices regarding your information.
              </p>
            </Section>

            {/* Information We Collect */}
            <Section id="information-collected" icon={Database} title="Information We Collect">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Personal Information You Provide</h3>
                  <p className="mb-3">We collect information that you voluntarily provide to us when you:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                    <li>Register for an account</li>
                    <li>Use our AI chat services</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Contact us for support</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                  <p className="mt-3">This information may include your name, email address, phone number, billing information, and any other information you choose to provide.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Chat and Conversation Data</h3>
                  <p>When you interact with our AI assistants, we collect the content of your conversations to provide and improve our services. This includes messages, prompts, and any files or images you share during conversations.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Automatically Collected Information</h3>
                  <p className="mb-3">When you access our services, we automatically collect certain information, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                    <li>Device information (type, operating system, browser)</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and preferences</li>
                    <li>Referring URLs and pages visited</li>
                    <li>Time spent on our platform</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* How We Use Your Information */}
            <Section id="how-we-use" icon={Users} title="How We Use Your Information">
              <p className="mb-4">We use the information we collect for various purposes, including:</p>
              
              <div className="grid gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Service Delivery</h4>
                  <p className="text-sm text-gray-400">Providing, maintaining, and improving our AI chat services and features.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Personalization</h4>
                  <p className="text-sm text-gray-400">Customizing your experience and providing personalized recommendations.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Communication</h4>
                  <p className="text-sm text-gray-400">Sending you updates, security alerts, and support messages.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Analytics</h4>
                  <p className="text-sm text-gray-400">Analyzing usage patterns to improve our services and user experience.</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">AI Training</h4>
                  <p className="text-sm text-gray-400">With your consent, using conversation data to improve our AI models (anonymized and aggregated).</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Legal Compliance</h4>
                  <p className="text-sm text-gray-400">Complying with legal obligations and protecting our rights.</p>
                </div>
              </div>
            </Section>

            {/* Information Sharing */}
            <Section id="sharing" icon={Globe} title="Information Sharing">
              <p className="mb-4">We may share your information in the following circumstances:</p>
              
              <div className="space-y-4">
                <div className="border-l-2 border-cyan-500/50 pl-4">
                  <h4 className="font-semibold text-white mb-1">Service Providers</h4>
                  <p className="text-sm text-gray-400">We share information with third-party vendors who perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.</p>
                </div>
                <div className="border-l-2 border-cyan-500/50 pl-4">
                  <h4 className="font-semibold text-white mb-1">AI Model Providers</h4>
                  <p className="text-sm text-gray-400">Your conversation data may be processed by our AI partners (OpenAI, Anthropic, Google) to provide responses. Each provider has their own privacy policies.</p>
                </div>
                <div className="border-l-2 border-cyan-500/50 pl-4">
                  <h4 className="font-semibold text-white mb-1">Legal Requirements</h4>
                  <p className="text-sm text-gray-400">We may disclose information if required by law, court order, or government regulation, or when we believe disclosure is necessary to protect our rights or investigate potential violations.</p>
                </div>
                <div className="border-l-2 border-cyan-500/50 pl-4">
                  <h4 className="font-semibold text-white mb-1">Business Transfers</h4>
                  <p className="text-sm text-gray-400">In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 font-medium">We do not sell your personal information to third parties for their marketing purposes.</p>
              </div>
            </Section>

            {/* Data Retention */}
            <Section id="retention" icon={Database} title="Data Retention">
              <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.</p>
              
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-gray-400 font-medium">Data Type</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 text-white">Account Information</td>
                      <td className="py-3 text-gray-400">Until account deletion + 30 days</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white">Chat History</td>
                      <td className="py-3 text-gray-400">90 days (or until manually deleted)</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white">Payment Records</td>
                      <td className="py-3 text-gray-400">7 years (legal requirement)</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white">Analytics Data</td>
                      <td className="py-3 text-gray-400">26 months (anonymized)</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white">Support Tickets</td>
                      <td className="py-3 text-gray-400">2 years after resolution</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Your Rights */}
            <Section id="rights" icon={Lock} title="Your Rights">
              <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Right to Access</h4>
                  <p className="text-sm text-gray-400">Request a copy of your personal data we hold.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Right to Rectification</h4>
                  <p className="text-sm text-gray-400">Request correction of inaccurate information.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Right to Erasure</h4>
                  <p className="text-sm text-gray-400">Request deletion of your personal data.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Right to Portability</h4>
                  <p className="text-sm text-gray-400">Receive your data in a structured format.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Right to Object</h4>
                  <p className="text-sm text-gray-400">Object to certain types of processing.</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Right to Withdraw Consent</h4>
                  <p className="text-sm text-gray-400">Withdraw consent at any time.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">For <ArticleRef article="GDPR" onClick={setActiveArticle} /> (EU/EEA Residents)</h4>
                  <p className="text-sm text-gray-400">You have all the rights listed above. We process your data based on consent, contract performance, legitimate interests, or legal obligations.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">For <ArticleRef article="CCPA" onClick={setActiveArticle} /> (California Residents)</h4>
                  <p className="text-sm text-gray-400">You have the right to know, delete, opt-out of sale (we don&apos;t sell data), and non-discrimination. You can designate an authorized agent to make requests on your behalf.</p>
                </div>
              </div>
            </Section>

            {/* Security */}
            <Section id="security" icon={Shield} title="Security">
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Encryption</h4>
                    <p className="text-xs text-gray-400 mt-1">TLS 1.3 for data in transit, AES-256 at rest</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Access Controls</h4>
                    <p className="text-xs text-gray-400 mt-1">Role-based access and multi-factor authentication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Database className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Regular Backups</h4>
                    <p className="text-xs text-gray-400 mt-1">Encrypted backups with disaster recovery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Bell className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Monitoring</h4>
                    <p className="text-xs text-gray-400 mt-1">24/7 security monitoring and intrusion detection</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-400 text-sm">While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
              </div>
            </Section>

            {/* International Transfers */}
            <Section id="transfers" icon={Globe} title="International Data Transfers">
              <p className="mb-4">Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:</p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Standard Contractual Clauses (SCCs) approved by the European Commission</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Data Processing Agreements with all third-party processors</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Encryption of data during international transfers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Regular assessment of third-party security practices</span>
                </li>
              </ul>
            </Section>

            {/* Children's Privacy */}
            <Section id="children" icon={Baby} title="Children's Privacy">
              <p className="mb-4">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
              <p>
                In compliance with <ArticleRef article="COPPA" onClick={setActiveArticle} />, if we learn that we have collected personal information from a child under 13, we will take steps to delete that information as quickly as possible.
              </p>
              <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-purple-400 text-sm">For users aged 13-18, we recommend parental guidance when using our AI services.</p>
              </div>
            </Section>

            {/* Cookies */}
            <Section id="cookies" icon={Cookie} title="Cookies & Tracking">
              <p className="mb-4">We use cookies and similar tracking technologies to collect and track information about your use of our services. Types of cookies we use:</p>
              
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Essential Cookies</h4>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Always Active</span>
                  </div>
                  <p className="text-sm text-gray-400">Required for basic site functionality and security.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Analytics Cookies</h4>
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">Optional</span>
                  </div>
                  <p className="text-sm text-gray-400">Help us understand how visitors interact with our site.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Preference Cookies</h4>
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">Optional</span>
                  </div>
                  <p className="text-sm text-gray-400">Remember your settings and preferences.</p>
                </div>
              </div>

              <p className="mt-4 text-sm">
                For more information about our cookie practices, please see our{" "}
                <a href="/legal/cookie-policy" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Cookie Policy</a>.
              </p>
            </Section>

            {/* Changes to Policy */}
            <Section id="changes" icon={Bell} title="Changes to This Policy">
              <p className="mb-4">We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.</p>
              <p className="mb-4">When we make material changes, we will:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Update the &ldquo;Last updated&rdquo; date at the top of this policy</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Notify you via email (for registered users)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <span>Display a prominent notice on our website</span>
                </li>
              </ul>
              <p className="mt-4">We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
            </Section>

            {/* Contact Us */}
            <Section id="contact" icon={Mail} title="Contact Us">
              <p className="mb-6">If you have questions or concerns about this privacy policy or our data practices, please contact us:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Email</h4>
                  <a href="mailto:privacy@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    privacy@onelastai.com
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Data Protection Officer</h4>
                  <a href="mailto:dpo@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    dpo@onelastai.com
                  </a>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-400">
                  For GDPR-related inquiries or to exercise your data protection rights, please include &ldquo;GDPR Request&rdquo; in your email subject line. We will respond within 30 days.
                </p>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Article Popup */}
      {activeArticle && (
        <ArticlePopup
          articleKey={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </div>
  );
}
