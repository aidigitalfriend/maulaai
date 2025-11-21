/**
 * ========================================
 * ENHANCED AI CHAT DEMO PAGE
 * ========================================
 * 
 * Demonstration of enhanced AI capabilities:
 * - Markdown formatting with syntax highlighting
 * - Advanced file upload (images, PDFs, documents)
 * - Vision/OCR processing
 * - Rich media generation
 * - Multi-modal interactions
 */

'use client';

import React from 'react';
import EnhancedChatBox from '../../../components/EnhancedChatBox';
import { FileUpload } from '../../../components/EnhancedFileUpload';

export default function EnhancedAIChatDemo() {
  
  const handleSendMessage = async (message: string, attachments?: FileUpload[]): Promise<string> => {
    try {
      // Call the enhanced API endpoint
      const response = await fetch('/api/agents/optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'ben-sega',
          message,
          options: {
            files: attachments || [],
            temperature: 0.7,
            maxTokens: 2000
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response || data.formattedContent || 'No response received';
      
    } catch (error) {
      console.error('API Error:', error);
      return '❌ Sorry, I encountered an error processing your message. Please try again.';
    }
  };

  const initialMessage = `# 🚀 Welcome to Enhanced AI Chat!

I'm **Ben Sega**, your coding companion with **advanced capabilities**! Here's what makes this experience special:

## ✨ **Enhanced Features**

### 💻 **Advanced Code Generation**
- Syntax-highlighted code blocks
- Professional formatting
- Best practice recommendations

### 📁 **Multi-File Support**
- **Images**: JPG, PNG, WebP, GIF with vision analysis
- **Documents**: PDF text extraction and analysis  
- **Code Files**: JavaScript, TypeScript, HTML, CSS, JSON
- **Text Files**: Automatic content processing

### 🎨 **Rich Formatting**
- **Proper Markdown**: Headers, lists, emphasis
- **Code Blocks**: \`inline code\` and syntax highlighting
- **Visual Structure**: Clean, professional layout
- **Interactive Elements**: Copy buttons, file previews

## 🎯 **Try These Examples**

1. **Upload an image** and ask me to analyze it
2. **Send code** and I'll format it with syntax highlighting
3. **Ask for help** with programming concepts
4. **Upload a PDF** for document analysis

### Quick Commands:
- \`"Show me a JavaScript example"\` - Code with highlighting
- \`"Help me debug this code"\` - Professional assistance  
- \`"Explain this concept"\` - Structured explanations
- Upload files for **vision processing** and **document analysis**

Ready to experience **next-level AI interactions**? 🚀`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 Enhanced AI Chat Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of AI interactions with **proper formatting**, **file uploads**, 
            **vision processing**, and **syntax-highlighted code generation**.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-3">💻</div>
            <h3 className="font-semibold text-gray-900 mb-2">Code Excellence</h3>
            <p className="text-gray-600 text-sm">Syntax highlighting, proper formatting, best practices</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-semibold text-gray-900 mb-2">File Processing</h3>
            <p className="text-gray-600 text-sm">Images, PDFs, documents with intelligent analysis</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-3">👁️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Vision AI</h3>
            <p className="text-gray-600 text-sm">Image analysis, OCR, object detection</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Rich Format</h3>
            <p className="text-gray-600 text-sm">Markdown, headers, lists, professional styling</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-5xl mx-auto">
          <EnhancedChatBox
            agentId="ben-sega"
            agentName="Enhanced Ben Sega"
            agentColor="from-blue-600 to-purple-600"
            placeholder="Ask me anything, upload files, or request code examples..."
            initialMessage={initialMessage}
            onSendMessage={handleSendMessage}
            maxFileSize={25} // 25MB
            maxFiles={10}
            className="h-[800px]"
          />
        </div>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 How to Test Enhanced Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">💻 Code & Formatting</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Ask: <code className="bg-gray-100 px-1 rounded text-sm">"Show me a React component"</code>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Request: <code className="bg-gray-100 px-1 rounded text-sm">"Help me with TypeScript"</code>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Try: <code className="bg-gray-100 px-1 rounded text-sm">"Explain async/await"</code>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-3">📁 File Upload</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Upload images for vision analysis
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Drop PDF files for text extraction
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Share code files for review
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Pro Tips</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Drag & drop files directly into the chat</li>
                <li>• Use the paperclip icon for traditional file selection</li>
                <li>• All responses are formatted with proper markdown</li>
                <li>• Code blocks include syntax highlighting automatically</li>
                <li>• Images are analyzed with AI vision technology</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}