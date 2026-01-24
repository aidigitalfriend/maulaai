'use client'

import Link from 'next/link'
import { ArrowLeft, Layout, Code, Sparkles, Download, Play, Zap, Layers, Palette, Settings, FileCode, Rocket } from 'lucide-react'

export default function CanvasDocsPage() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Text to App',
      description: 'Describe your app in plain English and watch it come to life. Our AI understands your intent and generates functional React components.',
      color: 'from-purple-500 to-fuchsia-500'
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Live Preview',
      description: 'See your application running in real-time as it\'s being generated. Make adjustments and see changes instantly.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Clean Code Output',
      description: 'Generated code follows best practices with proper component structure, TypeScript types, and Tailwind CSS styling.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Export & Deploy',
      description: 'Download your generated application as a complete project ready for deployment to Vercel, Netlify, or any hosting platform.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const useCases = [
    { title: 'Landing Pages', description: 'Create beautiful marketing pages with hero sections, features, testimonials, and CTAs', icon: '🎯' },
    { title: 'Dashboards', description: 'Build data visualization dashboards with charts, metrics, and interactive widgets', icon: '📊' },
    { title: 'Forms & Surveys', description: 'Generate complex forms with validation, multi-step wizards, and data collection', icon: '📝' },
    { title: 'E-commerce', description: 'Create product listings, shopping carts, and checkout flows', icon: '🛒' },
    { title: 'Admin Panels', description: 'Build CRUD interfaces, data tables, and management consoles', icon: '⚙️' },
    { title: 'Portfolio Sites', description: 'Design personal portfolios, galleries, and showcase pages', icon: '🎨' }
  ]

  const steps = [
    {
      step: 1,
      title: 'Describe Your App',
      description: 'Type a natural language description of what you want to build. Be specific about features, styling, and functionality.',
      example: '"Create a modern dashboard with a sidebar navigation, header with user profile, and main content area showing analytics cards with charts"'
    },
    {
      step: 2,
      title: 'AI Generates Code',
      description: 'Our AI analyzes your request and generates a complete React component with proper structure, styling, and interactivity.',
      example: 'Watch as the code appears in the editor with syntax highlighting and real-time compilation.'
    },
    {
      step: 3,
      title: 'Preview & Iterate',
      description: 'See your app running in the live preview panel. Request modifications or enhancements to refine the output.',
      example: '"Add a dark mode toggle to the header" or "Make the sidebar collapsible"'
    },
    {
      step: 4,
      title: 'Export & Use',
      description: 'Download the complete project with all dependencies, or copy individual components to integrate into your existing codebase.',
      example: 'Get a ready-to-run project with package.json, components, and configuration files.'
    }
  ]

  const techStack = [
    { name: 'React', description: 'Modern component-based architecture', icon: '⚛️' },
    { name: 'TypeScript', description: 'Type-safe code generation', icon: '📘' },
    { name: 'Tailwind CSS', description: 'Utility-first styling', icon: '🎨' },
    { name: 'Lucide Icons', description: 'Beautiful icon library', icon: '✨' },
    { name: 'Recharts', description: 'Data visualization charts', icon: '📈' },
    { name: 'Framer Motion', description: 'Smooth animations', icon: '🎬' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link href="/docs" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="text-xl">🎨</span>
              AI App Builder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">Canvas Builder</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Build complete web applications with AI-powered code generation</p>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">

        {/* Quick Start CTA */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 rounded-2xl p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
              <p className="text-neural-300 mb-6">Jump right in and start creating your first app with Canvas Builder.</p>
              <Link href="/canvas-app" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition">
                <Rocket className="w-5 h-5" />
                Launch Canvas Builder
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-800 text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100 hover:shadow-lg transition">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-neural-800 mb-2">{feature.title}</h3>
                <p className="text-neural-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-800 text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neural-800 mb-2">{step.title}</h3>
                    <p className="text-neural-600 mb-4">{step.description}</p>
                    <div className="bg-neural-50 rounded-lg p-4 border border-neural-100">
                      <p className="text-sm text-neural-700 italic">{step.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-800 text-center mb-8">What You Can Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-neural-100 hover:border-purple-200 transition">
                <div className="text-3xl mb-3">{useCase.icon}</div>
                <h3 className="font-bold text-neural-800 mb-1">{useCase.title}</h3>
                <p className="text-sm text-neural-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-800 text-center mb-8">Generated Tech Stack</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {techStack.map((tech, idx) => (
                <div key={idx} className="text-center p-4 bg-neural-50 rounded-xl">
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <h4 className="font-bold text-neural-800 text-sm">{tech.name}</h4>
                  <p className="text-xs text-neural-500">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neural-800 text-center mb-8">Pro Tips</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neural-800 mb-1">Be Specific</h4>
                  <p className="text-sm text-neural-600">Include details about layout, colors, and functionality for better results.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neural-800 mb-1">Iterate</h4>
                  <p className="text-sm text-neural-600">Start simple and add features incrementally through conversation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neural-800 mb-1">Reference Examples</h4>
                  <p className="text-sm text-neural-600">Mention well-known sites or apps as style references.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neural-800 mb-1">Use Components</h4>
                  <p className="text-sm text-neural-600">Ask for specific UI patterns like "add a modal" or "include a data table".</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start Building Now</h2>
            <p className="text-lg opacity-90 mb-8">
              Transform your ideas into working applications in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/canvas-app" className="btn-primary bg-white text-purple-600 hover:bg-neural-50">
                Open Canvas Builder
              </Link>
              <Link href="/resources/tutorials" className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-purple-600">
                View Tutorials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
