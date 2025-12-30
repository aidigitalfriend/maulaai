
import React, { useState, useEffect } from 'react';
import { GeneratedApp, ViewMode, GenerationState, ChatMessage, ModelOption } from './types';
import { generateAppCode } from './services/geminiService';
import Preview from './components/Preview';
import CodeView from './components/CodeView';
import ChatBox from './components/ChatBox';

const MODELS: ModelOption[] = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Gemini', description: 'Fast and efficient for basic layouts.' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Gemini', description: 'High reasoning for complex apps.' },
  { id: 'gemini-3-pro-preview-thinking', name: 'Gemini 3 Pro (Thinking)', provider: 'Gemini', description: 'Maximum reasoning power for hard logic.', isThinking: true },
  { id: 'gpt-4o', name: 'GPT-4o (Placeholder)', provider: 'OpenAI', description: 'Industry standard reasoning.' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Placeholder)', provider: 'Anthropic', description: 'Expert coding assistant.' },
];

const PRESET_TEMPLATES = [
  { name: 'SaaS Page', prompt: 'Build a modern SaaS landing page for a CRM tool with features, pricing, and hero.' },
  { name: 'Analytics', prompt: 'Create a dark-themed analytics dashboard with 3 chart placeholders and a sidebar.' },
  { name: 'Storefront', prompt: 'Generate an elegant minimal furniture store with a grid of items and cart icon.' }
];

type ActivePanel = 'workspace' | 'assistant' | 'history' | null;

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
    progressMessage: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('gencraft_v4_history');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) {}
  }, []);

  const saveHistory = (newHistory: GeneratedApp[]) => {
    setHistory(newHistory);
    localStorage.setItem('gencraft_v4_history', JSON.stringify(newHistory));
  };

  const handleGenerate = async (instruction: string, isInitial: boolean = false) => {
    if (!instruction.trim() || genState.isGenerating) return;

    const actualModelId = selectedModel.isThinking ? 'gemini-3-pro-preview' : selectedModel.id;
    
    if (selectedModel.provider !== 'Gemini') {
      setGenState({ isGenerating: false, error: "Multi-provider support requires separate API keys. Currently only Gemini is active.", progressMessage: "" });
      return;
    }

    setGenState({ 
      isGenerating: true, 
      error: null, 
      progressMessage: selectedModel.isThinking ? 'Deep thinking in progress...' : 'Building application...',
      isThinking: selectedModel.isThinking
    });

    try {
      const code = await generateAppCode(
        instruction, 
        actualModelId, 
        !!selectedModel.isThinking, 
        isInitial ? undefined : currentApp?.code,
        isInitial ? [] : currentApp?.history
      );

      const userMsg: ChatMessage = { role: 'user', text: instruction, timestamp: Date.now() };
      const modelMsg: ChatMessage = { role: 'model', text: isInitial ? 'Application built!' : 'Changes applied.', timestamp: Date.now() };

      if (isInitial) {
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: instruction.substring(0, 30) + '...',
          code,
          prompt: instruction,
          timestamp: Date.now(),
          history: [modelMsg]
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 10));
      } else if (currentApp) {
        const updatedApp = {
          ...currentApp,
          code,
          history: [...currentApp.history, userMsg, modelMsg]
        };
        setCurrentApp(updatedApp);
        saveHistory(history.map(a => a.id === updatedApp.id ? updatedApp : a));
      }

      setGenState({ isGenerating: false, error: null, progressMessage: '' });
      setViewMode(ViewMode.PREVIEW);
    } catch (err: any) {
      setGenState({ isGenerating: false, error: err.message, progressMessage: '' });
    }
  };

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* 1. Left Vertical Nav Bar (Narrow) */}
      <nav className="w-16 bg-[#1e1e2e] flex flex-col items-center py-6 gap-6 shrink-0 z-[60]">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <button 
          onClick={() => togglePanel('workspace')}
          className={`p-3 rounded-xl transition-all ${activePanel === 'workspace' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          title="Workspace"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        <button 
          onClick={() => togglePanel('assistant')}
          className={`p-3 rounded-xl transition-all ${activePanel === 'assistant' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          title="AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        <button 
          onClick={() => togglePanel('history')}
          className={`p-3 rounded-xl transition-all ${activePanel === 'history' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          title="History"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div className="mt-auto flex flex-col gap-6">
          <div className="w-2 h-2 rounded-full bg-green-500 mx-auto animate-pulse shadow-sm shadow-green-500/50"></div>
          <button className="p-3 text-gray-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight">GenCraft <span className="text-indigo-600">Pro</span></h1>
            
            {/* Model Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold hover:border-indigo-300 transition-colors">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {selectedModel.name}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Model</p>
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors ${selectedModel.id === m.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''}`}
                  >
                    <p className="text-xs font-bold text-gray-800">{m.name} {m.isThinking && <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">THINKING</span>}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
              <button onClick={() => setViewMode(ViewMode.PREVIEW)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>PREVIEW</button>
              <button onClick={() => setViewMode(ViewMode.CODE)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === ViewMode.CODE ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>CODE</button>
            </div>
            <button className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95">DEPLOY</button>
          </div>
        </header>

        {/* Workspace Content (Preview/Code) */}
        <main className="flex-1 relative flex">
          <div className="flex-1 relative overflow-hidden bg-gray-50/30">
            {genState.isGenerating && (
              <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 tracking-tight">{genState.progressMessage}</p>
                  <p className="text-sm text-gray-500 mt-1">Refining UI components and logic...</p>
                </div>
              </div>
            )}
            <div className="h-full">
              {viewMode === ViewMode.PREVIEW ? <Preview code={currentApp?.code || ''} /> : <CodeView code={currentApp?.code || ''} />}
            </div>
          </div>

          {/* 3. Right Toggleable Panels (Drawer-style) */}
          <div 
            className={`h-full border-l border-gray-100 bg-white transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden shadow-2xl ${activePanel ? 'w-80' : 'w-0 border-l-0 opacity-0'}`}
          >
            <div className="w-80 flex flex-col h-full">
              {activePanel === 'workspace' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workspace</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">New App Concept</label>
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
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Starter Templates</h3>
                    <div className="space-y-2">
                      {PRESET_TEMPLATES.map(tpl => (
                        <button 
                          key={tpl.name} 
                          onClick={() => setPrompt(tpl.prompt)} 
                          className="w-full text-left px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-white hover:text-indigo-600 rounded-xl border border-transparent hover:border-gray-200 transition-all flex justify-between items-center group"
                        >
                          {tpl.name}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'assistant' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Assistant</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">History</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map(app => (
                        <button 
                          key={app.id} 
                          onClick={() => setCurrentApp(app)} 
                          className={`w-full text-left px-4 py-3 text-xs rounded-xl transition-all truncate border ${currentApp?.id === app.id ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className="font-bold mb-1 truncate">{app.name}</div>
                          <div className="text-[10px] opacity-60">{new Date(app.timestamp).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 italic text-xs">No project history yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {genState.error && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm p-4 bg-white border border-red-100 rounded-3xl shadow-2xl flex gap-4 items-start border-l-4 border-l-red-500 animate-slide-up">
          <div className="p-2 bg-red-50 text-red-500 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800">Generation Error</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{genState.error}</p>
            <div className="mt-3 flex gap-4">
              <button onClick={() => setGenState({ ...genState, error: null })} className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors">Dismiss</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Active Server status in bottom left */}
      <div className="fixed bottom-4 left-20 z-40">
         <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
           <div className={`w-2 h-2 rounded-full ${genState.isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'}`}></div>
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Server: AWS EC2 Ubuntu</span>
         </div>
      </div>
    </div>
  );
};

export default App;
