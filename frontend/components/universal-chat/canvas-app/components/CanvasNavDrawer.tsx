
import React, { useEffect, useState } from 'react';

interface NavItem {
  label: string;
  icon: string;
  description: string;
  action: string;
}

const CANVAS_NAV_ITEMS: NavItem[] = [
  { label: 'Workspace', icon: '🎯', action: 'workspace', description: 'Project creation hub' },
  { label: 'AI Assistant', icon: '🤖', action: 'assistant', description: 'Neural chat interface' },
  { label: 'History', icon: '📜', action: 'history', description: 'Project archive system' },
  { label: 'Files', icon: '📁', action: 'files', description: 'Asset management' },
  { label: 'Tools', icon: '⚡', action: 'tools', description: 'Enhancement modules' },
  { label: 'Settings', icon: '⚙️', action: 'settings', description: 'System configuration' },
  { label: 'Templates', icon: '📋', action: 'templates', description: 'Starter blueprints' },
  { label: 'Main App', icon: '🏠', action: 'home', description: 'Return to neural hub' },
];

interface CanvasNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (action: string) => void;
  isDarkMode: boolean;
}

const CanvasNavDrawer: React.FC<CanvasNavDrawerProps> = ({ isOpen, onClose, onNavigate, isDarkMode }) => {
  const [renderNodes, setRenderNodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setRenderNodes(true), 200);
      return () => clearTimeout(timer);
    } else {
      setRenderNodes(false);
    }
  }, [isOpen]);

  const handleNavigate = (action: string) => {
    onNavigate(action);
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl z-[200] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
    >
      {/* Decorative Scan Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[length:100%_4px] animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between p-6 sm:p-10 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <span className="text-3xl">🎨</span>
            </div>
            <div>
              <h3 className="text-cyan-400 font-bold text-xl sm:text-3xl tracking-[0.2em] font-mono leading-none">
                CANVAS_NAVIGATOR
              </h3>
              <p className="text-[10px] sm:text-xs text-cyan-600/60 uppercase font-mono tracking-[0.3em] mt-2 font-bold flex items-center gap-4">
                BUILD STATUS: <span className="text-cyan-400">READY</span> 
                <span className="text-gray-800">|</span> 
                MODE: <span className="text-emerald-400">CREATIVE</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid of Navigation Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 flex-grow overflow-y-auto custom-scrollbar px-6 sm:px-10 pb-6 relative z-10">
        {CANVAS_NAV_ITEMS.map((item, idx) => (
          <button 
            key={item.label}
            onClick={() => handleNavigate(item.action)}
            style={{ 
              animationDelay: `${idx * 60}ms`,
              display: renderNodes ? 'flex' : 'none'
            }}
            className="stagger-node relative group p-6 sm:p-8 rounded-xl border border-gray-800/50 bg-black/40 hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all flex flex-col items-start text-left overflow-hidden active:scale-[0.98]"
          >
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors"></div>

            {/* Node ID Header */}
            <div className="w-full flex justify-between items-center mb-4">
              <div className="text-[9px] text-gray-700 font-mono tracking-[0.4em] group-hover:text-cyan-600 transition-colors uppercase font-bold">
                MODULE_0{idx + 1}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="mb-4 text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
              {item.icon}
            </div>
            
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs sm:text-sm uppercase font-bold tracking-[0.2em] text-gray-400 group-hover:text-cyan-400 transition-colors">
                {item.label}
              </span>
              <p className="text-[9px] sm:text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors font-mono leading-relaxed">
                {item.description.toUpperCase()}
              </p>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-2 h-1 ${i < 3 ? 'bg-cyan-900' : 'bg-gray-900'} group-hover:bg-cyan-500 transition-colors`}></div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-6 sm:p-8 bg-[#080808]/50 flex justify-between items-center relative overflow-hidden">
        <div className="flex gap-6 items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-[10px] sm:text-xs text-cyan-500/70 font-mono uppercase tracking-[0.3em] font-bold">
              NEURAL_CANVAS_ACTIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          {/* Exit Space Button */}
          <button
            onClick={() => {
              onClose();
              // Send message to parent window to close the drawer
              window.parent.postMessage('close-canvas-drawer', '*');
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/40 hover:to-orange-600/40 border border-red-500/50 hover:border-red-400 rounded-lg flex items-center gap-2 text-red-400 hover:text-red-300 transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Exit Space</span>
          </button>
          
          <div className="flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`w-1 h-3 border border-cyan-900/40 ${i < 5 ? 'bg-cyan-500/20' : 'bg-transparent'} animate-pulse`} style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>
          <span className="text-cyan-900/50">⚡</span>
        </div>
      </div>

      <style>{`
        @keyframes stagger-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .stagger-node {
          animation: stagger-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CanvasNavDrawer;
