'use client';

import { useState, useRef } from 'react';
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
  EyeIcon,
  XCircleIcon,
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

// =============================================================================
// FILE ICONS
// =============================================================================

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
  const isNeural = theme === 'neural';
  const previewRef = useRef<HTMLIFrameElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // STATE
  // =============================================================================
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to Canvas! 🎨 I'm ${agentName}, and I'll create amazing designs for you.\n\nTry a template or describe what you want to build!`,
      timestamp: new Date(),
    },
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  
  // UI State
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showFileTree, setShowFileTree] = useState(true);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);

  // =============================================================================
  // THEME STYLES
  // =============================================================================
  
  const styles = {
    bg: isNeural ? 'bg-gray-950' : 'bg-gray-50',
    bgPanel: isNeural ? 'bg-gray-900/95' : 'bg-white/95',
    bgSecondary: isNeural ? 'bg-gray-800/80' : 'bg-gray-100/80',
    bgInput: isNeural ? 'bg-gray-800' : 'bg-gray-100',
    border: isNeural ? 'border-gray-700/50' : 'border-gray-200',
    text: isNeural ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isNeural ? 'text-gray-400' : 'text-gray-500',
    accent: isNeural ? 'cyan' : 'indigo',
    accentBg: isNeural ? 'bg-cyan-600' : 'bg-indigo-600',
    accentHover: isNeural ? 'hover:bg-cyan-500' : 'hover:bg-indigo-500',
    accentText: isNeural ? 'text-cyan-400' : 'text-indigo-600',
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
  
  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setChatInput(template.prompt);
    setShowTemplates(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = async () => {
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

    try {
      // Call the Canvas API
      const response = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          provider: 'Anthropic',
          modelId: 'claude-3-5-sonnet',
          currentCode: generatedCode || undefined,
          attachments: userMessage.attachments,
          history: messages.map(m => ({ role: m.role, text: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate');
      }

      // Update generated code
      if (data.code) {
        setGeneratedCode(data.code);
        
        // Create file structure
        const files: GeneratedFile[] = [
          {
            id: 'f1',
            name: 'index.html',
            path: '/index.html',
            type: 'html',
            content: data.code,
            size: new Blob([data.code]).size,
          }
        ];
        setGeneratedFiles(files);

        // Update preview
        if (previewRef.current) {
          const doc = previewRef.current.contentDocument;
          if (doc) {
            doc.open();
            doc.write(data.code);
            doc.close();
          }
        }
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '✨ Done! I\'ve created your design. You can see it in the preview.\n\nWant me to make any changes? Just describe what you\'d like different!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, there was an error: ${error.message}\n\nPlease try again or choose a different request.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-project.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
    }
  };

  const handleOpenInNewTab = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleViewFile = (file: GeneratedFile) => {
    setSelectedFile(file);
    setShowFileModal(true);
  };

  // =============================================================================
  // PREVIEW DEVICE STYLES
  // =============================================================================
  
  const deviceStyles = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto border-8 border-gray-800 rounded-3xl',
    mobile: 'w-[375px] h-[812px] mx-auto border-8 border-gray-800 rounded-[3rem]',
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${styles.bg}`}>
      {/* =========== LEFT PANEL: AI CHAT =========== */}
      <div className={`w-80 flex flex-col border-r ${styles.border} ${styles.bgPanel}`}>
        {/* Chat Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${styles.border}`}>
          <div className="flex items-center gap-2">
            <SparklesIcon className={`w-5 h-5 ${styles.accentText}`} />
            <span className={`font-semibold ${styles.text}`}>AI Canvas</span>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`text-xs px-2 py-1 rounded-lg ${showTemplates ? styles.accentBg + ' text-white' : styles.bgSecondary + ' ' + styles.textSecondary}`}
          >
            {showTemplates ? 'Hide' : 'Templates'}
          </button>
        </div>

        {/* Templates Panel */}
        {showTemplates && (
          <div className={`border-b ${styles.border} max-h-64 overflow-hidden flex flex-col`}>
            {/* Category Tabs */}
            <div className={`flex overflow-x-auto p-2 gap-1 border-b ${styles.border} flex-shrink-0`}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? `${styles.accentBg} text-white`
                      : `${styles.textSecondary} hover:${styles.bgSecondary}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Templates Grid */}
            <div className="p-2 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-2 rounded-lg text-left transition-all hover:scale-[1.02] ${styles.bgSecondary} hover:ring-2 ring-${styles.accent}-500/30`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{template.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${styles.text}`}>{template.name}</p>
                        <p className={`text-[10px] ${styles.textSecondary}`}>{template.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? `${styles.accentBg} text-white`
                  : `${styles.bgSecondary} ${styles.text}`
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
          
          {isGenerating && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-3 ${styles.bgSecondary}`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${styles.accentBg} animate-bounce`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 rounded-full ${styles.accentBg} animate-bounce`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 rounded-full ${styles.accentBg} animate-bounce`} style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className={`text-xs ${styles.textSecondary}`}>Creating your design...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className={`px-3 py-2 border-t ${styles.border}`}>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${styles.bgSecondary} text-xs`}>
                  <PhotoIcon className="w-3 h-3" />
                  <span className={styles.text}>{file.name.slice(0, 15)}...</span>
                  <button onClick={() => removeUploadedFile(file.id)} className="text-red-400 hover:text-red-300" title="Remove file" aria-label="Remove file">
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className={`p-3 border-t ${styles.border}`}>
          <div className={`flex items-end gap-2 rounded-xl ${styles.bgInput} p-2`}>
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg ${styles.textSecondary} hover:${styles.bgSecondary} transition-colors`}
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
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Describe what you want to create..."
              className={`flex-1 resize-none bg-transparent outline-none text-sm ${styles.text} placeholder-gray-500`}
              rows={2}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isGenerating}
              className={`p-2 rounded-lg transition-all ${
                chatInput.trim() && !isGenerating
                  ? `${styles.accentBg} ${styles.accentHover} text-white`
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========== CENTER PANEL: FILE TREE =========== */}
      <div className={`w-56 flex flex-col border-r ${styles.border} ${styles.bgPanel} ${showFileTree ? '' : 'hidden'}`}>
        <div className={`flex items-center justify-between px-3 py-3 border-b ${styles.border}`}>
          <div className="flex items-center gap-2">
            <FolderIcon className={`w-4 h-4 ${styles.accentText}`} />
            <span className={`text-sm font-medium ${styles.text}`}>Files</span>
          </div>
          <button onClick={() => setShowFileTree(false)} className={styles.textSecondary} title="Hide file tree" aria-label="Hide file tree">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {/* Generated Files */}
          {generatedFiles.length > 0 ? (
            <div className="space-y-1">
              <div className={`flex items-center gap-2 px-2 py-1 ${styles.textSecondary}`}>
                <span className="text-xs font-medium uppercase tracking-wide">Generated</span>
              </div>
              {generatedFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleViewFile(file)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg ${styles.bgSecondary} hover:ring-1 ring-${styles.accent}-500/30 transition-all`}
                >
                  <span>{FILE_ICONS[file.type] || FILE_ICONS.other}</span>
                  <span className={`text-sm ${styles.text}`}>{file.name}</span>
                  <span className={`text-xs ${styles.textSecondary} ml-auto`}>
                    {(file.size / 1024).toFixed(1)}KB
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${styles.textSecondary}`}>
              <DocumentIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No files yet</p>
              <p className="text-xs mt-1">Ask AI to create something!</p>
            </div>
          )}
          
          {/* Uploaded Assets */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-1">
              <div className={`flex items-center gap-2 px-2 py-1 ${styles.textSecondary}`}>
                <span className="text-xs font-medium uppercase tracking-wide">Uploaded</span>
              </div>
              {uploadedFiles.map(file => (
                <div key={file.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${styles.bgSecondary}`}>
                  <PhotoIcon className="w-4 h-4" />
                  <span className={`text-sm ${styles.text} truncate`}>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========== RIGHT PANEL: PREVIEW =========== */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${styles.border} ${styles.bgSecondary}`}>
          {/* Left: File Tree Toggle + Title */}
          <div className="flex items-center gap-3">
            {!showFileTree && (
              <button
                onClick={() => setShowFileTree(true)}
                className={`p-1.5 rounded-lg ${styles.textSecondary} hover:${styles.bgInput}`}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <EyeIcon className={`w-4 h-4 ${styles.accentText}`} />
              <span className={`text-sm font-medium ${styles.text}`}>Preview</span>
            </div>
          </div>

          {/* Center: Device Toggle */}
          <div className={`flex items-center rounded-lg ${styles.bgInput} p-0.5`}>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? styles.accentBg + ' text-white' : styles.textSecondary}`}
              title="Desktop"
            >
              <ComputerDesktopIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1.5 rounded-md transition-all ${previewDevice === 'tablet' ? styles.accentBg + ' text-white' : styles.textSecondary}`}
              title="Tablet"
            >
              <DeviceTabletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? styles.accentBg + ' text-white' : styles.textSecondary}`}
              title="Mobile"
            >
              <DevicePhoneMobileIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyCode}
              disabled={!generatedCode}
              className={`p-2 rounded-lg ${styles.textSecondary} hover:${styles.bgInput} disabled:opacity-50`}
              title="Copy code"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              disabled={!generatedCode}
              className={`p-2 rounded-lg ${styles.textSecondary} hover:${styles.bgInput} disabled:opacity-50`}
              title="Open in new tab"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              disabled={!generatedCode}
              className={`p-2 rounded-lg ${styles.textSecondary} hover:${styles.bgInput} disabled:opacity-50`}
              title="Download"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20"
              title="Close Canvas"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`flex-1 overflow-auto p-4 ${isNeural ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {generatedCode ? (
            <div className={`${deviceStyles[previewDevice]} bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300`}>
              <iframe
                ref={previewRef}
                title="Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-full ${styles.textSecondary}`}>
              <div className={`w-24 h-24 rounded-2xl ${styles.bgSecondary} flex items-center justify-center mb-4`}>
                <SparklesIcon className={`w-12 h-12 ${styles.accentText} opacity-50`} />
              </div>
              <h3 className={`text-lg font-medium ${styles.text} mb-2`}>Ready to Create</h3>
              <p className="text-sm text-center max-w-xs">
                Select a template or describe what you want to build.<br />
                AI will create it for you instantly!
              </p>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className={`flex items-center justify-between px-4 py-1.5 border-t ${styles.border} ${styles.bgSecondary}`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${generatedCode ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className={`text-xs ${styles.textSecondary}`}>
                {isGenerating ? 'Generating...' : generatedCode ? 'Ready' : 'Waiting'}
              </span>
            </div>
            {generatedFiles.length > 0 && (
              <span className={`text-xs ${styles.textSecondary}`}>
                Files: {generatedFiles.length}
              </span>
            )}
          </div>
          <span className={`text-xs ${styles.textSecondary}`}>
            Powered by AI Canvas
          </span>
        </div>
      </div>

      {/* =========== FILE VIEW MODAL =========== */}
      {showFileModal && selectedFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-[800px] max-h-[80vh] rounded-2xl ${styles.bgPanel} shadow-2xl overflow-hidden`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${styles.border}`}>
              <div className="flex items-center gap-2">
                <span>{FILE_ICONS[selectedFile.type]}</span>
                <span className={`font-medium ${styles.text}`}>{selectedFile.name}</span>
                <span className={`text-xs ${styles.textSecondary}`}>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedFile.content) {
                      navigator.clipboard.writeText(selectedFile.content);
                    }
                  }}
                  className={`p-2 rounded-lg ${styles.textSecondary} hover:${styles.bgSecondary}`}
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
            <div className="overflow-auto max-h-[60vh]">
              <pre className={`p-4 text-sm font-mono ${styles.text} whitespace-pre-wrap`}>
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
