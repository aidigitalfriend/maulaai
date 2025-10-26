'use client'

import Link from 'next/link'
import { ChevronLeftIcon, LanguageIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import { FileAttachment } from '../../../utils/chatStorage'
import { DetectedLanguage } from '../../../utils/languageDetection'

export default function MultilingualDemoPage() {
  const handleSendMessage = async (message: string, attachments?: FileAttachment[], detectedLanguage?: DetectedLanguage): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate response based on detected language
    const getMultilingualResponse = (language?: DetectedLanguage) => {
      if (!language || language.code === 'en') {
        return [
          "🌍 Hello! I can detect and respond in multiple languages! Try speaking to me in Spanish, French, German, or any other language!",
          "🔍 Language detection is working! I can understand and respond in over 30 languages. What would you like to explore?",
          "✨ This is the multilingual demo! I automatically detect your language and respond accordingly. Test me with different languages!"
        ]
      }
      
      const responses: { [key: string]: string[] } = {
        'es': [
          `🌍 ¡Hola! He detectado que estás escribiendo en ${language.nativeName} (${language.flag}). ¡Puedo responder en tu idioma!`,
          `🔍 ¡Detección de idioma funcionando perfectamente! Detecté ${language.name} con ${Math.round(language.confidence * 100)}% de confianza.`,
          `✨ ¡Fantástico! Puedo entender y responder en más de 30 idiomas. ¿En qué puedo ayudarte hoy?`,
          `🚀 ¡Impresionante! La tecnología de detección automática de idiomas está funcionando. ¡Háblame en cualquier idioma!`
        ],
        'fr': [
          `🌍 Bonjour! J'ai détecté que vous écrivez en ${language.nativeName} (${language.flag}). Je peux répondre dans votre langue!`,
          `🔍 Détection de langue parfaitement fonctionnelle! J'ai détecté le ${language.name} avec ${Math.round(language.confidence * 100)}% de confiance.`,
          `✨ Fantastique! Je peux comprendre et répondre dans plus de 30 langues. Comment puis-je vous aider aujourd'hui?`,
          `🚀 Impressionnant! La technologie de détection automatique des langues fonctionne. Parlez-moi dans n'importe quelle langue!`
        ],
        'de': [
          `🌍 Hallo! Ich habe erkannt, dass Sie auf ${language.nativeName} (${language.flag}) schreiben. Ich kann in Ihrer Sprache antworten!`,
          `🔍 Spracherkennung funktioniert perfekt! Ich habe ${language.name} mit ${Math.round(language.confidence * 100)}% Vertrauen erkannt.`,
          `✨ Fantastisch! Ich kann mehr als 30 Sprachen verstehen und darauf antworten. Womit kann ich Ihnen heute helfen?`,
          `🚀 Beeindruckend! Die automatische Spracherkennungstechnologie funktioniert. Sprechen Sie mit mir in jeder Sprache!`
        ],
        'it': [
          `🌍 Ciao! Ho rilevato che stai scrivendo in ${language.nativeName} (${language.flag}). Posso rispondere nella tua lingua!`,
          `🔍 Rilevamento della lingua perfettamente funzionante! Ho rilevato l'${language.name} con ${Math.round(language.confidence * 100)}% di fiducia.`,
          `✨ Fantastico! Posso capire e rispondere in più di 30 lingue. Come posso aiutarti oggi?`,
          `🚀 Impressionante! La tecnologia di rilevamento automatico della lingua funziona. Parlami in qualsiasi lingua!`
        ],
        'pt': [
          `🌍 Olá! Detectei que você está escrevendo em ${language.nativeName} (${language.flag}). Posso responder no seu idioma!`,
          `🔍 Detecção de idioma funcionando perfeitamente! Detectei ${language.name} com ${Math.round(language.confidence * 100)}% de confiança.`,
          `✨ Fantástico! Posso entender e responder em mais de 30 idiomas. Como posso ajudá-lo hoje?`,
          `🚀 Impressionante! A tecnologia de detecção automática de idiomas está funcionando. Fale comigo em qualquer idioma!`
        ],
        'ru': [
          `🌍 Привет! Я обнаружил, что вы пишете на ${language.nativeName} (${language.flag}). Я могу отвечать на вашем языке!`,
          `🔍 Определение языка работает идеально! Я определил ${language.name} с ${Math.round(language.confidence * 100)}% уверенности.`,
          `✨ Фантастично! Я могу понимать и отвечать на более чем 30 языках. Чем могу помочь сегодня?`,
          `🚀 Впечатляюще! Технология автоматического определения языка работает. Говорите со мной на любом языке!`
        ],
        'ja': [
          `🌍 こんにちは！あなたが${language.nativeName} (${language.flag})で書いていることを検出しました。あなたの言語で応答できます！`,
          `🔍 言語検出が完璧に機能しています！${Math.round(language.confidence * 100)}%の信頼度で${language.name}を検出しました。`,
          `✨ 素晴らしい！30以上の言語を理解し、応答することができます。今日はどのようにお手伝いできますか？`,
          `🚀 印象的です！自動言語検出技術が機能しています。どの言語でも話しかけてください！`
        ],
        'ko': [
          `🌍 안녕하세요! 당신이 ${language.nativeName} (${language.flag})로 쓰고 있다는 것을 감지했습니다. 당신의 언어로 응답할 수 있습니다!`,
          `🔍 언어 감지가 완벽하게 작동하고 있습니다! ${Math.round(language.confidence * 100)}% 신뢰도로 ${language.name}를 감지했습니다.`,
          `✨ 환상적입니다! 30개 이상의 언어를 이해하고 응답할 수 있습니다. 오늘 어떻게 도와드릴까요?`,
          `🚀 인상적입니다! 자동 언어 감지 기술이 작동하고 있습니다. 어떤 언어로든 말씀해 주세요!`
        ],
        'zh': [
          `🌍 你好！我检测到你正在用${language.nativeName} (${language.flag})书写。我可以用你的语言回应！`,
          `🔍 语言检测完美运行！我以${Math.round(language.confidence * 100)}%的置信度检测到了${language.name}。`,
          `✨ 太棒了！我可以理解并回应30多种语言。今天我能为你做什么？`,
          `🚀 令人印象深刻！自动语言检测技术正在工作。请用任何语言与我交谈！`
        ],
        'ar': [
          `🌍 مرحبا! لقد اكتشفت أنك تكتب باللغة ${language.nativeName} (${language.flag}). يمكنني الرد بلغتك!`,
          `🔍 كشف اللغة يعمل بشكل مثالي! اكتشفت ${language.name} بثقة ${Math.round(language.confidence * 100)}%.`,
          `✨ رائع! يمكنني فهم والرد بأكثر من 30 لغة. كيف يمكنني مساعدتك اليوم؟`,
          `🚀 مثير للإعجاب! تقنية الكشف التلقائي للغة تعمل. تحدث معي بأي لغة!`
        ],
        'hi': [
          `🌍 नमस्ते! मैंने पता लगाया है कि आप ${language.nativeName} (${language.flag}) में लिख रहे हैं। मैं आपकी भाषा में जवाब दे सकता हूं!`,
          `🔍 भाषा पहचान पूर्ण रूप से काम कर रही है! मैंने ${Math.round(language.confidence * 100)}% विश्वास के साथ ${language.name} का पता लगाया।`,
          `✨ शानदार! मैं 30 से अधिक भाषाओं को समझ और जवाब दे सकता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?`,
          `🚀 प्रभावशाली! स्वचालित भाषा पहचान तकनीक काम कर रही है। किसी भी भाषा में मुझसे बात करें!`
        ],
        'th': [
          `🌍 สวัสดี! ฉันตรวจพบว่าคุณเขียนเป็น${language.nativeName} (${language.flag}) ฉันสามารถตอบกลับในภาษาของคุณได้!`,
          `🔍 การตรวจจับภาษาทำงานได้อย่างสมบูรณ์! ฉันตรวจพบ${language.name}ด้วยความเชื่อมั่น ${Math.round(language.confidence * 100)}%`,
          `✨ ยอดเยี่ยม! ฉันสามารถเข้าใจและตอบกลับได้มากกว่า 30 ภาษา วันนี้ฉันจะช่วยคุณได้อย่างไร?`,
          `🚀 น่าประทับใจ! เทคโนโลยีการตรวจจับภาษาอัตโนมัติกำลังทำงาน พูดกับฉันในภาษาใดก็ได้!`
        ]
      }
      
      return responses[language.code] || responses['es'] // Default to Spanish if not found
    }
    
    const responses = getMultilingualResponse(detectedLanguage)
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-blue-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <LanguageIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Multilingual AI Demo</h1>
              <p className="text-blue-100 text-lg">
                🌍 Experience automatic language detection and multilingual responses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Instructions */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🚀</span>
              How to Test Multilingual Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">✨ Available Features:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Automatic Language Detection</strong> - Type in any language</li>
                  <li>• <strong>Real-time Language Indicator</strong> - See detected language with flag</li>
                  <li>• <strong>Manual Language Override</strong> - Click language indicator to change</li>
                  <li>• <strong>Multilingual Responses</strong> - AI responds in your language</li>
                  <li>• <strong>30+ Languages Supported</strong> - Major world languages covered</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">🌍 Test These Languages:</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Spanish:</strong> "¡Hola! ¿Cómo estás?"</li>
                  <li>• <strong>French:</strong> "Bonjour! Comment allez-vous?"</li>
                  <li>• <strong>German:</strong> "Hallo! Wie geht es Ihnen?"</li>
                  <li>• <strong>Japanese:</strong> "こんにちは！元気ですか？"</li>
                  <li>• <strong>Korean:</strong> "안녕하세요! 어떻게 지내세요?"</li>
                  <li>• <strong>Chinese:</strong> "你好！你好吗？"</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>💡 Pro Tip:</strong> Watch the language indicator in the chat header! It shows the detected language with a flag and confidence level. 
                You can click it to manually override the language if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="multilingual-demo"
            agentName="Multilingual Demo"
            agentColor="from-blue-500 to-purple-600"
            initialMessage="🌍 Welcome to the Multilingual AI Demo! I can automatically detect and respond in your language. Try typing in Spanish, French, German, Japanese, Korean, Chinese, Arabic, Hindi, Thai, or any other language! The language indicator above will show what language I detect. ✨🗣️"
            onSendMessage={handleSendMessage}
            placeholder="Type in any language to test multilingual detection! 🌍✨"
            enableLanguageDetection={true}
            allowFileUpload={false}
            className="border border-purple-200"
          />
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔧 Technical Implementation</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">1. Detection Phase</h4>
                <p>Advanced pattern matching and character analysis to identify input language with high accuracy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">2. Response Generation</h4>
                <p>AI model receives language context and generates contextually appropriate responses in the detected language.</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-700 mb-2">3. User Experience</h4>
                <p>Seamless language switching with visual indicators and manual override capabilities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}