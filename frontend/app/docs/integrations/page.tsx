import Link from 'next/link'

export default function DocsIntegrations() {
  const integrations = [
    {
      title: "Slack Integration",
      description: "Connect your agents to Slack and respond to messages directly",
      category: "Communication",
      readTime: "8 min",
      href: "#slack",
      icon: "💬"
    },
    {
      title: "Discord Integration",
      description: "Build Discord bots powered by your AI agents",
      category: "Gaming & Community",
      readTime: "8 min",
      href: "#discord",
      icon: "🎮"
    },
    {
      title: "Teams Integration",
      description: "Deploy agents to Microsoft Teams for enterprise collaboration",
      category: "Enterprise",
      readTime: "8 min",
      href: "#teams",
      icon: "💼"
    },
    {
      title: "Webhooks",
      description: "Send real-time data and trigger actions with webhooks",
      category: "Integration",
      readTime: "6 min",
      href: "#webhooks",
      icon: "🔗"
    },
    {
      title: "Email Integration",
      description: "Connect your agents to handle incoming emails automatically",
      category: "Communication",
      readTime: "7 min",
      href: "#email",
      icon: "📧"
    },
    {
      title: "Custom APIs",
      description: "Build custom integrations with any third-party service",
      category: "Advanced",
      readTime: "10 min",
      href: "#custom",
      icon: "⚙️"
    }
  ]

  const setupSteps = [
    {
      platform: "Slack",
      steps: [
        "Go to Slack App Directory and search for One Last AI",
        "Click 'Add to Slack' and authorize the permissions",
        "Copy your Slack Bot Token from the API settings",
        "Paste the token in One Last AI Settings → Integrations → Slack",
        "Test the connection with a message"
      ]
    },
    {
      platform: "Discord",
      steps: [
        "Create a new application in Discord Developer Portal",
        "Add a Bot User to your application",
        "Copy the Bot Token",
        "In One Last AI, go to Settings → Integrations → Discord",
        "Paste your token and configure the command prefix"
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-600/20 via-accent-500/10 to-brand-700/20 border-b border-brand-500/20">
        <div className="container-custom section-padding-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-400 via-accent-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Integrations
            </h1>
            <p className="text-xl text-neutral-300 mb-6 leading-relaxed">
              Connect your AI agents to the tools and platforms you already use. From Slack and Discord to enterprise solutions, integrate seamlessly with our ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#setup" className="btn-primary">
                Get Started
              </a>
              <a href="#available" className="btn-secondary">
                Browse Integrations
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom section-padding-lg">
        
        {/* Integration Overview */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-dark p-6 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-bold mb-2">Easy Setup</h3>
              <p className="text-neutral-400 text-sm">
                Most integrations can be set up in minutes with step-by-step guides
              </p>
            </div>
            <div className="card-dark p-6 text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-bold mb-2">Real-time Sync</h3>
              <p className="text-neutral-400 text-sm">
                Keep your data synchronized across all platforms instantly
              </p>
            </div>
            <div className="card-dark p-6 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-bold mb-2">Secure</h3>
              <p className="text-neutral-400 text-sm">
                Enterprise-grade security with encrypted credentials and tokens
              </p>
            </div>
          </div>
        </div>

        {/* Available Integrations */}
        <div id="available" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="group card-dark p-6 hover:card-dark-hover transition-all duration-300">
                <div className="text-3xl mb-4">{integration.icon}</div>
                <div className="mb-4">
                  <span className="text-xs font-medium text-brand-400 bg-brand-900/30 px-3 py-1 rounded-full">
                    {integration.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-3 group-hover:text-brand-400 transition-colors">
                  {integration.title}
                </h3>
                <p className="text-neutral-400 mb-4 text-sm leading-relaxed">
                  {integration.description}
                </p>
                <a href={integration.href} className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
                  Learn more →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Integrations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured Integrations</h2>

          {/* Slack Section */}
          <div id="slack" className="mb-12">
            <div className="card-dark p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">💬</div>
                <div>
                  <h3 className="text-2xl font-bold">Slack</h3>
                  <p className="text-neutral-400">Connect agents directly to Slack channels and DMs</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <h4 className="text-lg font-bold mb-3">What You Can Do:</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Respond to channel messages automatically</li>
                  <li>✓ Handle direct messages from team members</li>
                  <li>✓ Create slash commands for quick agent access</li>
                  <li>✓ Thread conversations for organized discussions</li>
                  <li>✓ Use rich formatting and reactions</li>
                </ul>
              </div>

              <div className="bg-neutral-900 p-6 rounded-lg mb-6">
                <h4 className="font-bold mb-3">Example: Slack Command</h4>
                <code className="text-neutral-200 text-sm">
                  {`/agent ask Help me debug this error in my code`}
                </code>
              </div>
            </div>
          </div>

          {/* Discord Section */}
          <div id="discord" className="mb-12">
            <div className="card-dark p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🎮</div>
                <div>
                  <h3 className="text-2xl font-bold">Discord</h3>
                  <p className="text-neutral-400">Deploy AI agents as Discord bots for your community</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <h4 className="text-lg font-bold mb-3">What You Can Do:</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Create interactive Discord bots</li>
                  <li>✓ Respond to messages in channels and DMs</li>
                  <li>✓ Use slash commands for quick interactions</li>
                  <li>✓ Display embeds and rich content</li>
                  <li>✓ Handle reactions and button interactions</li>
                </ul>
              </div>

              <div className="bg-neutral-900 p-6 rounded-lg mb-6">
                <h4 className="font-bold mb-3">Example: Discord Slash Command</h4>
                <code className="text-neutral-200 text-sm">
                  {`/help [topic]\n/agent ask [question]\n/support ticket [issue]`}
                </code>
              </div>
            </div>
          </div>

          {/* Teams Section */}
          <div id="teams" className="mb-12">
            <div className="card-dark p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">💼</div>
                <div>
                  <h3 className="text-2xl font-bold">Microsoft Teams</h3>
                  <p className="text-neutral-400">Enterprise-ready AI agents for Microsoft Teams</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <h4 className="text-lg font-bold mb-3">What You Can Do:</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Deploy agents as Teams apps</li>
                  <li>✓ Integrate with enterprise directory</li>
                  <li>✓ Support for Teams channels and group chats</li>
                  <li>✓ Adaptive cards for rich interactions</li>
                  <li>✓ SSO and Azure AD authentication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Webhooks Section */}
          <div id="webhooks" className="mb-12">
            <div className="card-dark p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🔗</div>
                <div>
                  <h3 className="text-2xl font-bold">Webhooks</h3>
                  <p className="text-neutral-400">Trigger custom actions with real-time webhooks</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <h4 className="text-lg font-bold mb-3">What You Can Do:</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Send events to custom endpoints</li>
                  <li>✓ Trigger workflows and automation</li>
                  <li>✓ Log conversations and analytics</li>
                  <li>✓ Integrate with any HTTP endpoint</li>
                  <li>✓ Retry mechanism with backoff</li>
                </ul>
              </div>

              <div className="bg-neutral-900 p-6 rounded-lg">
                <h4 className="font-bold mb-3">Example: Webhook Payload</h4>
                <code className="text-neutral-200 text-sm">
                  {`{
  "event": "message.received",
  "agent_id": "agent_123",
  "conversation_id": "conv_456",
  "message": "Hello, how can I help?",
  "timestamp": "2025-01-15T10:30:00Z"
}`}
                </code>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div id="email" className="mb-12">
            <div className="card-dark p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">📧</div>
                <div>
                  <h3 className="text-2xl font-bold">Email</h3>
                  <p className="text-neutral-400">Respond to incoming emails automatically with AI agents</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <h4 className="text-lg font-bold mb-3">What You Can Do:</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ Auto-respond to incoming emails</li>
                  <li>✓ Categorize and route emails</li>
                  <li>✓ Draft intelligent replies</li>
                  <li>✓ Track email history and threads</li>
                  <li>✓ Support for multiple email accounts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Custom APIs Section */}
          <div id="custom" className="mb-12">
            <div className="card-dark p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">⚙️</div>
                <div>
                  <h3 className="text-2xl font-bold">Custom Integrations</h3>
                  <p className="text-neutral-400">Build custom integrations with any third-party service</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <h4 className="text-lg font-bold mb-3">Popular Services:</h4>
                <ul className="space-y-2 text-neutral-300">
                  <li>✓ CRM Systems (Salesforce, HubSpot)</li>
                  <li>✓ Project Management (Jira, Asana)</li>
                  <li>✓ Analytics Platforms (Google Analytics, Mixpanel)</li>
                  <li>✓ Payment Processors (Stripe, PayPal)</li>
                  <li>✓ Database Services (Firebase, MongoDB)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Guides */}
        <div id="setup" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Setup Guides</h2>
          
          {setupSteps.map((guide, index) => (
            <div key={index} className="card-dark p-8 mb-6">
              <h3 className="text-2xl font-bold mb-6">Setting up {guide.platform}</h3>
              <ol className="space-y-4">
                {guide.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {stepIndex + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Integration Best Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Security</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand-400">🔐</span>
                  <span className="text-neutral-300">Keep API keys and tokens secure</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">✓</span>
                  <span className="text-neutral-300">Use environment variables for secrets</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">🛡️</span>
                  <span className="text-neutral-300">Rotate credentials regularly</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">📋</span>
                  <span className="text-neutral-300">Audit integration logs frequently</span>
                </li>
              </ul>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Performance</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand-400">⚡</span>
                  <span className="text-neutral-300">Implement rate limiting</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">🔄</span>
                  <span className="text-neutral-300">Use webhooks instead of polling</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">💾</span>
                  <span className="text-neutral-300">Cache responses when possible</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">📊</span>
                  <span className="text-neutral-300">Monitor integration metrics</span>
                </li>
              </ul>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Reliability</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand-400">🔁</span>
                  <span className="text-neutral-300">Implement retry logic</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">⚠️</span>
                  <span className="text-neutral-300">Handle errors gracefully</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">📝</span>
                  <span className="text-neutral-300">Log all integration events</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">🧪</span>
                  <span className="text-neutral-300">Test integrations thoroughly</span>
                </li>
              </ul>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Maintenance</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand-400">🔄</span>
                  <span className="text-neutral-300">Keep dependencies updated</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">📚</span>
                  <span className="text-neutral-300">Document integration setup</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">👥</span>
                  <span className="text-neutral-300">Train team on integration usage</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-400">🎯</span>
                  <span className="text-neutral-300">Regular integration audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-600/20 via-accent-500/10 to-brand-700/20 border border-brand-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need More Integrations?</h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Our team is constantly adding new integrations. Can't find what you need? Build a custom integration with our API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/api" className="btn-primary">
              View API Docs
            </Link>
            <Link href="/docs/tutorials" className="btn-secondary">
              Build Custom Integration
            </Link>
            <Link href="/support/contact-us" className="btn-outline">
              Request Integration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
