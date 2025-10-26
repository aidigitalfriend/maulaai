'use client'

import Link from 'next/link'
import { UserIcon, LockClosedIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to AI Agents
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our platform to access powerful AI agents, save your conversations, 
              and unlock personalized experiences tailored just for you.
            </p>
          </div>

          {/* Authentication Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12">
            {/* Sign Up Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create Account
              </h2>
              <p className="text-gray-600 mb-6">
                New to our platform? Sign up to start your AI journey with personalized agents and saved conversations.
              </p>
              <Link 
                href="/auth/signup"
                className="group w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Free forever • No credit card required
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full">
                  <LockClosedIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome Back
              </h2>
              <p className="text-gray-600 mb-6">
                Already have an account? Sign in to continue your conversations and access your personalized AI agents.
              </p>
              <Link 
                href="/auth/login"
                className="group w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Secure • Fast • Easy
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              What you'll get with an account
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Saved Conversations</h4>
                <p className="text-sm text-gray-600">Your chat history persists across sessions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">18 AI Agents</h4>
                <p className="text-sm text-gray-600">Access to all specialized AI assistants</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Personalized Experience</h4>
                <p className="text-sm text-gray-600">Tailored recommendations and preferences</p>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-x-6">
            <Link 
              href="/auth/reset-password" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Forgot Password?
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/legal" 
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Terms & Privacy
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/support" 
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}