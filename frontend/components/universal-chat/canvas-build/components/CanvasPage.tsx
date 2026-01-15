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
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';

// Lazy load Monaco Editor with proper error handling
const MonacoEditor = dynamic(
  () =>
    import('@monaco-editor/react').then((mod) => {
      // Configure loader after module loads
      mod.loader.config({
        paths: {
          vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs',
        },
      });
      return mod.default;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400">Loading code editor...</p>
      </div>
    ),
  }
);

// =============================================================================
// MARKDOWN RENDERER
// =============================================================================

const renderMarkdown = (text: string): string => {
  if (!text) return '';
  return (
    text
      // Bold: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Code: `text`
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-white/10 px-1 py-0.5 rounded text-cyan-300">$1</code>'
      )
      // Links: [text](url)
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-cyan-400 underline" target="_blank">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, '<br />')
  );
};

// Extract only HTML code from mixed response (strips explanatory text)
const extractHtmlFromResponse = (
  response: string
): { html: string; explanation: string } => {
  const trimmed = response.trim();

  // Try to find HTML code block
  const htmlBlockMatch = trimmed.match(/```html\s*([\s\S]*?)```/i);
  if (htmlBlockMatch) {
    const html = htmlBlockMatch[1].trim();
    const explanation = trimmed
      .replace(htmlBlockMatch[0], '')
      .trim()
      .replace(/^[\s\n]+|[\s\n]+$/g, '');
    return { html, explanation };
  }

  // Try to find <!DOCTYPE html> or <html> tags
  const doctypeMatch = trimmed.match(/<!DOCTYPE\s+html[\s\S]*$/i);
  if (doctypeMatch) {
    const htmlStart = trimmed.indexOf(doctypeMatch[0]);
    const explanation = trimmed.substring(0, htmlStart).trim();
    return { html: doctypeMatch[0], explanation };
  }

  const htmlTagMatch = trimmed.match(/<html[\s\S]*<\/html>/i);
  if (htmlTagMatch) {
    const htmlStart = trimmed.indexOf(htmlTagMatch[0]);
    const htmlEnd = htmlStart + htmlTagMatch[0].length;
    const beforeText = trimmed.substring(0, htmlStart).trim();
    const afterText = trimmed.substring(htmlEnd).trim();
    const explanation = [beforeText, afterText].filter(Boolean).join('\n\n');
    return { html: htmlTagMatch[0], explanation };
  }

  // No HTML found, return as explanation
  return { html: '', explanation: trimmed };
};

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
// TEMPLATES (Quick prompts for AI generation)
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

// =============================================================================
// BUILT-IN TEMPLATES (Ready-to-use HTML templates - no AI needed)
// =============================================================================

const BUILTIN_TEMPLATES = [
  {
    id: 'bt1',
    name: 'Modern Landing Page',
    category: 'Landing',
    icon: '🚀',
    description: 'A clean, modern landing page with hero, features, and CTA sections.',
    thumbnail: '🌐',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .glass { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
  </style>
</head>
<body class="bg-gray-900 text-white">
  <!-- Navigation -->
  <nav class="fixed w-full z-50 glass border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Brand</div>
      <div class="hidden md:flex gap-8">
        <a href="#features" class="hover:text-purple-400 transition">Features</a>
        <a href="#pricing" class="hover:text-purple-400 transition">Pricing</a>
        <a href="#about" class="hover:text-purple-400 transition">About</a>
        <a href="#contact" class="hover:text-purple-400 transition">Contact</a>
      </div>
      <button class="gradient-bg px-6 py-2 rounded-full font-medium hover:opacity-90 transition">Get Started</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="min-h-screen flex items-center justify-center pt-20 px-6">
    <div class="max-w-4xl text-center">
      <span class="inline-block px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6">✨ New Feature Released</span>
      <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
        Build Amazing
        <span class="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"> Products</span>
        Faster
      </h1>
      <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        The all-in-one platform to design, develop, and deploy your next big idea. Start building today with our powerful tools.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="gradient-bg px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/25">
          Start Free Trial
        </button>
        <button class="px-8 py-4 rounded-full font-semibold text-lg border border-white/20 hover:bg-white/5 transition">
          Watch Demo →
        </button>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4">Powerful Features</h2>
        <p class="text-gray-400 text-lg">Everything you need to succeed</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition group">
          <div class="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 text-2xl">⚡</div>
          <h3 class="text-xl font-semibold mb-3">Lightning Fast</h3>
          <p class="text-gray-400">Optimized performance for the best user experience. Load times under 100ms.</p>
        </div>
        <div class="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition group">
          <div class="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 text-2xl">🔒</div>
          <h3 class="text-xl font-semibold mb-3">Secure by Default</h3>
          <p class="text-gray-400">Enterprise-grade security with end-to-end encryption and compliance.</p>
        </div>
        <div class="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition group">
          <div class="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 text-2xl">🎨</div>
          <h3 class="text-xl font-semibold mb-3">Beautiful Design</h3>
          <p class="text-gray-400">Modern, responsive designs that look great on any device.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-24 px-6">
    <div class="max-w-4xl mx-auto text-center gradient-bg rounded-3xl p-12">
      <h2 class="text-4xl font-bold mb-4">Ready to Get Started?</h2>
      <p class="text-white/80 text-lg mb-8">Join thousands of users already building amazing things.</p>
      <button class="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition">
        Start Your Free Trial
      </button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-white/10 py-12 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Brand</div>
      <p class="text-gray-500">© 2024 Brand. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`,
  },
  {
    id: 'bt2',
    name: 'Dashboard UI',
    category: 'Dashboard',
    icon: '📊',
    description: 'Analytics dashboard with stats cards, charts placeholder, and sidebar.',
    thumbnail: '📈',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .gradient-card { background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); }
  </style>
</head>
<body class="bg-gray-950 text-white min-h-screen">
  <div class="flex">
    <!-- Sidebar -->
    <aside class="w-64 min-h-screen bg-gray-900 border-r border-gray-800 p-6 fixed">
      <div class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-8">Dashboard</div>
      <nav class="space-y-2">
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-500/20 text-indigo-400">
          <span>📊</span> Overview
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400">
          <span>📈</span> Analytics
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400">
          <span>👥</span> Users
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400">
          <span>💳</span> Billing
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400">
          <span>⚙️</span> Settings
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="ml-64 flex-1 p-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold">Welcome back, Alex!</h1>
          <p class="text-gray-500 mt-1">Here's what's happening with your projects.</p>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-3 rounded-lg bg-gray-800 hover:bg-gray-700">🔔</button>
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500">Total Revenue</span>
            <span class="text-green-400 text-sm">+12.5%</span>
          </div>
          <div class="text-3xl font-bold">$45,231</div>
          <div class="text-gray-500 text-sm mt-1">vs last month</div>
        </div>
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500">Active Users</span>
            <span class="text-green-400 text-sm">+8.2%</span>
          </div>
          <div class="text-3xl font-bold">2,345</div>
          <div class="text-gray-500 text-sm mt-1">vs last month</div>
        </div>
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500">Conversion Rate</span>
            <span class="text-red-400 text-sm">-2.1%</span>
          </div>
          <div class="text-3xl font-bold">3.42%</div>
          <div class="text-gray-500 text-sm mt-1">vs last month</div>
        </div>
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <div class="flex justify-between items-start mb-4">
            <span class="text-gray-500">Avg. Session</span>
            <span class="text-green-400 text-sm">+5.8%</span>
          </div>
          <div class="text-3xl font-bold">4m 32s</div>
          <div class="text-gray-500 text-sm mt-1">vs last month</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <h3 class="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div class="h-64 flex items-end justify-around gap-2">
            <div class="w-12 bg-indigo-500/50 rounded-t" style="height: 40%"></div>
            <div class="w-12 bg-indigo-500/50 rounded-t" style="height: 65%"></div>
            <div class="w-12 bg-indigo-500/50 rounded-t" style="height: 45%"></div>
            <div class="w-12 bg-indigo-500/50 rounded-t" style="height: 80%"></div>
            <div class="w-12 bg-indigo-500/50 rounded-t" style="height: 55%"></div>
            <div class="w-12 bg-indigo-500 rounded-t" style="height: 90%"></div>
            <div class="w-12 bg-indigo-500/50 rounded-t" style="height: 70%"></div>
          </div>
          <div class="flex justify-around text-gray-500 text-sm mt-4">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
          <h3 class="text-lg font-semibold mb-4">Traffic Sources</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-2"><span>Direct</span><span class="text-gray-500">45%</span></div>
              <div class="h-2 bg-gray-800 rounded-full"><div class="h-full w-[45%] bg-indigo-500 rounded-full"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-2"><span>Organic Search</span><span class="text-gray-500">32%</span></div>
              <div class="h-2 bg-gray-800 rounded-full"><div class="h-full w-[32%] bg-purple-500 rounded-full"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-2"><span>Social Media</span><span class="text-gray-500">18%</span></div>
              <div class="h-2 bg-gray-800 rounded-full"><div class="h-full w-[18%] bg-pink-500 rounded-full"></div></div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-2"><span>Referral</span><span class="text-gray-500">5%</span></div>
              <div class="h-2 bg-gray-800 rounded-full"><div class="h-full w-[5%] bg-cyan-500 rounded-full"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800">
        <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5">
            <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">💰</div>
            <div class="flex-1">
              <p class="font-medium">New sale completed</p>
              <p class="text-sm text-gray-500">Order #12345 - $299.00</p>
            </div>
            <span class="text-gray-500 text-sm">2 min ago</span>
          </div>
          <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5">
            <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">👤</div>
            <div class="flex-1">
              <p class="font-medium">New user registered</p>
              <p class="text-sm text-gray-500">john.doe@example.com</p>
            </div>
            <span class="text-gray-500 text-sm">15 min ago</span>
          </div>
          <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5">
            <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">📊</div>
            <div class="flex-1">
              <p class="font-medium">Report generated</p>
              <p class="text-sm text-gray-500">Monthly analytics report</p>
            </div>
            <span class="text-gray-500 text-sm">1 hour ago</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`,
  },
  {
    id: 'bt3',
    name: 'Portfolio Site',
    category: 'Portfolio',
    icon: '👨‍💼',
    description: 'Creative portfolio with project gallery, about section, and contact form.',
    thumbnail: '🎨',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creative Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
    .gradient-text { background: linear-gradient(135deg, #f97316, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card-hover:hover { transform: translateY(-8px); }
  </style>
</head>
<body class="bg-black text-white">
  <!-- Navigation -->
  <nav class="fixed w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
    <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <div class="text-2xl font-bold gradient-text">JD.</div>
      <div class="hidden md:flex gap-8">
        <a href="#work" class="hover:text-orange-400 transition">Work</a>
        <a href="#about" class="hover:text-orange-400 transition">About</a>
        <a href="#skills" class="hover:text-orange-400 transition">Skills</a>
        <a href="#contact" class="hover:text-orange-400 transition">Contact</a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="min-h-screen flex items-center px-6 pt-20">
    <div class="max-w-6xl mx-auto">
      <p class="text-orange-400 text-lg mb-4">Hello, I'm</p>
      <h1 class="text-6xl md:text-8xl font-bold mb-6">
        John <span class="gradient-text">Designer</span>
      </h1>
      <p class="text-xl text-gray-400 max-w-xl mb-8">
        A creative designer & developer crafting beautiful digital experiences that bring ideas to life.
      </p>
      <div class="flex gap-4">
        <a href="#work" class="px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition">View Work</a>
        <a href="#contact" class="px-8 py-4 border border-white/30 rounded-full font-semibold hover:bg-white/10 transition">Get in Touch</a>
      </div>
    </div>
  </section>

  <!-- Projects -->
  <section id="work" class="py-24 px-6">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-4xl font-bold mb-12">Featured <span class="gradient-text">Work</span></h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div class="group card-hover transition-all duration-300">
          <div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 overflow-hidden mb-4">
            <div class="w-full h-full flex items-center justify-center text-6xl">🎨</div>
          </div>
          <h3 class="text-xl font-semibold group-hover:text-orange-400 transition">Brand Identity Design</h3>
          <p class="text-gray-500">Branding, UI/UX</p>
        </div>
        <div class="group card-hover transition-all duration-300">
          <div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 overflow-hidden mb-4">
            <div class="w-full h-full flex items-center justify-center text-6xl">📱</div>
          </div>
          <h3 class="text-xl font-semibold group-hover:text-orange-400 transition">Mobile App Design</h3>
          <p class="text-gray-500">UI/UX, Prototyping</p>
        </div>
        <div class="group card-hover transition-all duration-300">
          <div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-white/10 overflow-hidden mb-4">
            <div class="w-full h-full flex items-center justify-center text-6xl">🌐</div>
          </div>
          <h3 class="text-xl font-semibold group-hover:text-orange-400 transition">E-commerce Website</h3>
          <p class="text-gray-500">Web Design, Development</p>
        </div>
        <div class="group card-hover transition-all duration-300">
          <div class="aspect-[4/3] rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-white/10 overflow-hidden mb-4">
            <div class="w-full h-full flex items-center justify-center text-6xl">📊</div>
          </div>
          <h3 class="text-xl font-semibold group-hover:text-orange-400 transition">Dashboard UI Kit</h3>
          <p class="text-gray-500">UI Design, Components</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Skills -->
  <section id="skills" class="py-24 px-6 bg-white/5">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-4xl font-bold mb-12">My <span class="gradient-text">Skills</span></h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="p-6 rounded-2xl bg-black border border-white/10 text-center hover:border-orange-500/50 transition">
          <div class="text-4xl mb-3">🎨</div>
          <p class="font-medium">UI/UX Design</p>
        </div>
        <div class="p-6 rounded-2xl bg-black border border-white/10 text-center hover:border-orange-500/50 transition">
          <div class="text-4xl mb-3">⚛️</div>
          <p class="font-medium">React</p>
        </div>
        <div class="p-6 rounded-2xl bg-black border border-white/10 text-center hover:border-orange-500/50 transition">
          <div class="text-4xl mb-3">🎭</div>
          <p class="font-medium">Figma</p>
        </div>
        <div class="p-6 rounded-2xl bg-black border border-white/10 text-center hover:border-orange-500/50 transition">
          <div class="text-4xl mb-3">💻</div>
          <p class="font-medium">TypeScript</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact -->
  <section id="contact" class="py-24 px-6">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-4xl font-bold mb-4">Let's <span class="gradient-text">Connect</span></h2>
      <p class="text-gray-400 mb-8">Have a project in mind? Let's create something amazing together.</p>
      <form class="space-y-4">
        <input type="text" placeholder="Your Name" class="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 outline-none transition">
        <input type="email" placeholder="Your Email" class="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 outline-none transition">
        <textarea placeholder="Your Message" rows="4" class="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500 outline-none transition resize-none"></textarea>
        <button type="submit" class="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition">Send Message</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 border-t border-white/10 text-center text-gray-500">
    <p>© 2024 John Designer. Built with ❤️</p>
  </footer>
</body>
</html>`,
  },
  {
    id: 'bt4',
    name: 'Pricing Page',
    category: 'Components',
    icon: '💎',
    description: 'Beautiful pricing table with 3 tiers and feature comparison.',
    thumbnail: '💰',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing Plans</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .popular-glow { box-shadow: 0 0 60px rgba(99, 102, 241, 0.3); }
  </style>
</head>
<body class="bg-gray-950 text-white min-h-screen py-20 px-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-16">
      <span class="inline-block px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">Pricing</span>
      <h1 class="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">Choose the plan that fits your needs. All plans include a 14-day free trial.</p>
      
      <!-- Toggle -->
      <div class="flex items-center justify-center gap-4 mt-8">
        <span class="text-gray-400">Monthly</span>
        <button class="w-14 h-8 bg-indigo-500 rounded-full relative">
          <div class="w-6 h-6 bg-white rounded-full absolute right-1 top-1"></div>
        </button>
        <span class="text-white font-medium">Yearly <span class="text-green-400 text-sm">Save 20%</span></span>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="grid md:grid-cols-3 gap-8">
      <!-- Starter -->
      <div class="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition">
        <div class="text-gray-400 font-medium mb-2">Starter</div>
        <div class="flex items-baseline gap-2 mb-6">
          <span class="text-5xl font-bold">$9</span>
          <span class="text-gray-500">/month</span>
        </div>
        <p class="text-gray-400 mb-8">Perfect for individuals and small projects.</p>
        <button class="w-full py-4 rounded-xl border border-gray-700 font-semibold hover:bg-white/5 transition">Get Started</button>
        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> 5 Projects
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> 10GB Storage
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Basic Analytics
          </div>
          <div class="flex items-center gap-3 text-gray-500">
            <span>✗</span> Priority Support
          </div>
          <div class="flex items-center gap-3 text-gray-500">
            <span>✗</span> Custom Domain
          </div>
        </div>
      </div>

      <!-- Pro (Popular) -->
      <div class="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/50 to-gray-900 border-2 border-indigo-500 popular-glow relative transform scale-105">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 rounded-full text-sm font-medium">Most Popular</div>
        <div class="text-indigo-400 font-medium mb-2">Pro</div>
        <div class="flex items-baseline gap-2 mb-6">
          <span class="text-5xl font-bold">$29</span>
          <span class="text-gray-500">/month</span>
        </div>
        <p class="text-gray-400 mb-8">Best for growing teams and businesses.</p>
        <button class="w-full py-4 rounded-xl bg-indigo-500 font-semibold hover:bg-indigo-400 transition">Get Started</button>
        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Unlimited Projects
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> 100GB Storage
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Advanced Analytics
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Priority Support
          </div>
          <div class="flex items-center gap-3 text-gray-500">
            <span>✗</span> Custom Domain
          </div>
        </div>
      </div>

      <!-- Enterprise -->
      <div class="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition">
        <div class="text-gray-400 font-medium mb-2">Enterprise</div>
        <div class="flex items-baseline gap-2 mb-6">
          <span class="text-5xl font-bold">$99</span>
          <span class="text-gray-500">/month</span>
        </div>
        <p class="text-gray-400 mb-8">For large teams with advanced needs.</p>
        <button class="w-full py-4 rounded-xl border border-gray-700 font-semibold hover:bg-white/5 transition">Contact Sales</button>
        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Unlimited Everything
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> 1TB Storage
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Custom Analytics
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> 24/7 Dedicated Support
          </div>
          <div class="flex items-center gap-3 text-gray-300">
            <span class="text-green-400">✓</span> Custom Domain + SSL
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Teaser -->
    <div class="mt-20 text-center">
      <p class="text-gray-400">Have questions? <a href="#" class="text-indigo-400 hover:underline">Check our FAQ</a> or <a href="#" class="text-indigo-400 hover:underline">contact support</a></p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'bt5',
    name: 'Login / Signup Form',
    category: 'Components',
    icon: '🔐',
    description: 'Glassmorphism login form with social login options.',
    thumbnail: '🔑',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); }
    .gradient-border { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); padding: 1px; }
  </style>
</head>
<body class="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
  <!-- Background Decoration -->
  <div class="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
  <div class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

  <!-- Login Card -->
  <div class="gradient-border rounded-3xl">
    <div class="glass rounded-3xl p-8 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
          <span class="text-3xl">✨</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Welcome Back</h1>
        <p class="text-gray-400 mt-2">Sign in to continue to your account</p>
      </div>

      <!-- Social Login -->
      <div class="flex gap-4 mb-6">
        <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white">
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-white">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </button>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-4 mb-6">
        <div class="flex-1 h-px bg-white/10"></div>
        <span class="text-gray-500 text-sm">or continue with email</span>
        <div class="flex-1 h-px bg-white/10"></div>
      </div>

      <!-- Form -->
      <form class="space-y-4">
        <div>
          <label class="text-sm text-gray-400 block mb-2">Email Address</label>
          <input type="email" placeholder="you@example.com" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition">
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm text-gray-400">Password</label>
            <a href="#" class="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</a>
          </div>
          <input type="password" placeholder="••••••••" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-white placeholder-gray-500 transition">
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" id="remember" class="w-4 h-4 rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500">
          <label for="remember" class="text-sm text-gray-400">Remember me for 30 days</label>
        </div>
        <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold text-white hover:opacity-90 transition">
          Sign In
        </button>
      </form>

      <!-- Sign Up Link -->
      <p class="text-center text-gray-400 mt-6">
        Don't have an account? <a href="#" class="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  },
];

const BUILTIN_TEMPLATE_CATEGORIES = ['All', ...Array.from(new Set(BUILTIN_TEMPLATES.map((t) => t.category)))];

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
  const hasLoadedMessages = useRef(false);

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
    'chat' | 'files' | 'preview' | 'templates' | 'code' | 'history' | 'settings'
  >('chat');
  const [splitView, setSplitView] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [showBuiltinTemplatesPanel, setShowBuiltinTemplatesPanel] = useState(false);
  const [builtinTemplateCategory, setBuiltinTemplateCategory] = useState<string>('All');
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('mistral');
  const [selectedModel, setSelectedModel] = useState<string>(
    'mistral-large-latest'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4096);

  // Provider/Model options
  const providerModels: Record<
    string,
    { name: string; models: { id: string; name: string }[] }
  > = {
    mistral: {
      name: 'Mistral AI',
      models: [
        { id: 'mistral-large-latest', name: 'Mistral Large' },
        { id: 'mistral-small-latest', name: 'Mistral Small' },
        { id: 'codestral-latest', name: 'Codestral' },
      ],
    },
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      ],
    },
    anthropic: {
      name: 'Anthropic',
      models: [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      ],
    },
    gemini: {
      name: 'Google Gemini',
      models: [
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      ],
    },
    xai: {
      name: 'xAI (Grok)',
      models: [{ id: 'grok-beta', name: 'Grok Beta' }],
    },
  };

  // Restore chat messages once when opened, or seed with welcome message
  useEffect(() => {
    if (!isOpen || hasLoadedMessages.current) return;
    hasLoadedMessages.current = true;
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('canvasMessages');
      if (stored) {
        const parsed: ChatMessage[] = JSON.parse(stored).map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }

    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hi! 👋 I'm your AI Canvas assistant.\n\nWhat would you like to build today? Tell me about your project - a landing page, dashboard, portfolio, or something else?\n\n**🎨 Image-to-Code:** Upload a design screenshot and I'll recreate it as code!\n\nI'll ask a few questions to understand your needs, then we can start building!`,
        timestamp: new Date(),
      },
    ]);
  }, [isOpen]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mobile orientation detection - show rotate prompt on portrait mobile
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768 || (window.innerWidth < 1024 && 'ontouchstart' in window);
      const isPortrait = window.innerHeight > window.innerWidth;
      
      setIsMobilePortrait(isMobile && isPortrait);
      
      // Show rotate prompt only on first load in portrait mode on mobile
      if (isMobile && isPortrait) {
        setShowRotatePrompt(true);
      } else {
        setShowRotatePrompt(false);
      }
    };

    // Check on mount
    checkOrientation();

    // Listen to orientation/resize changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isOpen]);

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
    const settingsActive = activePane === 'settings';
    setShowChatPanel(chatActive);
    setShowFilesPanel(filesActive);
    setShowHistoryPanel(historyActive || settingsActive);
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
    let cleaned = code.trim();
    // Remove leading markdown code blocks (```html, ```HTML, etc.)
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/gim, '');
    // Remove trailing markdown code blocks
    cleaned = cleaned.replace(/\n?```\s*$/gim, '');
    // Also handle case where ``` appears in the middle (shouldn't happen but just in case)
    cleaned = cleaned.replace(/```\s*$/gm, '');
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

  // Persist chat messages to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(
        messages.map((m) => ({
          ...m,
          timestamp:
            m.timestamp instanceof Date
              ? m.timestamp.toISOString()
              : m.timestamp,
        }))
      );
      localStorage.setItem('canvasMessages', serialized);
    } catch (err) {
      console.error('Failed to save messages', err);
    }
  }, [messages]);

  const updatePreview = useCallback((code: string) => {
    if (previewRef.current) {
      // Comprehensive CSS fix for icons and layout issues
      const iconFixCSS = `
<style>
  /* CRITICAL: Fix for oversized icons - constrain ALL SVGs aggressively */
  svg:not([width]):not([class*="w-"]):not(.chart):not(.graph) { 
    width: 24px !important; 
    height: 24px !important;
    max-width: 48px !important;
    max-height: 48px !important;
    display: inline-block !important;
  }
  
  /* Force constrain all Lucide icons */
  [data-lucide], i[data-lucide], .lucide { 
    width: 24px !important; 
    height: 24px !important;
    max-width: 32px !important;
    max-height: 32px !important;
    display: inline-block !important;
    vertical-align: middle !important;
  }
  
  [data-lucide] svg, i[data-lucide] svg, .lucide svg { 
    width: 100% !important; 
    height: 100% !important;
    max-width: 32px !important;
    max-height: 32px !important;
  }
  
  /* Icons in buttons, links, spans should be constrained */
  button svg, a svg, span svg, div svg, p svg { 
    max-width: 32px !important; 
    max-height: 32px !important; 
  }
  
  /* Hero/feature icons can be slightly larger but still constrained */
  .hero svg, .feature svg, .icon-lg svg, [class*="icon"] svg {
    max-width: 64px !important;
    max-height: 64px !important;
  }
  
  /* Ensure body doesn't have overflowing SVGs */
  body > svg:not([class]) {
    display: none !important;
  }
  
  /* Reset any SVG that might be positioned absolutely and taking full screen */
  svg[style*="position: absolute"], svg[style*="position:absolute"] {
    max-width: 100px !important;
    max-height: 100px !important;
  }
</style>
`;
      // Insert CSS fix before </head> if head exists, otherwise before </body>
      let fixedCode = code;
      if (code.includes('</head>')) {
        fixedCode = code.replace('</head>', iconFixCSS + '</head>');
      } else if (code.includes('</body>')) {
        fixedCode = code.replace('</body>', iconFixCSS + '</body>');
      } else {
        // No head or body tag found, prepend the CSS
        fixedCode = iconFixCSS + code;
      }

      // Also try to initialize Lucide if it's being used
      const lucideInit = `
<script>
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    document.addEventListener('DOMContentLoaded', function() { 
      lucide.createIcons(); 
      // After icons are created, ensure they're sized properly
      document.querySelectorAll('[data-lucide]').forEach(function(el) {
        el.style.width = '24px';
        el.style.height = '24px';
      });
    });
    setTimeout(function() { 
      if (lucide.createIcons) {
        lucide.createIcons(); 
        document.querySelectorAll('[data-lucide]').forEach(function(el) {
          el.style.width = '24px';
          el.style.height = '24px';
        });
      }
    }, 100);
  }
</script>
`;
      if (fixedCode.includes('lucide') || fixedCode.includes('data-lucide')) {
        fixedCode = fixedCode.replace('</body>', lucideInit + '</body>');
      }

      // Use doc.write() with allow-same-origin sandbox (required for external CDN requests)
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(fixedCode);
        doc.close();
      }
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'preview' && !splitView) return;
    const htmlContent =
      selectedFile?.type === 'html' ? selectedFile.content : generatedCode;
    if (htmlContent) {
      updatePreview(htmlContent);
    }
  }, [viewMode, selectedFile, generatedCode, updatePreview, splitView]);

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
    setChatInput('');
    setUploadedFiles([]);
    setIsGenerating(true);
    setShowTemplates(false);
    setGenerationStatus('generating');

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
      // Check if we have image attachments for image-to-code
      const imageAttachments = uploadedFiles.length > 0 
        ? uploadedFiles
            .filter(f => f.type.startsWith('image/'))
            .map(f => ({ url: f.url, type: f.type, name: f.name }))
        : undefined;

      const response = await fetch('/api/canvas/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: userPrompt,
          provider: selectedProvider,
          modelId: selectedModel,
          temperature,
          maxTokens,
          currentCode: generatedCode || undefined,
          history: messages
            .filter((m) => !m.isStreaming)
            .map((m) => ({ role: m.role, text: m.content })),
          imageAttachments, // Send images for image-to-code
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
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
                  fullResponse += chunkContent;

                  // Extract HTML from potentially mixed response
                  const { html } = extractHtmlFromResponse(fullResponse);
                  const hasHtmlCode =
                    html &&
                    (html.includes('<!DOCTYPE') ||
                      html.includes('<html') ||
                      html.includes('<body'));

                  if (hasHtmlCode) {
                    // It's code - update the preview with only the HTML
                    const cleaned = normalizeCode(html);
                    setGeneratedCode(cleaned);

                    // Update files in real-time
                    const files = extractFiles(cleaned);
                    setGeneratedFiles(files);

                    // Update preview in real-time (throttled)
                    if (
                      html.includes('</body>') ||
                      html.includes('</html>') ||
                      fullResponse.length % 500 < 50
                    ) {
                      updatePreview(cleaned);
                    }
                  } else {
                    // It's conversational text - update the chat message
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingMsgId
                          ? { ...m, content: fullResponse }
                          : m
                      )
                    );
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
                  fullResponse += data;
                }
              }
            }
          }
        }
      }

      // Final update - extract HTML and separate explanatory text
      if (fullResponse) {
        const { html, explanation } = extractHtmlFromResponse(fullResponse);

        // Check if we found actual HTML code
        const hasHtmlCode =
          html &&
          (html.includes('<!DOCTYPE') ||
            html.includes('<html') ||
            html.includes('<body'));

        if (hasHtmlCode) {
          // We have HTML code - clean and display it
          const cleaned = normalizeCode(html);
          setGeneratedCode(cleaned);
          updatePreview(cleaned);
          setViewMode('preview');
          const files = extractFiles(cleaned);
          setGeneratedFiles(files);
          setGenerationStatus('success');

          setHistoryEntries((prev) =>
            [
              {
                id: `${Date.now()}`,
                name: summarizePrompt(userPrompt),
                prompt: userPrompt,
                code: cleaned,
                timestamp: Date.now(),
              },
              ...prev,
            ].slice(0, 20)
          );

          // Show explanation in chat if any, otherwise default message
          const chatMessage = explanation
            ? explanation
            : '✨ Done! Your design is ready.\n\nCheck the Preview or Code tab. Want changes? Just describe them!';

          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMsgId
                ? {
                    ...m,
                    content: chatMessage,
                    isStreaming: false,
                  }
                : m
            )
          );
        } else {
          // It's conversational - just finalize the message
          setGenerationStatus('idle');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMsgId
                ? { ...m, content: fullResponse, isStreaming: false }
                : m
            )
          );
        }
      } else {
        throw new Error('No response received');
      }
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

  // Start a new conversation - clears chat and code
  const handleNewConversation = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hi! 👋 I'm your AI Canvas assistant.\n\nWhat would you like to build today? Tell me about your project - a landing page, dashboard, portfolio, or something else?\n\n**🎨 Image-to-Code:** Upload a design screenshot and I'll recreate it as code!\n\nI'll ask a few questions to understand your needs, then we can start building!`,
        timestamp: new Date(),
      },
    ]);
    setGeneratedCode('');
    setGeneratedFiles([]);
    setSelectedFile(null);
    setUploadedFiles([]);
    setChatInput('');
    setActivePane('chat');
  }, []);

  // Load a built-in template directly (no AI interaction)
  const handleLoadBuiltinTemplate = useCallback((template: typeof BUILTIN_TEMPLATES[0]) => {
    // Set the code directly
    const normalizedCode = normalizeCode(template.code);
    setGeneratedCode(normalizedCode);
    
    // Extract files
    const files = extractFiles(normalizedCode);
    setGeneratedFiles(files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
    
    // Update preview
    updatePreview(normalizedCode);
    
    // Add a message to chat about the loaded template
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Loaded **${template.name}** template!\n\n${template.description}\n\nYou can now:\n- View and edit the code\n- See it in the preview\n- Ask me to customize it (change colors, add sections, etc.)\n\nWhat would you like to modify?`,
        timestamp: new Date(),
      },
    ]);
    
    // Save to history
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      name: template.name,
      prompt: `Loaded template: ${template.name}`,
      code: normalizedCode,
      timestamp: Date.now(),
    };
    setHistoryEntries((prev) => [historyEntry, ...prev]);
    
    // Close the panel and switch to preview
    setShowBuiltinTemplatesPanel(false);
    setActivePane('preview');
    setGenerationStatus('success');
  }, [normalizeCode, extractFiles, updatePreview]);

  // Filter built-in templates by category
  const filteredBuiltinTemplates = builtinTemplateCategory === 'All'
    ? BUILTIN_TEMPLATES
    : BUILTIN_TEMPLATES.filter((t) => t.category === builtinTemplateCategory);

  // Filtered history entries based on search
  const filteredHistoryEntries = historySearchQuery.trim()
    ? historyEntries.filter(
        (entry) =>
          entry.name?.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
          entry.prompt?.toLowerCase().includes(historySearchQuery.toLowerCase())
      )
    : historyEntries;

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

      {/* =========== MOBILE ROTATE PROMPT =========== */}
      {showRotatePrompt && isMobilePortrait && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg">
          <div className="text-center p-8 max-w-sm">
            {/* Rotate Phone Icon */}
            <div className="mb-6 relative inline-block">
              <div className="w-20 h-32 border-4 border-cyan-400 rounded-2xl relative mx-auto animate-pulse">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-cyan-400/50 rounded-full" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-cyan-400/50 rounded-full" />
              </div>
              {/* Rotation Arrow */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                <svg className="w-10 h-10 text-purple-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Rotate Your Device</h2>
            <p className="text-gray-400 mb-6">
              For the best Canvas experience, please rotate your phone to <span className="text-cyan-400 font-semibold">landscape mode</span>.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowRotatePrompt(false)}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
              >
                Continue Anyway
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl border border-white/20 text-gray-300 font-medium hover:bg-white/5 transition"
              >
                Go Back
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              📱 Canvas works best in landscape for full access to all features
            </p>
          </div>
        </div>
      )}

      {/* =========== LEFT TOOLBAR =========== */}
      <div
        className={`${showNavOverlay ? 'w-60 items-start' : 'w-14 items-center'} flex flex-col gap-2 py-4 ${brandColors.bgPanel} ${brandColors.border} border-r relative z-20 transition-all duration-300 overflow-y-auto overflow-x-hidden custom-scrollbar`}
      >
        <button
          onClick={() => setShowNavOverlay((v) => !v)}
          className={`p-2 rounded-lg ${brandColors.gradientPrimary} ${showNavOverlay ? 'ml-2' : ''} hover:scale-105 transition-transform flex items-center gap-2 flex-shrink-0`}
          title={showNavOverlay ? 'Close navigation' : 'Open navigation'}
        >
          <Image
            src="/images/logos/company-logo.png"
            alt="One Last AI logo"
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            priority
          />
          {showNavOverlay && (
            <span className={`text-sm font-semibold ${brandColors.text}`}>
              Navigation
            </span>
          )}
        </button>
        <div className="flex flex-col gap-2 w-full px-2 mt-2 flex-shrink-0">
          {/* New Conversation Button */}
          <button
            onClick={handleNewConversation}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${brandColors.btnPrimary} hover:scale-105`}
            title="New conversation"
          >
            <PlusIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>New</span>
            )}
          </button>
          <div className="h-px w-full bg-white/10 my-1" />
          <button
            onClick={() =>
              setActivePane((prev) => (prev === 'chat' ? 'preview' : 'chat'))
            }
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
          {/* Templates Button - Opens Built-in Templates Panel */}
          <button
            onClick={() => setShowBuiltinTemplatesPanel(true)}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              showBuiltinTemplatesPanel
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Built-in Templates"
          >
            <RectangleGroupIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Templates</span>
            )}
          </button>
          <button
            onClick={() =>
              setActivePane((prev) => (prev === 'files' ? 'preview' : 'files'))
            }
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
            onClick={() =>
              setActivePane((prev) =>
                prev === 'preview' ? 'preview' : 'preview'
              )
            }
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
            onClick={() =>
              setActivePane((prev) => (prev === 'code' ? 'preview' : 'code'))
            }
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
          {/* Split View Button */}
          <button
            onClick={() => setSplitView((prev) => !prev)}
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              splitView
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Split view (Code + Preview)"
          >
            <Squares2X2Icon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Split</span>
            )}
          </button>
          <div className="h-px w-full bg-white/10 my-1" />
          <button
            onClick={() =>
              setActivePane((prev) =>
                prev === 'history' ? 'preview' : 'history'
              )
            }
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
          <button
            onClick={() =>
              setActivePane((prev) =>
                prev === 'settings' ? 'preview' : 'settings'
              )
            }
            className={`p-2 rounded-lg flex items-center ${showNavOverlay ? 'justify-start gap-3 px-3' : 'justify-center'} transition-colors ${
              activePane === 'settings'
                ? brandColors.btnPrimary
                : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
            }`}
            title="Settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            {showNavOverlay && (
              <span className={`text-sm ${brandColors.text}`}>Settings</span>
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
              <SparklesIcon className="w-4 h-4 text-white" />
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
                    <div
                      className="text-sm prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
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

        {/* Uploaded Files - Image-to-Code indicator */}
        {uploadedFiles.length > 0 && showChatPanel && (
          <div className={`px-3 py-2 ${brandColors.border} border-t`}>
            {/* Show Image-to-Code badge if images uploaded */}
            {uploadedFiles.some(f => f.type.startsWith('image/')) && (
              <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
                <SparklesIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-300 font-medium">
                  🎨 Image-to-Code mode - I&apos;ll recreate this design!
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${brandColors.bgSecondary} text-xs border ${file.type.startsWith('image/') ? 'border-cyan-500/50' : brandColors.border}`}
                >
                  {file.type.startsWith('image/') ? (
                    <>
                      {/* Show image thumbnail */}
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className={brandColors.text}>
                        {file.name.length > 15 ? file.name.slice(0, 12) + '...' : file.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <PhotoIcon className="w-3 h-3 text-cyan-400" />
                      <span className={brandColors.text}>
                        {file.name.slice(0, 12)}...
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => removeUploadedFile(file.id)}
                    className="text-red-400 hover:text-red-300 ml-1"
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

      {/* =========== CENTER PANEL: FILES / HISTORY / SETTINGS =========== */}
      <div
        className={`${showFilesPanel || showHistoryPanel ? 'w-[220px]' : 'w-0'} flex flex-col ${brandColors.bgPanel} ${showFilesPanel || showHistoryPanel ? `${brandColors.border} border-r` : 'border-transparent'} relative z-10 transition-all duration-300 overflow-hidden`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-3 ${brandColors.border} border-b`}
        >
          {activePane === 'history' ? (
            <ClockIcon className={`w-4 h-4 ${brandColors.accentCyan}`} />
          ) : activePane === 'settings' ? (
            <Cog6ToothIcon className={`w-4 h-4 ${brandColors.accentCyan}`} />
          ) : (
            <FolderIcon className={`w-4 h-4 ${brandColors.accentCyan}`} />
          )}
          {(showFilesPanel || showHistoryPanel) && (
            <span className={`text-sm font-medium ${brandColors.text}`}>
              {activePane === 'history'
                ? 'History'
                : activePane === 'settings'
                  ? 'Settings'
                  : 'Files'}
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

        {activePane === 'settings' && showHistoryPanel ? (
          /* =========== SETTINGS PANEL CONTENT =========== */
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
            <div
              className={`${brandColors.bgSecondary} border ${brandColors.border} rounded-xl p-4`}
            >
              <div
                className={`flex items-center gap-2 mb-3 ${brandColors.text}`}
              >
                <SparklesIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-sm">
                  Fine-tune best practices
                </span>
              </div>
              <ul
                className={`space-y-2 text-xs ${brandColors.textSecondary} leading-relaxed`}
              >
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  Write one focused change request at a time.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Share constraints: stack, style, data shapes, limits.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  Provide examples: good/bad snippets and target tone.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  State outputs you need: code, plan, tests, or diffs.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Call out blockers early (auth, CORS, missing APIs).
                </li>
              </ul>
            </div>

            {/* AI Provider Selection */}
            <div
              className={`${brandColors.bgSecondary} border ${brandColors.border} rounded-xl p-4`}
            >
              <div
                className={`flex items-center gap-2 mb-3 ${brandColors.text}`}
              >
                <CodeBracketIcon className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-sm">AI Provider</span>
              </div>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  const newProvider = e.target.value;
                  setSelectedProvider(newProvider);
                  // Auto-select first model of new provider
                  const firstModel = providerModels[newProvider]?.models[0]?.id;
                  if (firstModel) setSelectedModel(firstModel);
                }}
                title="Select AI Provider"
                className={`w-full px-3 py-2 rounded-lg text-sm ${brandColors.bgInput} ${brandColors.border} border ${brandColors.text} focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
              >
                {Object.entries(providerModels).map(([key, provider]) => (
                  <option key={key} value={key}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Model Selection */}
            <div
              className={`${brandColors.bgSecondary} border ${brandColors.border} rounded-xl p-4`}
            >
              <div
                className={`flex items-center gap-2 mb-3 ${brandColors.text}`}
              >
                <SparklesIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-sm">Model</span>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                title="Select AI Model"
                className={`w-full px-3 py-2 rounded-lg text-sm ${brandColors.bgInput} ${brandColors.border} border ${brandColors.text} focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
              >
                {providerModels[selectedProvider]?.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Setting */}
            <div
              className={`${brandColors.bgSecondary} border ${brandColors.border} rounded-xl p-4`}
            >
              <div
                className={`flex items-center justify-between mb-3 ${brandColors.text}`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-pink-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="font-semibold text-sm">Temperature</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${brandColors.bgInput} ${brandColors.textSecondary}`}
                >
                  {temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                title="Adjust temperature"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #a855f7 ${(temperature / 2) * 100}%, #1e1e2a ${(temperature / 2) * 100}%)`,
                }}
              />
              <div
                className={`flex justify-between text-[10px] mt-1 ${brandColors.textMuted}`}
              >
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Max Tokens Setting */}
            <div
              className={`${brandColors.bgSecondary} border ${brandColors.border} rounded-xl p-4`}
            >
              <div
                className={`flex items-center justify-between mb-3 ${brandColors.text}`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold text-sm">Max Tokens</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${brandColors.bgInput} ${brandColors.textSecondary}`}
                >
                  {maxTokens.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1024"
                max="16384"
                step="512"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                title="Adjust max tokens"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #a855f7 ${((maxTokens - 1024) / (16384 - 1024)) * 100}%, #1e1e2a ${((maxTokens - 1024) / (16384 - 1024)) * 100}%)`,
                }}
              />
              <div
                className={`flex justify-between text-[10px] mt-1 ${brandColors.textMuted}`}
              >
                <span>1K</span>
                <span>8K</span>
                <span>16K</span>
              </div>
            </div>
          </div>
        ) : activePane === 'history' && showHistoryPanel ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* History Search Bar */}
            <div className={`p-2 ${brandColors.border} border-b flex-shrink-0`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${brandColors.bgInput} border ${brandColors.border}`}>
                <MagnifyingGlassIcon className={`w-4 h-4 ${brandColors.textMuted}`} />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent text-sm ${brandColors.text} placeholder:${brandColors.textMuted} outline-none`}
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className={`${brandColors.textSecondary} hover:${brandColors.text}`}
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {/* History List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
            {filteredHistoryEntries.length === 0 ? (
              <div className={`text-center py-8 ${brandColors.textSecondary}`}>
                <ClockIcon className="w-8 h-8 opacity-50 mx-auto mb-2" />
                <p className="text-xs">{historySearchQuery ? 'No matching results' : 'No history yet'}</p>
                <p className={`text-[10px] mt-1 ${brandColors.textMuted}`}>
                  {historySearchQuery ? 'Try a different search term' : 'Generate something to see it here'}
                </p>
              </div>
            ) : (
              filteredHistoryEntries.map((entry) => (
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
          {splitView ? (
            /* ===== SPLIT VIEW: Code + Preview Side by Side ===== */
            <div className="flex w-full h-full">
              {/* Left: Code Editor */}
              <div className={`w-1/2 h-full border-r ${brandColors.border}`}>
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
                        fontSize: 12,
                        padding: { top: 8, bottom: 8 },
                      }}
                      loading={
                        <div className={`flex flex-col items-center justify-center h-full ${brandColors.bgMain}`}>
                          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className={`text-xs ${brandColors.textSecondary}`}>Loading...</p>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center h-full ${brandColors.textSecondary}`}>
                    <CodeBracketIcon className="w-10 h-10 opacity-30 mb-2" />
                    <p className="text-xs">No code yet</p>
                  </div>
                )}
              </div>
              {/* Right: Preview */}
              <div className="w-1/2 h-full p-2 overflow-auto">
                {generatedCode ? (
                  <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                    <iframe
                      ref={previewRef}
                      title="Preview"
                      className="w-full h-full border-none"
                      sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
                    />
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center h-full ${brandColors.textSecondary}`}>
                    <EyeIcon className="w-10 h-10 opacity-30 mb-2" />
                    <p className="text-xs">Preview here</p>
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'preview' ? (
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
                    sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
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
                    loading={
                      <div
                        className={`flex flex-col items-center justify-center h-full ${brandColors.bgMain}`}
                      >
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className={`text-sm ${brandColors.textSecondary}`}>
                          Loading editor...
                        </p>
                      </div>
                    }
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

      {/* =========== BUILT-IN TEMPLATES PANEL (Overlay) =========== */}
      {showBuiltinTemplatesPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-5xl max-h-[85vh] ${brandColors.bgPanel} rounded-3xl border ${brandColors.border} shadow-2xl overflow-hidden flex flex-col`}>
            {/* Panel Header */}
            <div className={`flex items-center justify-between px-6 py-4 ${brandColors.border} border-b`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${brandColors.gradientPrimary}`}>
                  <RectangleGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${brandColors.gradientText}`}>Ready-Made Templates</h2>
                  <p className={`text-sm ${brandColors.textSecondary}`}>Choose a template to start instantly - no AI generation needed!</p>
                </div>
              </div>
              <button
                onClick={() => setShowBuiltinTemplatesPanel(false)}
                className={`p-2 rounded-lg ${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className={`flex overflow-x-auto px-6 py-3 gap-2 ${brandColors.border} border-b`}>
              {BUILTIN_TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBuiltinTemplateCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    builtinTemplateCategory === cat
                      ? brandColors.btnPrimary
                      : `${brandColors.bgSecondary} ${brandColors.textSecondary} ${brandColors.bgHover}`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuiltinTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleLoadBuiltinTemplate(template)}
                    className={`group p-6 rounded-2xl text-left transition-all hover:scale-[1.02] ${brandColors.bgSecondary} border ${brandColors.border} hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10`}
                  >
                    {/* Template Preview Placeholder */}
                    <div className={`aspect-video rounded-xl mb-4 flex items-center justify-center text-5xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border ${brandColors.border} group-hover:border-cyan-500/30 transition`}>
                      {template.thumbnail}
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${brandColors.text} group-hover:text-cyan-400 transition`}>
                          {template.name}
                        </h3>
                        <p className={`text-sm ${brandColors.textSecondary} mt-1 line-clamp-2`}>
                          {template.description}
                        </p>
                        <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${brandColors.bgInput} ${brandColors.textMuted}`}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Footer */}
            <div className={`px-6 py-4 ${brandColors.border} border-t flex items-center justify-between`}>
              <p className={`text-sm ${brandColors.textMuted}`}>
                💡 Click a template to load it instantly. Then customize with AI chat!
              </p>
              <button
                onClick={() => setShowBuiltinTemplatesPanel(false)}
                className={`px-4 py-2 rounded-lg ${brandColors.btnSecondary} text-sm font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
