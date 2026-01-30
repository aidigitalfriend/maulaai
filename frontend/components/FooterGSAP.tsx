'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function FooterGSAP() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const footerLinks = [
    { name: 'Agents', href: '/agents' },
    { name: 'AI Studio', href: '/studio' },
    { name: 'AI Lab', href: '/lab' },
    { name: 'Industries', href: '/industries' },
    { name: 'Pricing', href: '/pricing/overview' },
    { name: 'Dashboard', href: '/dashboard/overview' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Community', href: '/community/overview' },
    { name: 'Resources', href: '/resources' },
    { name: 'Careers', href: '/resources/careers' },
    { name: 'All Tools', href: '/tools' },
    { name: 'Status', href: '/status' },
    { name: 'Rewards', href: '/rewards' },
    { name: 'API', href: '/docs/api' },
    { name: 'Blog', href: '/blog' },
  ];

  const bottomLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Legal', href: '/legal' },
    { name: 'Security', href: '/security' },
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/maulaai', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    )},
    { name: 'Discord', href: 'https://discord.gg/maulaai', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
    )},
    { name: 'GitHub', href: 'https://github.com/maulaai', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
    )},
    { name: 'LinkedIn', href: 'https://linkedin.com/company/maulaai', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    )},
  ];

  return (
    <footer 
      className="relative bg-[#0a0a10] border-t border-white/5 w-full overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full filter blur-[200px]"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[200px]"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 container-custom py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Brand & Social */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl group-hover:bg-blue-500/30 transition-all duration-300"></div>
                <Image
                  src="/images/logos/company-logo.png"
                  alt="Maula AI"
                  width={48}
                  height={48}
                  className="relative w-12 h-12 object-contain"
                />
              </div>
              <span className="brand-name text-2xl font-bold text-white">
                Maula.AI
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Transform your business with intelligent AI agents. 18+ specialized personalities ready to revolutionize how you work.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right Column: Navigation Links */}
          <div className="lg:col-span-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
              Quick Links
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-8 gap-y-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="footer-link text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-10 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-2">Stay in the loop</h4>
              <p className="text-gray-500 text-sm mb-4">Get the latest updates on new features and announcements.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="text-emerald-400 text-sm flex items-center gap-2 mt-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Thanks for subscribing!
                </p>
              )}
            </div>

            {/* Right: App Store badges */}
            <div className="flex flex-wrap gap-3 md:justify-end">
              {/* App Store Badge */}
              <div className="app-badge relative group">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-not-allowed">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 leading-tight">Download on the</span>
                    <span className="text-sm font-semibold text-white leading-tight">App Store</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[9px] font-bold text-white shadow-lg">
                  SOON
                </div>
              </div>

              {/* Google Play Badge */}
              <div className="app-badge relative group">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-not-allowed">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 leading-tight">GET IT ON</span>
                    <span className="text-sm font-semibold text-white leading-tight">Google Play</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[9px] font-bold text-white shadow-lg">
                  SOON
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/5">
        <div className="container-custom py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Maula AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {bottomLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
