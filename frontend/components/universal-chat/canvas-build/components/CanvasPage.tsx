'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
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
  CodeBracketIcon,
  EyeIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

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
  type: 'html' | 'css' | 'js' | 'tsx' | 'json' | 'image' | 'other';
  content: string;
  size: number;
}

interface HistoryEntry {
  id: string;
  name: string;
  prompt: string;
  code: string;
  timestamp: number;
}

interface CanvasModeProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly theme?: 'default' | 'neural';
  readonly agentId?: string;
  readonly agentName?: string;
}

// =============================================================================
// TEMPLATES
// =============================================================================

const TEMPLATES = [
  {
    id: 't1',
    name: 'SaaS Landing',
    category: 'Landing',
    icon: '🚀',
    prompt:
      'Create a modern SaaS landing page with hero section, features grid, pricing cards, testimonials, and CTA. Use gradient backgrounds and smooth animations.',
  },
  {
    id: 't2',
    name: 'Portfolio',
    category: 'Landing',
    icon: '👨‍💼',
    prompt:
      'Build a creative portfolio website with about section, project gallery with hover effects, skills section, and contact form. Modern dark theme.',
  },
  {
    id: 't3',
    name: 'Analytics Dashboard',
    category: 'Dashboard',
    icon: '📊',
    prompt:
      'Create an analytics dashboard with stats cards, line chart placeholder, bar chart, recent activity list, and sidebar navigation. Dark theme.',
  },
  {
    id: 't4',
    name: 'Admin Panel',
    category: 'Dashboard',
    icon: '⚙️',
    prompt:
      'Build an admin panel with user management table, search/filter, pagination, sidebar menu, and top navbar with notifications.',
  },
  {
    id: 't5',
    name: 'E-commerce Store',
    category: 'E-commerce',
    icon: '🛒',
    prompt:
      'Create an e-commerce product grid with filter sidebar, product cards with hover effects, cart icon, and sorting dropdown.',
  },
  {
    id: 't6',
    name: 'Product Page',
    category: 'E-commerce',
    icon: '📦',
    prompt:
      'Build a product detail page with image gallery, size/color selectors, add to cart button, reviews section, and related products.',
  },
  {
    id: 't7',
    name: 'Login Form',
    category: 'Components',
    icon: '🔐',
    prompt:
      'Create a beautiful login/signup form with social login buttons, input validation styling, and forgot password link. Glassmorphism style.',
  },
  {
    id: 't8',
    name: 'Pricing Table',
    category: 'Components',
    icon: '💎',
    prompt:
      'Build a 3-tier pricing table with feature comparison, popular badge, monthly/yearly toggle, and CTA buttons.',
  },
  {
    id: 't9',
    name: 'Contact Form',
    category: 'Components',
    icon: '✉️',
    prompt:
      'Design a contact form with name, email, subject, message fields, and submit button. Include form validation styling.',
  },
  {
    id: 't10',
    name: 'Blog Layout',
    category: 'Creative',
    icon: '📝',
    prompt:
      'Create a blog homepage with featured post hero, recent articles grid, categories sidebar, and newsletter signup.',
  },
  {
    id: 't11',
    name: 'Event Page',
    category: 'Creative',
    icon: '🎉',
    prompt:
      'Design an event landing page with countdown timer, speaker profiles, schedule timeline, and ticket purchase section.',
  },
  {
    id: 't12',
    name: 'Restaurant',
    category: 'Creative',
    icon: '🍽️',
    prompt:
      'Create a restaurant website with hero image, menu sections, reservation form, gallery, and location map placeholder.',
  },
];

const FILE_ICONS: Record<string, string> = {
  html: '🌐',
  css: '🎨',
  js: '📜',
  tsx: '⚛️',
  json: '📋',
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

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);

  // UI State
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDevice, setPreviewDevice] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copySuccess, setCopySuccess] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'generating' | 'success' | 'error'
  >('idle');
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [showFilesPanel, setShowFilesPanel] = useState(true);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showNavOverlay, setShowNavOverlay] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [openHistoryMenuId, setOpenHistoryMenuId] = useState<string | null>(
    null
  );
  const [activePane, setActivePane] = useState<
    'chat' | 'files' | 'preview' | 'templates' | 'code' | 'history'
  >('chat');

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hi! I'm ready to create amazing designs for you.\n\n🎯 Select a template or describe what you want to build!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =============================================================================
  // BRAND THEME STYLES
  // =============================================================================

  const brandColors = {
    gradientPrimary:
      'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500',
    gradientText:
      'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
    bgMain: 'bg-[#0a0a0f]',
    bgPanel: 'bg-[#12121a]/95 backdrop-blur-xl',
    bgSecondary: 'bg-[#1a1a24]/80',
    bgInput: 'bg-[#1e1e2a]',
    bgHover: 'hover:bg-[#252530]',
    border: 'border-[#2a2a3a]',
    borderAccent: 'border-cyan-500/30',
    text: 'text-gray-100',
    textSecondary: 'text-gray-400',
    textMuted: 'text-gray-500',
    accentCyan: 'text-cyan-400',
    accentPurple: 'text-purple-400',
    btnPrimary:
      'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/25',
    btnSecondary: 'bg-[#2a2a3a] hover:bg-[#353545] text-gray-200',
  };

  // Categories
  const categories = [
    'All',
    ...Array.from(new Set(TEMPLATES.map((t) => t.category))),
  ];
  const filteredTemplates =
    selectedCategory === 'All'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  // Sync pane selection with visible panels and modes
  useEffect(() => {
    const chatActive = activePane === 'chat' || activePane === 'templates';
    const filesActive = activePane === 'files' || activePane === 'code';
    const historyActive = activePane === 'history';
    setShowChatPanel(chatActive);
    setShowFilesPanel(filesActive);
    setShowHistoryPanel(historyActive);
    setShowTemplates(activePane === 'templates');

    if (activePane === 'preview') {
      setViewMode('preview');
    }
    if (activePane === 'code') {
      setViewMode('code');
    }
    if (filesActive && generatedFiles.length > 0 && activePane !== 'preview') {
      setViewMode('code');
    }
  }, [activePane, generatedFiles.length]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const normalizeCode = useCallback((code: string) => {
    let cleaned = code.trimStart();
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/i, '');
    cleaned = cleaned.replace(/```$/i, '');
    return cleaned.trim();
  }, []);

  const summarizePrompt = useCallback((prompt: string) => {
    const clean = prompt.trim();
    if (!clean) return 'Untitled build';
    const firstLine = clean.split('\n')[0];
    return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('canvasHistory');
      if (stored) {
        const parsed: HistoryEntry[] = JSON.parse(stored);
        setHistoryEntries(
          parsed.map((entry) => ({
            ...entry,
            name: entry.name || summarizePrompt(entry.prompt),
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  }, [summarizePrompt]);

  // Persist history to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('canvasHistory', JSON.stringify(historyEntries));
    } catch (err) {
      console.error('Failed to save history', err);
    }
  }, [historyEntries]);

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

  useEffect(() => {
    if (viewMode !== 'preview') return;
    const htmlContent =
      selectedFile?.type === 'html' ? selectedFile.content : generatedCode;
    if (htmlContent) {
      updatePreview(htmlContent);
    }
  }, [viewMode, selectedFile, generatedCode, updatePreview]);

  // Extract files from generated code
  const extractFiles = useCallback((code: string): GeneratedFile[] => {
    const files: GeneratedFile[] = [];

    // Main HTML file
    if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      files.push({
        id: 'f-html',
        name: 'index.html',
        path: '/index.html',
        type: 'html',
        content: code,
        size: new Blob([code]).size,
      });
    }

    // Extract inline CSS
    const styleMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches && styleMatches.length > 0) {
      const cssContent = styleMatches
        .map((m) => m.replace(/<\/?style[^>]*>/gi, ''))
        .join('\n');
      if (cssContent.trim().length > 50) {
        files.push({
          id: 'f-css',
          name: 'styles.css',
          path: '/styles.css',
          type: 'css',
          content: cssContent.trim(),
          size: new Blob([cssContent]).size,
        });
      }
    }

    // Extract inline JS
    const scriptMatches = code.match(
      /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi
    );
    if (scriptMatches && scriptMatches.length > 0) {
      const jsContent = scriptMatches
        .map((m) => m.replace(/<\/?script[^>]*>/gi, ''))
        .join('\n');
      if (jsContent.trim().length > 50) {
        files.push({
          id: 'f-js',
          name: 'script.js',
          path: '/script.js',
          type: 'js',
          content: jsContent.trim(),
          size: new Blob([jsContent]).size,
        });
      }
    }

    return files;
  }, []);

  const handleTemplateSelect = useCallback(
    (template: (typeof TEMPLATES)[0]) => {
      setChatInput(template.prompt);
      setShowTemplates(false);
      // Auto-submit
      setTimeout(() => {
        const submitBtn = document.getElementById('canvas-submit-btn');
        if (submitBtn) submitBtn.click();
      }, 100);
    },
    []
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newFile: FileAttachment = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            url: event.target?.result as string,
            size: file.size,
          };
          setUploadedFiles((prev) => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
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

    setMessages((prev) => [...prev, userMessage]);
    const userPrompt = chatInput.trim();
    const uniquenessHint = `\n\nUniqueness requirements: produce a fresh layout, novel component structure, and a new color system for this request. Avoid reusing any previous templates. Seed: ${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000)}`;
    setChatInput('');
    setUploadedFiles([]);
    setIsGenerating(true);
    setShowTemplates(false);
    setGenerationStatus('generating');
    setViewMode('preview'); // Switch to preview when generating

    // Add streaming placeholder
    const streamingMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: streamingMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/canvas/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: `${userPrompt}${uniquenessHint}`,
          provider: 'mistral',
          modelId: 'mistral-large-latest',
          currentCode: generatedCode || undefined,
          history: messages
            .filter((m) => !m.isStreaming)
            .map((m) => ({ role: m.role, text: m.content })),
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
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                // API returns 'chunk' not 'content'
                const chunkContent = parsed.chunk || parsed.content;
                if (chunkContent) {
                  fullCode += chunkContent;
                  const cleaned = normalizeCode(fullCode);
                  setGeneratedCode(cleaned);

                  // Update files in real-time
                  const files = extractFiles(cleaned);
                  setGeneratedFiles(files);

                  // Update preview in real-time (throttled)
                  if (
                    fullCode.includes('</body>') ||
                    fullCode.includes('</html>') ||
                    fullCode.length % 500 < 50
                  ) {
                    updatePreview(cleaned);
                  }
                }
                if (parsed.done) {
                  // Stream completed
                  console.log('Stream completed');
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (parseError) {
                // If not valid JSON, might be raw content
                if (data && data !== '[DONE]' && !data.startsWith('{')) {
                  fullCode += data;
                  setGeneratedCode(normalizeCode(fullCode));
                }
              }
            }
          }
        }
      }

      // Final update
      if (fullCode) {
        const cleaned = normalizeCode(fullCode);
        setGeneratedCode(cleaned);
        updatePreview(cleaned);
        const files = extractFiles(cleaned);
        setGeneratedFiles(files);
        setGenerationStatus('success');

        setHistoryEntries((prev) => [
          {
            id: `${Date.now()}`,
            name: summarizePrompt(userPrompt),
            prompt: userPrompt,
            code: cleaned,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      } else {
        throw new Error('No code generated');
      }

      // Update message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content:
                  '✨ Done! Your design is ready.\n\nCheck the Preview or Code tab. Want changes? Just describe them!',
                isStreaming: false,
              }
            : m
        )
      );
    } catch (error: unknown) {
      const isAborted =
        error instanceof DOMException && error.name === 'AbortError';
      const errorMsg = isAborted
        ? 'Stopped by user'
        : error instanceof Error
          ? error.message
          : 'Unknown error';
      setGenerationStatus('error');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content: isAborted
                  ? '⏹️ Generation stopped by user.'
                  : `❌ Error: ${errorMsg}\n\nPlease try again.`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  }, [
    chatInput,
    isGenerating,
    uploadedFiles,
    generatedCode,
    messages,
    updatePreview,
    extractFiles,
    summarizePrompt,
  ]);

  const handleStopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  const handleDeleteHistoryEntry = useCallback(
    (id: string) => {
      setHistoryEntries((prev) => prev.filter((entry) => entry.id !== id));
      if (openHistoryMenuId === id) setOpenHistoryMenuId(null);
    },
    [openHistoryMenuId]
  );

  const handleRenameHistoryEntry = useCallback(
    (id: string) => {
      const entry = historyEntries.find((e) => e.id === id);
      if (!entry) return;
      const newName = window.prompt(
        'Rename build',
        entry.name || 'Untitled build'
      );
      if (!newName) return;
      setHistoryEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, name: newName.trim() || e.name } : e
        )
      );
      setOpenHistoryMenuId(null);
    },
    [historyEntries]
  );

  const handleDownloadHistoryEntry = useCallback((entry: HistoryEntry) => {
    const blob = new Blob([entry.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.name || 'canvas-build'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setOpenHistoryMenuId(null);
  }, []);

  const handleShareHistoryEntry = useCallback(async (entry: HistoryEntry) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: entry.name, text: entry.code });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(entry.code);
        alert('Code copied to clipboard');
      } else {
        alert('Sharing is not supported in this browser');
      }
    } catch (err) {
      console.error('Share failed', err);
    } finally {
      setOpenHistoryMenuId(null);
    }
  }, []);

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
    const contentToCopy = selectedFile?.content || generatedCode;
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [generatedCode, selectedFile]);

  const handleOpenInNewTab = useCallback(() => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [generatedCode]);

  // Device styles
  const deviceStyles = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-full mx-auto',
    mobile: 'w-[375px] h-full mx-auto',
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${brandColors.bgMain}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* =========== LEFT TOOLBAR =========== */}
      <div
        className={`${showNavOverlay ? 'w-60 items-start' : 'w-14 items-center'} flex flex-col gap-2 py-4 ${brandColors.bgPanel} ${brandColors.border} border-r relative z-20 transition-all duration-300`}
      >
        <button
          onClick={() => setShowNavOverlay((v) => !v)}
          className={`p-2 rounded-lg ${brandColors.gradientPrimary} ${showNavOverlay ? 'ml-2' : ''} hover:scale-105 transition-transform flex items-center gap-2`}
          title={showNavOverlay ? 'Close navigation' : 'Open navigation'}
        >
          <Image
            src="/images/logos/company-logo.png"
            alt="One Last AI logo"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
            priority
          />
          {showNavOverlay && (
            <span className={`text-sm font-semibold ${brandColors.text}`}>
              Navigation
            </span>
          )}
        </button>
        <div className="flex flex-col gap-2 w-full px-2 mt-2">
          <button
            onClick={() => setActivePane('chat')}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'chat'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Chat"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Chat</span>
            )}
          </button>
          <button
            onClick={() => setActivePane('files')}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'files'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Files"
          >
            <FolderIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Files</span>
            )}
          </button>
          <button
            onClick={() => setActivePane('preview')}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'preview'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Preview"
          >
            <EyeIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Preview</span>
            )}
          </button>
          <div className="h-px w-full bg-white/5 my-1" />
          <button
            onClick={() => {
              setActivePane('preview');
              setPreviewDevice('desktop');
            }}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'preview' && previewDevice === 'desktop'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Desktop preview"
          >
            <ComputerDesktopIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Desktop</span>
            )}
          </button>
          <button
            onClick={() => {
              setActivePane('preview');
              setPreviewDevice('tablet');
            }}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'preview' && previewDevice === 'tablet'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Tablet preview"
          >
            <DeviceTabletIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Tablet</span>
            )}
          </button>
          <button
            onClick={() => {
              setActivePane('preview');
              setPreviewDevice('mobile');
            }}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'preview' && previewDevice === 'mobile'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Mobile preview"
          >
            <DevicePhoneMobileIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Mobile</span>
            )}
          </button>
          <button
            onClick={() => setActivePane('code')}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'code'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Code"
          >
            <CodeBracketIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Code</span>
            )}
          </button>
          <button
            onClick={() => setActivePane('history')}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'history'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="History"
          >
            <ClockIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>History</span>
            )}
          </button>
        </div>
      </div>

      {/* =========== LEFT PANEL: AI CHAT =========== */}
      <div
        className={`${showChatPanel ? 'w-[320px]' : 'w-0'} flex flex-col ${brandColors.bgPanel} ${showChatPanel ? `${brandColors.border} border-r` : 'border-transparent'} relative z-10 transition-all duration-300 overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 ${brandColors.border} border-b`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${brandColors.gradientPrimary}`}>
              <Image
                src="/images/logos/company-logo.png"
                alt="One Last AI logo"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
                priority
              />
            </div>
            {showChatPanel && (
              <span className={`font-semibold ${brandColors.gradientText}`}>
                AI Canvas
              </span>
            )}
          </div>
          {showChatPanel && (
            <button
              onClick={() => {
                setActivePane('templates');
                setShowTemplates(true);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                showTemplates
                  ? brandColors.btnPrimary
                  : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
              }`}
            >
              Temp
              <ChevronDownIcon
                className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Templates Dropdown */}
        {showTemplates && showChatPanel && (
          <div
            className={`${brandColors.border} border-b max-h-80 overflow-hidden flex flex-col`}
          >
            {/* Category Tabs */}
            <div
              className={`flex overflow-x-auto p-2 gap-1 ${brandColors.border} border-b flex-shrink-0`}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? brandColors.btnPrimary
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
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-2.5 rounded-xl text-left transition-all hover:scale-[1.02] ${brandColors.bgSecondary} ${brandColors.bgHover} border ${brandColors.border} hover:border-cyan-500/50 group`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {template.icon}
                      </span>
                      <div>
                        <p
                          className={`text-xs font-medium ${brandColors.text}`}
                        >
                          {template.name}
                        </p>
                        <p className={`text-[10px] ${brandColors.textMuted}`}>
                          {template.category}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {showChatPanel && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? brandColors.btnPrimary
                      : `${brandColors.bgSecondary} ${brandColors.text} border ${brandColors.border}`
                  }`}
                >
                  {msg.isStreaming ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                      <span className={`text-xs ${brandColors.textSecondary}`}>
                        Creating...
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.attachments.map((file) => (
                        <span
                          key={file.id}
                          className="text-xs bg-white/20 px-2 py-0.5 rounded"
                        >
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
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && showChatPanel && (
          <div className={`px-3 py-2 ${brandColors.border} border-t`}>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${brandColors.bgSecondary} text-xs border ${brandColors.border}`}
                >
                  <PhotoIcon className="w-3 h-3 text-cyan-400" />
                  <span className={brandColors.text}>
                    {file.name.slice(0, 12)}...
                  </span>
                  <button
                    onClick={() => removeUploadedFile(file.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        {showChatPanel && (
          <div className={`p-3 ${brandColors.border} border-t`}>
            <div
              className={`flex items-end gap-2 rounded-xl ${brandColors.bgInput} p-2 border ${brandColors.border} focus-within:border-cyan-500/50 transition-colors`}
            >
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

              {isGenerating ? (
                <button
                  onClick={handleStopGeneration}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                  title="Stop generation"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  id="canvas-submit-btn"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className={`p-2 rounded-lg transition-all ${
                    chatInput.trim()
                      ? brandColors.btnPrimary
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========== CENTER PANEL: FILES =========== */}
      <div
        className={`${showFilesPanel || showHistoryPanel ? 'w-[220px]' : 'w-0'} flex flex-col ${brandColors.bgPanel} ${showFilesPanel || showHistoryPanel ? `${brandColors.border} border-r` : 'border-transparent'} relative z-10 transition-all duration-300 overflow-hidden`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-3 ${brandColors.border} border-b`}
        >
          {activePane === 'history' ? (
            <ClockIcon className={`w-4 h-4 ${brandColors.accentCyan}`} />
          ) : (
            <FolderIcon className={`w-4 h-4 ${brandColors.accentCyan}`} />
          )}
          {(showFilesPanel || showHistoryPanel) && (
            <span className={`text-sm font-medium ${brandColors.text}`}>
              {activePane === 'history' ? 'History' : 'Files'}
            </span>
          )}
          {generatedFiles.length > 0 &&
            showFilesPanel &&
            activePane !== 'history' && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${brandColors.gradientPrimary} text-white`}
              >
                {generatedFiles.length}
              </span>
            )}
        </div>

        {activePane === 'history' && showHistoryPanel ? (
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
            {historyEntries.length === 0 ? (
              <div className={`text-center py-8 ${brandColors.textSecondary}`}>
                <ClockIcon className="w-8 h-8 opacity-50 mx-auto mb-2" />
                <p className="text-xs">No history yet</p>
                <p className={`text-[10px] mt-1 ${brandColors.textMuted}`}>
                  Generate something to see it here
                </p>
              </div>
            ) : (
              historyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`border ${brandColors.border} rounded-lg p-2 ${brandColors.bgSecondary} ${brandColors.bgHover} transition-all relative`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${brandColors.text}`}
                      >
                        {entry.name || 'Untitled build'}
                      </span>
                      <span className={`text-[11px] ${brandColors.textMuted}`}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setGeneratedCode(entry.code);
                          setViewMode('code');
                          setActivePane('code');
                          setOpenHistoryMenuId(null);
                        }}
                        className={`text-xs ${brandColors.accentCyan} hover:text-cyan-300 px-2 py-1 rounded-lg ${brandColors.bgHover}`}
                      >
                        Open
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenHistoryMenuId((prev) =>
                              prev === entry.id ? null : entry.id
                            )
                          }
                          className={`p-1 rounded-lg ${brandColors.bgHover} ${brandColors.textSecondary} hover:${brandColors.text}`}
                          title="More options"
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                        {openHistoryMenuId === entry.id && (
                          <div
                            className={`absolute right-0 mt-2 w-36 rounded-lg border ${brandColors.border} ${brandColors.bgPanel} shadow-lg z-10`}
                          >
                            <button
                              onClick={() => handleRenameHistoryEntry(entry.id)}
                              className={`w-full text-left px-3 py-2 text-sm ${brandColors.text} ${brandColors.bgHover}`}
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => handleDownloadHistoryEntry(entry)}
                              className={`w-full text-left px-3 py-2 text-sm ${brandColors.text} ${brandColors.bgHover}`}
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handleShareHistoryEntry(entry)}
                              className={`w-full text-left px-3 py-2 text-sm ${brandColors.text} ${brandColors.bgHover}`}
                            >
                              Share
                            </button>
                            <button
                              onClick={() => handleDeleteHistoryEntry(entry.id)}
                              className={`w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 ${brandColors.bgHover}`}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${brandColors.textSecondary}`}>
                    {entry.prompt}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          showFilesPanel && (
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {generatedFiles.length > 0 ? (
                <div className="space-y-1">
                  {generatedFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        setViewMode('code');
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all group ${
                        selectedFile?.id === file.id
                          ? `${brandColors.btnPrimary}`
                          : `${brandColors.bgSecondary} ${brandColors.bgHover} border ${brandColors.border} hover:border-cyan-500/30`
                      }`}
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform">
                        {FILE_ICONS[file.type] || FILE_ICONS.other}
                      </span>
                      <span
                        className={`text-xs truncate ${selectedFile?.id === file.id ? 'text-white' : brandColors.text}`}
                      >
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className={`text-center py-8 ${brandColors.textSecondary}`}
                >
                  <div
                    className={`w-10 h-10 mx-auto rounded-lg ${brandColors.bgSecondary} flex items-center justify-center mb-2`}
                  >
                    <DocumentIcon className="w-5 h-5 opacity-50" />
                  </div>
                  <p className="text-xs">No files yet</p>
                  <p className={`text-[10px] mt-1 ${brandColors.textMuted}`}>
                    AI will create files here
                  </p>
                </div>
              )}
            </div>
          )
        )}

        {/* Generation Status */}
        {isGenerating && showFilesPanel && activePane !== 'history' && (
          <div className={`px-3 py-2 ${brandColors.border} border-t`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className={`text-xs ${brandColors.accentCyan}`}>
                Generating...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =========== RIGHT PANEL: CODE / PREVIEW =========== */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Toolbar */}
        <div
          className={`flex items-center justify-between px-4 py-2 ${brandColors.border} border-b ${brandColors.bgSecondary}`}
        >
          <div className="flex items-center">
            <span
              className={`text-sm font-semibold ${brandColors.gradientText}`}
            >
              One Last AI
            </span>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyCode}
              disabled={!generatedCode}
              className={`p-2 rounded-lg transition-all ${brandColors.textSecondary} ${brandColors.bgHover} disabled:opacity-50 disabled:cursor-not-allowed`}
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
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-hidden ${brandColors.bgMain}`}>
          {viewMode === 'preview' ? (
            /* ===== PREVIEW VIEW ===== */
            <div className="w-full h-full p-4 overflow-auto">
              {generatedCode ? (
                <div
                  className={`${deviceStyles[previewDevice]} bg-white rounded-xl overflow-hidden transition-all duration-300`}
                  style={{
                    boxShadow:
                      '0 0 60px rgba(34, 211, 238, 0.15), 0 0 30px rgba(168, 85, 247, 0.1)',
                  }}
                >
                  <iframe
                    ref={previewRef}
                    title="Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center h-full ${brandColors.textSecondary}`}
                >
                  <div
                    className={`w-20 h-20 rounded-2xl ${brandColors.bgSecondary} flex items-center justify-center mb-4 border ${brandColors.borderAccent}`}
                  >
                    <SparklesIcon
                      className={`w-10 h-10 ${brandColors.accentCyan} opacity-60`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${brandColors.gradientText} mb-2`}
                  >
                    Ready to Create
                  </h3>
                  <p className="text-sm text-center">
                    Select a template or describe what you want.
                    <br />
                    <span className={brandColors.accentPurple}>
                      Preview will appear here!
                    </span>
                  </p>
                  {isGenerating && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-cyan-300">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Generating preview...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ===== CODE VIEW ===== */
            <div className="w-full h-full overflow-hidden">
              {selectedFile || generatedCode ? (
                <div className="h-full">
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="html"
                    language={
                      selectedFile?.type === 'css'
                        ? 'css'
                        : selectedFile?.type === 'js'
                          ? 'javascript'
                          : selectedFile?.type === 'json'
                            ? 'json'
                            : selectedFile?.type === 'tsx'
                              ? 'typescript'
                              : 'html'
                    }
                    theme="vs-dark"
                    value={selectedFile?.content || generatedCode}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              ) : (
                <div
                  className={`flex flex-col items-center justify-center h-full ${brandColors.textSecondary}`}
                >
                  <CodeBracketIcon className="w-12 h-12 opacity-30 mb-3" />
                  <p className="text-sm">No code yet</p>
                  <p className={`text-xs ${brandColors.textMuted}`}>
                    Generated code will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div
          className={`flex items-center justify-between px-4 py-2 ${brandColors.border} border-t ${brandColors.bgSecondary}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {generationStatus === 'generating' && (
                <>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className={`text-xs ${brandColors.accentCyan}`}>
                    Generating...
                  </span>
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
                  <span
                    className={`w-2 h-2 rounded-full ${brandColors.bgSecondary}`}
                  />
                  <span className={`text-xs ${brandColors.textMuted}`}>
                    Waiting
                  </span>
                </>
              )}
            </div>
            {selectedFile && viewMode === 'code' && (
              <span className={`text-xs ${brandColors.textSecondary}`}>
                {selectedFile.name} • {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          <span className={`text-xs ${brandColors.gradientText}`}>
            Powered by AI Canvas ✨
          </span>
        </div>
      </div>

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
