"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  Loader2
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
  actions: string;
  contactPreference: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function ReportsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    reportType: "inappropriate-content",
    severity: "medium",
    description: "",
    evidence: "",
    agentName: "",
    timestamp: "",
    actions: "",
    contactPreference: "email",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Cards animation
      gsap.from(".info-card", {
        scrollTrigger: {
          trigger: ".info-cards",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      });

      // Form animation
      gsap.from(".form-container", {
        scrollTrigger: {
          trigger: ".form-container",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      // FAQ animation
      gsap.from(".faq-item", {
        scrollTrigger: {
          trigger: ".faq-section",
          start: "top 85%",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  const reportTypes = [
    { value: "inappropriate-content", label: "Inappropriate Content" },
    { value: "abuse", label: "Abuse or Harassment" },
    { value: "misuse", label: "Misuse of Service" },
    { value: "security", label: "Security Vulnerability" },
    { value: "false-information", label: "False Information" },
    { value: "scam", label: "Scam or Fraud" },
    { value: "other", label: "Other" },
  ];

  const severityLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please provide a detailed description of the issue";
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the legal disclaimer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          reportType: "inappropriate-content",
          severity: "medium",
          description: "",
          evidence: "",
          agentName: "",
          timestamp: "",
          actions: "",
          contactPreference: "email",
          agreeToTerms: false,
        });

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        setErrors({ submit: "Failed to submit report. Please try again." });
      }
    } catch {
      setErrors({ submit: "An error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "Will my identity be kept confidential?",
      answer: "Yes, we handle all reports confidentially. Your identity will only be shared with law enforcement if required by law, and only after thorough investigation. We keep reporter information strictly private.",
    },
    {
      question: "What happens after I submit a report?",
      answer: "Our trust and safety team reviews each report within 24-48 hours. We investigate the details provided and may contact you for additional information if needed. Based on our findings, we take appropriate action which may include warnings, suspensions, or permanent bans.",
    },
    {
      question: "Can I report anonymously?",
      answer: "Yes! You can select \"Anonymous Report (No Follow-up Needed)\" as your contact preference. However, providing your contact information helps us reach out if we need clarification or can provide you with updates on the investigation.",
    },
    {
      question: "What types of issues can I report?",
      answer: "You can report inappropriate content, abuse/harassment, service misuse, security vulnerabilities, false information, scams, fraud, or any other policy violations. Please be as specific as possible about the issue you're reporting.",
    },
    {
      question: "What if I file a false report?",
      answer: "Filing a false report is a serious matter. By submitting this form, you certify that your information is truthful. We take false reporting very seriously and may pursue legal action against individuals who knowingly file false reports.",
    },
    {
      question: "How will you use my report information?",
      answer: "Your report will be used solely for investigation and prevention purposes. We may share information with law enforcement if required by law. Your personal information will not be shared with third parties without your consent, except as required by law.",
    },
  ];

  const inputClasses = (hasError: boolean) =>
    `w-full px-4 py-3 bg-white/5 border ${
      hasError ? "border-red-500" : "border-white/10"
    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition`;

  const selectClasses = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition appearance-none cursor-pointer";

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] opacity-30" />

        <div className="hero-content relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Trust & Safety</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Report Inappropriate Activity
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Help us maintain a safe and trustworthy platform by reporting misuse or violations.
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-cards max-w-5xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="info-card p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-red-500/30 transition-colors">
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 w-fit mb-4">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your Safety Matters</h3>
            <p className="text-gray-400 text-sm">
              We take all reports seriously and investigate them thoroughly to protect our community.
            </p>
          </div>

          <div className="info-card p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-amber-500/30 transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 w-fit mb-4">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Detailed Documentation</h3>
            <p className="text-gray-400 text-sm">
              Provide as much detail as possible to help us understand and resolve the issue quickly.
            </p>
          </div>

          <div className="info-card p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-yellow-500/30 transition-colors">
            <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 w-fit mb-4">
              <Mail className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Confidential Handling</h3>
            <p className="text-gray-400 text-sm">
              Your report will be handled confidentially and processed by our trust and safety team.
            </p>
          </div>
        </div>
      </div>

      {/* Report Form */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <div className="form-container bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 md:p-8">
          {submitted && (
            <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-1">Report Submitted Successfully</h3>
                <p className="text-gray-400">
                  Thank you for your report. Our team will review it and take appropriate action within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-1">Submission Error</h3>
                <p className="text-gray-400">{errors.submit}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className={inputClasses(!!errors.name)}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className={inputClasses(!!errors.email)}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Report Type and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reportType" className="block text-sm font-semibold text-white mb-2">
                  Report Type *
                </label>
                <div className="relative">
                  <select
                    id="reportType"
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleInputChange}
                    className={selectClasses}
                  >
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-[#1a1a1a]">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-semibold text-white mb-2">
                  Severity Level *
                </label>
                <div className="relative">
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className={selectClasses}
                  >
                    {severityLevels.map((level) => (
                      <option key={level.value} value={level.value} className="bg-[#1a1a1a]">
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Agent Name and Timestamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="agentName" className="block text-sm font-semibold text-white mb-2">
                  Agent Name Involved (if applicable)
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Wizard, Chef Biew"
                  className={inputClasses(false)}
                />
              </div>

              <div>
                <label htmlFor="timestamp" className="block text-sm font-semibold text-white mb-2">
                  When Did This Occur?
                </label>
                <input
                  type="datetime-local"
                  id="timestamp"
                  name="timestamp"
                  value={formData.timestamp}
                  onChange={handleInputChange}
                  className={inputClasses(false)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-2">
                Detailed Description of the Issue * <span className="text-gray-500">(minimum 50 characters)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide a clear and detailed description of the inappropriate activity or misuse you are reporting. Include specific examples and context."
                rows={5}
                className={`${inputClasses(!!errors.description)} resize-none`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-sm ${formData.description.length >= 50 ? "text-green-400" : "text-gray-500"}`}>
                  {formData.description.length} characters
                </p>
                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
              </div>
            </div>

            {/* Evidence */}
            <div>
              <label htmlFor="evidence" className="block text-sm font-semibold text-white mb-2">
                Evidence or Screenshots (URLs or descriptions)
              </label>
              <textarea
                id="evidence"
                name="evidence"
                value={formData.evidence}
                onChange={handleInputChange}
                placeholder="Provide links to screenshots, chat logs, or other evidence that supports your report."
                rows={4}
                className={`${inputClasses(false)} resize-none`}
              />
            </div>

            {/* Previous Actions */}
            <div>
              <label htmlFor="actions" className="block text-sm font-semibold text-white mb-2">
                Actions Already Taken (if any)
              </label>
              <textarea
                id="actions"
                name="actions"
                value={formData.actions}
                onChange={handleInputChange}
                placeholder="Have you already blocked the user, reported them elsewhere, or taken any other action?"
                rows={3}
                className={`${inputClasses(false)} resize-none`}
              />
            </div>

            {/* Contact Preference */}
            <div>
              <label htmlFor="contactPreference" className="block text-sm font-semibold text-white mb-2">
                Preferred Contact Method
              </label>
              <div className="relative">
                <select
                  id="contactPreference"
                  name="contactPreference"
                  value={formData.contactPreference}
                  onChange={handleInputChange}
                  className={selectClasses}
                >
                  <option value="email" className="bg-[#1a1a1a]">Email</option>
                  <option value="phone" className="bg-[#1a1a1a]">Phone</option>
                  <option value="no-contact" className="bg-[#1a1a1a]">Anonymous Report (No Follow-up Needed)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-3">Legal Disclaimer</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    By submitting this report, you acknowledge that:
                  </p>
                  <ul className="space-y-2 text-gray-400 text-sm mb-4">
                    {[
                      "You are providing truthful and accurate information to the best of your knowledge",
                      "You understand that submitting false or malicious reports is prohibited",
                      "You may be held legally liable for knowingly filing false reports",
                      "False reports may result in legal action, including civil and criminal prosecution",
                      "Our team will investigate all reports and may share information with law enforcement if necessary",
                      "You grant us permission to use the information provided for investigation purposes",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-red-400/80 text-sm italic">
                    We take false reports very seriously. By submitting this form, you accept full responsibility for the accuracy of the information provided.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 accent-cyan-500 cursor-pointer bg-white/5 border-white/10 rounded"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-400 cursor-pointer flex-1">
                <span className="text-red-400 font-semibold">I acknowledge and agree</span> that I understand the legal disclaimer above and certify that the information I have provided is true and accurate. I understand the legal consequences of submitting false information. *
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Submit Report</span>
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm">
              Your report will be reviewed by our trust and safety team within 24-48 hours.
            </p>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section max-w-3xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="faq-item bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-6 group open:border-cyan-500/30"
            >
              <summary className="flex items-center gap-3 font-semibold text-white cursor-pointer list-none">
                <span className="text-cyan-400 text-lg group-open:rotate-45 transition-transform">+</span>
                <span>{faq.question}</span>
              </summary>
              <p className="text-gray-400 mt-4 pl-8">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need Additional Help?</h2>
          <p className="text-gray-400 mb-8">
            If you prefer to contact our trust and safety team directly, please reach out to us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/support/contact-us"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/legal/privacy-policy"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/10"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
