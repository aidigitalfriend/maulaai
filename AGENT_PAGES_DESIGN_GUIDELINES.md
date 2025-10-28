# 🎨 Agent Pages UI/UX - Visual Design Guidelines & Component Library

**Purpose:** Design specifications for implementing enhancements  
**Audience:** Designers and frontend developers

---

## 🎯 Design System Quick Reference

### **Color Palette for Components**

```
Primary Interactions:
├─ Primary Action:   #3B82F6 (Blue-500)
├─ Success:          #10B981 (Green-500)
├─ Warning:          #F59E0B (Amber-500)
├─ Danger:           #EF4444 (Red-500)
├─ Neutral:          #6B7280 (Gray-600)
└─ Disabled:         #D1D5DB (Gray-300)

Agent Gradients:
├─ Einstein:         indigo-600 → purple-600
├─ Comedy King:      yellow-500 → orange-600
├─ Fitness Guru:     green-500 → emerald-600
├─ Tech Wizard:      cyan-500 → blue-600
├─ Drama Queen:      pink-500 → rose-600
└─ (Use agent.color property)

Backgrounds:
├─ Page BG:         Gray-50
├─ Card BG:         White
├─ Hover BG:        Gray-100
├─ Focus Ring:      Blue-500 (2px)
└─ Disabled:        Gray-100
```

### **Typography Scale**

```
Headlines:
├─ h1: 3rem (48px) / font-bold / leading-tight
├─ h2: 2rem (32px) / font-bold / leading-snug
├─ h3: 1.5rem (24px) / font-bold / leading-snug
└─ h4: 1.25rem (20px) / font-semibold / leading-snug

Body:
├─ Large: 1.125rem (18px) / leading-relaxed
├─ Normal: 1rem (16px) / leading-relaxed
├─ Small: 0.875rem (14px) / leading-relaxed
└─ Tiny: 0.75rem (12px) / leading-relaxed

Monospace (Code):
├─ Code Block: 0.875rem / font-mono / bg-gray-100
├─ Inline Code: 0.875rem / font-mono / bg-gray-100
└─ Terminal: 0.8125rem / font-mono / bg-gray-900 / text-white
```

### **Spacing Scale**

```
Consistent spacing using rem units:
├─ xs: 0.25rem (4px)
├─ sm: 0.5rem (8px)
├─ md: 1rem (16px)
├─ lg: 1.5rem (24px)
├─ xl: 2rem (32px)
├─ 2xl: 3rem (48px)
└─ 3xl: 4rem (64px)

Component-specific:
├─ Button padding: 0.75rem 1rem (py-3 px-4)
├─ Input padding: 0.75rem 1rem (py-3 px-4)
├─ Card padding: 1.5rem (p-6)
├─ Section padding: 2rem (py-8 px-4)
└─ Container margin: auto / max-w-6xl
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile-First Approach:

┌─────────────────────────────────────────┐
│ sm: 640px  | md: 768px  | lg: 1024px  │
│ Tablets    | Desktop    | Large Screen│
└─────────────────────────────────────────┘

Layout Changes:
┌──────────────────────────────────────────┐
│ < 640px (Mobile)                         │
│ ├─ Full-width single column             │
│ ├─ Bottom sheet dialogs                 │
│ ├─ Stacked navigation                   │
│ └─ 16px padding sides                   │
│                                          │
│ 640px - 768px (Tablet)                  │
│ ├─ 2-column layout possible              │
│ ├─ Side navigation emerges              │
│ ├─ Modal dialogs allowed                │
│ └─ 24px padding sides                   │
│                                          │
│ > 768px (Desktop)                       │
│ ├─ Multi-column layouts                 │
│ ├─ Sidebar navigation fixed             │
│ ├─ Center content, max-w-4xl            │
│ └─ Full spacing budget                  │
└──────────────────────────────────────────┘
```

---

## 🎛️ COMPONENT SPECIFICATIONS

### **1. Message Bubble Component**

```
Message Bubble (Assistant)
┌─────────────────────────────────────────────┐
│  🤖 Agent Message                           │
├─────────────────────────────────────────────┤
│ This is the agent's response. It can span   │
│ multiple lines and contain formatting.      │
│                                              │
│ • Bullet points                             │
│ • Lists                                     │
│ • Code blocks                               │
├─────────────────────────────────────────────┤
│ 2:34 PM                                     │
├─────────────────────────────────────────────┤
│ 👍 👎 ❤️  🚀  ⚠️  │ 📋 │ ⭐ │ 🔗 │          │
└─────────────────────────────────────────────┘

Styling:
├─ Max-width: 70% on desktop, 90% on mobile
├─ Padding: 1rem (16px)
├─ Border-radius: 0.5rem (8px)
├─ Background: Gray-100
├─ Text color: Gray-900
├─ Shadow: 0 1px 2px rgba(0,0,0,0.05)
├─ Timestamp: 0.75rem gray-500
└─ Actions appear on hover (opacity 0 → 1)

Animations:
├─ Slide-in from bottom (300ms)
├─ Fade-in for content (200ms)
└─ Hover state: 2% brightness increase
```

### **2. User Message Bubble**

```
User Message Bubble
                 ┌─────────────────────┐
                 │ What is quantum     │
                 │ mechanics?          │
                 ├─────────────────────┤
                 │ 2:33 PM             │
                 ├─────────────────────┤
                 │ 📋 │ 🔄              │
                 └─────────────────────┘

Styling:
├─ Max-width: 70% on desktop
├─ Align: right (ml-auto)
├─ Background: Blue-500
├─ Text color: White
├─ Padding: 0.75rem 1rem (py-3 px-4)
├─ Border-radius: 1rem (rounded-2xl)
└─ Actions: Copy, Retry
```

### **3. Enhanced Input Component**

```
Input Area with Multi-line Support

┌─────────────────────────────────────────┐
│ 📎  🎤  😊   [Text area expanding]       │
│                                          │
│ This is a multi-line input that         │
│ expands as you type more content.       │
│ Use Shift+Enter for new lines.          │
│                                          │
│ Type / for quick commands ⌨️ Enter ⏩   │
├─────────────────────────────────────────┤
│ 145 characters | Ctrl+Enter to send →  │
└─────────────────────────────────────────┘

Styling:
├─ Height: Auto-expanding (min 40px, max 200px)
├─ Padding: 0.75rem 1rem (py-3 px-4)
├─ Border: 1px solid gray-300
├─ Focus: 2px solid blue-500 (blue-500 ring)
├─ Font: 1rem (16px) for mobile zoom prevention
├─ Font-family: -apple-system, BlinkMacSystemFont
├─ Resize: none (auto-expand instead)
└─ Line-height: 1.5

States:
├─ Empty: Placeholder visible
├─ Focused: Blue ring (2px)
├─ Typing: Expand as needed
├─ Pasting files: Visual feedback
└─ Disabled: Gray-100 background, opacity 0.5
```

### **4. Reaction Buttons**

```
Reaction Buttons (Assistant Messages)

┌───────────────────────────────────────┐
│ Before hover:                         │
│ 👍 👎 ❤️  🚀  ⚠️  (Gray, opacity 50%)  │
│                                       │
│ After hover:                          │
│ 👍 👎 ❤️  🚀  ⚠️  (Full color)        │
│                                       │
│ After click:                          │
│ ✓👍 👎 ❤️  🚀  ⚠️ (Background highlight│
│                       + green checkmark)
└───────────────────────────────────────┘

Reaction Reference:
├─ 👍 Helpful       (Green checkmark)
├─ 👎 Not helpful   (Red X)
├─ ❤️ Love it       (Red background)
├─ 🚀 Awesome       (Blue background)
└─ ⚠️ Unclear       (Yellow background)

Button Styling:
├─ Base: p-1.5 (12px padding)
├─ Border-radius: 0.5rem (8px)
├─ Hover: bg-gray-100
├─ Active: bg-{color}-100 with ring
├─ Transition: all 150ms ease
└─ Cursor: pointer
```

### **5. Command Palette**

```
Command Palette (Ctrl+/ to trigger)

┌─────────────────────────────────────────┐
│ Quick Commands                 [Close]  │
├─────────────────────────────────────────┤
│                                         │
│ 📝 Expand    ⚙️ Simplify  📊 Summarize │
│ ✨ Refine    🌍 Translate  🔍 Analyze  │
│                                         │
├─────────────────────────────────────────┤
│ Tip: Start typing a command or press ↑↓│
└─────────────────────────────────────────┘

Styling:
├─ Position: Sticky / floating
├─ Background: Gray-50 border gray-200
├─ Padding: 1rem (16px)
├─ Border-radius: 0.5rem (8px)
├─ Shadow: 0 4px 6px rgba(0,0,0,0.1)
├─ Grid: 2 columns (sm), 5 columns (lg)
├─ Gap: 0.5rem (8px)
└─ Animation: Slide-in from top (200ms)

Command Item:
├─ Padding: 0.5rem (8px)
├─ Border: 1px solid gray-200
├─ Background: White
├─ Hover: bg-blue-50 border-blue-300
├─ Border-radius: 0.375rem (6px)
├─ Transition: all 150ms ease
└─ Icon size: 1.5rem (24px) centered
```

### **6. Agent Page Header (Enhanced)**

```
┌──────────────────────────────────────────────────────┐
│ 🧠 Einstein          Back to Agents          [Menu]  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────┐  h1: Einstein                           │
│  │ Avatar  │  p: Theoretical Physics Genius          │
│  │ (32px)  │  ⭐⭐⭐⭐⭐ 4.8 · 1.2K conversations      │
│  │ 🟢      │                                         │
│  └─────────┘  Physics | Science | Theory | Education │
│                                                       │
│ Description: A world-renowned theoretical physicist...│
│                                                       │
│  Stats Grid (4 columns on desktop, 2 on mobile):    │
│  ┌─────────┬─────────┬─────────┬─────────┐          │
│  │1,250 🧑 │ 4.8 ⭐ │ 2s ⚡  │3,420 👥 │          │
│  │Chats    │ Rating  │Response │ Users   │          │
│  └─────────┴─────────┴─────────┴─────────┘          │
│                                                       │
│  [Start Conversation] [View Details]                 │
│                                                       │
└──────────────────────────────────────────────────────┘

Styling:
├─ Background: Linear gradient (agent.color)
├─ Text color: White / white/90%
├─ Avatar: w-24 h-24 (md:w-32 md:h-32)
├─ Avatar border-radius: 1rem (16px)
├─ Avatar shadow: 0 10px 15px rgba(0,0,0,0.2)
├─ Stats boxes: bg-white/10 backdrop-blur-sm
├─ Padding: py-12 px-4 (mobile-safe)
└─ Max-width: container-custom
```

---

## 🌐 MOBILE VS DESKTOP LAYOUTS

### **ChatBox Layout Comparison**

**Desktop (> 768px):**
```
┌───────────────────────────────────┐
│ Agent Header (Fixed)              │
├───────────────────────────────────┤
│                                   │
│ Message History (Scrollable)      │
│ ┌─────────────────────────────┐   │
│ │ Agent Message 1             │   │
│ ├─────────────────────────────┤   │
│ │             User Message 1  │   │
│ ├─────────────────────────────┤   │
│ │ Agent Message 2 (Streaming) │   │
│ ├─────────────────────────────┤   │
│ │ [New messages...]           │   │
│ └─────────────────────────────┘   │
│                                   │
├───────────────────────────────────┤
│ Settings Panel [Collapsed Right]  │
├───────────────────────────────────┤
│ ┌─────────┬─────────────────────┐ │
│ │📎🎤😊  │ [Multi-line input]   │→ │
│ │         │ Ctrl+Enter to send   │ │
│ └─────────┴─────────────────────┘ │
└───────────────────────────────────┘
```

**Mobile (< 768px):**
```
┌─────────────────────────────────┐
│ 🤖 Agent | Settings ⋮           │
├─────────────────────────────────┤
│                                 │
│ Message History (Full height)   │
│ ┌───────────────────────────┐   │
│ │ Agent: Hello!             │   │
│ ├───────────────────────────┤   │
│ │       User: Hi there      │   │
│ ├───────────────────────────┤   │
│ │ Agent: How can I help?    │   │
│ ├───────────────────────────┤   │
│ │       [More messages...]  │   │
│ └───────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│ 📎 🎤 😊 │ Input Area | Send  │
│                                 │
│ (Safe Area: Notch clearance)    │
└─────────────────────────────────┘
```

---

## ♿ ACCESSIBILITY SPECIFICATIONS

### **Focus States**

```
All interactive elements must show:

Keyboard Focus Indicator:
├─ 2px solid ring (blue-500)
├─ 4px offset from element
├─ Visible on light and dark backgrounds
├─ Minimum contrast ratio: 3:1
└─ Remove default outline (use ring instead)

States:
├─ Default: No ring
├─ Focused: 2px blue ring
├─ Active: Ring + slight background change
└─ Disabled: Ring not visible, opacity 0.5

Example CSS:
.interactive-element {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  @apply dark:focus:ring-offset-gray-900
}
```

### **Color Contrast**

```
WCAG 2.1 AA Standards:

Normal Text:
├─ Minimum: 4.5:1 contrast ratio
├─ Examples:
│  ├─ Black (000) on White (FFF): 21:1 ✅
│  ├─ Gray-700 (374151) on White: 9:1 ✅
│  ├─ Gray-500 (6B7280) on White: 4.5:1 ✅
│  └─ Gray-400 (9CA3AF) on White: 2.5:1 ❌
│
Large Text (18pt+):
├─ Minimum: 3:1 contrast ratio
└─ More lenient for large headings

Interactive Elements:
├─ Focus indicator: 3:1 minimum
├─ Disabled state: 4.5:1 minimum
└─ Buttons: 4.5:1 minimum
```

### **Screen Reader Support**

```
Semantic HTML:
├─ Use <button> not <div role="button">
├─ Use <input> with <label> associations
├─ Use <nav>, <main>, <article>, <section>
├─ Use heading hierarchy (h1 > h2 > h3)
└─ Use <table> for data (never for layout)

ARIA Labels:
├─ aria-label="Send message" for icon-only buttons
├─ aria-describedby for additional context
├─ aria-live="polite" for status updates
├─ aria-expanded for expandable sections
└─ aria-pressed for toggle buttons

Live Regions:
├─ Message arrivals: aria-live="polite"
├─ Error states: aria-live="assertive"
├─ Loading states: aria-busy="true"
└─ Announcements: role="status"
```

---

## 🎬 ANIMATION SPECIFICATIONS

### **Timing Functions**

```
Standard Easing:
├─ Quick feedback: 150ms ease-out
├─ Normal: 200ms ease-in-out
├─ Graceful: 300ms cubic-bezier(0.4, 0, 0.2, 1)
└─ Slow: 500ms ease-in

Prefers Reduced Motion:
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Message Entry Animation**

```
New message slides in from bottom:

1. Start (0ms):
   └─ opacity: 0
   └─ transform: translateY(20px)

2. Active (300ms):
   └─ opacity: 1
   └─ transform: translateY(0)

CSS:
.message-enter {
  animation: slideInUp 300ms ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### **Loading States**

```
Typing Indicator:
┌────────────────────┐
│ ●  ●  ●            │
│ ↑  ↑  ↑            │
│ Thinking...        │
└────────────────────┘

Animation:
.dot {
  animation: bounce 1.4s infinite;
  
  &:nth-child(1) { animation-delay: 0ms; }
  &:nth-child(2) { animation-delay: 140ms; }
  &:nth-child(3) { animation-delay: 280ms; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

---

## 📐 TOUCH TARGET SIZES

### **Mobile Touch Targets**

```
Minimum Touch Size (Apple HIG + WCAG):
├─ Interactive Elements: 44×44px minimum
├─ Dense Elements: 38×38px minimum
├─ Spacing: 8px minimum between targets
└─ Recommended: 48×48px for common actions

Button Sizing:
├─ Small actions: 40×40px (icon)
├─ Normal buttons: 48×48px (with text)
├─ Large CTAs: 56×56px (prominent actions)

Input Sizing:
├─ Text input height: 48px (Tailwind: h-12)
├─ Checkbox/radio: 48×48px
├─ Select/dropdown: 48px height
└─ Input padding: 12px horizontal (px-3)
```

---

## 🎨 DARK MODE SPECIFICATIONS

### **Color Overrides for Dark Mode**

```
Dark Mode Palette:
├─ Background: Gray-900 (#111827)
├─ Surface: Gray-800 (#1F2937)
├─ Surface-elevated: Gray-700 (#374151)
├─ Text primary: Gray-50 (#F9FAFB)
├─ Text secondary: Gray-400 (#9CA3AF)
├─ Border: Gray-700 (#374151)
└─ Focus ring: Blue-400 (instead of Blue-500)

Message Bubbles (Dark):
├─ Assistant: Gray-800 background, Gray-50 text
├─ User: Blue-600 background, White text
└─ System: Amber-900 background, Amber-100 text

Input (Dark):
├─ Background: Gray-700
├─ Border: Gray-600
├─ Text: Gray-50
├─ Placeholder: Gray-500
└─ Focus: Blue-400 ring
```

---

## 📋 IMPLEMENTATION CHECKLIST

**Before Implementation:**
- [ ] Review design with product team
- [ ] Get approval on animations/transitions
- [ ] Define accessibility standards (WCAG 2.1 AA)
- [ ] Plan responsive breakpoints
- [ ] Identify performance concerns

**During Implementation:**
- [ ] Follow component specifications exactly
- [ ] Test on real devices (mobile)
- [ ] Use lighthouse for performance
- [ ] Test keyboard navigation
- [ ] Test with screen reader (NVDA/JAWS)

**After Implementation:**
- [ ] Visual QA on desktop/tablet/mobile
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility audit (axe, WAVE)
- [ ] Performance audit (PageSpeed, Lighthouse)
- [ ] User testing with real users

---

**This design system ensures consistency, accessibility, and excellent user experience across all agent pages and chat interfaces.**

