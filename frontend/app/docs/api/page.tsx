import Link from 'next/link'

export default function DocsAPI() {
  const apiEndpoints = [
    {
      title: "Authentication",
      description: "Secure your API requests with OAuth 2.0 and API keys",
      category: "Security",
      readTime: "5 min",
      href: "#authentication"
    },
    {
      title: "Agents Endpoints",
      description: "Create, retrieve, and manage AI agents through our REST API",
      category: "Reference",
      readTime: "10 min",
      href: "#agents"
    },
    {
      title: "Conversations API",
      description: "Access and manage chat conversations and message history",
      category: "Reference",
      readTime: "8 min",
      href: "#conversations"
    },
    {
      title: "Rate Limits",
      description: "Understand rate limiting and throttling policies",
      category: "Policy",
      readTime: "4 min",
      href: "#rate-limits"
    },
    {
      title: "Error Handling",
      description: "Learn how to handle and debug API errors effectively",
      category: "Guide",
      readTime: "6 min",
      href: "#errors"
    },
    {
      title: "Webhooks",
      description: "Set up real-time notifications for agent events",
      category: "Integration",
      readTime: "7 min",
      href: "#webhooks"
    }
  ]

  const codeExamples = [
    {
      title: "List All Agents",
      language: "JavaScript",
      code: `// Get all agents
const response = await fetch('https://api.maulaai.co/v1/agents', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const agents = await response.json();
console.log(agents);`
    },
    {
      title: "Create an Agent",
      language: "Python",
      code: `import requests

# Create a new agent
response = requests.post(
  'https://api.maulaai.co/v1/agents',
  headers={
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  json={
    'name': 'My Bot',
    'personality': 'helpful',
    'model': 'gpt-4'
  }
)

agent = response.json()
print(agent['id'])`
    },
    {
      title: "Send Message",
      language: "JavaScript",
      code: `// Send a message to an agent
const response = await fetch('https://api.maulaai.co/v1/conversations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 'agent_123',
    message: 'Hello, how are you?'
  })
});

const result = await response.json();
console.log(result.reply);`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 border-b border-brand-500/20">
        <div className="container-custom section-padding-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              API Reference
            </h1>
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              Build powerful integrations with our comprehensive REST API. Access real-time agent management, conversation tracking, and webhook capabilities with simple, well-documented endpoints.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#quick-start" className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition">
                Quick Start
              </a>
              <a href="#authentication" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-brand-600 transition">
                View Endpoints
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom section-padding-lg">
        
        {/* API Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mr-3 text-brand-600">
                📡
              </span>
              Base URL
            </h3>
            <code className="block bg-gray-900 p-4 rounded-lg text-gray-200 text-sm">
              https://api.maulaai.co/v1
            </code>
            <p className="text-gray-600 text-sm mt-3">
              All API requests should be made to this base URL with proper versioning.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mr-3 text-brand-600">
                🔑
              </span>
              Authentication
            </h3>
            <code className="block bg-gray-900 p-4 rounded-lg text-gray-200 text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
            <p className="text-gray-600 text-sm mt-3">
              Include your API key in the Authorization header for all requests.
            </p>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">API Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="mb-4">
                  <span className="text-xs font-medium text-brand-600 bg-brand-100 px-3 py-1 rounded-full">
                    {endpoint.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                  {endpoint.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {endpoint.description}
                </p>
                <a href={endpoint.href} className="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors">
                  Learn more →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication Section */}
        <div id="authentication" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Getting Your API Key</h3>
            <ol className="space-y-4 mb-6">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-semibold text-gray-900">Sign in to your account</p>
                  <p className="text-gray-600 text-sm">Log in to the Maula AI dashboard</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-semibold text-gray-900">Navigate to API Settings</p>
                  <p className="text-gray-600 text-sm">Go to Settings → Developer → API Keys</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-semibold text-gray-900">Generate a new API key</p>
                  <p className="text-gray-600 text-sm">Click "Create New Key" and copy your key</p>
                </div>
              </li>
            </ol>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Security Note:</strong> Keep your API keys confidential. Never commit them to version control or share publicly.
              </p>
            </div>
          </div>
        </div>

        {/* Agents Endpoints */}
        <div id="agents" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Agents Endpoints</h2>
          
          <div className="space-y-6">
            {/* GET Agents */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-mono text-sm font-semibold">GET</span>
                <code className="text-gray-700">/agents</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve a list of all your agents</p>
              <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <p className="text-gray-500 text-xs mb-2">Response:</p>
                <code className="text-gray-200 text-sm">
                  {`{
  "data": [
    {
      "id": "agent_123",
      "name": "Tech Wizard",
      "personality": "helpful",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1
}`}
                </code>
              </div>
            </div>

            {/* POST Create Agent */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded font-mono text-sm font-semibold">POST</span>
                <code className="text-gray-700">/agents</code>
              </div>
              <p className="text-gray-600 mb-4">Create a new AI agent</p>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-500 text-xs mb-2">Request:</p>
                <code className="text-gray-200 text-sm">
                  {`{
  "name": "New Agent",
  "personality": "friendly",
  "model": "gpt-4",
  "system_prompt": "You are a helpful assistant"
}`}
                </code>
              </div>
            </div>

            {/* GET Agent by ID */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-mono text-sm font-semibold">GET</span>
                <code className="text-gray-700">/agents/[agent_id]</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve details of a specific agent</p>
            </div>
          </div>
        </div>

        {/* Conversations API */}
        <div id="conversations" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Conversations API</h2>
          
          <div className="space-y-6">
            {/* POST Send Message */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded font-mono text-sm font-semibold">POST</span>
                <code className="text-gray-700">/conversations</code>
              </div>
              <p className="text-gray-600 mb-4">Send a message to an agent and get a response</p>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-500 text-xs mb-2">Request:</p>
                <code className="text-gray-200 text-sm">
                  {`{
  "agent_id": "agent_123",
  "message": "How do I create an agent?",
  "conversation_id": "conv_456" // optional
}`}
                </code>
              </div>
            </div>

            {/* GET Conversation History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded font-mono text-sm font-semibold">GET</span>
                <code className="text-gray-700">/conversations/[conversation_id]</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve the full conversation history</p>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div id="rate-limits" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Rate Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Standard Plan</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600">Requests/minute:</span>
                  <span className="font-bold text-brand-600">100</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Daily limit:</span>
                  <span className="font-bold text-brand-600">100,000</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Concurrent requests:</span>
                  <span className="font-bold text-brand-600">10</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pro Plan</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600">Requests/minute:</span>
                  <span className="font-bold text-brand-600">500</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Daily limit:</span>
                  <span className="font-bold text-brand-600">1,000,000</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Concurrent requests:</span>
                  <span className="font-bold text-brand-600">50</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Code Examples</h2>
          <div className="grid grid-cols-1 gap-6">
            {codeExamples.map((example, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{example.title}</h3>
                  <span className="text-xs font-medium text-brand-600 bg-brand-100 px-3 py-1 rounded-full">
                    {example.language}
                  </span>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-gray-200 text-sm">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Handling */}
        <div id="errors" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Error Handling</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-700 mb-6">
              All API errors follow a standard format. Handle errors gracefully in your applications:
            </p>
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <code className="text-gray-200 text-sm">
                {`{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid",
    "details": "Please check your API key and try again"
  }
}`}
              </code>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">400</span>
                <div>
                  <p className="font-semibold text-gray-900">Bad Request</p>
                  <p className="text-gray-600 text-sm">Invalid parameters or missing required fields</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">401</span>
                <div>
                  <p className="font-semibold text-gray-900">Unauthorized</p>
                  <p className="text-gray-600 text-sm">API key is missing or invalid</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">429</span>
                <div>
                  <p className="font-semibold text-gray-900">Rate Limit Exceeded</p>
                  <p className="text-gray-600 text-sm">You've exceeded the rate limit for your plan</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">500</span>
                <div>
                  <p className="font-semibold text-gray-900">Server Error</p>
                  <p className="text-gray-600 text-sm">Internal server error - try again later</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div id="webhooks" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Webhooks</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-700 mb-6">
              Subscribe to real-time events from your agents. Webhooks are triggered when specific events occur:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-brand-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">agent.created</h3>
                <p className="text-gray-600 text-sm">Triggered when a new agent is created</p>
              </div>
              <div className="border-l-4 border-brand-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">agent.updated</h3>
                <p className="text-gray-600 text-sm">Triggered when an agent is updated</p>
              </div>
              <div className="border-l-4 border-brand-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">message.received</h3>
                <p className="text-gray-600 text-sm">Triggered when an agent receives a message</p>
              </div>
              <div className="border-l-4 border-brand-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">conversation.completed</h3>
                <p className="text-gray-600 text-sm">Triggered when a conversation ends</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Build?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Start integrating with our API today. Check out our tutorials and SDKs for different programming languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/sdks" className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition">
              View SDKs
            </Link>
            <Link href="/docs/tutorials" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-brand-600 transition">
              See Tutorials
            </Link>
            <Link href="/support/contact-us" className="px-6 py-3 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white hover:text-brand-600 transition">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
