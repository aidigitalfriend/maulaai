'use client'

export default function FAQsPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is One Last AI?",
          a: "One Last AI is an AI platform that provides access to 20+ specialized AI personalities for various business needs. Each agent specializes in different areas like creative writing, technical problem-solving, entertainment, fitness, and customer support."
        },
        {
          q: "How do I get started?",
          a: "Simply sign up for a free account, choose an AI agent, and start chatting. No credit card required for the 14-day free trial. You can explore different agents and find the ones that best suit your needs."
        },
        {
          q: "Do I need technical skills?",
          a: "No! One Last AI is designed to be user-friendly. Anyone can use it without technical expertise. We also provide comprehensive documentation, tutorials, and support for those who want to explore advanced features."
        },
        {
          q: "What agents are available?",
          a: "We offer 20+ AI agents including Einstein (Physics & Math), Tech Wizard (Programming), Chef Biew (Cooking), Fitness Guru (Health & Fitness), Travel Buddy (Travel), Comedy King (Entertainment), and many more specialized personalities."
        }
      ]
    },
    {
      category: "Billing & Pricing",
      questions: [
        {
          q: "What are the pricing plans?",
          a: "We offer three main plans: Starter ($1/day - per agent), Professional ($5/week - per agent), and Enterprise ($19/month - per agent). All plans include a 14-day free trial with no credit card required."
        },
        {
          q: "What does 'per agent' mean?",
          a: "Our pricing is based on per-agent usage. You can have multiple agents active simultaneously, and each agent's pricing is calculated separately. This gives you flexibility to use as many agents as you need."
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes! You can cancel your subscription at any time. You'll have access to your current plan until the end of your billing period, and all your data is preserved."
        },
        {
          q: "Do you offer refunds?",
          a: "Yes. We offer full refunds within 30 days, 50% refunds between 30-60 days. After 60 days, no refunds are available but you can cancel anytime without further charges."
        },
        {
          q: "Is there an annual billing option?",
          a: "Yes! Annual billing is available at a 17% discount. You can select annual billing during checkout or upgrade your existing monthly subscription."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise customers."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "Is my data secure?",
          a: "Yes. We use enterprise-grade encryption (AES-256), SOC 2 Type II compliance, ISO 27001 certification, and regular security audits to protect your data. All communications are transmitted over HTTPS."
        },
        {
          q: "Can I change my plan?",
          a: "Yes. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect on your next billing cycle, and we'll pro-rate any differences."
        },
        {
          q: "How do I reset my password?",
          a: "Use the 'Forgot Password' link on the login page. You'll receive an email with a secure link to reset your password. For security, this link expires after 24 hours."
        },
        {
          q: "How do I enable two-factor authentication?",
          a: "You can enable 2FA in your account security settings. We support authenticator apps (Google Authenticator, Microsoft Authenticator) and SMS-based verification."
        },
        {
          q: "Can I export my conversation data?",
          a: "Yes. You can export your conversation history in JSON or CSV format from your account dashboard. Enterprise users also get additional export and compliance options."
        },
        {
          q: "What happens to my data if I delete my account?",
          a: "Your data is deleted within 30 days of account deletion. You can request immediate deletion of sensitive information. We retain minimal metadata for legal and compliance purposes as required by law."
        }
      ]
    },
    {
      category: "Features & Usage",
      questions: [
        {
          q: "How many AI agents can I use simultaneously?",
          a: "You can use as many agents as you want simultaneously. Each agent is billed separately based on your plan. You can easily switch between agents or have multiple conversations at once."
        },
        {
          q: "Can I customize an agent's behavior?",
          a: "Yes. Professional and Enterprise plans include customization options to tailor agent responses, personality traits, and knowledge base to your specific needs."
        },
        {
          q: "What integrations are available?",
          a: "We support integrations with Slack, Microsoft Teams, Discord, Zapier, Make.com, and more. You can also use our REST API and webhooks for custom integrations."
        },
        {
          q: "Can I create my own custom agent?",
          a: "Yes! Professional and Enterprise users can create custom agents with specialized knowledge bases and personality traits. Contact our sales team for details."
        },
        {
          q: "What are the usage limits?",
          a: "Starter: 100 conversations/month, Professional: Unlimited conversations, Enterprise: Unlimited with dedicated infrastructure. All plans have reasonable rate limits (1000 requests/hour)."
        },
        {
          q: "Can I use One Last AI for commercial purposes?",
          a: "Yes! You can use One Last AI for business applications, content creation, customer support, and commercial projects. Enterprise plans include additional commercial usage terms."
        }
      ]
    },
    {
      category: "API & Integration",
      questions: [
        {
          q: "Do you have an API?",
          a: "Yes! We provide a comprehensive REST API for integration with your applications. Professional and Enterprise plans include API access with documentation and SDKs for popular languages."
        },
        {
          q: "What's the API rate limit?",
          a: "Standard rate limit is 1000 requests per hour. Enterprise users can request higher limits. Rate limits are applied per API key to prevent abuse."
        },
        {
          q: "Do you support webhooks?",
          a: "Yes. Enterprise and Professional plans support webhooks for real-time event notifications. You can subscribe to events like message sent, conversation created, and more."
        },
        {
          q: "Is there SDK support?",
          a: "Yes! We provide official SDKs for JavaScript/Node.js, Python, and Go. Community-contributed SDKs for other languages are also available."
        },
        {
          q: "How do I get API documentation?",
          a: "Complete API documentation is available in our Developer Portal at /docs. You'll find endpoint references, code examples, and interactive API explorer."
        }
      ]
    },
    {
      category: "Support & Help",
      questions: [
        {
          q: "How do I get support?",
          a: "You can reach our support team through email, live chat (available for Pro+ plans), or our support portal. Response times vary by plan: Starter (24-48 hours), Professional (2-4 hours), Enterprise (1 hour)."
        },
        {
          q: "Is there priority support?",
          a: "Yes. Professional and Enterprise plans include priority support with faster response times. Enterprise plans also include a dedicated account manager."
        },
        {
          q: "Do you have documentation?",
          a: "Yes! We have extensive documentation available at /docs including getting started guides, API reference, tutorials, and integration guides."
        },
        {
          q: "Are there video tutorials?",
          a: "Yes! We offer comprehensive tutorials on our /resources/tutorials page showing how to use each agent, API integration, and advanced features."
        },
        {
          q: "Can I schedule a demo?",
          a: "Absolutely! You can schedule a demo with our team at /webinars/register-now or contact our sales team. We offer personalized demos for enterprise customers."
        }
      ]
    },
    {
      category: "Performance & Reliability",
      questions: [
        {
          q: "What's your uptime guarantee?",
          a: "We maintain 99.9% uptime SLA for Professional and Enterprise plans. Our infrastructure is distributed across multiple data centers with automatic failover."
        },
        {
          q: "How fast is the response time?",
          a: "Most responses are generated within 2-5 seconds. Response time depends on the complexity of your query and current system load. Enterprise users get priority queue placement."
        },
        {
          q: "Can I scale to handle high volume?",
          a: "Yes! Our infrastructure automatically scales to handle your needs. For extreme high-volume use cases, contact our sales team to discuss dedicated infrastructure options."
        },
        {
          q: "Do you monitor system performance?",
          a: "Yes. We continuously monitor system performance and provide status updates at status.One Last AI.io. Enterprise users get real-time monitoring and custom alerts."
        }
      ]
    },
    {
      category: "Agents & Personalities",
      questions: [
        {
          q: "How are agents created?",
          a: "Each agent is built using advanced AI models fine-tuned with specialized knowledge and personality traits. Our team continuously trains and improves agents based on user feedback."
        },
        {
          q: "Can I suggest a new agent?",
          a: "Absolutely! We love suggestions from our community. Visit our feedback portal or contact support with your ideas. Popular suggestions become new agents."
        },
        {
          q: "Do agents learn from conversations?",
          a: "Agents don't retain specific conversation data between sessions for privacy. However, we use aggregated, anonymized feedback to continuously improve agent performance."
        },
        {
          q: "How often are agents updated?",
          a: "Agents receive regular updates and improvements. Major updates are released monthly with new knowledge, improved responses, and new features based on user feedback."
        },
        {
          q: "What's the difference between agents?",
          a: "Each agent specializes in different domains: Einstein excels at physics/math, Tech Wizard at programming, Chef Biew at cooking, etc. You can use different agents for different tasks."
        }
      ]
    },
    {
      category: "Compliance & Legal",
      questions: [
        {
          q: "Is One Last AI GDPR compliant?",
          a: "Yes! We are fully GDPR compliant. We support data subject rights, DPA agreements, and provide tools for GDPR compliance. See our security page for details."
        },
        {
          q: "Do you comply with HIPAA?",
          a: "Yes. Enterprise customers can enable HIPAA-compliant infrastructure. We also support HIPAA BAAs (Business Associate Agreements) for healthcare providers."
        },
        {
          q: "Is there a service level agreement (SLA)?",
          a: "Yes. Professional and Enterprise plans include SLAs with uptime guarantees and incident response times. Enterprise customers get custom SLAs tailored to their needs."
        },
        {
          q: "How do you handle data residency?",
          a: "By default, data is stored in secure US data centers. Enterprise customers can request EU or other regional data residency options."
        },
        {
          q: "Can I get SOC 2 compliance documentation?",
          a: "Yes. We have completed SOC 2 Type II audits. Enterprise and Professional customers can request compliance documentation under NDA."
        }
      ]
    },
    {
      category: "Community & Resources",
      questions: [
        {
          q: "Is there a community forum?",
          a: "Yes! Join our community at /community to connect with other users, share tips, and discuss best practices. Community members help each other solve problems and share ideas."
        },
        {
          q: "Are there webinars?",
          a: "Yes! We host regular webinars on topics like 'Getting Started', 'Advanced Customization', 'Enterprise Solutions', and more. Register at /resources/webinars."
        },
        {
          q: "Can I find best practices?",
          a: "Absolutely! Check out our /resources section for documentation, tutorials, case studies, and best practices guides. We also share tips regularly in our newsletter."
        },
        {
          q: "How can I contribute to the community?",
          a: "Share your use cases, create tutorials, contribute SDKs, or help other users in the community forum. Contributors get recognition and exclusive benefits!"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">Find answers to common questions about One Last AI</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="space-y-12">
            {faqs.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-brand-200">{category.category}</h2>
                <div className="space-y-6">
                  {category.questions.map((item, qIdx) => (
                    <details
                      key={qIdx}
                      className="group border border-neural-200 rounded-lg p-4 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <summary className="font-semibold text-neural-900 flex items-center justify-between group-open:text-brand-600">
                        {item.q}
                        <span className="transition-transform group-open:rotate-180">▼</span>
                      </summary>
                      <p className="text-neural-600 mt-4 pt-4 border-t border-neural-100">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#E0F2FE' }}>
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-neural-900">Can't find your answer?</h2>
          <p className="text-lg text-neural-700 mb-8">
            Our support team is here to help. Reach out to us anytime.
          </p>
          <a href="/support/contact-us" className="inline-block px-8 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">
            Contact Support
          </a>
        </div>
      </section>
    </div>
  )
}
