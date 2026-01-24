'use client'

import Link from 'next/link'
import CodeBlock from '@/components/ui/CodeBlock'

export default function DocsSDKs() {
  const sdks = [
    {
      name: "JavaScript/TypeScript",
      description: "Modern SDK for Node.js and browser environments",
      icon: "📘",
      version: "2.0.0",
      href: "#javascript",
      readTime: "10 min"
    },
    {
      name: "Python",
      description: "Complete Python SDK with async support",
      icon: "🐍",
      version: "1.8.0",
      href: "#python",
      readTime: "10 min"
    },
    {
      name: "Go",
      description: "High-performance Go SDK for enterprise applications",
      icon: "🐹",
      version: "1.5.0",
      href: "#go",
      readTime: "9 min"
    },
    {
      name: "PHP",
      description: "Full-featured PHP SDK for web applications",
      icon: "🚀",
      version: "2.1.0",
      href: "#php",
      readTime: "8 min"
    },
    {
      name: "Ruby",
      description: "Ruby gem for seamless integration",
      icon: "💎",
      version: "1.3.0",
      href: "#ruby",
      readTime: "8 min"
    },
    {
      name: "Java",
      description: "Enterprise-grade Java SDK",
      icon: "☕",
      version: "2.2.0",
      href: "#java",
      readTime: "11 min"
    }
  ]

  const featureComparison = [
    { feature: "RESTful API Support", js: true, py: true, go: true, php: true },
    { feature: "Real-time Streaming", js: true, py: true, go: true, php: false },
    { feature: "File Upload", js: true, py: true, go: true, php: true },
    { feature: "Error Handling", js: true, py: true, go: true, php: true },
    { feature: "Type Safety", js: true, py: false, go: true, php: false },
    { feature: "Async/Await", js: true, py: true, go: true, php: false },
    { feature: "WebSocket Support", js: true, py: true, go: true, php: false },
    { feature: "Rate Limiting", js: true, py: true, go: true, php: true }
  ]

  // Code snippets
  const jsInstallNpm = `npm install @maulaai/sdk`
  const jsInstallYarn = `yarn add @maulaai/sdk`
  
  const jsBasicUsage = `import { MaulaAI } from '@maulaai/sdk';

const client = new MaulaAI({
  apiKey: process.env.MAULAAI_API_KEY
});

// Get all agents
const agents = await client.agents.list();

// Send a message to an agent
const response = await client.conversations.send({
  agentId: 'agent_123',
  message: 'Hello, how are you?'
});

console.log(response.reply);`

  const jsCreateAgent = `const newAgent = await client.agents.create({
  name: 'My Bot',
  personality: 'helpful',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant'
});

console.log(newAgent.id);`

  const pyInstall = `pip install maulaai-sdk`
  
  const pyBasicUsage = `from maulaai import MaulaAI

client = MaulaAI(api_key='YOUR_API_KEY')

# Get all agents
agents = client.agents.list()

# Send a message
response = client.conversations.send(
  agent_id='agent_123',
  message='Hello, how are you?'
)

print(response['reply'])`

  const pyAsyncUsage = `import asyncio
from maulaai import AsyncMaulaAI

async def main():
  client = AsyncMaulaAI(api_key='YOUR_API_KEY')
  
  response = await client.conversations.send(
    agent_id='agent_123',
    message='Hello!'
  )
  
  print(response['reply'])

asyncio.run(main())`

  const goInstall = `go get github.com/maulaai/sdk-go`
  
  const goBasicUsage = `package main

import (
  "fmt"
  "github.com/maulaai/sdk-go"
)

func main() {
  client := maulaai.NewClient("YOUR_API_KEY")
  
  // List agents
  agents, err := client.Agents.List()
  if err != nil {
    panic(err)
  }
  
  // Send message
  response, err := client.Conversations.Send(&maulaai.Message{
    AgentID: "agent_123",
    Text:    "Hello!",
  })
  
  fmt.Println(response.Reply)
}`

  const phpInstall = `composer require maulaai/sdk-php`
  
  const phpBasicUsage = `<?php
require 'vendor/autoload.php';

use MaulaAI\\Client;

$client = new Client([
  'api_key' => 'YOUR_API_KEY'
]);

// List agents
$agents = $client->agents->list();

// Send message
$response = $client->conversations->send([
  'agent_id' => 'agent_123',
  'message' => 'Hello!'
]);

echo $response['reply'];
?>`

  const rubyInstall = `gem install maulaai-sdk`
  
  const rubyBasicUsage = `require 'maulaai'

client = MaulaAI::Client.new(api_key: ENV['MAULAAI_API_KEY'])

# List agents
agents = client.agents.list

# Send message
response = client.conversations.send(
  agent_id: 'agent_123',
  message: 'Hello!'
)

puts response['reply']`

  const javaInstall = `<dependency>
  <groupId>com.maulaai</groupId>
  <artifactId>sdk-java</artifactId>
  <version>2.2.0</version>
</dependency>`
  
  const javaBasicUsage = `import com.maulaai.sdk.MaulaAI;
import com.maulaai.sdk.models.Agent;

public class Main {
  public static void main(String[] args) {
    MaulaAI client = new MaulaAI("YOUR_API_KEY");
    
    // List agents
    List<Agent> agents = client.agents().list();
    
    // Send message
    String response = client.conversations()
      .send("agent_123", "Hello!");
    
    System.out.println(response);
  }
}`

  const errorHandling = `try {
  const response = await client
    .conversations.send({...});
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Handle rate limit
  } else if (error.code === 'AUTH_ERROR') {
    // Handle auth error
  } else {
    // Handle other errors
  }
}`

  const retryLogic = `const maxRetries = 3;
let attempt = 0;

while (attempt < maxRetries) {
  try {
    return await client.agents.list();
  } catch (error) {
    attempt++;
    await sleep(Math.pow(2, attempt) * 1000);
  }
}`

  const pagination = `const agents = [];
let page = 1;

while (true) {
  const result = await client
    .agents.list({
      page: page,
      limit: 50
    });
  
  agents.push(...result.data);
  
  if (!result.hasMore) break;
  page++;
}`

  const streaming = `const stream = await client
  .conversations.stream({
    agentId: 'agent_123',
    message: 'Write a poem'
  });

for await (const chunk of stream) {
  process.stdout.write(chunk.data);
}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">📦</span>
            Official Libraries
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">SDKs & Libraries</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">Official SDKs for popular programming languages with production-ready libraries</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#quickstart" className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-gray-100 transition">
              Quick Start
            </a>
            <a href="#available" className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition">
              View All SDKs
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-12">
        
        {/* SDK Overview */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-bold text-neural-900 mb-2">Easy to Use</h3>
              <p className="text-neural-600 text-sm">
                Simple APIs that make it easy to integrate Maula AI into your apps
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-neural-900 mb-2">Well-Maintained</h3>
              <p className="text-neural-600 text-sm">
                Regularly updated with bug fixes and new features
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-neural-900 mb-2">Fully Documented</h3>
              <p className="text-neural-600 text-sm">
                Comprehensive documentation with examples for every feature
              </p>
            </div>
          </div>
        </div>

        {/* Available SDKs */}
        <div id="available" className="mb-16">
          <h2 className="text-3xl font-bold text-neural-900 mb-8">Available SDKs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdks.map((sdk, index) => (
              <a key={index} href={sdk.href} className="group bg-white rounded-2xl p-6 shadow-sm border border-neural-200 hover:shadow-md hover:border-brand-300 transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{sdk.icon}</div>
                  <span className="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-1 rounded">
                    v{sdk.version}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-neural-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {sdk.name}
                </h3>
                <p className="text-neural-600 text-sm mb-4 flex-grow">
                  {sdk.description}
                </p>
                <span className="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors">
                  Learn more →
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Installation Guide */}
        <div id="quickstart" className="mb-16">
          <h2 className="text-3xl font-bold text-neural-900 mb-8">Installation Guide</h2>

          {/* JavaScript */}
          <div id="javascript" className="bg-white rounded-2xl p-8 shadow-sm border border-neural-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">📘</div>
              <h3 className="text-2xl font-bold text-neural-900">JavaScript/TypeScript</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Installation</h4>
              <CodeBlock code={jsInstallNpm} language="bash" title="npm" />
              <p className="text-neural-600 text-sm my-3">or with yarn:</p>
              <CodeBlock code={jsInstallYarn} language="bash" title="yarn" />
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Basic Usage</h4>
              <CodeBlock code={jsBasicUsage} language="javascript" showLineNumbers />
            </div>

            <div>
              <h4 className="text-lg font-bold text-neural-900 mb-3">Creating an Agent</h4>
              <CodeBlock code={jsCreateAgent} language="javascript" showLineNumbers />
            </div>
          </div>

          {/* Python */}
          <div id="python" className="bg-white rounded-2xl p-8 shadow-sm border border-neural-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🐍</div>
              <h3 className="text-2xl font-bold text-neural-900">Python</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Installation</h4>
              <CodeBlock code={pyInstall} language="bash" title="pip" />
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Basic Usage</h4>
              <CodeBlock code={pyBasicUsage} language="python" showLineNumbers />
            </div>

            <div>
              <h4 className="text-lg font-bold text-neural-900 mb-3">Async Support</h4>
              <CodeBlock code={pyAsyncUsage} language="python" showLineNumbers />
            </div>
          </div>

          {/* Go */}
          <div id="go" className="bg-white rounded-2xl p-8 shadow-sm border border-neural-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🐹</div>
              <h3 className="text-2xl font-bold text-neural-900">Go</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Installation</h4>
              <CodeBlock code={goInstall} language="bash" title="go get" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-neural-900 mb-3">Basic Usage</h4>
              <CodeBlock code={goBasicUsage} language="go" showLineNumbers />
            </div>
          </div>

          {/* PHP */}
          <div id="php" className="bg-white rounded-2xl p-8 shadow-sm border border-neural-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🚀</div>
              <h3 className="text-2xl font-bold text-neural-900">PHP</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Installation</h4>
              <CodeBlock code={phpInstall} language="bash" title="composer" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-neural-900 mb-3">Basic Usage</h4>
              <CodeBlock code={phpBasicUsage} language="php" showLineNumbers />
            </div>
          </div>

          {/* Ruby */}
          <div id="ruby" className="bg-white rounded-2xl p-8 shadow-sm border border-neural-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">💎</div>
              <h3 className="text-2xl font-bold text-neural-900">Ruby</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Installation</h4>
              <CodeBlock code={rubyInstall} language="bash" title="gem" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-neural-900 mb-3">Basic Usage</h4>
              <CodeBlock code={rubyBasicUsage} language="ruby" showLineNumbers />
            </div>
          </div>

          {/* Java */}
          <div id="java" className="bg-white rounded-2xl p-8 shadow-sm border border-neural-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">☕</div>
              <h3 className="text-2xl font-bold text-neural-900">Java</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold text-neural-900 mb-3">Installation</h4>
              <p className="text-neural-600 mb-3">Add to your pom.xml:</p>
              <CodeBlock code={javaInstall} language="xml" title="pom.xml" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-neural-900 mb-3">Basic Usage</h4>
              <CodeBlock code={javaBasicUsage} language="java" showLineNumbers />
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-900 mb-8">SDK Feature Comparison</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-neural-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neural-200 bg-gray-50">
                    <th className="text-left py-4 px-4 font-bold text-neural-900">Feature</th>
                    <th className="text-center py-4 px-4 font-bold text-neural-900">JavaScript</th>
                    <th className="text-center py-4 px-4 font-bold text-neural-900">Python</th>
                    <th className="text-center py-4 px-4 font-bold text-neural-900">Go</th>
                    <th className="text-center py-4 px-4 font-bold text-neural-900">PHP</th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, index) => (
                    <tr key={index} className="border-b border-neural-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-neural-700">{row.feature}</td>
                      <td className="text-center py-4 px-4">
                        {row.js ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.py ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.go ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.php ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-900 mb-8">Common Patterns</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200">
              <h3 className="text-lg font-bold text-neural-900 mb-4">Error Handling</h3>
              <CodeBlock code={errorHandling} language="javascript" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200">
              <h3 className="text-lg font-bold text-neural-900 mb-4">Retry Logic</h3>
              <CodeBlock code={retryLogic} language="javascript" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200">
              <h3 className="text-lg font-bold text-neural-900 mb-4">Pagination</h3>
              <CodeBlock code={pagination} language="javascript" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-200">
              <h3 className="text-lg font-bold text-neural-900 mb-4">Streaming Responses</h3>
              <CodeBlock code={streaming} language="javascript" />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Coding?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Choose your SDK, follow the installation guide, and start building powerful AI agent applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/tutorials" className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              View Tutorials
            </Link>
            <Link href="/docs/api" className="border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              API Reference
            </Link>
            <Link href="/support/contact-us" className="border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
