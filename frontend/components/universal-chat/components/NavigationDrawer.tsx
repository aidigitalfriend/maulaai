
import React, { useEffect, useState } from 'react';
import { X, Cpu, Activity, Zap, ChevronRight, Check, TrendingUp, Clock, Server, Gauge } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { NavItem, SettingsState } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleSelect: (item: NavItem) => void;
  currentSettings: SettingsState;
  onSettingsChange: (settings: SettingsState) => void;
}

// Model display name mapping for user-friendly names
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Maula AI (Cerebras)
  'llama-3.3-70b': 'Ultra Fast',
  // One Last AI (Groq)
  'llama-3.3-70b-specdec': 'Power Mode',
  'mixtral-8x7b-32768': 'Quick Reply',
  'gemma-7b-it': 'Light Speed',
  // Planner (xAI)
  'grok-3': 'Master Plan',
  'grok-2-mini': 'Quick Plan',
  // Code Expert (Anthropic)
  'claude-sonnet-4-20250514': 'Pro Coder',
  'claude-3-opus-20240229': 'Senior Dev',
  'claude-3-haiku-20240307': 'Quick Fix',
  // Designer (OpenAI)
  'gpt-4.1': 'Creative Pro',
  'gpt-4-turbo': 'Fast Design',
  'gpt-3.5-turbo': 'Quick Sketch',
  // Writer (Mistral)
  'mistral-large-2411': 'Bestseller',
  'mistral-medium-latest': 'Story Mode',
  'mixtral-8x7b-instruct': 'Quick Draft',
  // Researcher (Gemini)
  'gemini-2.0-flash': 'Deep Dive',
  'gemini-1.5-pro': 'Analysis Pro',
  'gemini-1.5-flash': 'Quick Search',
};

// AI Providers with their models - exported for use in SettingsPanel
export const AI_PROVIDERS = [
  { id: 'cerebras', name: 'Maula AI', icon: '🧠', color: 'from-purple-500 to-pink-600', models: ['llama-3.3-70b'], defaultModel: 'llama-3.3-70b', description: 'Ultra Fast', status: 'active' },
  { id: 'groq', name: 'One Last AI', icon: '⚡', color: 'from-green-500 to-emerald-600', models: ['llama-3.3-70b-specdec', 'mixtral-8x7b-32768', 'gemma-7b-it'], defaultModel: 'llama-3.3-70b-specdec', description: 'Power Mode', status: 'active' },
  { id: 'xai', name: 'Planner', icon: '📋', color: 'from-gray-400 to-gray-600', models: ['grok-3', 'grok-2-mini'], defaultModel: 'grok-3', description: 'Master Plan', status: 'active' },
  { id: 'anthropic', name: 'Code Expert', icon: '💻', color: 'from-orange-500 to-amber-600', models: ['claude-sonnet-4-20250514', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'], defaultModel: 'claude-sonnet-4-20250514', description: 'Pro Coder', status: 'active' },
  { id: 'openai', name: 'Designer', icon: '🎨', color: 'from-teal-500 to-cyan-600', models: ['gpt-4.1', 'gpt-4-turbo', 'gpt-3.5-turbo'], defaultModel: 'gpt-4.1', description: 'Creative Pro', status: 'active' },
  { id: 'mistral', name: 'Writer', icon: '✍️', color: 'from-blue-500 to-indigo-600', models: ['mistral-large-2411', 'mistral-medium-latest', 'mixtral-8x7b-instruct'], defaultModel: 'mistral-large-2411', description: 'Bestseller', status: 'active' },
  { id: 'gemini', name: 'Researcher', icon: '🔬', color: 'from-blue-400 to-violet-600', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'], defaultModel: 'gemini-2.0-flash', description: 'Deep Dive', status: 'active' },
];

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose, onModuleSelect, currentSettings, onSettingsChange }) => {
  const [renderNodes, setRenderNodes] = useState(false);
  // Initialize from currentSettings
  const [selectedProvider, setSelectedProvider] = useState(currentSettings?.provider || 'anthropic');
  const [selectedModel, setSelectedModel] = useState(currentSettings?.model || 'Claude 3.5 Sonnet');
  
  // Chart bars - generated once on client to avoid hydration mismatch
  const [chartBars, setChartBars] = useState<Array<{height: number; isFailed: boolean}>>([]);
  
  // Generate chart bars on client only
  useEffect(() => {
    setChartBars(
      [...Array(48)].map(() => ({
        height: 20 + Math.random() * 80,
        isFailed: Math.random() > 0.95
      }))
    );
  }, []);
  
  // Live stats simulation
  const [stats, setStats] = useState({
    tokensUsed: 124500,
    tokensLimit: 500000,
    successRate: 98.5,
    avgLatency: 245,
    requestsToday: 1247,
    activeConnections: 3,
    uptime: 99.9,
    costToday: 12.45
  });

  // Sync with external settings when drawer opens
  useEffect(() => {
    if (isOpen && currentSettings) {
      setSelectedProvider(currentSettings.provider || 'anthropic');
      setSelectedModel(currentSettings.model || 'Claude 3.5 Sonnet');
    }
  }, [isOpen, currentSettings]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setRenderNodes(true), 200);
      return () => clearTimeout(timer);
    } else {
      setRenderNodes(false);
    }
  }, [isOpen]);

  // Update settings when provider/model changes
  const handleProviderChange = (providerId: string, model?: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      const firstModel = typeof provider.models[0] === 'object' ? provider.models[0].id : provider.models[0];
      const newModel = model || firstModel;
      setSelectedProvider(providerId);
      setSelectedModel(newModel);
      onSettingsChange({
        ...currentSettings,
        provider: providerId,
        model: newModel
      });
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onSettingsChange({
      ...currentSettings,
      model: model
    });
  };

  // Simulate live updates
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tokensUsed: prev.tokensUsed + Math.floor(Math.random() * 100),
        avgLatency: 200 + Math.floor(Math.random() * 100),
        requestsToday: prev.requestsToday + Math.floor(Math.random() * 3),
        successRate: 97 + Math.random() * 3
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div 
      className={`fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl z-[200] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col shadow-[0_-30px_100px_rgba(0,0,0,0.9)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
    >
      {/* Decorative Matrix Scan Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[length:100%_4px] animate-[pulse_3s_infinite]"></div>
      </div>

      {/* Compact Header */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Cpu size={20} className="text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-emerald-400 font-bold text-lg tracking-[0.2em] font-mono leading-none">
              AI_PROVIDER_HUB
            </h3>
            <p className="text-[9px] text-emerald-600/60 uppercase font-mono tracking-[0.3em] mt-1">
              STATUS: <span className="text-emerald-400">ONLINE</span> | LATENCY: <span className="text-emerald-400">{stats.avgLatency}MS</span>
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/5 rounded-full border border-gray-800 hover:border-red-500/20 transition-all"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Provider Selection Grid - Compact 30% */}
      <div className="px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Select Provider</span>
          <span className="text-[10px] text-emerald-500/70 font-mono">7 PROVIDERS AVAILABLE</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {AI_PROVIDERS.map((provider, idx) => (
            <button 
              key={provider.id}
              onClick={() => handleProviderChange(provider.id)}
              style={{ animationDelay: `${idx * 50}ms`, display: renderNodes ? 'flex' : 'none' }}
              className={`stagger-node relative group p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                selectedProvider === provider.id
                  ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'border-gray-800/50 bg-black/40 hover:border-emerald-500/30 hover:bg-emerald-500/5'
              }`}
            >
              {selectedProvider === provider.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-black" />
                </div>
              )}
              <span className="text-2xl">{provider.icon}</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${selectedProvider === provider.id ? 'text-emerald-400' : 'text-gray-500'}`}>
                {provider.name}
              </span>
              {provider.status === 'beta' && (
                <span className="absolute top-1 left-1 text-[7px] px-1 bg-purple-500/30 text-purple-400 rounded">BETA</span>
              )}
            </button>
          ))}
        </div>

        {/* Model Selection for Current Provider */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[9px] text-gray-600 font-mono uppercase tracking-wider mr-2">Models:</span>
          {currentProvider?.models.map((model) => {
            const modelId = typeof model === 'object' ? model.id : model;
            const modelName = typeof model === 'object' ? model.name : MODEL_DISPLAY_NAMES[model] || model;
            return (
              <button
                key={modelId}
                onClick={() => handleModelChange(modelId)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all ${
                  selectedModel === modelId
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-gray-900/50 text-gray-500 border border-gray-800 hover:border-emerald-500/30 hover:text-gray-400'
                }`}
              >
                {modelName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Dashboard - 70% */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        {/* Current Model Info Banner */}
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${currentProvider?.color} bg-opacity-10 border border-emerald-500/20`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentProvider?.icon}</span>
              <div>
                <div className="text-lg font-bold text-white">{MODEL_DISPLAY_NAMES[selectedModel] || selectedModel}</div>
                <div className="text-[10px] text-gray-300 uppercase tracking-widest">{currentProvider?.name} • Active Session</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-mono">LIVE</span>
            </div>
          </div>
        </div>

        {/* Gauge Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Token Usage Gauge */}
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Tokens Used</span>
              <Gauge size={14} className="text-cyan-500" />
            </div>
            <div className="relative h-24 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" stroke="#06b6d4" strokeWidth="6"
                  strokeDasharray={`${(stats.tokensUsed / stats.tokensLimit) * 220} 220`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-lg font-bold text-cyan-400">{Math.round((stats.tokensUsed / stats.tokensLimit) * 100)}%</div>
                <div className="text-[8px] text-gray-500 uppercase">Used</div>
              </div>
            </div>
            <div className="text-center text-[10px] text-gray-400 font-mono mt-2">
              {(stats.tokensUsed / 1000).toFixed(1)}K / {(stats.tokensLimit / 1000).toFixed(0)}K
            </div>
          </div>

          {/* Success Rate Gauge */}
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Success Rate</span>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div className="relative h-24 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" stroke="#10b981" strokeWidth="6"
                  strokeDasharray={`${(stats.successRate / 100) * 220} 220`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-lg font-bold text-emerald-400">{stats.successRate.toFixed(1)}%</div>
                <div className="text-[8px] text-gray-500 uppercase">Rate</div>
              </div>
            </div>
            <div className="text-center text-[10px] text-gray-400 font-mono mt-2">
              {stats.requestsToday} requests today
            </div>
          </div>

          {/* Latency Gauge */}
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 hover:border-yellow-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Avg Latency</span>
              <Clock size={14} className="text-yellow-500" />
            </div>
            <div className="relative h-24 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" stroke="#eab308" strokeWidth="6"
                  strokeDasharray={`${Math.min((stats.avgLatency / 500) * 220, 220)} 220`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-lg font-bold text-yellow-400">{stats.avgLatency}</div>
                <div className="text-[8px] text-gray-500 uppercase">MS</div>
              </div>
            </div>
            <div className="text-center text-[10px] text-gray-400 font-mono mt-2">
              Target: &lt;300ms
            </div>
          </div>

          {/* Uptime Gauge */}
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Uptime</span>
              <Server size={14} className="text-purple-500" />
            </div>
            <div className="relative h-24 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" stroke="#a855f7" strokeWidth="6"
                  strokeDasharray={`${(stats.uptime / 100) * 220} 220`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-lg font-bold text-purple-400">{stats.uptime}%</div>
                <div className="text-[8px] text-gray-500 uppercase">UP</div>
              </div>
            </div>
            <div className="text-center text-[10px] text-gray-400 font-mono mt-2">
              Last 30 days
            </div>
          </div>
        </div>

        {/* Live Activity Chart */}
        <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">Live Request Activity</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] text-gray-500">Success</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[9px] text-gray-500">Failed</span>
              </div>
            </div>
          </div>
          <div className="h-32 flex items-end gap-1">
            {chartBars.map((bar, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t transition-all ${bar.isFailed ? 'bg-red-500/60' : 'bg-emerald-500/40 hover:bg-emerald-500/60'}`}
                style={{ height: `${bar.height}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[8px] text-gray-600 font-mono">
            <span>24h ago</span>
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 text-center hover:border-cyan-500/30 transition-all">
            <div className="text-2xl font-bold text-cyan-400">{stats.activeConnections}</div>
            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mt-1">Active Connections</div>
          </div>
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 text-center hover:border-emerald-500/30 transition-all">
            <div className="text-2xl font-bold text-emerald-400">${stats.costToday.toFixed(2)}</div>
            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mt-1">Cost Today</div>
          </div>
          <div className="bg-black/40 border border-gray-800/50 rounded-xl p-4 text-center hover:border-purple-500/30 transition-all">
            <div className="text-2xl font-bold text-purple-400">7</div>
            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mt-1">Providers Online</div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-[#080808]/50 flex justify-between items-center border-t border-gray-800/50">
        <div className="flex items-center gap-3">
          <Activity size={14} className="text-emerald-600 animate-pulse" />
          <span className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-widest">
            NEURAL_SYNC: {selectedModel.toUpperCase().replace(/ /g, '_')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`w-1 h-3 ${i < 6 ? 'bg-emerald-500/30' : 'bg-gray-800'} animate-pulse`} style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>
          <Zap size={14} className="text-emerald-900/50" />
        </div>
      </div>

      <style>{`
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .stagger-node { animation: stagger-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default NavigationDrawer;
