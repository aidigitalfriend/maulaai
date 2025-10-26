'use client'

import Link from 'next/link'
import { DocumentIcon, PaperClipIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import { FileAttachment } from '../../../utils/chatStorage'

export default function PDFUploadDemo() {
  const handleSendMessage = async (message: string, attachments?: FileAttachment[]): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (attachments && attachments.length > 0) {
      const totalSize = attachments.reduce((sum, f) => sum + f.size, 0)
      const sizeStr = totalSize > 1024 * 1024 
        ? Math.round(totalSize / (1024 * 1024) * 10) / 10 + 'MB' 
        : Math.round(totalSize / 1024) + 'KB'
      
      return `📄 **PDF Analysis Complete!**

I've successfully processed ${attachments.length} PDF file(s):
${attachments.map((f, i) => `${i + 1}. **${f.name}** (${Math.round(f.size / 1024)}KB)`).join('\n')}

**Total processed:** ${sizeStr} of content

**What I found:**
✅ Document structure analyzed
✅ Text content extracted
✅ Key information identified
✅ Context understanding enhanced

**Next steps:**
- Ask me specific questions about the content
- Request summaries or analysis
- Get recommendations based on the documents
- Explore connections between multiple files

What would you like to know about your uploaded documents?`
    }
    
    const responses = [
      "Hello! I'm ready to help you with document analysis. Upload a PDF file and I'll process it for you!",
      "I can analyze PDF documents and answer questions about their content. Try uploading a file!",
      "PDF processing is my specialty! Upload any document and I'll help you understand its contents.",
      "Ready to dive into your documents! Upload a PDF and let's explore what's inside together."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">PDF Upload Demo</h1>
              <p className="text-blue-100 text-lg">Document Processing & Analysis Agent</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">PDF Processing</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Document Analysis</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">File Upload</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">AI Assistant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <PaperClipIcon className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">File Upload</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Drag & drop PDF files</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Click to browse files</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Multiple file support</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>10MB max file size</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DocumentIcon className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Processing</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Automatic PDF analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Content extraction</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>File preview display</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Smart summarization</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-indigo-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">Interaction</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Ask questions about content</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Get detailed analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Remove files easily</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span>Download attachments</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use PDF Upload</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Files</h4>
                    <p className="text-gray-600 text-sm">Click the paperclip icon or drag PDF files directly into the chat</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Preview & Confirm</h4>
                    <p className="text-gray-600 text-sm">Review attached files and remove any if needed</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Send Message</h4>
                    <p className="text-gray-600 text-sm">Send your message with attachments for processing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Get Analysis</h4>
                    <p className="text-gray-600 text-sm">Receive detailed analysis and ask follow-up questions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ChatBox
            agentId="pdf-upload-demo"
            agentName="PDF Upload Demo"
            agentColor="from-blue-600 to-purple-700"
            initialMessage="📄 **Welcome to PDF Upload Demo!**

I'm your document processing assistant! Here's what I can do:

🔹 **Upload PDF files** - Drag & drop or click the paperclip icon
🔹 **Process documents** - Analyze content, structure, and key information  
🔹 **Answer questions** - Ask me anything about your uploaded files
🔹 **Provide insights** - Get summaries, recommendations, and analysis

**Try it now:** Upload a PDF file and see the magic happen! I support files up to 10MB and can handle multiple documents at once.

Ready to get started? 🚀"
            onSendMessage={handleSendMessage}
            placeholder="Upload a PDF file and ask me about it! 📄✨"
            className="border border-indigo-200"
            allowFileUpload={true}
            maxFileSize={10}
          />
        </div>
      </div>
    </div>
  )
}