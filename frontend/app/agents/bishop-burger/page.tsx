'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

import { FileAttachment } from '../../../utils/chatStorage'
import { DetectedLanguage, generateMultilingualPrompt } from '../../../utils/languageDetection'
import { getAIConfig, getAppConfig, getPreferredAIProvider } from '../../../utils/config'

// Call actual AI service for Bishop Burger responses
const callBishopBurgerAI = async (
  message: string, 
  attachments?: FileAttachment[], 
  detectedLanguage?: DetectedLanguage, 
  provider: string = 'openai'
): Promise<string | null> => {
  try {
    const appConfig = getAppConfig()
    const prompt = generateMultilingualPrompt(
      detectedLanguage || { code: appConfig.multilingual.defaultLanguage, name: 'English', nativeName: 'English', flag: '🇺🇸', confidence: 1.0 },
      `You are Bishop Burger, a unique character who is both a chess bishop and a gourmet chef. You think diagonally (like a chess bishop moves) and connect unexpected flavors and techniques. You have a spiritual approach to cooking, treating food as sacred. Respond with enthusiasm, culinary wisdom, and creative diagonal thinking. Use emojis like 🍔✨👨‍🍳🙏. ${message}`
    )

    const response = await fetch(`${appConfig.api.url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        provider,
        agent: 'bishop-burger',
        language: detectedLanguage?.code || appConfig.multilingual.defaultLanguage,
        attachments: attachments?.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size,
          content: att.data
        }))
      }),
      signal: AbortSignal.timeout(appConfig.api.timeout)
    })

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success && result.response) {
      return result.response
    }
    
    return null
  } catch (error) {
    console.error('Failed to call Bishop Burger AI service:', error)
    return null
  }
}

export default function BishopBurgerPage() {
  // Get configuration from environment variables
  const aiConfig = getAIConfig()
  const appConfig = getAppConfig()  
  const preferredProvider = getPreferredAIProvider()

  const handleSendMessage = async (message: string, attachments?: FileAttachment[], detectedLanguage?: DetectedLanguage): Promise<string> => {
    // Check if multilingual features are enabled
    if (!appConfig.multilingual.enabled) {
      detectedLanguage = {
        code: appConfig.multilingual.defaultLanguage,
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        confidence: 1.0
      }
    }

    // Try to call actual AI service if configured
    if (aiConfig.openai.enabled || aiConfig.anthropic.enabled || aiConfig.gemini.enabled || aiConfig.cohere.enabled) {
      try {
        const response = await callBishopBurgerAI(message, attachments, detectedLanguage, preferredProvider)
        if (response) return response
      } catch (error) {
        console.warn('AI service call failed, falling back to simulated response:', error)
      }
    }

    // Fallback to simulated response (demo mode)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Handle PDF attachments
    if (attachments && attachments.length > 0) {
      const fileResponses = [
        "🍔 *examining the PDF with spiritual insight* Ah, I see wisdom within these pages! Let me digest this culinary knowledge and share how we can transform these ingredients into something sacred...",
        "✨ *blesses the uploaded document* What beautiful recipes and techniques you've shared! I can sense the love and tradition in these pages. Let me guide you through enhancing these with my diagonal thinking approach...",
        "👨‍🍳 *studies the PDF thoughtfully* These documents reveal fascinating culinary secrets! Like a bishop moving diagonally across a board, I can connect these techniques to create something extraordinary. Here's what I see...",
        "🙏 *meditates on the PDF content* Food documents are like sacred texts to me! I can feel the passion and knowledge within these pages. Let me share how we can elevate these recipes with spiritual culinary wisdom...",
        "🍔 *chef's kiss while reviewing the PDF* This is treasure! Hidden within these pages are the building blocks of culinary enlightenment. Allow me to show you the diagonal connections I see between these techniques..."
      ]
      return fileResponses[Math.floor(Math.random() * fileResponses.length)] + 
        `\n\n📄 I've analyzed ${attachments.length} PDF file(s): ${attachments.map(f => f.name).join(', ')}. The total knowledge absorbed: ${attachments.reduce((sum, f) => sum + f.size, 0) > 1024 * 1024 ? Math.round(attachments.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024) * 10) / 10 + 'MB' : Math.round(attachments.reduce((sum, f) => sum + f.size, 0) / 1024) + 'KB'} of pure culinary wisdom!`
    }
    
    // Simple multilingual responses
    const getResponseInLanguage = (language?: DetectedLanguage) => {
      if (!language || language.code === 'en') {
        return [
          "🍔 Ah, a divine combination! Let me share a recipe that connects flavors diagonally...",
          "✨ *blesses the ingredients* This calls for some creative culinary wisdom!",
          "👨‍🍳 Like a bishop's diagonal move, let's connect unexpected flavors!",
          "🙏 Food is love made visible! Here's how we make this dish with spiritual flair...",
          "🍔 *chef's kiss* This reminds me of a recipe that bridges cultures beautifully!",
          "✨ Cooking is meditation in motion! Let me guide you through this culinary journey..."
        ]
      }
      
      const multilingualResponses: { [key: string]: string[] } = {
        'es': [
          "🍔 ¡Ah, una combinación divina! Déjame compartir una receta que conecta sabores diagonalmente...",
          "✨ *bendice los ingredientes* ¡Esto requiere sabiduría culinaria creativa!",
          "👨‍🍳 Como el movimiento diagonal de un alfil, ¡conectemos sabores inesperados!",
        ],
        'fr': [
          "🍔 Ah, une combinaison divine! Laissez-moi partager une recette qui connecte les saveurs en diagonal...",
          "✨ *bénit les ingrédients* Cela demande de la sagesse culinaire créative!",
          "👨‍🍳 Comme le mouvement diagonal d'un fou, connectons des saveurs inattendues!",
        ],
        'de': [
          "🍔 Ach, eine göttliche Kombination! Lassen Sie mich ein Rezept teilen, das Aromen diagonal verbindet...",
          "✨ *segnet die Zutaten* Das verlangt nach kreativer kulinarischer Weisheit!",
          "👨‍🍳 Wie der diagonale Zug eines Läufers, verbinden wir unerwartete Geschmäcker!",
        ]
      }
      
      return multilingualResponses[language.code] || multilingualResponses['es']
    }

    const responses = getResponseInLanguage(detectedLanguage)
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-orange-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🍔
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Bishop Burger</h1>
              <p className="text-orange-100 text-lg">Culinary Arts Spiritual Guide</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Cooking</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Recipes</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Food</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Creativity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="bishop-burger"
            agentName="Bishop Burger"
            agentColor="from-orange-500 to-amber-600"
            initialMessage="🍔 Hello, I am Bishop Burger, how can I help you with culinary wisdom?"
            onSendMessage={handleSendMessage}
            placeholder="What culinary creation shall we bless today? 🍔✨ (You can also upload PDF recipes!)"
            className="border border-amber-200"
            allowFileUpload={true}
            enableLanguageDetection={true}
            maxFileSize={10}
          />
        </div>
      </div>
    </div>
  )
}