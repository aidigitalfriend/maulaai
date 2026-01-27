"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Flag,
  Shield,
  FileText,
  Lock,
  AlertTriangle,
  Send,
  Mail,
  Check,
  ChevronDown,
  Clock,
  Eye,
  MessageSquare,
  HelpCircle,
  CheckCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface FormData {
  name: string;
  email: string;
  reportType: string;
  severity: string;
  description: string;
  evidence: string;
  agentName: string;
  timestamp: string;
  actionsTaken: string;
  contactPreference: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function ReportsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    reportType: "",
    severity: "",
    description: "",
    evidence: "",
    agentName: "",
    timestamp: "",
    actionsTaken: "",
    contactPreference: "email",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useGSAP(() => {
    // Hero entrance animation
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .fromTo(".hero-badge", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo(".hero-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
      .fromTo(".hero-subtitle", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");

    // Info cards animation
    gsap.fromTo(
      ".info-card",
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: { trigger: ".info-grid", start: "top 85%", toggleActions: "play none none reverse" },
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

    // FAQ animation
    gsap.fromTo(
      ".faq-item",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".faq-section", start: "top 80%", toggleActions: "play none none reverse" },
      }
    );
  }, { scope: containerRef });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.reportType) {
      newErrors.reportType = "Please select a report type";
    }

    if (!formData.severity) {
      newErrors.severity = "Please select severity level";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Please provide at least 50 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const infoCards = [
    {
      icon: Shield,
      title: "Your Safety First",
      desc: "We take all reports seriously and prioritize the safety of our community.",
      color: "cyan",
    },
    {
      icon: FileText,
      title: "Document Everything",
      desc: "Include as much detail as possible - screenshots, timestamps, and context help us investigate.",
      color: "blue",
    },
    {
      icon: Lock,
      title: "Confidential",
      desc: "Your report will be handled confidentially. Your identity is protected throughout the process.",
      color: "purple",
    },
  ];

  const reportTypes = [
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "safety", label: "Safety Concern" },
    { value: "abuse", label: "Abuse of Service" },
    { value: "privacy", label: "Privacy Violation" },
    { value: "technical", label: "Technical Issue" },
    { value: "other", label: "Other" },
  ];

  const severityLevels = [
    { value: "low", label: "Low - Minor concern" },
    { value: "medium", label: "Medium - Needs attention" },
    { value: "high", label: "High - Urgent matter" },
    { value: "critical", label: "Critical - Immediate action required" },
  ];

  const faqs = [
    {
      question: "What happens after I submit a report?",
      answer:
        "Once submitted, your report enters our review queue. A team member will review it within 24-48 hours. You'll receive email updates on the status of your report if you've opted in for follow-ups.",
    },
    {
      question: "Will my identity be revealed?",
      answer:
        "No, your identity remains confidential. We do not share your personal information with the reported party. Only authorized team members handling your case will have access to your details.",
    },
    {
      question: "Can I report anonymously?",
      answer:
        "While we require contact information to follow up on reports, we treat all submissions confidentially. If you have serious concerns, reach out to us at safety@onelastai.com.",
    },
    {
      question: "What qualifies as a reportable offense?",
      answer:
        "Reportable offenses include harassment, hate speech, threats, sharing of private information, impersonation, spam, illegal activity, or any behavior that violates our Terms of Service.",
    },
    {
      question: "How long does the investigation take?",
      answer:
        "Investigation times vary based on complexity. Simple reports are typically resolved within 2-3 business days. Complex cases may take up to 2 weeks. Critical safety issues are prioritized and addressed immediately.",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-red-500/10 via-transparent to-transparent blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <Flag className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Report an Issue</span>
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Report Inappropriate Activity
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Help us maintain a safe and respectful community. Your reports help us take action against violations.
          </p>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="info-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {infoCards.map((card, i) => (
              <div
                key={i}
                className="info-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 overflow-hidden hover:border-red-500/30 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <card.icon className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors">{card.title}</h3>
                <p className="text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REPORT FORM */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold">Submit a Report</h2>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Report Submitted Successfully</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Thank you for helping us maintain a safe community. We&apos;ll review your report and take appropriate action.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      reportType: "",
                      severity: "",
                      description: "",
                      evidence: "",
                      agentName: "",
                      timestamp: "",
                      actionsTaken: "",
                      contactPreference: "email",
                      agreeToTerms: false,
                    });
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.name ? "border-red-500" : "border-white/10"} rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Report Type & Severity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Report Type *</label>
                    <select
                      name="reportType"
                      value={formData.reportType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.reportType ? "border-red-500" : "border-white/10"} rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-[#1a1a1a]">Select report type</option>
                      {reportTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-[#1a1a1a]">
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.reportType && <p className="text-red-400 text-sm mt-1">{errors.reportType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Severity Level *</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${errors.severity ? "border-red-500" : "border-white/10"} rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-[#1a1a1a]">Select severity</option>
                      {severityLevels.map((level) => (
                        <option key={level.value} value={level.value} className="bg-[#1a1a1a]">
                          {level.label}
                        </option>
                      ))}
                    </select>
                    {errors.severity && <p className="text-red-400 text-sm mt-1">{errors.severity}</p>}
                  </div>
                </div>

                {/* Agent Name & Timestamp Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name (if applicable)</label>
                    <input
                      type="text"
                      name="agentName"
                      value={formData.agentName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                      placeholder="Name of the AI agent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">When did this occur?</label>
                    <input
                      type="datetime-local"
                      name="timestamp"
                      value={formData.timestamp}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 bg-white/5 border ${errors.description ? "border-red-500" : "border-white/10"} rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all resize-none`}
                    placeholder="Please describe the issue in detail. Include what happened, who was involved, and any relevant context..."
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.description.length}/50 characters minimum
                  </p>
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Evidence (URLs, screenshots links)</label>
                  <textarea
                    name="evidence"
                    value={formData.evidence}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all resize-none"
                    placeholder="Paste any links to screenshots, chat logs, or other evidence..."
                  />
                </div>

                {/* Actions Taken */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Actions Already Taken</label>
                  <input
                    type="text"
                    name="actionsTaken"
                    value={formData.actionsTaken}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                    placeholder="e.g., Blocked user, stopped conversation"
                  />
                </div>

                {/* Contact Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Follow-up Preference</label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: "email", label: "Email updates", icon: Mail },
                      { value: "none", label: "No follow-up", icon: Eye },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                          formData.contactPreference === option.value
                            ? "bg-red-500/10 border-red-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="contactPreference"
                          value={option.value}
                          checked={formData.contactPreference === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <option.icon className="w-5 h-5 text-gray-400" />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div>
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.agreeToTerms
                        ? "bg-red-500/10 border-red-500/50"
                        : errors.agreeToTerms
                          ? "bg-red-500/5 border-red-500"
                          : "bg-white/5 border-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <span className="text-gray-300 text-sm">
                      I confirm that the information provided is accurate to the best of my knowledge. I understand that
                      false reports may result in action against my account.
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="text-red-400 text-sm mt-1">{errors.agreeToTerms}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 faq-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
              <HelpCircle className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#00d4ff] font-medium">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Common questions about the reporting process</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="faq-item rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 overflow-hidden hover:border-[#00d4ff]/30 transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedFaq === i ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-6 text-gray-400">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-red-500/10 via-transparent to-transparent blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Immediate Assistance?</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                For urgent safety concerns, contact our safety team directly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <a
                  href="mailto:safety@onelastai.com"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
                >
                  <Mail className="w-5 h-5" />
                  Safety Team
                </a>
                <a
                  href="mailto:support@onelastai.com"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  General Support
                </a>
              </div>
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
