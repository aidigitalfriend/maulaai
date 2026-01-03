// =============================================================================
// CANVAS CONSTANTS - Templates, icons, colors
// =============================================================================

import { Template, BrandColors } from './types';

export const TEMPLATES: Template[] = [
  { id: 't1', name: 'SaaS Landing', category: 'Landing', icon: '🚀', prompt: 'Create a modern SaaS landing page with hero section, features grid, pricing cards, testimonials, and CTA. Use gradient backgrounds and smooth animations.' },
  { id: 't2', name: 'Portfolio', category: 'Landing', icon: '👨‍💼', prompt: 'Build a creative portfolio website with about section, project gallery with hover effects, skills section, and contact form. Modern dark theme.' },
  { id: 't3', name: 'Analytics Dashboard', category: 'Dashboard', icon: '📊', prompt: 'Create an analytics dashboard with stats cards, line chart placeholder, bar chart, recent activity list, and sidebar navigation. Dark theme.' },
  { id: 't4', name: 'Admin Panel', category: 'Dashboard', icon: '⚙️', prompt: 'Build an admin panel with user management table, search/filter, pagination, sidebar menu, and top navbar with notifications.' },
  { id: 't5', name: 'E-commerce Store', category: 'E-commerce', icon: '🛒', prompt: 'Create an e-commerce product grid with filter sidebar, product cards with hover effects, cart icon, and sorting dropdown.' },
  { id: 't6', name: 'Product Page', category: 'E-commerce', icon: '📦', prompt: 'Build a product detail page with image gallery, size/color selectors, add to cart button, reviews section, and related products.' },
  { id: 't7', name: 'Login Form', category: 'Components', icon: '🔐', prompt: 'Create a beautiful login/signup form with social login buttons, input validation styling, and forgot password link. Glassmorphism style.' },
  { id: 't8', name: 'Pricing Table', category: 'Components', icon: '💎', prompt: 'Build a 3-tier pricing table with feature comparison, popular badge, monthly/yearly toggle, and CTA buttons.' },
  { id: 't9', name: 'Contact Form', category: 'Components', icon: '✉️', prompt: 'Design a contact form with name, email, subject, message fields, and submit button. Include form validation styling.' },
  { id: 't10', name: 'Blog Layout', category: 'Creative', icon: '📝', prompt: 'Create a blog homepage with featured post hero, recent articles grid, categories sidebar, and newsletter signup.' },
  { id: 't11', name: 'Event Page', category: 'Creative', icon: '🎉', prompt: 'Design an event landing page with countdown timer, speaker profiles, schedule timeline, and ticket purchase section.' },
  { id: 't12', name: 'Restaurant', category: 'Creative', icon: '🍽️', prompt: 'Create a restaurant website with hero image, menu sections, reservation form, gallery, and location map placeholder.' },
];

export const FILE_ICONS: Record<string, string> = {
  html: '🌐',
  css: '🎨',
  js: '📜',
  tsx: '⚛️',
  json: '📋',
  image: '🖼️',
  folder: '📁',
  other: '📄',
};

export const BRAND_COLORS: BrandColors = {
  gradientPrimary: 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500',
  gradientText: 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
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
  btnPrimary: 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-cyan-500/25',
  btnSecondary: 'bg-[#2a2a3a] hover:bg-[#353545] text-gray-200',
};

export const DEVICE_STYLES = {
  desktop: 'w-full h-full',
  tablet: 'w-[768px] h-full mx-auto',
  mobile: 'w-[375px] h-full mx-auto',
};
