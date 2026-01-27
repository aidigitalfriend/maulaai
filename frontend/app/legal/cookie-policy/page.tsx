"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Cookie,
  Shield,
  Settings,
  Clock,
  BarChart3,
  Share2,
  Mail,
  X,
  ExternalLink,
  Check,
  AlertCircle,
  Zap,
  Target,
  Users,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Creative styles for cards
const creativeStyles = `
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(15, 15, 15, 0.9));
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #00d4ff, #00ff88, #0066ff, #00d4ff);
    background-size: 300% 300%;
    animation: glowRotate 4s ease infinite;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .glow-card:hover::before {
    opacity: 1;
  }
  @keyframes glowRotate {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .shimmer-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
    transition: left 0.6s ease;
    pointer-events: none;
  }
  .shimmer-card:hover::after {
    left: 100%;
  }

  .glass-card {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(26, 26, 26, 0.7);
  }

  .float-card {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
  }

  .cyber-grid::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .cyber-grid:hover::before {
    opacity: 1;
  }
`;

// Article popup for legal references
const articles: Record<string, { title: string; content: string }> = {
  "ePrivacy Directive": {
    title: "ePrivacy Directive (2002/58/EC)",
    content:
      "The ePrivacy Directive, also known as the 'Cookie Law', is an EU directive that deals with privacy and electronic communications. It requires websites to obtain user consent before storing or retrieving any information on a user's device, except for strictly necessary cookies. It works alongside the GDPR to ensure comprehensive privacy protection for EU citizens.",
  },
  CCPA: {
    title: "California Consumer Privacy Act (CCPA)",
    content:
      "The CCPA grants California residents rights including knowing what personal data is being collected, knowing whether their personal data is sold or disclosed, saying no to the sale of personal data, accessing their personal data, requesting deletion of their personal data, and not being discriminated against for exercising their privacy rights.",
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
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl">
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
          className="mt-6 w-full py-3 bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black font-semibold rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

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
      className="inline-flex items-center gap-1 text-[#00d4ff] hover:text-[#00d4ff]/80 underline underline-offset-2 transition-colors"
    >
      {article}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export default function CookiePolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

  // 3D tilt effect handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  useGSAP(() => {
    // Hero entrance animation with blur effect
    const heroTl = gsap.timeline({ defaults: { ease: "elastic.out(1, 0.8)" } });

    heroTl
      .fromTo(".hero-badge", { opacity: 0, y: 30, scale: 0.8, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1 })
      .fromTo(".hero-title", { opacity: 0, y: 60, scale: 0.9, filter: "blur(20px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.2 }, "-=0.6")
      .fromTo(".hero-subtitle", { opacity: 0, y: 40, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 }, "-=0.6")
      .fromTo(".hero-meta", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3");

    // Bento cards with explosive stagger
    gsap.fromTo(
      ".bento-card",
      { opacity: 0, y: 80, scale: 0.8, rotationX: 20, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        filter: "blur(0px)",
        duration: 1,
        stagger: { each: 0.1, from: "center" },
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: ".bento-grid", start: "top 85%", toggleActions: "play none none reverse" },
      }
    );

    // Section animations
    gsap.utils.toArray<HTMLElement>(".section-animate").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 60, filter: "blur(5px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
        }
      );
    });

    // Table rows animation with wave effect
    gsap.fromTo(
      ".table-row",
      { opacity: 0, x: -30, rotationY: -10 },
      {
        opacity: 1,
        x: 0,
        rotationY: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: ".cookie-table", start: "top 80%", toggleActions: "play none none reverse" },
      }
    );
  }, { scope: containerRef });

  const cookieTypes = [
    {
      icon: Shield,
      title: "Essential Cookies",
      desc: "Required for basic site functionality",
      color: "#00ff88",
      required: true,
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      desc: "Help us understand how you use our site",
      color: "#00d4ff",
      required: false,
    },
    {
      icon: Zap,
      title: "Functional Cookies",
      desc: "Remember your preferences and settings",
      color: "#a855f7",
      required: false,
    },
    {
      icon: Target,
      title: "Marketing Cookies",
      desc: "Track across sites for advertising",
      color: "#f59e0b",
      required: false,
    },
  ];

  const cookieTable = [
    { name: "_session", purpose: "User session management", duration: "Session", type: "Essential" },
    { name: "auth_token", purpose: "Authentication state", duration: "7 days", type: "Essential" },
    { name: "csrf_token", purpose: "Security - prevent CSRF attacks", duration: "Session", type: "Essential" },
    { name: "_ga", purpose: "Google Analytics - distinguish users", duration: "2 years", type: "Analytics" },
    { name: "_gid", purpose: "Google Analytics - distinguish users", duration: "24 hours", type: "Analytics" },
    { name: "theme", purpose: "Remember user theme preference", duration: "1 year", type: "Functional" },
    { name: "language", purpose: "Remember language preference", duration: "1 year", type: "Functional" },
    { name: "cookie_consent", purpose: "Store cookie consent preferences", duration: "1 year", type: "Essential" },
  ];

  const thirdParties = [
    { name: "Google Analytics", purpose: "Website traffic analysis", link: "https://policies.google.com/privacy" },
    { name: "Stripe", purpose: "Payment processing", link: "https://stripe.com/privacy" },
    { name: "Vercel", purpose: "Hosting and performance", link: "https://vercel.com/legal/privacy-policy" },
    { name: "OpenAI", purpose: "AI model processing", link: "https://openai.com/privacy" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx>{creativeStyles}</style>
      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <Cookie className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">Cookie Policy</span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            How We Use Cookies
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content.
          </p>

          <p className="hero-meta text-sm text-gray-500">Last updated: December 28, 2024</p>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12 relative overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-50"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-[#00d4ff]" />
                </div>
                <h2 className="text-3xl font-bold">What Are Cookies?</h2>
              </div>

              <p className="text-gray-300 text-lg mb-4 max-w-3xl">
                Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and understand how you use the service.
              </p>
              <p className="text-gray-400">
                This policy complies with the{" "}
                <ArticleRef article="ePrivacy Directive" onClick={setActiveArticle} /> and the{" "}
                <ArticleRef article="CCPA" onClick={setActiveArticle} />.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COOKIE TYPES - BENTO GRID */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
              <Settings className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#00d4ff] font-medium">Cookie Categories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Types of Cookies We Use</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We categorize cookies based on their purpose and necessity
            </p>
          </div>

          <div className="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cookieTypes.map((item, i) => (
              <div
                key={i}
                className="bento-card float-card glass-card shimmer-card group relative rounded-2xl p-6 overflow-hidden cursor-pointer cyber-grid"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}20, transparent 60%)` }}
                ></div>
                {item.required && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400">
                    Required
                  </div>
                )}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${item.color}30, transparent)` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2 transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COOKIES WE USE TABLE */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-3xl font-bold">Cookies We Use</h2>
            </div>

            <div className="cookie-table overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Cookie Name</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Purpose</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Duration</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieTable.map((cookie, i) => (
                    <tr key={i} className="table-row border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono text-[#00d4ff] text-sm">{cookie.name}</td>
                      <td className="py-4 px-4 text-gray-300">{cookie.purpose}</td>
                      <td className="py-4 px-4 text-gray-400">{cookie.duration}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            cookie.type === "Essential"
                              ? "bg-green-500/20 text-green-400"
                              : cookie.type === "Analytics"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {cookie.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* THIRD PARTY COOKIES */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="section-animate">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
                <Share2 className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-sm text-[#00d4ff] font-medium">Third Parties</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Third-Party Cookies</h2>
              <p className="text-gray-400 mb-8">
                Some cookies are placed by third-party services that appear on our pages. We have no control over these
                cookies and recommend reviewing their privacy policies.
              </p>

              <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-400 mb-1">Third-Party Notice</p>
                    <p className="text-sm text-gray-400">
                      Third-party providers have their own privacy policies. Review them for complete information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-animate space-y-4">
              {thirdParties.map((party, i) => {
                const colors = ['#00d4ff', '#00ff88', '#0066ff', '#a855f7'];
                const color = colors[i % colors.length];
                return (
                  <div
                    key={i}
                    className="glass-card float-card shimmer-card p-5 rounded-2xl overflow-hidden relative group cursor-pointer flex items-center justify-between"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }}></div>
                    <div>
                      <h4 className="font-semibold text-white mb-1 group-hover:text-[#00d4ff] transition-colors">{party.name}</h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{party.purpose}</p>
                    </div>
                    <a
                      href={party.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#00d4ff] hover:text-[#00d4ff]/80 text-sm transition-colors"
                    >
                      Privacy
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MANAGING COOKIES */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-3xl font-bold">Managing Your Cookies</h2>
            </div>

            <p className="text-gray-400 mb-8">
              You have control over which cookies you accept. Here are your options:
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "Browser Settings",
                  desc: "Most browsers allow you to block or delete cookies through settings. Check your browser's help documentation.",
                },
                {
                  title: "Cookie Banner",
                  desc: "Use our cookie consent banner to manage your preferences when you first visit the site.",
                },
                {
                  title: "Opt-Out Links",
                  desc: "For analytics cookies, use the opt-out links provided by third parties like Google Analytics.",
                },
                {
                  title: "Do Not Track",
                  desc: "We respect browser Do Not Track (DNT) signals and will not track you if enabled.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-[#00d4ff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-400 mb-1">Note</p>
                  <p className="text-sm text-gray-400">
                    Blocking essential cookies may impact the functionality of our services and prevent you from accessing certain features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#00d4ff]/20 via-transparent to-transparent blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#00d4ff]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Questions About Cookies?</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                If you have any questions about our use of cookies, please reach out.
              </p>

              <a
                href="mailto:privacy@onelastai.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-black font-semibold rounded-2xl hover:opacity-90 transition-opacity"
              >
                <Mail className="w-5 h-5" />
                Contact Privacy Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Article Popup */}
      {activeArticle && <ArticlePopup articleKey={activeArticle} onClose={() => setActiveArticle(null)} />}

      {/* CSS for gradient-radial */}
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
