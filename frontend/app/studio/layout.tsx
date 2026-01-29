'use client';

/**
 * Studio Layout - Full-screen mode without header/footer
 * 
 * This layout wraps the /studio page to hide the global navigation
 * since the universal-chat component has its own header.
 */

import { useEffect } from 'react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide global header and footer when studio is mounted
  useEffect(() => {
    // Add class to body to hide global navigation
    document.body.classList.add('studio-fullscreen');
    
    // Hide the global header and footer
    const globalHeader = document.querySelector('body > div > header');
    const globalFooter = document.querySelector('body > div > footer');
    
    if (globalHeader) {
      (globalHeader as HTMLElement).style.display = 'none';
    }
    if (globalFooter) {
      (globalFooter as HTMLElement).style.display = 'none';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('studio-fullscreen');
      if (globalHeader) {
        (globalHeader as HTMLElement).style.display = '';
      }
      if (globalFooter) {
        (globalFooter as HTMLElement).style.display = '';
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {children}
    </div>
  );
}
