import Link from 'next/link'

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-600/20 via-accent-500/10 to-brand-700/20 border-b border-brand-500/20">
        <div className="container-custom section-padding-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-400 via-accent-400 to-blue-400 bg-clip-text text-transparent mb-6">
              SDKs & Libraries
            </h1>
            <p className="text-xl text-neutral-300 mb-6 leading-relaxed">
              Official SDKs for popular programming languages. Simplify your integration with our well-documented, production-ready libraries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#quickstart" className="btn-primary">
                Quick Start
              </a>
              <a href="#available" className="btn-secondary">
                View All SDKs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom section-padding-lg">
        
        {/* SDK Overview */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-dark p-6 text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-bold mb-2">Easy to Use</h3>
              <p className="text-neutral-400 text-sm">
                Simple APIs that make it easy to integrate One Last AI into your apps
              </p>
            </div>
            <div className="card-dark p-6 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold mb-2">Well-Maintained</h3>
              <p className="text-neutral-400 text-sm">
                Regularly updated with bug fixes and new features
              </p>
            </div>
            <div className="card-dark p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-bold mb-2">Fully Documented</h3>
              <p className="text-neutral-400 text-sm">
                Comprehensive documentation with examples for every feature
              </p>
            </div>
          </div>
        </div>

        {/* Available SDKs */}
        <div id="available" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Available SDKs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdks.map((sdk, index) => (
              <a key={index} href={sdk.href} className="group card-dark p-6 hover:card-dark-hover transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{sdk.icon}</div>
                  <span className="text-xs font-bold text-brand-400 bg-brand-900/50 px-2 py-1 rounded">
                    v{sdk.version}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition-colors">
                  {sdk.name}
                </h3>
                <p className="text-neutral-400 text-sm mb-4 flex-grow">
                  {sdk.description}
                </p>
                <span className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
                  Learn more →
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Installation Guide */}
        <div id="quickstart" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Installation Guide</h2>

          {/* JavaScript */}
          <div id="javascript" className="card-dark p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">📘</div>
              <h3 className="text-2xl font-bold">JavaScript/TypeScript</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Installation</h4>
              <div className="bg-neutral-900 p-4 rounded-lg mb-4">
                <code className="text-neutral-200 text-sm">npm install @One Last AI/sdk</code>
              </div>
              <p className="text-neutral-400 text-sm">or with yarn:</p>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">yarn add @One Last AI/sdk</code>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Basic Usage</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`import { One Last AI } from '@One Last AI/sdk';

const client = new One Last AI({
  apiKey: process.env.One Last AI_API_KEY
});

// Get all agents
const agents = await client.agents.list();

// Send a message to an agent
const response = await client.conversations.send({
  agentId: 'agent_123',
  message: 'Hello, how are you?'
});

console.log(response.reply);`}
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-3">Creating an Agent</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`const newAgent = await client.agents.create({
  name: 'My Bot',
  personality: 'helpful',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant'
});

console.log(newAgent.id);`}
                </code>
              </div>
            </div>
          </div>

          {/* Python */}
          <div id="python" className="card-dark p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🐍</div>
              <h3 className="text-2xl font-bold">Python</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Installation</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">pip install One Last AI-sdk</code>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Basic Usage</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`from One Last AI import One Last AI

client = One Last AI(api_key='YOUR_API_KEY')

# Get all agents
agents = client.agents.list()

# Send a message
response = client.conversations.send(
  agent_id='agent_123',
  message='Hello, how are you?'
)

print(response['reply'])`}
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-3">Async Support</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`import asyncio
from One Last AI import AsyncOne Last AI

async def main():
  client = AsyncOne Last AI(api_key='YOUR_API_KEY')
  
  response = await client.conversations.send(
    agent_id='agent_123',
    message='Hello!'
  )
  
  print(response['reply'])

asyncio.run(main())`}
                </code>
              </div>
            </div>
          </div>

          {/* Go */}
          <div id="go" className="card-dark p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🐹</div>
              <h3 className="text-2xl font-bold">Go</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Installation</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">go get github.com/One Last AI/sdk-go</code>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Basic Usage</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`package main

import (
  "fmt"
  "github.com/One Last AI/sdk-go"
)

func main() {
  client := One Last AI.NewClient("YOUR_API_KEY")
  
  // List agents
  agents, err := client.Agents.List()
  if err != nil {
    panic(err)
  }
  
  // Send message
  response, err := client.Conversations.Send(&One Last AI.Message{
    AgentID: "agent_123",
    Text:    "Hello!",
  })
  
  fmt.Println(response.Reply)
}`}
                </code>
              </div>
            </div>
          </div>

          {/* PHP */}
          <div id="php" className="card-dark p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">🚀</div>
              <h3 className="text-2xl font-bold">PHP</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Installation</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">composer require One Last AI/sdk-php</code>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Basic Usage</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`<?php
require 'vendor/autoload.php';

use One Last AI\\Client;

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
?>`}
                </code>
              </div>
            </div>
          </div>

          {/* Ruby */}
          <div id="ruby" className="card-dark p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">💎</div>
              <h3 className="text-2xl font-bold">Ruby</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Installation</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">gem install One Last AI-sdk</code>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Basic Usage</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`require 'One Last AI'

client = One Last AI::Client.new(api_key: ENV['One Last AI_API_KEY'])

# List agents
agents = client.agents.list

# Send message
response = client.conversations.send(
  agent_id: 'agent_123',
  message: 'Hello!'
)

puts response['reply']`}
                </code>
              </div>
            </div>
          </div>

          {/* Java */}
          <div id="java" className="card-dark p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">☕</div>
              <h3 className="text-2xl font-bold">Java</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">Installation</h4>
              <p className="text-neutral-400 mb-3">Add to your pom.xml:</p>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`<dependency>
  <groupId>com.One Last AI</groupId>
  <artifactId>sdk-java</artifactId>
  <version>2.2.0</version>
</dependency>`}
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-3">Basic Usage</h4>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-sm">
                  {`import com.One Last AI.sdk.One Last AI;
import com.One Last AI.sdk.models.Agent;

public class Main {
  public static void main(String[] args) {
    One Last AI client = new One Last AI("YOUR_API_KEY");
    
    // List agents
    List<Agent> agents = client.agents().list();
    
    // Send message
    String response = client.conversations()
      .send("agent_123", "Hello!");
    
    System.out.println(response);
  }
}`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">SDK Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-center py-4 px-4 font-bold">JavaScript</th>
                  <th className="text-center py-4 px-4 font-bold">Python</th>
                  <th className="text-center py-4 px-4 font-bold">Go</th>
                  <th className="text-center py-4 px-4 font-bold">PHP</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, index) => (
                  <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-900/50">
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.js ? <span className="text-green-400">✓</span> : <span className="text-neutral-500">✗</span>}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.py ? <span className="text-green-400">✓</span> : <span className="text-neutral-500">✗</span>}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.go ? <span className="text-green-400">✓</span> : <span className="text-neutral-500">✗</span>}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.php ? <span className="text-green-400">✓</span> : <span className="text-neutral-500">✗</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Common Patterns */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Common Patterns</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Error Handling</h3>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-xs">
                  {`try {
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
}`}
                </code>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Retry Logic</h3>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-xs">
                  {`const maxRetries = 3;
let attempt = 0;

while (attempt < maxRetries) {
  try {
    return await client.agents.list();
  } catch (error) {
    attempt++;
    await sleep(
      Math.pow(2, attempt) * 1000
    );
  }
}`}
                </code>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Pagination</h3>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-xs">
                  {`const agents = [];
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
}`}
                </code>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="text-lg font-bold mb-4">Streaming Responses</h3>
              <div className="bg-neutral-900 p-4 rounded-lg">
                <code className="text-neutral-200 text-xs">
                  {`const stream = await client
  .conversations.stream({
    agentId: 'agent_123',
    message: 'Write a poem'
  });

for await (const chunk of stream) {
  process.stdout.write(
    chunk.data
  );
}`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-600/20 via-accent-500/10 to-brand-700/20 border border-brand-500/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Coding?</h2>
          <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
            Choose your SDK, follow the installation guide, and start building powerful AI agent applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/tutorials" className="btn-primary">
              View Tutorials
            </Link>
            <Link href="/docs/api" className="btn-secondary">
              API Reference
            </Link>
            <Link href="/support/contact-us" className="btn-outline">
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
