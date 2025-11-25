/**
 * Configuration Setup Page
 * Helps users understand and configure their environment variables
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, Cog6ToothIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import ConfigValidator from '../../components/ConfigValidator'

export default function ConfigSetupPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const envVarSections = [
    {
      title: 'AI Service Providers',
      description: 'Configure AI models for agent responses',
      vars: [
        {
          name: 'NEXT_PUBLIC_OPENAI_API_KEY',
          description: 'OpenAI API key for GPT models',
          example: 'sk-...',
          required: false,
          link: 'https://platform.openai.com/api-keys'
        },
        {
          name: 'NEXT_PUBLIC_ANTHROPIC_API_KEY',
          description: 'Anthropic API key for Claude models',
          example: 'sk-ant-...',
          required: false,
          link: 'https://console.anthropic.com/keys'
        },
        {
          name: 'NEXT_PUBLIC_GEMINI_API_KEY',
          description: 'Google Gemini API key',
          example: 'AIza...',
          required: false,
          link: 'https://aistudio.google.com/app/apikey'
        },
        {
          name: 'NEXT_PUBLIC_COHERE_API_KEY',
          description: 'Cohere API key for Command models',
          example: 'co_...',
          required: false,
          link: 'https://dashboard.cohere.ai/api-keys'
        }
      ]
    },
    {
      title: 'Voice Services',
      description: 'Configure text-to-speech and speech recognition',
      vars: [
        {
          name: 'NEXT_PUBLIC_ELEVENLABS_API_KEY',
          description: 'ElevenLabs API key for high-quality voice synthesis',
          example: 'el_...',
          required: false,
          link: 'https://elevenlabs.io/app/subscription'
        },
        {
          name: 'NEXT_PUBLIC_ELEVENLABS_VOICE_ID',
          description: 'Default voice ID for ElevenLabs',
          example: 'pNInz6obpgDQGcFmaJgB',
          required: false
        },
        {
          name: 'NEXT_PUBLIC_AZURE_SPEECH_KEY',
          description: 'Azure Cognitive Services Speech key',
          example: 'abc123...',
          required: false,
          link: 'https://portal.azure.com/'
        },
        {
          name: 'NEXT_PUBLIC_AZURE_SPEECH_REGION',
          description: 'Azure Speech service region',
          example: 'eastus',
          required: false
        }
      ]
    },
    {
      title: 'Translation Services',
      description: 'Configure language translation providers',
      vars: [
        {
          name: 'NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY',
          description: 'Google Cloud Translation API key',
          example: 'AIza...',
          required: false,
          link: 'https://console.cloud.google.com/apis/credentials'
        },
        {
          name: 'NEXT_PUBLIC_DEEPL_API_KEY',
          description: 'DeepL API key for high-quality translation',
          example: 'abc123:fx',
          required: false,
          link: 'https://www.deepl.com/pro-api'
        },
        {
          name: 'NEXT_PUBLIC_AZURE_TRANSLATOR_KEY',
          description: 'Azure Translator service key',
          example: 'abc123...',
          required: false
        }
      ]
    },
    {
      title: 'Application Settings',
      description: 'Configure general application behavior',
      vars: [
        {
          name: 'NEXT_PUBLIC_API_URL',
          description: 'Backend API URL',
          example: 'http://localhost:3002',
          required: true
        },
        {
          name: 'NEXT_PUBLIC_ENABLE_MULTILINGUAL',
          description: 'Enable multilingual features',
          example: 'true',
          required: false
        },
        {
          name: 'NEXT_PUBLIC_DEFAULT_LANGUAGE',
          description: 'Default language code',
          example: 'en',
          required: false
        },
        {
          name: 'NEXT_PUBLIC_ENABLE_VOICE',
          description: 'Enable voice features',
          example: 'true',
          required: false
        },
        {
          name: 'NEXT_PUBLIC_ENABLE_TRANSLATION',
          description: 'Enable translation features',
          example: 'true',
          required: false
        }
      ]
    }
  ]

  const generateEnvTemplate = () => {
    const lines = ['# Multilingual AI Agent System - Environment Variables', '']
    
    envVarSections.forEach(section => {
      lines.push(`# ${section.title}`)
      lines.push(`# ${section.description}`)
      lines.push('')
      
      section.vars.forEach(envVar => {
        lines.push(`# ${envVar.description}`)
        if (envVar.link) {
          lines.push(`# Get your key at: ${envVar.link}`)
        }
        lines.push(`${envVar.name}=${envVar.example}`)
        lines.push('')
      })
      
      lines.push('')
    })
    
    return lines.join('\n')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <div className="text-gray-300">|</div>
              <div className="flex items-center space-x-2">
                <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Environment Configuration</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Validator */}
        <div className="mb-8">
          <ConfigValidator />
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Environment Variable Setup</h2>
            <p className="mt-2 text-gray-600">
              Configure your environment variables to enable all features of the multilingual AI agent system.
              You don't need all services - the system will work with whatever you configure.
            </p>
          </div>

          <div className="p-6">
            {/* Quick Setup */}
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">Quick Setup</h3>
              <p className="text-sm text-blue-700 mt-1 mb-3">
                Copy this template to your <code>.env.local</code> file and fill in your API keys:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                  <code>{generateEnvTemplate()}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(generateEnvTemplate())}
                  className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Detailed Configuration */}
            <div className="space-y-8">
              {envVarSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{section.title}</h3>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  
                  <div className="grid gap-4">
                    {section.vars.map((envVar, varIndex) => (
                      <div key={varIndex} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {envVar.name}
                              </code>
                              {envVar.required && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{envVar.description}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              Example: <code className="bg-gray-100 px-1 rounded">{envVar.example}</code>
                            </div>
                            {envVar.link && (
                              <div className="mt-2">
                                <a
                                  href={envVar.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Get your API key →
                                </a>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(`${envVar.name}=${envVar.example}`)}
                            className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                            title="Copy to clipboard"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Usage Notes */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900">Important Notes</h3>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li>Environment variables with <code>NEXT_PUBLIC_</code> prefix are exposed to the browser</li>
                <li>Keep your API keys secure and never commit them to version control</li>
                <li>You only need to configure the services you want to use</li>
                <li>The system will automatically fall back to available services</li>
                <li>Restart your development server after changing environment variables</li>
                <li>For production, use your hosting platform's environment variable settings</li>
              </ul>
            </div>

            {/* File Structure */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">File Structure</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>Create these files in your project root:</p>
                <ul className="mt-2 space-y-1 font-mono text-xs bg-gray-900 text-gray-100 p-3 rounded">
                  <li>📁 /frontend/</li>
                  <li>&nbsp;&nbsp;📄 .env.local <span className="text-gray-400"># Your actual API keys (DO NOT COMMIT)</span></li>
                  <li>&nbsp;&nbsp;📄 .env.example <span className="text-gray-400"># Template file (safe to commit)</span></li>
                  <li>📁 /backend/</li>
                  <li>&nbsp;&nbsp;📄 .env.local <span className="text-gray-400"># Backend environment variables</span></li>
                  <li>&nbsp;&nbsp;📄 .env.example <span className="text-gray-400"># Backend template file</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}