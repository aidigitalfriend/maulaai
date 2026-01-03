'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// =============================================================================
// TYPES
// =============================================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface GeneratedFile {
  id: string;
  name: string;
  path: string;
  type: 'html' | 'css' | 'js' | 'image' | 'other';
  content?: string;
  size: number;
}

interface CanvasModeProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly theme?: 'default' | 'neural';
  readonly agentId?: string;
  readonly agentName?: string;
}

// =============================================================================
// TEMPLATES (25 Total)
// =============================================================================

const TEMPLATES = [
  // Landing Pages (5)
  { id: 't1', name: 'SaaS Landing', category: 'Landing', icon: '🚀', prompt: 'Create a modern SaaS landing page with hero section, features grid, pricing cards, testimonials, and CTA. Use gradient backgrounds and smooth animations.' },
  { id: 't2', name: 'Portfolio', category: 'Landing', icon: '👨‍💼', prompt: 'Build a creative portfolio website with about section, project gallery with hover effects, skills section, and contact form. Modern dark theme.' },
  { id: 't3', name: 'Startup', category: 'Landing', icon: '💡', prompt: 'Design a startup landing page with animated hero, team section, how it works steps, and newsletter signup. Vibrant colors.' },
  { id: 't4', name: 'Agency', category: 'Landing', icon: '🏢', prompt: 'Create a digital agency website with services showcase, case studies grid, client logos, and booking form. Professional design.' },
  { id: 't5', name: 'App Promo', category: 'Landing', icon: '📱', prompt: 'Build a mobile app promotion page with phone mockup, feature highlights, download buttons, and app screenshots carousel.' },
  
  // Dashboards (5)
  { id: 't6', name: 'Analytics', category: 'Dashboard', icon: '📊', prompt: 'Create an analytics dashboard with stats cards, line chart placeholder, bar chart, recent activity list, and sidebar navigation. Dark theme.' },
  { id: 't7', name: 'Admin Panel', category: 'Dashboard', icon: '⚙️', prompt: 'Build an admin panel with user management table, search/filter, pagination, sidebar menu, and top navbar with notifications.' },
  { id: 't8', name: 'Finance', category: 'Dashboard', icon: '💰', prompt: 'Design a finance dashboard with balance cards, transaction history, expense chart, and quick action buttons. Clean minimal style.' },
  { id: 't9', name: 'Project Manager', category: 'Dashboard', icon: '📋', prompt: 'Create a project management dashboard with kanban-style task cards, progress bars, team avatars, and deadline calendar.' },
  { id: 't10', name: 'CRM', category: 'Dashboard', icon: '👥', prompt: 'Build a CRM dashboard with leads funnel, recent contacts, deal pipeline, and activity timeline. Professional blue theme.' },
  
  // E-commerce (5)
  { id: 't11', name: 'Product Store', category: 'E-commerce', icon: '🛒', prompt: 'Create an e-commerce product grid with filter sidebar, product cards with hover effects, cart icon, and sorting dropdown.' },
  { id: 't12', name: 'Product Page', category: 'E-commerce', icon: '📦', prompt: 'Build a product detail page with image gallery, size/color selectors, add to cart button, reviews section, and related products.' },
  { id: 't13', name: 'Checkout', category: 'E-commerce', icon: '💳', prompt: 'Design a checkout page with order summary, shipping form, payment method selector, and order confirmation. Clean UX.' },
  { id: 't14', name: 'Fashion Store', category: 'E-commerce', icon: '👗', prompt: 'Create a fashion boutique homepage with hero banner, new arrivals, categories grid, and Instagram feed section.' },
  { id: 't15', name: 'Food Delivery', category: 'E-commerce', icon: '🍔', prompt: 'Build a food delivery app UI with restaurant cards, menu items, cart sidebar, and delivery tracking section.' },
  
  // Components (5)
  { id: 't16', name: 'Login Form', category: 'Components', icon: '🔐', prompt: 'Create a beautiful login/signup form with social login buttons, input validation styling, and forgot password link. Glassmorphism style.' },
  { id: 't17', name: 'Pricing Table', category: 'Components', icon: '💎', prompt: 'Build a 3-tier pricing table with feature comparison, popular badge, monthly/yearly toggle, and CTA buttons.' },
  { id: 't18', name: 'Contact Form', category: 'Components', icon: '✉️', prompt: 'Design a contact form with name, email, subject, message fields, and submit button. Include form validation styling.' },
  { id: 't19', name: 'Navigation', category: 'Components', icon: '🧭', prompt: 'Create a responsive navigation bar with logo, menu links, dropdown menu, mobile hamburger, and search icon.' },
  { id: 't20', name: 'Cards Gallery', category: 'Components', icon: '🃏', prompt: 'Build a gallery of various card designs: blog card, user card, stats card, pricing card, and testimonial card.' },
  
  // Creative (5)
  { id: 't21', name: 'Blog', category: 'Creative', icon: '📝', prompt: 'Create a blog homepage with featured post hero, recent articles grid, categories sidebar, and newsletter signup.' },
  { id: 't22', name: 'Event Page', category: 'Creative', icon: '🎉', prompt: 'Design an event landing page with countdown timer, speaker profiles, schedule timeline, and ticket purchase section.' },
  { id: 't23', name: 'Resume/CV', category: 'Creative', icon: '📄', prompt: 'Build a digital resume/CV page with profile photo, experience timeline, skills bars, education, and download button.' },
  { id: 't24', name: 'Restaurant', category: 'Creative', icon: '🍽️', prompt: 'Create a restaurant website with hero image, menu sections, reservation form, gallery, and location map placeholder.' },
  { id: 't25', name: 'Fitness App', category: 'Creative', icon: '💪', prompt: 'Design a fitness app UI with workout cards, progress rings, activity calendar, and achievement badges.' },
];

const FILE_ICONS: Record<string, string> = {
  html: '🌐',
  css: '🎨',
  js: '📜',
  image: '🖼️',
  folder: '📁',
  other: '📄',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CanvasMode({
  isOpen,
  onClose,
  theme = 'neural',
  agentId = 'default',
  agentName = 'AI Assistant',
}: CanvasModeProps) {
  const previewRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // STATE
  // =============================================================================
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  
  // UI State
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showFileTree, setShowFileTree] = useState(true);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Welcome to AI Canvas! ✨\n\nI'm ${agentName}, ready to create amazing designs for you.\n\n🎯 **Quick Start:**\n• Select a template above\n• Or describe what you want to build\n• I'll create it instantly!`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, agentName, messages.length]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // =============================================================================
  // BRAND THEME STYLES (OneLast AI)
  // =============================================================================
  
  const brandColors = {
    // Primary gradient: cyan to purple
    gradientPrimary: 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500',
    gradientSecondary: 'bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/20',
    gradientText: 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
    
    // Background
    bgMain: 'bg-[#0a0a0f]',
    bgPanel: 'bg-[#12121a]/95 backdrop-blur-xl',
    bgSecondary: 'bg-[#1a1a24]/80',
    bgInput: 'bg-[#1e1e2a]',
    bgHover: 'hover:bg-[#252530]',
    
    // Borders
    border: 'border-[#2a2a3a]',
    borderAccent: 'border-cyan-500/30',
    
    // Text
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    textMuted: 'text-gray-500',
    
    // Accent colors
    accentCyan: 'text-cyan-400',
    accentPurple: 'text-purple-400',
    accentPink: 'text-pink-400',
    
    // Buttons
    btnPrimary: 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/25',
    btnSecondary: 'bg-[#2a2a3a] hover:bg-[#353545] text-gray-200',
    
    // Glow effects
    glowCyan: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    glowPurple: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  };

  // =============================================================================
  // CATEGORIES
  // =============================================================================
  
  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === selectedCategory);

  // =============================================================================
  // HANDLERS
  // =============================================================================
  
  const handleTemplateSelect = useCallback((template: typeof TEMPLATES[0]) => {
    setChatInput(template.prompt);
    setShowTemplates(false);
    // Auto-submit after selecting template
    setTimeout(() => {
      const submitBtn = document.getElementById('canvas-submit-btn');
      if (submitBtn) submitBtn.click();
    }, 100);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: FileAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          url: event.target?.result as string,
          size: file.size,
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const updatePreview = useCallback((code: string) => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const userPrompt = chatInput.trim();
    setChatInput('');
    setUploadedFiles([]);
    setIsGenerating(true);
    setShowTemplates(false);
    setGenerationStatus('generating');
    setStreamingContent('');

    // Add streaming placeholder
    const streamingMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: streamingMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      // Use streaming API for real-time response
      const response = await fetch('/api/canvas/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          provider: 'Anthropic',
          modelId: 'claude-3-5-sonnet',
          currentCode: generatedCode || undefined,
          attachments: userMessage.attachments,
          history: messages.filter(m => !m.isStreaming).map(m => ({ role: m.role, text: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullCode = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullCode += parsed.content;
                  setStreamingContent(fullCode);
                  
                  // Update preview in real-time
                  if (fullCode.includes('</html>') || fullCode.length > 500) {
                    updatePreview(fullCode);
                  }
                }
              } catch {
                // Not JSON, might be raw content
                fullCode += data;
                setStreamingContent(fullCode);
              }
            }
          }
        }
      }

      // Final update
      if (fullCode) {
        setGeneratedCode(fullCode);
        updatePreview(fullCode);
        
        // Create file structure
        const files: GeneratedFile[] = [{
          id: 'f1',
          name: 'index.html',
          path: '/index.html',
          type: 'html',
          content: fullCode,
          size: new Blob([fullCode]).size,
        }];
        setGeneratedFiles(files);
        setGenerationStatus('success');
      }

      // Update the streaming message to final
      setMessages(prev => prev.map(m => 
        m.id === streamingMsgId 
          ? { ...m, content: '✨ Done! Your design is ready in the preview.\n\nWant changes? Just describe what you\'d like different!', isStreaming: false }
          : m
      ));

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setGenerationStatus('error');
      setMessages(prev => prev.map(m => 
        m.id === streamingMsgId 
          ? { ...m, content: `❌ Error: ${errorMsg}\n\nPlease try again.`, isStreaming: false }
          : m
      ));
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
    }
  }, [chatInput, isGenerating, uploadedFiles, generatedCode, messages, updatePreview]);

  const handleDownload = useCallback(() => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-project.html';
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedCode]);

  const handleCopyCode = useCallback(() => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [generatedCode]);

  const handleOpenInNewTab = useCallback(() => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [generatedCode]);

  const handleViewFile = useCallback((file: GeneratedFile) => {
    setSelectedFile(file);
    setShowFileModal(true);
  }, []);

  // =============================================================================
  // DEVICE STYLES
  // =============================================================================
  
  const deviceStyles = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto',
    mobile: 'w-[375px] h-[812px] mx-auto',
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${brandColors.bgMain}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* =========== LEFT PANEL: AI CHAT =========== */}
      <div className={`w-80 flex flex-col ${brandColors.border} border-r ${brandColors.bgPanel} relative z-10`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 ${brandColors.border} border-b`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${brandColors.gradientPrimary}`}>
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <span className={`font-semibold ${brandColors.gradientText}`}>AI Canvas</span>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              showTemplates 
                ? `${brandColors.btnPrimary}` 
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
          >
            {showTemplates ? 'Hide' : 'Templates'}
          </button>
        </div>

        {/* Templates Panel */}
        {showTemplates && (
          <div className={`${brandColors.border} border-b max-h-64 overflow-hidden flex flex-col`}>
            {/* Category Tabs */}
            <div className={`flex overflow-x-auto p-2 gap-1 ${brandColors.border} border-b flex-shrink-0`}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? `${brandColors.btnPrimary}`
                      : `${brandColors.textSecondary} ${brandColors.bgHover}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Templates Grid */}
            <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-2.5 rounded-xl text-left transition-all hover:scale-[1.02] ${brandColors.bgSecondary} ${brandColors.bgHover} border ${brandColors.border} hover:border-cyan-500/50 group`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg group-hover:scale-110 transition-transform">{template.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${brandColors.text}`}>{template.name}</p>
                        <p className={`text-[10px] ${brandColors.textMuted}`}>{template.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? `${brandColors.btnPrimary}`
                  : `${brandColors.bgSecondary} ${brandColors.text} border ${brandColors.border}`
              }`}>
                {msg.isStreaming ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className={`text-xs ${brandColors.textSecondary}`}>Creating your design...</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.attachments.map(file => (
                      <span key={file.id} className="text-xs bg-white/20 px-2 py-0.5 rounded">
                        📎 {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className={`px-3 py-2 ${brandColors.border} border-t`}>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${brandColors.bgSecondary} text-xs border ${brandColors.border}`}>
                  <PhotoIcon className="w-3 h-3 text-cyan-400" />
                  <span className={brandColors.text}>{file.name.slice(0, 15)}...</span>
                  <button 
                    onClick={() => removeUploadedFile(file.id)} 
                    className="text-red-400 hover:text-red-300"
                    title="Remove file"
                    aria-label="Remove file"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className={`p-3 ${brandColors.border} border-t`}>
          <div className={`flex items-end gap-2 rounded-xl ${brandColors.bgInput} p-2 border ${brandColors.border} focus-within:border-cyan-500/50 transition-colors`}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg ${brandColors.textSecondary} ${brandColors.bgHover} transition-colors`}
              title="Upload image"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              title="Upload images"
              aria-label="Upload images"
            />
            
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Describe what you want to create..."
              className={`flex-1 resize-none bg-transparent outline-none text-sm ${brandColors.text} placeholder-gray-500`}
              rows={2}
            />
            
            <button
              id="canvas-submit-btn"
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isGenerating}
              className={`p-2 rounded-lg transition-all ${
                chatInput.trim() && !isGenerating
                  ? `${brandColors.btnPrimary}`
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========== CENTER PANEL: FILE TREE =========== */}
      {showFileTree && (
        <div className={`w-56 flex flex-col ${brandColors.border} border-r ${brandColors.bgPanel} relative z-10`}>
          <div className={`flex items-center justify-between px-3 py-3 ${brandColors.border} border-b`}>
            <div className="flex items-center gap-2">
              <FolderIcon className={`w-4 h-4 ${brandColors.accentCyan}`} />
              <span className={`text-sm font-medium ${brandColors.text}`}>Files</span>
              {generatedFiles.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${brandColors.gradientPrimary} text-white`}>
                  {generatedFiles.length}
                </span>
              )}
            </div>
            <button 
              onClick={() => setShowFileTree(false)} 
              className={brandColors.textSecondary}
              title="Hide file tree"
              aria-label="Hide file tree"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {generatedFiles.length > 0 ? (
              <div className="space-y-1">
                <div className={`flex items-center gap-2 px-2 py-1 ${brandColors.textMuted}`}>
                  <span className="text-xs font-medium uppercase tracking-wide">Generated</span>
                </div>
                {generatedFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleViewFile(file)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg ${brandColors.bgSecondary} ${brandColors.bgHover} border ${brandColors.border} hover:border-cyan-500/30 transition-all group`}
                  >
                    <span className="group-hover:scale-110 transition-transform">{FILE_ICONS[file.type] || FILE_ICONS.other}</span>
                    <span className={`text-sm ${brandColors.text} truncate`}>{file.name}</span>
                    <span className={`text-xs ${brandColors.textMuted} ml-auto`}>
                      {(file.size / 1024).toFixed(1)}KB
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${brandColors.textSecondary}`}>
                <div className={`w-12 h-12 mx-auto rounded-xl ${brandColors.bgSecondary} flex items-center justify-center mb-3`}>
                  <DocumentIcon className="w-6 h-6 opacity-50" />
                </div>
                <p className="text-xs">No files yet</p>
                <p className={`text-xs mt-1 ${brandColors.textMuted}`}>Ask AI to create something!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========== RIGHT PANEL: PREVIEW =========== */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Toolbar */}
        <div className={`flex items-center justify-between px-4 py-2 ${brandColors.border} border-b ${brandColors.bgSecondary}`}>
          {/* Left: File Tree Toggle */}
          <div className="flex items-center gap-3">
            {!showFileTree && (
              <button
                onClick={() => setShowFileTree(true)}
                className={`p-1.5 rounded-lg ${brandColors.textSecondary} ${brandColors.bgHover}`}
                title="Show file tree"
                aria-label="Show file tree"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                generationStatus === 'generating' ? 'bg-yellow-400 animate-pulse' :
                generationStatus === 'success' ? 'bg-green-400' :
                generationStatus === 'error' ? 'bg-red-400' :
                'bg-gray-500'
              }`} />
              <span className={`text-sm font-medium ${brandColors.text}`}>Preview</span>
            </div>
          </div>

          {/* Center: Device Toggle */}
          <div className={`flex items-center rounded-lg ${brandColors.bgInput} p-0.5 border ${brandColors.border}`}>
            {(['desktop', 'tablet', 'mobile'] as const).map(device => (
              <button
                key={device}
                onClick={() => setPreviewDevice(device)}
                className={`p-2 rounded-md transition-all ${
                  previewDevice === device 
                    ? `${brandColors.btnPrimary}` 
                    : brandColors.textSecondary
                }`}
                title={device.charAt(0).toUpperCase() + device.slice(1)}
              >
                {device === 'desktop' && <ComputerDesktopIcon className="w-4 h-4" />}
                {device === 'tablet' && <DeviceTabletIcon className="w-4 h-4" />}
                {device === 'mobile' && <DevicePhoneMobileIcon className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyCode}
              disabled={!generatedCode}
              className={`p-2 rounded-lg transition-all ${brandColors.textSecondary} ${brandColors.bgHover} disabled:opacity-50 disabled:cursor-not-allowed relative`}
              title="Copy code"
            >
              {copySuccess ? (
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleOpenInNewTab}
              disabled={!generatedCode}
              className={`p-2 rounded-lg ${brandColors.textSecondary} ${brandColors.bgHover} disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Open in new tab"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              disabled={!generatedCode}
              className={`p-2 rounded-lg ${brandColors.textSecondary} ${brandColors.bgHover} disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Download"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <div className={`w-px h-6 ${brandColors.bgSecondary} mx-1`} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
              title="Close Canvas"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`flex-1 overflow-auto p-4 ${brandColors.bgMain}`}>
          {generatedCode || streamingContent ? (
            <div className={`${deviceStyles[previewDevice]} bg-white rounded-xl overflow-hidden transition-all duration-300 ${brandColors.glowCyan}`}
                 style={{ boxShadow: '0 0 60px rgba(34, 211, 238, 0.15), 0 0 30px rgba(168, 85, 247, 0.1)' }}>
              <iframe
                ref={previewRef}
                title="Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-full ${brandColors.textSecondary}`}>
              <div className={`w-24 h-24 rounded-2xl ${brandColors.gradientSecondary} flex items-center justify-center mb-4 border ${brandColors.borderAccent}`}>
                <SparklesIcon className={`w-12 h-12 ${brandColors.accentCyan} opacity-60`} />
              </div>
              <h3 className={`text-xl font-semibold ${brandColors.gradientText} mb-2`}>Ready to Create</h3>
              <p className="text-sm text-center max-w-xs">
                Select a template or describe what you want.<br />
                <span className={brandColors.accentPurple}>AI will create it instantly!</span>
              </p>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className={`flex items-center justify-between px-4 py-2 ${brandColors.border} border-t ${brandColors.bgSecondary}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {generationStatus === 'generating' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className={`text-xs ${brandColors.accentCyan}`}>Generating...</span>
                </>
              )}
              {generationStatus === 'success' && (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Ready</span>
                </>
              )}
              {generationStatus === 'error' && (
                <>
                  <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Error</span>
                </>
              )}
              {generationStatus === 'idle' && (
                <>
                  <span className={`w-2 h-2 rounded-full ${brandColors.bgSecondary}`} />
                  <span className={`text-xs ${brandColors.textMuted}`}>Waiting</span>
                </>
              )}
            </div>
            {generatedFiles.length > 0 && (
              <span className={`text-xs ${brandColors.textSecondary}`}>
                Files: {generatedFiles.length}
              </span>
            )}
          </div>
          <span className={`text-xs ${brandColors.gradientText}`}>
            Powered by AI Canvas ✨
          </span>
        </div>
      </div>

      {/* =========== FILE VIEW MODAL =========== */}
      {showFileModal && selectedFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className={`w-[800px] max-h-[80vh] rounded-2xl ${brandColors.bgPanel} border ${brandColors.border} overflow-hidden`}
               style={{ boxShadow: '0 0 60px rgba(34, 211, 238, 0.2)' }}>
            <div className={`flex items-center justify-between px-4 py-3 ${brandColors.border} border-b`}>
              <div className="flex items-center gap-2">
                <span>{FILE_ICONS[selectedFile.type]}</span>
                <span className={`font-medium ${brandColors.text}`}>{selectedFile.name}</span>
                <span className={`text-xs ${brandColors.textMuted}`}>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedFile.content) {
                      navigator.clipboard.writeText(selectedFile.content);
                    }
                  }}
                  className={`p-2 rounded-lg ${brandColors.textSecondary} ${brandColors.bgHover}`}
                  title="Copy"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowFileModal(false)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[60vh] custom-scrollbar">
              <pre className={`p-4 text-sm font-mono ${brandColors.text} whitespace-pre-wrap`}>
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </div>
  );
}
