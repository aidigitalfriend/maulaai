// ThemeToggle Logic
// Handles theme switching between light, dark, and system preferences

export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  actualTheme: 'light' | 'dark';
  isChanging: boolean;
}

export interface ThemeActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  detectSystemTheme: () => void;
  applyTheme: (theme: 'light' | 'dark') => void;
}

export class ThemeToggleLogic {
  private state: ThemeState;
  private actions: ThemeActions;
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.state = {
      theme: 'system',
      systemTheme: 'light',
      actualTheme: 'light',
      isChanging: false,
    };

    this.actions = {
      setTheme: this.setTheme.bind(this),
      toggleTheme: this.toggleTheme.bind(this),
      detectSystemTheme: this.detectSystemTheme.bind(this),
      applyTheme: this.applyTheme.bind(this),
    };

    // Initialize theme system
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (typeof window === 'undefined') return;

    // Load saved theme preference or default to system
    const savedTheme = localStorage.getItem('theme') as
      | 'light'
      | 'dark'
      | 'system'
      | null;
    this.state.theme = savedTheme || 'system';

    // Set up system theme detection
    this.setupSystemThemeDetection();

    // Detect initial system theme
    this.detectSystemTheme();

    // Apply the appropriate theme
    this.updateActualTheme();
    this.applyTheme(this.state.actualTheme);
  }

  private setupSystemThemeDetection(): void {
    if (typeof window === 'undefined') return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener(
      'change',
      this.handleSystemThemeChange.bind(this)
    );
  }

  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    this.state.systemTheme = e.matches ? 'dark' : 'light';

    // If using system theme, update the actual theme
    if (this.state.theme === 'system') {
      this.updateActualTheme();
      this.applyTheme(this.state.actualTheme);
    }

    this.trackThemeEvent('system_theme_changed', {
      system_theme: this.state.systemTheme,
      user_theme: this.state.theme,
      actual_theme: this.state.actualTheme,
    });
  }

  detectSystemTheme(): void {
    if (typeof window === 'undefined') return;

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    this.state.systemTheme = prefersDark ? 'dark' : 'light';
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    if (this.state.isChanging) return;

    this.state.isChanging = true;
    this.state.theme = theme;

    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }

    // Update actual theme and apply
    this.updateActualTheme();
    this.applyTheme(this.state.actualTheme);

    this.trackThemeEvent('theme_changed', {
      new_theme: theme,
      actual_theme: this.state.actualTheme,
    });

    // Reset changing state after animation
    setTimeout(() => {
      this.state.isChanging = false;
    }, 200);
  }

  toggleTheme(): void {
    const currentTheme = this.state.theme;

    // Cycle through: light -> dark -> system -> light
    switch (currentTheme) {
      case 'light':
        this.setTheme('dark');
        break;
      case 'dark':
        this.setTheme('system');
        break;
      case 'system':
        this.setTheme('light');
        break;
      default:
        this.setTheme('light');
    }
  }

  private updateActualTheme(): void {
    if (this.state.theme === 'system') {
      this.state.actualTheme = this.state.systemTheme;
    } else {
      this.state.actualTheme = this.state.theme;
    }
  }

  applyTheme(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light-theme', 'dark-theme');

    // Add new theme classes
    root.classList.add(theme);
    body.classList.add(`${theme}-theme`);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);

    // Update CSS custom properties for smooth transitions
    this.updateThemeProperties(theme);
  }

  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#0f172a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  private updateThemeProperties(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (theme === 'dark') {
      // Dark theme properties
      root.style.setProperty('--background', '0 0% 3.9%');
      root.style.setProperty('--foreground', '0 0% 98%');
      root.style.setProperty('--primary', '0 0% 98%');
      root.style.setProperty('--primary-foreground', '0 0% 9%');
      root.style.setProperty('--muted', '0 0% 14.9%');
      root.style.setProperty('--muted-foreground', '0 0% 63.9%');
      root.style.setProperty('--border', '0 0% 14.9%');
      root.style.setProperty('--input', '0 0% 14.9%');
      root.style.setProperty('--card', '0 0% 3.9%');
      root.style.setProperty('--card-foreground', '0 0% 98%');
      root.style.setProperty('--popover', '0 0% 3.9%');
      root.style.setProperty('--popover-foreground', '0 0% 98%');
    } else {
      // Light theme properties
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '0 0% 3.9%');
      root.style.setProperty('--primary', '0 0% 9%');
      root.style.setProperty('--primary-foreground', '0 0% 98%');
      root.style.setProperty('--muted', '0 0% 96.1%');
      root.style.setProperty('--muted-foreground', '0 0% 45.1%');
      root.style.setProperty('--border', '0 0% 89.8%');
      root.style.setProperty('--input', '0 0% 89.8%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '0 0% 3.9%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '0 0% 3.9%');
    }
  }

  // Get the display name for current theme
  getThemeDisplayName(): string {
    switch (this.state.theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return `System (${this.state.systemTheme})`;
      default:
        return 'Unknown';
    }
  }

  // Get the icon for current theme
  getThemeIcon(): string {
    switch (this.state.actualTheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      default:
        return '💻';
    }
  }

  // Check if current theme matches actual theme (for system theme indication)
  isSystemTheme(): boolean {
    return this.state.theme === 'system';
  }

  // Get available theme options
  getThemeOptions(): Array<{
    value: 'light' | 'dark' | 'system';
    label: string;
    icon: string;
  }> {
    return [
      { value: 'light', label: 'Light', icon: '☀️' },
      { value: 'dark', label: 'Dark', icon: '🌙' },
      { value: 'system', label: 'System', icon: '💻' },
    ];
  }

  // Preload theme transition to avoid flash
  preloadTheme(): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        transition: background-color 0.2s ease-in-out,
                   border-color 0.2s ease-in-out,
                   color 0.2s ease-in-out !important;
      }
    `;
    document.head.appendChild(style);

    // Remove transition styles after theme is applied
    setTimeout(() => {
      document.head.removeChild(style);
    }, 300);
  }

  private trackThemeEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'theme',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener(
        'change',
        this.handleSystemThemeChange.bind(this)
      );
    }
  }

  getState(): ThemeState {
    return { ...this.state };
  }

  getActions(): ThemeActions {
    return this.actions;
  }

  setState(updates: Partial<ThemeState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default ThemeToggleLogic;
