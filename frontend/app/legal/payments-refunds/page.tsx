"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  CreditCard,
  DollarSign,
  Clock,
  Ban,
  AlertTriangle,
  RefreshCcw,
  Bell,
  Mail,
  Check,
  Calendar,
  Shield,
  Zap,
  Crown,
  X,
  AlertCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function PaymentsRefundsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero entrance animation
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .fromTo(".hero-badge", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo(".hero-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
      .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(".hero-meta", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");

    // Pricing cards animation
    gsap.fromTo(
      ".pricing-card",
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: { trigger: ".pricing-grid", start: "top 85%", toggleActions: "play none none reverse" },
      }
    );

    // Section animations
    gsap.utils.toArray<HTMLElement>(".section-animate").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none reverse" },
        }
      );
    });

    // Feature cards
    gsap.fromTo(
      ".feature-card",
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: ".features-grid", start: "top 80%", toggleActions: "play none none reverse" },
      }
    );
  }, { scope: containerRef });

  const pricingPlans = [
    {
      name: "Daily Pass",
      price: "$1",
      period: "/day",
      icon: Zap,
      features: ["Full access for 24 hours", "All AI models", "Unlimited chats", "No auto-renewal"],
      highlight: false,
    },
    {
      name: "Weekly Pass",
      price: "$5",
      period: "/week",
      icon: Shield,
      features: ["Full access for 7 days", "All AI models", "Unlimited chats", "Priority support"],
      highlight: true,
    },
    {
      name: "Monthly Pass",
      price: "$15",
      period: "/month",
      icon: Crown,
      features: ["Full access for 30 days", "All AI models", "Unlimited chats", "Premium features", "VIP support"],
      highlight: false,
    },
  ];

  const paymentMethods = [
    { name: "Credit/Debit Cards", desc: "Visa, Mastercard, American Express, Discover" },
    { name: "Digital Wallets", desc: "Apple Pay, Google Pay" },
    { name: "Link by Stripe", desc: "Fast checkout with saved payment info" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <CreditCard className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">Payments & Refunds</span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Billing & Payments
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            Transparent pricing with simple, flexible plans. Understand our payment terms and refund policy.
          </p>

          <p className="hero-meta text-sm text-gray-500">Last updated: December 28, 2024</p>
        </div>
      </section>

      {/* PRICING OVERVIEW */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
              <DollarSign className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#00d4ff] font-medium">Pricing Structure</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Flexible Plans</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose the plan that works for you. No hidden fees.</p>
          </div>

          <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`pricing-card group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-br from-[#00d4ff]/20 to-[#0a0a0a] border-2 border-[#00d4ff]/50 scale-105"
                    : "bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 hover:border-[#00d4ff]/30"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00d4ff] text-black text-xs font-bold rounded-b-lg">
                    BEST VALUE
                  </div>
                )}

                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <plan.icon className="w-7 h-7 text-[#00d4ff]" />
                </div>

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[#00d4ff]">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[#00d4ff]" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="section-animate">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
                <CreditCard className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-sm text-[#00d4ff] font-medium">Payment Methods</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Accepted Payment Methods</h2>
              <p className="text-gray-400 mb-8">
                We accept a variety of payment methods for your convenience. All payments are processed securely through
                Stripe.
              </p>

              <div className="space-y-4">
                {paymentMethods.map((method, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-xl hover:border-[#00d4ff]/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{method.name}</h4>
                      <p className="text-sm text-gray-400">{method.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-animate rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-[#00d4ff]" />
                <h3 className="text-2xl font-bold">Payment Terms</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "All payments are charged at the time of purchase",
                  "Prices are in USD and include all applicable fees",
                  "Subscriptions auto-renew unless cancelled",
                  "You will receive an email receipt for every payment",
                  "Failed payments may result in service suspension",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#00d4ff] mt-1" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NO REFUNDS POLICY - IMPORTANT */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-red-500/10 to-[#0a0a0a] border-2 border-red-500/30 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-red-500/10 to-transparent opacity-50"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Ban className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-red-400">No Refunds Policy</h2>
                  <p className="text-gray-400">Please read carefully before purchasing</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-400 mb-2">All Sales Are Final</p>
                      <p className="text-gray-300">
                        Due to the nature of our digital services and the immediate access to AI features upon payment,{" "}
                        <strong className="text-white">all sales are final and non-refundable</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: X, title: "No partial refunds", desc: "Even for unused time" },
                    { icon: X, title: "No prorated refunds", desc: "For early cancellation" },
                    { icon: X, title: "No exceptions", desc: "For change of mind" },
                    { icon: X, title: "No credit transfers", desc: "Between accounts" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-gray-400 text-sm">
                  By making a purchase, you acknowledge and agree to this no-refund policy. We encourage you to try our
                  free features before purchasing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CANCELLATION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cancellation */}
            <div className="section-animate rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 hover:border-[#00d4ff]/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-[#00d4ff]" />
                <h3 className="text-2xl font-bold">Cancellation</h3>
              </div>
              <p className="text-gray-400 mb-6">
                You may cancel your subscription at any time through your account settings.
              </p>
              <ul className="space-y-3">
                {[
                  "Access continues until end of billing period",
                  "No partial refunds for remaining time",
                  "You can reactivate anytime",
                  "Data retained for 30 days after expiry",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chargebacks */}
            <div className="section-animate rounded-2xl bg-amber-500/10 border border-amber-500/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <h3 className="text-2xl font-bold text-amber-400">Chargebacks</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Disputing a charge with your bank without contacting us first may result in:
              </p>
              <ul className="space-y-3">
                {[
                  "Immediate account suspension",
                  "Permanent account termination",
                  "Collection actions for owed amounts",
                  "Prohibition from future services",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400 mt-6">
                Please contact us at billing@onelastai.com before filing a dispute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICE CHANGES */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                <RefreshCcw className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-3xl font-bold">Price Changes</h2>
            </div>

            <p className="text-gray-400 mb-8">
              We may update our prices from time to time. Here&apos;s how we handle price changes:
            </p>

            <div className="space-y-4">
              {[
                { title: "Advance Notice", desc: "You will receive at least 30 days notice before any price increase" },
                {
                  title: "Current Subscribers",
                  desc: "Existing subscriptions continue at current price until the next billing cycle after notice period",
                },
                { title: "New Purchases", desc: "New prices apply immediately to new subscriptions" },
                { title: "Right to Cancel", desc: "You may cancel before the new price takes effect" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bell className="w-4 h-4 text-[#00d4ff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Billing Questions?</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                If you have any questions about payments, billing, or this policy, please contact our billing team.
              </p>

              <a
                href="mailto:billing@onelastai.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-black font-semibold rounded-2xl hover:opacity-90 transition-opacity"
              >
                <Mail className="w-5 h-5" />
                Contact Billing Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CSS for gradient-radial */}
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
