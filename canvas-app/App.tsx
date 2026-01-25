import React, { useState, useEffect, useRef } from 'react';
import {
  GeneratedApp,
  ViewMode,
  GenerationState,
  ChatMessage,
  ModelOption,
} from './types';
import Preview from './components/Preview';
import CodeView from './components/CodeView';
import ChatBox from './components/ChatBox';

const MODELS: ModelOption[] = [
  // Best models for code generation
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Best for coding - highly recommended.',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable OpenAI model.',
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'Strong reasoning and coding.',
  },
  {
    id: 'codestral',
    name: 'Codestral',
    provider: 'Mistral',
    description: 'Specialized for code generation.',
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Ultra-fast inference.',
  },
];

const PRESET_TEMPLATES = [
  {
    name: 'SaaS Page',
    prompt:
      'Build a modern SaaS landing page for a CRM tool with features, pricing, and hero.',
  },
  {
    name: 'Analytics',
    prompt:
      'Create a dark-themed analytics dashboard with 3 chart placeholders and a sidebar.',
  },
  {
    name: 'Storefront',
    prompt:
      'Generate an elegant minimal furniture store with a grid of items and cart icon.',
  },
];

type ActivePanel = 'workspace' | 'assistant' | 'history' | 'settings' | null;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [currentApp, setCurrentApp] = useState<GeneratedApp | null>(null);
  const [history, setHistory] = useState<GeneratedApp[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('workspace');
  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    progressMessage: '',
  });
  
  // New state for features
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Refs for camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gencraft_v4_history');
    if (saved)
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
  }, []);

  const saveHistory = (newHistory: GeneratedApp[]) => {
    setHistory(newHistory);
    localStorage.setItem('gencraft_v4_history', JSON.stringify(newHistory));
  };

  const handleGenerate = async (
    instruction: string,
    isInitial: boolean = false
  ) => {
    if (!instruction.trim() || genState.isGenerating) return;

    setGenState({
      isGenerating: true,
      error: null,
      progressMessage: `Generating with ${selectedModel.name}...`,
      isThinking: selectedModel.isThinking,
    });

    try {
      // Call the backend API instead of direct SDK
      const response = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: instruction,
          provider: selectedModel.provider,
          modelId: selectedModel.id,
          isThinking: selectedModel.isThinking || false,
          currentCode: isInitial ? undefined : currentApp?.code,
          history: isInitial ? [] : currentApp?.history,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate application');
      }

      const code = data.code;

      const userMsg: ChatMessage = {
        role: 'user',
        text: instruction,
        timestamp: Date.now(),
      };
      const modelMsg: ChatMessage = {
        role: 'model',
        text: isInitial ? 'Application built!' : 'Changes applied.',
        timestamp: Date.now(),
      };

      if (isInitial) {
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: instruction.substring(0, 30) + '...',
          code,
          prompt: instruction,
          timestamp: Date.now(),
          history: [modelMsg],
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 10));
      } else if (currentApp) {
        const updatedApp = {
          ...currentApp,
          code,
          history: [...currentApp.history, userMsg, modelMsg],
        };
        setCurrentApp(updatedApp);
        saveHistory(
          history.map((a) => (a.id === updatedApp.id ? updatedApp : a))
        );
      }

      setGenState({ isGenerating: false, error: null, progressMessage: '' });
      setViewMode(ViewMode.PREVIEW);
    } catch (err: any) {
      setGenState({
        isGenerating: false,
        error: err.message,
        progressMessage: '',
      });
    }
  };

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Screenshot functionality
  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/png');
      
      // Add screenshot to chat history
      if (currentApp) {
        const screenshotMsg: ChatMessage = {
          role: 'user',
          text: '📸 [Screenshot captured for analysis]',
          timestamp: Date.now(),
        };
        const updatedApp = {
          ...currentApp,
          history: [...currentApp.history, screenshotMsg],
        };
        setCurrentApp(updatedApp);
        setActivePanel('assistant');
      }
    } catch (err) {
      console.log('Screenshot cancelled or not supported');
    }
  };

  // Camera functions
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      setCameraStream(stream);
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access denied:', err);
      alert('Camera access denied. Please allow camera permission.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Stop camera
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        setCameraOpen(false);

        // Add captured image to chat
        if (currentApp) {
          const photoMsg: ChatMessage = {
            role: 'user',
            text: '📷 [Live photo captured for analysis]',
            timestamp: Date.now(),
          };
          const aiResponse: ChatMessage = {
            role: 'model',
            text: "I've received your captured photo! 📸 How would you like me to help? I can analyze the content, generate code inspired by the design, or create a similar UI.",
            timestamp: Date.now() + 1,
          };
          const updatedApp = {
            ...currentApp,
            history: [...currentApp.history, photoMsg, aiResponse],
          };
          setCurrentApp(updatedApp);
          setActivePanel('assistant');
        }
      }
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
  };

  // Download code
  const downloadCode = () => {
    if (currentApp?.code) {
      const blob = new Blob([currentApp.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentApp.name || 'app'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('No project to download yet. Generate an app first!');
    }
  };

  // Share (copy code)
  const shareCode = () => {
    if (currentApp?.code) {
      navigator.clipboard.writeText(currentApp.code);
      alert('Code copied to clipboard!');
    } else {
      alert('No project to share yet. Generate an app first!');
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* 1. Left Vertical Nav Bar (Narrow) */}
      <nav className="w-16 bg-[#1e1e2e] flex flex-col items-center py-6 gap-6 shrink-0 z-[60]">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-900/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <button
          onClick={() => togglePanel('workspace')}
          className={`p-3 rounded-xl transition-all ${
            activePanel === 'workspace'
              ? 'bg-indigo-600/20 text-indigo-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="Workspace"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <button
          onClick={() => togglePanel('assistant')}
          className={`p-3 rounded-xl transition-all ${
            activePanel === 'assistant'
              ? 'bg-indigo-600/20 text-indigo-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="AI Assistant"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>

        <button
          onClick={() => togglePanel('history')}
          className={`p-3 rounded-xl transition-all ${
            activePanel === 'history'
              ? 'bg-indigo-600/20 text-indigo-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          title="History"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <div className="mt-auto flex flex-col gap-4">
          {/* Divider */}
          <div className="w-8 h-px bg-gray-600 mx-auto"></div>
          
          {/* Camera Button */}
          <button
            onClick={openCamera}
            className={`p-3 rounded-xl transition-all ${cameraOpen ? 'bg-green-600/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Camera - Live Capture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Voice Button */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-3 rounded-xl transition-all ${voiceEnabled ? 'bg-green-600/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title={voiceEnabled ? 'Voice On' : 'Voice Off'}
          >
            {voiceEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Screenshot Button */}
          <button
            onClick={handleScreenshot}
            className="p-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5"
            title="Screenshot - Capture Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-8 h-px bg-gray-600 mx-auto"></div>

          {/* Share Button */}
          <button
            onClick={shareCode}
            className={`p-3 rounded-xl transition-all ${currentApp ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
            title="Share - Copy Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Download Button */}
          <button
            onClick={downloadCode}
            className={`p-3 rounded-xl transition-all ${currentApp ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
            title="Download Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-8 h-px bg-gray-600 mx-auto"></div>

          {/* Status Indicator */}
          <div className="w-2 h-2 rounded-full bg-green-500 mx-auto animate-pulse shadow-sm shadow-green-500/50"></div>
          
          {/* Settings Button */}
          <button 
            onClick={() => togglePanel('settings')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'settings' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white'}`}
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight">
              GenCraft <span className="text-indigo-600">Pro</span>
            </h1>

            {/* Model Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold hover:border-indigo-300 transition-colors">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {selectedModel.name}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Select Model
                </p>
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors ${
                      selectedModel.id === m.id
                        ? 'bg-indigo-50 ring-1 ring-indigo-200'
                        : ''
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-800">
                      {m.name}{' '}
                      {m.isThinking && (
                        <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">
                          THINKING
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {m.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
              <button
                onClick={() => setViewMode(ViewMode.PREVIEW)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === ViewMode.PREVIEW
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                PREVIEW
              </button>
              <button
                onClick={() => setViewMode(ViewMode.CODE)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === ViewMode.CODE
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                CODE
              </button>
            </div>
            <button className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95">
              DEPLOY
            </button>
          </div>
        </header>

        {/* Workspace Content (Preview/Code) */}
        <main className="flex-1 relative flex">
          <div className="flex-1 relative overflow-hidden bg-gray-50/30">
            {genState.isGenerating && (
              <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 tracking-tight">
                    {genState.progressMessage}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Refining UI components and logic...
                  </p>
                </div>
              </div>
            )}
            <div className="h-full">
              {viewMode === ViewMode.PREVIEW ? (
                <Preview code={currentApp?.code || ''} />
              ) : (
                <CodeView code={currentApp?.code || ''} />
              )}
            </div>
          </div>

          {/* 3. Right Toggleable Panels (Drawer-style) */}
          <div
            className={`h-full border-l border-gray-100 bg-white transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden shadow-2xl ${
              activePanel ? 'w-80' : 'w-0 border-l-0 opacity-0'
            }`}
          >
            <div className="w-80 flex flex-col h-full">
              {activePanel === 'workspace' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Workspace
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">
                      New App Concept
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Landing page for a SaaS..."
                      className="w-full p-4 text-xs border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 min-h-[160px] resize-none transition-all"
                    />
                    <button
                      onClick={() => handleGenerate(prompt, true)}
                      disabled={genState.isGenerating || !prompt.trim()}
                      className="w-full mt-3 py-3 bg-indigo-600 text-white text-xs font-bold rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
                    >
                      {genState.isGenerating ? 'BUILDING...' : 'GENERATE APP'}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Starter Templates
                    </h3>
                    <div className="space-y-2">
                      {PRESET_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.name}
                          onClick={() => setPrompt(tpl.prompt)}
                          className="w-full text-left px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-white hover:text-indigo-600 rounded-xl border border-transparent hover:border-gray-200 transition-all flex justify-between items-center group"
                        >
                          {tpl.name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'assistant' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      AI Assistant
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <ChatBox
                    messages={currentApp?.history || []}
                    onSendMessage={(text) => handleGenerate(text, false)}
                    isGenerating={genState.isGenerating}
                  />
                </div>
              )}

              {activePanel === 'history' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      History
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setCurrentApp(app)}
                          className={`w-full text-left px-4 py-3 text-xs rounded-xl transition-all truncate border ${
                            currentApp?.id === app.id
                              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="font-bold mb-1 truncate">
                            {app.name}
                          </div>
                          <div className="text-[10px] opacity-60">
                            {new Date(app.timestamp).toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 italic text-xs">
                      No project history yet.
                    </div>
                  )}
                </div>
              )}

              {activePanel === 'settings' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Settings
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Model Selection */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">AI Model</h4>
                    <div className="space-y-2">
                      {MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModel(m)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedModel.id === m.id
                              ? 'bg-indigo-50 ring-1 ring-indigo-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <p className="text-xs font-bold text-gray-800">{m.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{m.provider} - {m.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Preferences</h4>
                    
                    <label className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${useStreaming ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-xs font-medium text-gray-700">Real-time Streaming</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useStreaming}
                        onChange={() => setUseStreaming(!useStreaming)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${voiceEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-xs font-medium text-gray-700">Voice Responses</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={voiceEnabled}
                        onChange={() => setVoiceEnabled(!voiceEnabled)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-xs font-medium text-gray-700">Dark Mode</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                  </div>

                  {/* Clear History */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => {
                        if (confirm('Clear all history?')) {
                          setHistory([]);
                          localStorage.removeItem('gencraft_v4_history');
                        }
                      }}
                      className="w-full py-3 px-4 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                    >
                      Clear History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Live Camera
            </h3>
            <button
              onClick={closeCamera}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              title="Close Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-[60vh] bg-black"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/50 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/50 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/50 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/50 rounded-br-lg"></div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95 group"
              title="Capture Photo"
            >
              <div className="w-16 h-16 bg-red-500 rounded-full group-hover:bg-red-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
          </div>

          <p className="text-white/60 text-sm mt-4">
            Point at a design or UI and capture to analyze
          </p>
        </div>
      )}

      {genState.error && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm p-4 bg-white border border-red-100 rounded-3xl shadow-2xl flex gap-4 items-start border-l-4 border-l-red-500 animate-slide-up">
          <div className="p-2 bg-red-50 text-red-500 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800">
              Generation Error
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {genState.error}
            </p>
            <div className="mt-3 flex gap-4">
              <button
                onClick={() => setGenState({ ...genState, error: null })}
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Server status in bottom left */}
      <div className="fixed bottom-4 left-20 z-40">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              genState.isGenerating
                ? 'bg-indigo-500 animate-pulse'
                : 'bg-green-500'
            }`}
          ></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Active Server: AWS EC2 Ubuntu
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
