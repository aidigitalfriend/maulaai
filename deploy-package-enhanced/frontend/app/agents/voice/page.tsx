'use client';

import React from 'react';
import VoiceAgents from '../../../components/VoiceAgents';

export default function VoiceAgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🎤 Premium Voice Agents
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              18 specialized AI agents with advanced voice chat capabilities. 
              Get expert advice through natural conversation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                <span>🛡️</span>
                <span>Cybersecurity Expert</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                <span>☁️</span>
                <span>Cloud Architect</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                <span>🤖</span>
                <span>AI Engineer</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                <span>📱</span>
                <span>Mobile Developer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Voice Agents?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of AI assistance with natural voice conversations, 
            specialized expertise, and personalized guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Specialized Expertise
            </h3>
            <p className="text-gray-600">
              Each agent is trained in specific domains with deep knowledge and years of 
              experience in their field.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗣️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Natural Voice Chat
            </h3>
            <p className="text-gray-600">
              Have natural conversations with AI agents using advanced speech-to-text 
              and text-to-speech technology.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Assistance
            </h3>
            <p className="text-gray-600">
              Get instant expert advice and guidance through voice interaction, 
              perfect for hands-free learning.
            </p>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Subscription Tiers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the tier that fits your needs. All subscriptions include voice chat capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-yellow-200">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⭐</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <p className="text-gray-600">For individual developers and professionals</p>
            </div>

            <div className="mb-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">$19.99 - $34.99</span>
                <span className="text-gray-600">/month per agent</span>
              </div>
              
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>60-150 minutes voice chat per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>Advanced expertise in specialized domains</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>Multiple voice options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">👑</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600">For teams and organizations</p>
            </div>

            <div className="mb-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">$39.99 - $59.99</span>
                <span className="text-gray-600">/month per agent</span>
              </div>
              
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>160-300 minutes voice chat per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>All Premium features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>Advanced analytics and insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>Team management features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">✓</span>
                  <span>Custom integrations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Agents Component */}
      <div className="container mx-auto px-4 pb-16">
        <VoiceAgents 
          userId="demo-user" 
          className="max-w-7xl mx-auto"
        />
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience Voice AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with any agent that matches your expertise needs. 
            Each subscription is individual and can be managed separately.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Browse All Agents
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}