'use client';

import { useRef, useEffect } from 'react';
import { BRAND_COLORS, DEVICE_STYLES } from '../constants';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewPanelProps {
  htmlContent: string;
  device: DeviceType;
  refreshKey: number;
}

export default function PreviewPanel({ htmlContent, device, refreshKey }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const deviceStyle = DEVICE_STYLES[device];

  // Update iframe content when htmlContent changes
  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent, refreshKey]);

  if (!htmlContent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className={`w-16 h-16 rounded-2xl ${BRAND_COLORS.bgGradient} flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className={`font-medium ${BRAND_COLORS.text} mb-2`}>No Preview Available</h3>
          <p className={`text-sm ${BRAND_COLORS.textMuted}`}>
            Generate code from the chat to see a live preview here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
      <div
        className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${deviceStyle.class}`}
        style={{
          width: deviceStyle.width,
          height: deviceStyle.height,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Device Frame Header (for mobile/tablet) */}
        {device !== 'desktop' && (
          <div className="h-6 bg-gray-100 flex items-center justify-center">
            <div className="w-16 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          key={refreshKey}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="Preview"
        />
        
        {/* Device Frame Footer (for mobile) */}
        {device === 'mobile' && (
          <div className="h-4 bg-gray-100 flex items-center justify-center">
            <div className="w-8 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
