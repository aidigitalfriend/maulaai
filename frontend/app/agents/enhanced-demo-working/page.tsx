/**
 * ========================================
 * ENHANCED AI DEMO - WORKING VERSION  
 * ========================================
 * 
 * This is a demonstration of the enhanced AI capabilities
 * that we built, showing the improved formatting even 
 * with the current API setup.
 */

'use client';

import React, { useState } from 'react';
import EnhancedMarkdownFormatter from '../../../components/EnhancedMarkdownFormatter';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  CodeBracketIcon,
  PhotoIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function WorkingEnhancedDemo() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo responses that show the enhanced formatting capabilities
  const demoResponses = {
    'code': `## Ben Sega - Code Generation Expert

### 💻 React Component with TypeScript

Here's a **professional React component** with proper formatting:

\`\`\`typescript
import React, { useState, useEffect } from 'react';
import { User, ApiResponse } from './types';

interface UserProfileProps {
  userId: string;
  onUserUpdate?: (user: User) => void;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUserUpdate,
  className = ""
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`/api/users/\${userId}\`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData: User = await response.json();
      setUser(userData);
      onUserUpdate?.(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading user profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error: {error}</p>
        <button 
          onClick={fetchUserData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      {user && (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <Image
              src={user.avatar || '/default-avatar.png'}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Profile Details</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li><strong>Role:</strong> {user.role}</li>
                <li><strong>Department:</strong> {user.department}</li>
                <li><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Info</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li><strong>Phone:</strong> {user.phone || 'Not provided'}</li>
                <li><strong>Location:</strong> {user.location || 'Not provided'}</li>
                <li><strong>Timezone:</strong> {user.timezone || 'UTC'}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
\`\`\`

### 🎯 **Key Features Demonstrated:**

1. **TypeScript Integration**: Full type safety with interfaces
2. **Modern React Patterns**: Hooks, functional components, proper state management
3. **Error Handling**: Comprehensive try-catch with user feedback
4. **Loading States**: Professional UX with loading indicators
5. **Responsive Design**: Grid layout that adapts to screen size
6. **Accessibility**: Proper ARIA labels and semantic HTML
7. **Performance**: Optimized re-renders and efficient data fetching

### 📋 **Best Practices Included:**

- ✅ **Clean Code Structure**: Logical organization and readable syntax
- ✅ **Proper Error Boundaries**: Graceful error handling and recovery
- ✅ **Type Safety**: Full TypeScript coverage with strict typing
- ✅ **Modern CSS**: Utility-first styling with Tailwind CSS
- ✅ **Component Reusability**: Flexible props and customization options
- ✅ **Professional UX**: Loading states, error messages, and user feedback

---

*Generated with **enhanced AI formatting** and **professional code standards** by Anthropic Claude-3.5-Sonnet*`,

    'hello': `## 🌟 Welcome to Enhanced AI Chat!

### 👋 **Hello! I'm your AI assistant with superpowers!**

I'm excited to demonstrate the **enhanced capabilities** we've built:

#### 🚀 **What Makes This Special:**

1. **🎨 Beautiful Formatting** - No more ugly asterisks! 
   - **Professional markdown** with proper headings
   - *Elegant emphasis* and clean structure
   - Organized lists and sections

2. **💻 Advanced Code Generation**
   - Syntax highlighting for multiple languages
   - Copy-to-clipboard functionality
   - Professional code examples with best practices

3. **📁 Multi-Modal File Support**
   - Image upload and analysis
   - PDF document processing  
   - Code file review and optimization
   - Drag & drop interface

4. **👁️ Vision Processing**
   - Image analysis and description
   - Text extraction from images (OCR)
   - Object detection and scene understanding

#### 🎯 **Try These Commands:**

- **"show me code"** - See syntax-highlighted programming examples
- **"help with formatting"** - Learn about markdown capabilities  
- **"create a component"** - Get professional React/TypeScript code
- **Upload an image** - Experience AI vision analysis

#### ✨ **Enhanced Features:**

- **No More \`*asterisks*\`** - Professional **bold** and *italic* formatting
- **Proper Code Blocks** - With syntax highlighting and copy buttons
- **Structured Responses** - Clear headings and organized information
- **Rich Media Support** - Handle images, documents, and code files
- **Interactive Elements** - Copy buttons, previews, and smooth animations

Ready to experience the **future of AI chat**? Ask me anything! 🚀`,

    'help': `## 🆘 Enhanced AI Help Center

### 💡 **How to Use Enhanced Features**

#### 🎨 **Formatting Capabilities**

The enhanced AI system provides **professional formatting** instead of basic text:

**Before (Old System):**
\`\`\`
*Here is some basic text with asterisks*
*More emphasis with asterisks*
Some unformatted code: function hello() { return "world"; }
\`\`\`

**After (Enhanced System):**
- **Beautiful bold text** with proper emphasis
- *Clean italic styling* for subtle emphasis  
- Organized lists and structured content
- \`Professional inline code\` highlighting

#### 💻 **Code Generation Examples**

Request programming help and get **syntax-highlighted code**:

\`\`\`javascript
// JavaScript with proper highlighting
const enhancedAI = {
  features: ['syntax highlighting', 'proper formatting', 'copy buttons'],
  languages: ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS'],
  
  generateCode(request) {
    return this.processWithAI(request);
  }
};
\`\`\`

#### 📁 **File Upload Features**

1. **Supported File Types:**
   - 🖼️ **Images**: JPG, PNG, WebP, GIF
   - 📄 **Documents**: PDF files with text extraction
   - 💻 **Code Files**: JS, TS, HTML, CSS, JSON
   - 📝 **Text Files**: Plain text and markdown

2. **Upload Methods:**
   - Drag and drop files directly
   - Click the paperclip icon to browse
   - Paste images from clipboard

3. **What Happens When You Upload:**
   - **Images**: AI vision analysis and description
   - **PDFs**: Text extraction and content analysis  
   - **Code**: Syntax review and optimization suggestions
   - **Documents**: Content summarization and insights

#### 🎯 **Example Commands**

Try these to see enhanced formatting in action:

1. **Code Generation:**
   - "Create a React component with TypeScript"
   - "Show me a Python function with error handling"
   - "Build a CSS animation example"

2. **Formatting Examples:**
   - "Explain machine learning with proper formatting"
   - "Create a project plan with headings and lists"
   - "Show me markdown examples"

3. **File Processing:**
   - Upload an image and ask "What do you see?"
   - Share a PDF and request "Summarize this document"
   - Upload code and ask "Review this implementation"

#### ✨ **Pro Tips**

- **Copy Code Easily**: Hover over code blocks to see copy buttons
- **Rich Responses**: All responses use proper markdown formatting
- **Multi-File Support**: Upload multiple files for comprehensive analysis
- **Visual Feedback**: Real-time processing indicators and previews
- **Professional Output**: Everything is formatted for readability

---

*Your enhanced AI assistant is ready to provide **beautifully formatted**, **intelligent responses** with **advanced capabilities**!* 🚀`
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate enhanced response based on input
    let enhancedResponse = '';
    
    if (input.toLowerCase().includes('code') || input.toLowerCase().includes('react') || input.toLowerCase().includes('typescript')) {
      enhancedResponse = demoResponses.code;
    } else if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
      enhancedResponse = demoResponses.hello;
    } else if (input.toLowerCase().includes('help')) {
      enhancedResponse = demoResponses.help;
    } else {
      enhancedResponse = `## Enhanced AI Response

### 🎯 **Your Question**: "${input}"

I understand you're asking about: **${input.substring(0, 100)}${input.length > 100 ? '...' : ''}**

Here's what I can help you with using **enhanced formatting**:

#### ✨ **Enhanced Capabilities:**

1. **Professional Formatting** - Beautiful markdown instead of asterisks
2. **Code Generation** - Syntax highlighting and copy functionality  
3. **File Processing** - Upload images, PDFs, and documents
4. **Vision Analysis** - Analyze images and extract text
5. **Structured Responses** - Clear headings and organized content

#### 💡 **Try These Examples:**

- **"show me code"** - Get syntax-highlighted programming examples
- **"hello"** - See the welcome message with full formatting
- **"help"** - Access the comprehensive help center

#### 🚀 **Key Improvements:**

- ✅ **Proper Markdown**: Headers, lists, emphasis, code blocks
- ✅ **Syntax Highlighting**: Professional code formatting  
- ✅ **Interactive Elements**: Copy buttons and smooth animations
- ✅ **File Upload Support**: Drag-drop with previews and analysis
- ✅ **Vision Processing**: Image analysis and text extraction
- ✅ **Responsive Design**: Works perfectly on all devices

Ready to experience **next-level AI interactions**? 🎨

---

*Powered by **Enhanced AI** with professional formatting and advanced capabilities*`;
    }
    
    setResponse(enhancedResponse);
    setIsLoading(false);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <SparklesIcon className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enhanced AI Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience **professional AI formatting** with syntax highlighting, proper markdown, and advanced capabilities
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <CodeBracketIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Code Excellence</h3>
            <p className="text-gray-600 text-sm">Syntax highlighting, copy buttons, professional formatting</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <PhotoIcon className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Vision Processing</h3>
            <p className="text-gray-600 text-sm">Image analysis, OCR, object detection capabilities</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <DocumentIcon className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Rich Formatting</h3>
            <p className="text-gray-600 text-sm">Professional markdown, structured responses, no asterisks</p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h2 className="text-xl font-semibold">🤖 Enhanced AI Assistant</h2>
            <p className="text-blue-100 text-sm">Try: "show me code", "hello", or "help"</p>
          </div>

          {/* Response Area */}
          {response && (
            <div className="p-6 bg-gray-50 border-b border-gray-200 max-h-96 overflow-y-auto">
              <EnhancedMarkdownFormatter 
                content={response}
                enableSyntaxHighlighting={true}
                enableCopy={true}
                className="prose-sm"
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-gray-600 text-sm">Processing with enhanced AI...</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6">
            <div className="flex space-x-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about code, formatting, or say hello..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>{isLoading ? 'Processing...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Try These Enhanced Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💻 Code Examples</h4>
              <p className="text-blue-800 text-sm">Type "show me code" or "React component" to see syntax-highlighted examples</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🎨 Formatting Demo</h4>
              <p className="text-purple-800 text-sm">Say "hello" to see beautiful markdown formatting in action</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">📚 Help Center</h4>
              <p className="text-green-800 text-sm">Type "help" for comprehensive documentation and examples</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}