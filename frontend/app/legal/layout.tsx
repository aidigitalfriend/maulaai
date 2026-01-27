'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const legalLinks = [
  { href: '/legal', label: 'Overview', icon: '⚖️' },
  { href: '/legal/privacy-policy', label: 'Privacy Policy', icon: '🔒' },
  { href: '/legal/terms-of-service', label: 'Terms of Service', icon: '📋' },
  { href: '/legal/cookie-policy', label: 'Cookie Policy', icon: '🍪' },
  { href: '/legal/payments-refunds', label: 'Payments & Refunds', icon: '💳' },
  { href: '/legal/reports', label: 'Reports', icon: '⚠️' },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Animate nav items on load
    gsap.fromTo('.legal-nav-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );

    // Content fade in
    gsap.fromTo('.legal-content',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
              OL
            </div>
            <span className="font-semibold text-lg">One Last AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/legal" className="text-[#00d4ff]">Legal</Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Log In</Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="pt-16 flex">
        {/* Sidebar Navigation */}
        <aside ref={navRef} className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Legal Documents</h3>
            <nav className="space-y-1">
              {legalLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`legal-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' 
                        : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {link.icon}
                    </span>
                    <span className="text-sm font-medium">{link.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Help Box */}
          <div className="p-6 mt-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5">
              <div className="text-2xl mb-3">💬</div>
              <h4 className="font-semibold text-sm mb-2">Need Help?</h4>
              <p className="text-xs text-gray-500 mb-4">Have questions about our legal policies?</p>
              <Link 
                href="/support" 
                className="block w-full text-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 hover:border-[#00d4ff]/30 transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 overflow-x-auto">
          <div className="flex gap-2 p-4">
            {legalLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                    isActive 
                      ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' 
                      : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="legal-content pt-20 lg:pt-0">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="lg:ml-64 py-8 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2026 One Last AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-[#00d4ff]/5 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-[#0066ff]/5 via-transparent to-transparent blur-3xl"></div>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
