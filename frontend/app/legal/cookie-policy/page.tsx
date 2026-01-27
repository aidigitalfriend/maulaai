"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  Cookie, 
  Shield, 
  Eye, 
  Settings, 
  Globe, 
  Sliders,
  Bell,
  Mail,
  ChevronDown,
  X,
  ExternalLink,
  Check
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Article references for legal terms
interface ArticleReference {
  title: string;
  content: string;
  source: string;
}

const articles: Record<string, ArticleReference> = {
  ePrivacy: {
    title: "ePrivacy Directive (Cookie Law)",
    content: `The ePrivacy Directive (2002/58/EC), often called the "Cookie Law," regulates the use of cookies and similar tracking technologies in the European Union.

Key Requirements:
• Prior informed consent required for non-essential cookies
• Clear and comprehensive information about cookie use
• Users must be able to refuse cookies
• Consent must be freely given, specific, informed, and unambiguous

Cookie Categories:
1. Strictly Necessary: No consent required (essential for site operation)
2. Performance/Analytics: Consent required (track usage patterns)
3. Functional: Consent required (remember preferences)
4. Targeting/Advertising: Consent required (personalized ads)

Penalties:
Non-compliance can result in fines up to €20 million or 4% of global annual revenue under GDPR enforcement.`,
    source: "Directive 2002/58/EC (as amended by Directive 2009/136/EC)",
  },
  ccpaOptOut: {
    title: "CCPA Cookie Opt-Out Rights",
    content: `The California Consumer Privacy Act (CCPA) provides specific rights regarding cookies and tracking technologies.

Consumer Rights:
• Right to know what personal information is collected via cookies
• Right to know if personal information is sold or shared
• Right to opt-out of the sale of personal information
• Right to non-discrimination for exercising privacy rights

"Do Not Sell My Personal Information" Link:
Businesses must provide a clear and conspicuous link on their homepage titled "Do Not Sell My Personal Information" that enables consumers to opt-out of the sale of their data.

Cookie Disclosure Requirements:
• Disclose categories of personal information collected via cookies
• Disclose third parties with whom information is shared
• Provide opt-out mechanisms for non-essential cookies
• Honor Global Privacy Control (GPC) signals

Enforcement:
The California Privacy Protection Agency (CPPA) can impose fines of up to $7,500 per intentional violation.`,
    source: "California Civil Code § 1798.100 et seq.",
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

// Cookie table component
function CookieTable({
  cookies,
  headerBg = "bg-white/5",
}: {
  cookies: Array<{ name: string; purpose: string; duration: string }>;
  headerBg?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className={headerBg}>
          <tr className="border-b border-white/10">
            <th className="text-left p-3 text-gray-400 font-medium">Cookie Name</th>
            <th className="text-left p-3 text-gray-400 font-medium">Purpose</th>
            <th className="text-left p-3 text-gray-400 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {cookies.map((cookie, i) => (
            <tr key={i}>
              <td className="p-3 font-mono text-xs text-cyan-400">{cookie.name}</td>
              <td className="p-3 text-gray-400">{cookie.purpose}</td>
              <td className="p-3 text-gray-500">{cookie.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicyPage() {
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
    { id: "introduction", title: "1. Introduction", icon: Cookie },
    { id: "what-are-cookies", title: "2. What Are Cookies?", icon: Cookie },
    { id: "cookies-we-use", title: "3. Cookies We Use", icon: Shield },
    { id: "third-party", title: "4. Third-Party Services", icon: Globe },
    { id: "managing", title: "5. Managing Cookies", icon: Sliders },
    { id: "updates", title: "6. Updates", icon: Bell },
    { id: "contact", title: "7. Contact", icon: Mail },
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
            <Cookie className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Cookie Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Learn how we use cookies and similar technologies to improve your experience on our platform.
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
            {/* 1. Introduction */}
            <Section id="introduction" icon={Cookie} title="1. Introduction">
              <p>
                This Cookie Policy explains how One Last AI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar tracking technologies on our website at{" "}
                <a href="https://onelastai.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  onelastai.com
                </a>.
              </p>
              <p>
                By using our website, you consent to our use of cookies in accordance with this policy and our{" "}
                <a href="/legal/privacy-policy" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                  Privacy Policy
                </a>. You can manage your cookie preferences at any time.
              </p>
              
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mt-4">
                <p>
                  <strong className="text-white">Legal Framework:</strong> Our cookie practices comply with the{" "}
                  <ArticleRef articleKey="ePrivacy" label="ePrivacy Directive (EU Cookie Law)" onClick={handleArticleClick} />, GDPR, and{" "}
                  <ArticleRef articleKey="ccpaOptOut" label="CCPA requirements" onClick={handleArticleClick} />.
                </p>
              </div>
            </Section>

            {/* 2. What Are Cookies */}
            <Section id="what-are-cookies" icon={Cookie} title="2. What Are Cookies?">
              <p className="mb-4">Cookies are small text files stored on your device when you visit a website. They help websites:</p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="font-semibold text-white mb-1">📝 Remember You</p>
                  <p className="text-sm text-gray-400">Store login status and preferences</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="font-semibold text-white mb-1">📊 Analyze Usage</p>
                  <p className="text-sm text-gray-400">Track how visitors use the site</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="font-semibold text-white mb-1">⚡ Improve Performance</p>
                  <p className="text-sm text-gray-400">Optimize loading times and functionality</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="font-semibold text-white mb-1">🎯 Personalize Experience</p>
                  <p className="text-sm text-gray-400">Customize content and features</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Cookie Types by Duration</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">Session Cookies</p>
                      <p className="text-sm text-gray-400">Temporary cookies deleted when you close your browser. Used for essential site functions.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">Persistent Cookies</p>
                      <p className="text-sm text-gray-400">Remain on your device until expiration or manual deletion. Remember preferences between visits.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Cookie Types by Source</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">First-Party Cookies</p>
                      <p className="text-sm text-gray-400">Set by One Last AI directly. We have full control over these cookies.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">Third-Party Cookies</p>
                      <p className="text-sm text-gray-400">Set by external services (e.g., Google Analytics). Subject to third-party privacy policies.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* 3. Cookies We Use */}
            <Section id="cookies-we-use" icon={Shield} title="3. Cookies We Use">
              <div className="space-y-6">
                {/* Strictly Necessary */}
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white">3.1 Strictly Necessary Cookies</h4>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Always Active</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">These cookies are essential for the website to function. We do not need your consent for these.</p>
                    </div>
                  </div>
                  
                  <CookieTable
                    cookies={[
                      { name: "session_token", purpose: "Maintains your login session", duration: "Session" },
                      { name: "csrf_token", purpose: "Prevents cross-site request forgery", duration: "Session" },
                      { name: "cookie_consent", purpose: "Stores your cookie preferences", duration: "1 year" },
                      { name: "load_balancer", purpose: "Routes requests to correct server", duration: "Session" },
                    ]}
                  />
                </div>

                {/* Performance/Analytics */}
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white">3.2 Performance & Analytics Cookies</h4>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Consent Required</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Help us understand how visitors use our site. We need your consent for these.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                      <h5 className="font-semibold text-white mb-2">Google Analytics</h5>
                      <p className="text-sm text-gray-400 mb-3">We use Google Analytics to track website usage, visitor demographics, and traffic sources.</p>
                      <CookieTable
                        cookies={[
                          { name: "_ga", purpose: "Distinguishes unique visitors", duration: "2 years" },
                          { name: "_gid", purpose: "Distinguishes users for 24 hours", duration: "24 hours" },
                          { name: "_gat", purpose: "Throttles request rate", duration: "1 minute" },
                        ]}
                      />
                      <p className="text-xs text-gray-500 mt-3">
                        Data is anonymized. See{" "}
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                          Google&apos;s Privacy Policy
                        </a>
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                      <h5 className="font-semibold text-white mb-2">Performance Monitoring</h5>
                      <p className="text-sm text-gray-400 mb-3">Track page load times, API response times, and errors to improve service quality.</p>
                      <CookieTable
                        cookies={[
                          { name: "perf_metrics", purpose: "Stores performance timing data", duration: "7 days" },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Functional */}
                <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Settings className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white">3.3 Functional Cookies</h4>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Consent Required</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Remember your preferences and provide enhanced features.</p>
                    </div>
                  </div>
                  
                  <CookieTable
                    cookies={[
                      { name: "theme_preference", purpose: "Remembers dark/light mode choice", duration: "1 year" },
                      { name: "language", purpose: "Stores preferred language", duration: "1 year" },
                      { name: "agent_preferences", purpose: "Saves favorite AI agents", duration: "6 months" },
                      { name: "voice_settings", purpose: "Remembers voice interaction preferences", duration: "6 months" },
                    ]}
                  />
                </div>
              </div>
            </Section>

            {/* 4. Third-Party Services */}
            <Section id="third-party" icon={Globe} title="4. Third-Party Services">
              <p className="mb-4">We integrate the following third-party services that may set cookies:</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-400 mb-2">Website analytics and visitor insights</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>
                      Privacy Policy:{" "}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                        policies.google.com/privacy
                      </a>
                    </p>
                    <p>
                      Opt-out:{" "}
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                        Browser Add-on
                      </a>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Payment Processors (Stripe, PayPal)</h4>
                  <p className="text-sm text-gray-400 mb-2">Secure payment processing and fraud prevention</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>
                      Stripe Privacy:{" "}
                      <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                        stripe.com/privacy
                      </a>
                    </p>
                    <p>
                      PayPal Privacy:{" "}
                      <a href="https://www.paypal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                        paypal.com/privacy
                      </a>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Cloudflare</h4>
                  <p className="text-sm text-gray-400 mb-2">CDN, DDoS protection, and performance optimization</p>
                  <div className="text-xs text-gray-500">
                    <p>
                      Privacy Policy:{" "}
                      <a href="https://www.cloudflare.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                        cloudflare.com/privacy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* 5. Managing Cookies */}
            <Section id="managing" icon={Sliders} title="5. Managing Your Cookie Preferences">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">5.1 Cookie Settings on Our Site</h4>
                  <p className="mb-3">You can manage your cookie preferences at any time:</p>
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors">
                      Open Cookie Preferences
                    </button>
                    <p className="text-sm text-gray-400 mt-3">Adjust settings for analytics, functional, and other non-essential cookies</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">5.2 Browser Settings</h4>
                  <p className="mb-3">Most browsers allow you to control cookies through settings:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { browser: "Google Chrome", path: "Settings → Privacy and Security → Cookies" },
                      { browser: "Mozilla Firefox", path: "Options → Privacy & Security → Cookies" },
                      { browser: "Safari", path: "Preferences → Privacy → Cookies" },
                      { browser: "Microsoft Edge", path: "Settings → Privacy → Cookies" },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-white text-sm">{item.browser}</p>
                        <p className="text-xs text-gray-500">{item.path}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">5.3 Opt-Out Tools</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-400">
                        <strong className="text-white">Google Analytics:</strong>{" "}
                        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                          Browser Add-on
                        </a>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-400">
                        <strong className="text-white">Do Not Track (DNT):</strong> Enable in browser settings (we honor DNT signals)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-400">
                        <strong className="text-white">Global Privacy Control:</strong>{" "}
                        <a href="https://globalprivacycontrol.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                          Learn more
                        </a>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 text-sm">
                    <strong className="text-white">Important:</strong> Blocking strictly necessary cookies may prevent you from using essential features of our platform, including login and account management.
                  </p>
                </div>
              </div>
            </Section>

            {/* 6. Updates */}
            <Section id="updates" icon={Bell} title="6. Updates to This Policy">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal compliance. Updates will be posted on this page with a new &ldquo;Last Updated&rdquo; date. Significant changes will be communicated via email or platform notification.
              </p>
            </Section>

            {/* 7. Contact */}
            <Section id="contact" icon={Mail} title="7. Contact Us About Cookies">
              <p className="mb-6">For questions about our cookie practices:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Privacy</h4>
                  <a href="mailto:privacy@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    privacy@onelastai.com
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Support</h4>
                  <a href="mailto:support@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    support@onelastai.com
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
