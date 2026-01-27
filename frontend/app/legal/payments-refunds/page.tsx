"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  DollarSign, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  FileText,
  XCircle,
  RefreshCw,
  AlertCircle,
  Bell,
  Mail,
  ChevronDown,
  Check,
  X,
  Bot,
  Wrench,
  Mic,
  Users,
  BarChart3,
  HeadphonesIcon
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Section wrapper component
function Section({
  id,
  icon: Icon,
  title,
  children,
  className = "",
  variant = "default",
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "danger" | "warning";
}) {
  const bgColors = {
    default: "from-white/5 to-transparent border-white/10",
    danger: "from-red-500/10 to-red-500/5 border-red-500/30",
    warning: "from-amber-500/10 to-amber-500/5 border-amber-500/30",
  };

  const iconColors = {
    default: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    danger: "bg-red-500/20 border-red-500/30 text-red-400",
    warning: "bg-amber-500/20 border-amber-500/30 text-amber-400",
  };

  const titleColors = {
    default: "text-white",
    danger: "text-red-400",
    warning: "text-amber-400",
  };

  return (
    <section id={id} className={`section-card bg-gradient-to-br ${bgColors[variant]} border rounded-2xl p-6 md:p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl border ${iconColors[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h2 className={`text-2xl font-bold ${titleColors[variant]}`}>{title}</h2>
      </div>
      <div className="text-gray-300 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PaymentsRefundsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

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
    { id: "overview", title: "1. Overview", icon: FileText },
    { id: "pricing", title: "2. Pricing Structure", icon: DollarSign },
    { id: "payment-methods", title: "3. Payment Methods", icon: CreditCard },
    { id: "payment-terms", title: "4. Payment Terms", icon: FileText },
    { id: "no-refunds", title: "5. No Refund Policy", icon: XCircle },
    { id: "cancellation", title: "6. Cancellation", icon: RefreshCw },
    { id: "chargebacks", title: "7. Chargebacks", icon: AlertCircle },
    { id: "price-changes", title: "8. Price Changes", icon: Bell },
    { id: "contact", title: "9. Contact", icon: Mail },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30" />
        
        <div className="hero-content relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Billing & Payments</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Payments & Refunds Policy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Simple, transparent pricing with no auto-renewal. Understand our payment terms and refund policy.
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
            {/* 1. Overview */}
            <Section id="overview" icon={FileText} title="1. Overview">
              <p>
                This Payments & Refunds Policy explains the pricing structure, payment methods, billing procedures, and refund policy for One Last AI services. By purchasing access to our services, you agree to these terms.
              </p>
              
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl mt-4">
                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/20 h-fit">
                    <DollarSign className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white mb-2">One-Time Purchases - No Auto-Renewal</p>
                    <p className="text-gray-400">
                      Choose from $1/day, $5/week, or $15/month access to any AI agent. Each purchase is one-time only with NO automatic renewal. You only pay when you want access.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* 2. Pricing Structure */}
            <Section id="pricing" icon={DollarSign} title="2. Pricing Structure">
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  Simple Per-Agent Pricing
                </h3>
                <div className="space-y-3">
                  {[
                    { title: "One-Time Purchase", desc: "$1/day, $5/week, or $15/month - NO auto-renewal" },
                    { title: "Single Agent Access", desc: "Choose one AI agent per purchase" },
                    { title: "No Recurring Charges", desc: "Manually repurchase when access expires if you want to continue" },
                    { title: "Immediate Access", desc: "Start using your chosen agent right away" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">2.1 What&apos;s Included</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Bot, title: "AI Agents", desc: "Access to 90+ specialized AI personalities" },
                    { icon: Wrench, title: "Developer Tools", desc: "19 network utilities and WHOIS services" },
                    { icon: Mic, title: "Voice Features", desc: "Emotional TTS with 15+ voices" },
                    { icon: Users, title: "Community", desc: "Connect with users worldwide" },
                    { icon: BarChart3, title: "Analytics", desc: "Track usage and performance" },
                    { icon: HeadphonesIcon, title: "Priority Support", desc: "Email support within 24 hours" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">2.2 No Free Tier</h4>
                <p className="mb-3">One Last AI does not offer a free tier. All agent access requires a one-time payment starting at $1/day. This low-cost model ensures:</p>
                <ul className="space-y-2">
                  {[
                    "High-quality AI services without ads",
                    "Continuous platform improvements",
                    "Responsive customer support",
                    "Data privacy and security investments",
                    "No surprise recurring charges"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            {/* 3. Payment Methods */}
            <Section id="payment-methods" icon={CreditCard} title="3. Payment Methods">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    Accepted Payment Methods
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">💳 Credit & Debit Cards</p>
                      <p className="text-sm text-gray-400">Visa, MasterCard, American Express, Discover, Diners Club, JCB</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">🅿️ PayPal</p>
                      <p className="text-sm text-gray-400">Link your PayPal account for convenient payments</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-1">🌐 International Payments</p>
                      <p className="text-sm text-gray-400">We accept payments from most countries worldwide</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">3.1 Payment Processing</h4>
                  <p className="mb-3">Payments are processed securely through:</p>
                  <ul className="space-y-2">
                    {[
                      { label: "Stripe:", value: "PCI DSS Level 1 certified payment processor" },
                      { label: "PayPal:", value: "Industry-leading payment platform" },
                      { label: "Encryption:", value: "All transactions use 256-bit SSL encryption" },
                      { label: "No Storage:", value: "We do not store full credit card numbers" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-400"><strong className="text-white">{item.label}</strong> {item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                  <div className="flex gap-3">
                    <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white mb-1">Secure Payment Guarantee</p>
                      <p className="text-sm text-gray-400">Your payment information is never stored on our servers. All transactions are processed through PCI-compliant third-party providers with bank-level security.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* 4. Payment Terms */}
            <Section id="payment-terms" icon={FileText} title="4. Payment Terms">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">4.1 One-Time Purchase - No Auto-Renewal</h4>
                  <p className="mb-3">Your payment method will be charged <strong className="text-white">once</strong> when you purchase access:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Charge occurs immediately upon purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400"><strong className="text-white">NO automatic renewal</strong> - you will NOT be charged again</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Access expires after your chosen period (1 day, 1 week, or 1 month)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">You must manually purchase again if you want continued access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">No surprises - you control when you pay</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">4.2 Payment Failures</h4>
                  <p className="mb-3">If a payment fails during purchase:</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-gray-300"><strong className="text-white">Immediate:</strong> You&apos;ll see an error message and can retry with a different payment method</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-gray-300"><strong className="text-white">No Access:</strong> Access is not granted until payment succeeds</p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <p className="text-gray-300"><strong className="text-white">No Retries:</strong> Since there&apos;s no auto-renewal, we don&apos;t retry failed payments - you simply try again when ready</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">4.3 Currency and Taxes</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">All prices are in <strong className="text-white">USD (United States Dollars)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Your bank may apply currency conversion fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Sales tax or VAT may be added based on your location</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400">Final charges will be clearly shown before payment</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* 5. NO REFUND POLICY */}
            <Section id="no-refunds" icon={XCircle} title="5. NO REFUND POLICY" variant="danger">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold text-white">All Payments Are Final and Non-Refundable</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-3">5.1 Policy Statement</h4>
                  <p className="text-lg mb-4">
                    <strong className="text-red-400">ONE LAST AI DOES NOT OFFER REFUNDS FOR ANY REASON.</strong>
                  </p>
                  <p className="mb-3">
                    All payments made to One Last AI are <strong className="text-white">final, non-refundable, and non-transferable</strong>. This includes but is not limited to:
                  </p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Daily access charges ($1.00 per day)</li>
                    <li>• Weekly access charges ($5.00 per week)</li>
                    <li>• Monthly access charges ($15.00 per month)</li>
                    <li>• Any one-time purchase fees</li>
                    <li>• Payments made in error</li>
                    <li>• Duplicate payments</li>
                  </ul>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-3">5.2 Rationale for No Refund Policy</h4>
                  <p className="mb-4">Our no-refund policy exists because:</p>
                  <div className="space-y-4">
                    {[
                      { num: 1, title: "Extremely Low Cost", desc: "At just $1.00 per day, our service is priced affordably for everyone." },
                      { num: 2, title: "Immediate Access", desc: "You receive full platform access immediately upon payment." },
                      { num: 3, title: "Digital Service Nature", desc: "Our AI services cannot be \"returned\" once used." },
                      { num: 4, title: "Transparent Pricing", desc: "You know exactly what you're paying upfront with no hidden fees." },
                      { num: 5, title: "Operational Sustainability", desc: "Low pricing requires efficient operations." },
                    ].map((item) => (
                      <div key={item.num} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {item.num}
                        </span>
                        <div>
                          <p className="text-white font-semibold">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                  <h4 className="text-lg font-bold text-white mb-3">5.3 No Exceptions</h4>
                  <p className="mb-3">We do not make exceptions to this policy for any circumstance, including:</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      "Dissatisfaction with service",
                      "Technical issues or bugs",
                      "Accidental purchases",
                      "Change of mind",
                      "Lack of usage",
                      "Early cancellation",
                      "Billing disputes",
                      "Feature requests not implemented",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-400">
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-red-400 font-semibold mt-4">
                    By purchasing, you acknowledge and accept this no-refund policy.
                  </p>
                </div>

                <div className="p-6 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <h4 className="text-lg font-bold text-cyan-400 mb-3">5.4 Alternatives to Refunds</h4>
                  <p className="mb-3">If you&apos;re experiencing issues, we encourage you to:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400"><strong className="text-white">Contact Support:</strong> <a href="mailto:support@onelastai.com" className="text-cyan-400 hover:text-cyan-300 underline">support@onelastai.com</a></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400"><strong className="text-white">Cancel Your Access:</strong> Stop using the agent and prevent duplicate purchases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400"><strong className="text-white">Provide Feedback:</strong> Help us improve the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-400"><strong className="text-white">Review Documentation:</strong> <a href="https://onelastai.com/docs" className="text-cyan-400 hover:text-cyan-300 underline">onelastai.com/docs</a></span>
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* 6. Cancellation */}
            <Section id="cancellation" icon={RefreshCw} title="6. Cancellation & Access Management">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-6">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Important: No Auto-Renewal = Simple Management</h4>
                <p className="text-gray-400">
                  Since all purchases are one-time with <strong className="text-white">NO auto-renewal</strong>, there&apos;s nothing to &ldquo;cancel&rdquo; in the traditional sense. Your access simply expires after your chosen period, and you can re-purchase whenever you want.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">6.1 Stopping Access Early (Optional)</h4>
                  <p className="mb-3">If you want to stop using an agent before your access expires:</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-2">Method 1: Agent Page</p>
                      <ol className="list-decimal pl-5 text-sm text-gray-400 space-y-1">
                        <li>Go to /subscribe page</li>
                        <li>Find your active agent</li>
                        <li>Click &ldquo;Cancel Subscription&rdquo; button</li>
                        <li>Confirm cancellation</li>
                      </ol>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="font-semibold text-white mb-2">Method 2: Email Request</p>
                      <p className="text-sm text-gray-400">
                        Email <a href="mailto:support@onelastai.com" className="text-cyan-400 hover:text-cyan-300 underline">support@onelastai.com</a> with your account email, agent name, and &ldquo;CANCEL ACCESS&rdquo; in the subject line
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">6.2 What Happens When You Cancel</h4>
                  <ul className="space-y-2">
                    {[
                      { label: "Immediate Effect:", value: "Access is terminated and you can no longer use the agent" },
                      { label: "No Future Charges:", value: "Since there's no auto-renewal anyway, you won't be charged again" },
                      { label: "Data Retention:", value: "Your conversation history is kept for 30 days" },
                      { label: "No Refund:", value: "Current purchase is not refunded (all sales final)" },
                      { label: "Can Re-purchase:", value: "You can buy access again anytime" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-400"><strong className="text-white">{item.label}</strong> {item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* 7. Chargebacks */}
            <Section id="chargebacks" icon={AlertCircle} title="7. Chargebacks and Disputes" variant="warning">
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">7.1 Contact Us First</h4>
                  <p className="text-gray-400">
                    Before filing a chargeback or payment dispute with your bank, please contact us at{" "}
                    <a href="mailto:billing@onelastai.com" className="text-cyan-400 hover:text-cyan-300 underline">billing@onelastai.com</a>. We&apos;re committed to resolving billing issues quickly.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">7.2 Chargeback Policy</h4>
                  <p className="mb-3">Filing a chargeback for a legitimate charge may result in:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Immediate account suspension</li>
                    <li>• Permanent ban from future services</li>
                    <li>• Legal action for fraudulent chargebacks</li>
                    <li>• Collection of chargeback fees ($15-25)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">7.3 Legitimate Disputes</h4>
                  <p className="mb-2">We will work with you on legitimate billing errors such as:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Charges after proper cancellation</li>
                    <li>• Duplicate transactions</li>
                    <li>• Unauthorized account access</li>
                    <li>• System processing errors</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-3">These issues will be investigated and resolved within 5-7 business days.</p>
                </div>
              </div>
            </Section>

            {/* 8. Price Changes */}
            <Section id="price-changes" icon={Bell} title="8. Price Changes">
              <p className="mb-4">We reserve the right to change our pricing at any time. Price changes will:</p>
              <ul className="space-y-2">
                {[
                  "Be communicated at least 30 days in advance via email",
                  "Apply to all new purchases immediately upon announcement",
                  "Not affect any active access periods already purchased at the old price",
                  "Allow you to make final purchases at current prices before changes take effect"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <span className="text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Since there&apos;s no auto-renewal, you&apos;re never locked into new pricing - you simply choose whether to purchase again at the new rates.
              </p>
            </Section>

            {/* 9. Contact */}
            <Section id="contact" icon={Mail} title="9. Contact Billing Support">
              <p className="mb-6">For billing questions and support:</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Billing</h4>
                  <a href="mailto:billing@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    billing@onelastai.com
                  </a>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Support</h4>
                  <a href="mailto:support@onelastai.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    support@onelastai.com
                  </a>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Response Time:</strong> We respond to all billing inquiries within 24-48 hours (Monday-Friday, excluding holidays).
                </p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
