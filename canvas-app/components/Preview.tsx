
import React, { useEffect, useRef } from 'react';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && code) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code]);

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gradient-to-br from-gray-50 via-white to-gray-100 border-2 border-dashed border-gray-200 rounded-xl m-4 p-6 overflow-hidden">
        {/* ASCII Art Logo - Responsive */}
        <div className="mb-6 text-center">
          <pre className="hidden md:block font-mono text-[10px] sm:text-xs leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 font-bold select-none">
{`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║     ██████╗ ███╗   ██╗███████╗    ██╗      █████╗     ║
    ║    ██╔═══██╗████╗  ██║██╔════╝    ██║     ██╔══██╗    ║
    ║    ██║   ██║██╔██╗ ██║█████╗      ██║     ███████║    ║
    ║    ██║   ██║██║╚██╗██║██╔══╝      ██║     ██╔══██║    ║
    ║    ╚██████╔╝██║ ╚████║███████╗    ███████╗██║  ██║    ║
    ║     ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚══════╝╚═╝  ╚═╝    ║
    ║                                                       ║
    ║         █████╗ ██╗    ██████╗ ██╗   ██╗██╗██╗         ║
    ║        ██╔══██╗██║    ██╔══██╗██║   ██║██║██║         ║
    ║        ███████║██║    ██████╔╝██║   ██║██║██║         ║
    ║        ██╔══██║██║    ██╔══██╗██║   ██║██║██║         ║
    ║        ██║  ██║██║    ██████╔╝╚██████╔╝██║███████╗    ║
    ║        ╚═╝  ╚═╝╚═╝    ╚═════╝  ╚═════╝ ╚═╝╚══════╝    ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
`}
          </pre>
          {/* Mobile-friendly compact version */}
          <pre className="md:hidden font-mono text-[8px] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 font-bold select-none">
{`
  ╔═════════════════════════════╗
  ║  ░█▀█░█▀█░█▀▀░░░█░░░█▀█░   ║
  ║  ░█░█░█░█░█▀▀░░░█░░░█▀█░   ║
  ║  ░▀▀▀░▀░▀░▀▀▀░░░▀▀▀░▀░▀░   ║
  ║    █▀█░▀█▀░░░█▀▄░█░█░▀█▀   ║
  ║    █▀█░░█░░░░█▀▄░█░█░░█░   ║
  ║    ▀░▀░▀▀▀░░░▀▀░░▀▀▀░▀▀▀   ║
  ╚═════════════════════════════╝
`}
          </pre>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
        </div>

        {/* Icon */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Text content */}
        <p className="text-base sm:text-lg font-semibold text-gray-600 mb-1">Your preview will appear here</p>
        <p className="text-xs sm:text-sm text-gray-400 text-center max-w-xs">Describe your app idea and click "Generate" to bring it to life</p>
        
        {/* Tagline */}
        <div className="mt-6 px-4 py-2 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-full border border-emerald-500/20">
          <p className="text-[10px] sm:text-xs font-mono text-emerald-600">
            <span className="opacity-60">{"<"}</span>
            <span className="font-semibold">AI-Powered App Builder</span>
            <span className="opacity-60">{" />"}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b text-xs text-gray-500">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 text-center font-mono opacity-60 truncate">localhost:3000/generated-app</div>
      </div>
      <iframe
        ref={iframeRef}
        title="App Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
      />
    </div>
  );
};

export default Preview;
