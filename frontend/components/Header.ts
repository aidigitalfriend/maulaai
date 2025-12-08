// Header Logic
// Handles navigation state, authentication status, and responsive menu behavior

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  current?: boolean;
  external?: boolean;
}

export interface HeaderState {
  isAuthenticated: boolean;
  user: User | null;
  isMobileMenuOpen: boolean;
  isProfileMenuOpen: boolean;
  currentPath: string;
  notifications: number;
}

export interface HeaderActions {
  toggleMobileMenu: () => void;
  toggleProfileMenu: () => void;
  handleSignOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateCurrentPath: (path: string) => void;
}

export class HeaderLogic {
  private state: HeaderState;
  private actions: HeaderActions;

  constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      isMobileMenuOpen: false,
      isProfileMenuOpen: false,
      currentPath: '/',
      notifications: 0,
    };

    this.actions = {
      toggleMobileMenu: this.toggleMobileMenu.bind(this),
      toggleProfileMenu: this.toggleProfileMenu.bind(this),
      handleSignOut: this.handleSignOut.bind(this),
      checkAuthStatus: this.checkAuthStatus.bind(this),
      updateCurrentPath: this.updateCurrentPath.bind(this),
    };

    // Initialize
    this.checkAuthStatus();
  }

  toggleMobileMenu(): void {
    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;

    // Close profile menu when mobile menu opens
    if (this.state.isMobileMenuOpen) {
      this.state.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu(): void {
    this.state.isProfileMenuOpen = !this.state.isProfileMenuOpen;
  }

  async handleSignOut(): Promise<void> {
    try {
      // Call sign out API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear local state
      this.state.isAuthenticated = false;
      this.state.user = null;
      this.state.isProfileMenuOpen = false;

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');

      // Track sign out
      this.trackAuthEvent('sign_out');

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  async checkAuthStatus(): Promise<void> {
    try {
      // Check localStorage first for quick UI update
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.state.user = JSON.parse(storedUser);
        this.state.isAuthenticated = true;
      }

      // Verify with server
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        this.state.isAuthenticated = true;
        this.state.user = userData.user;

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData.user));
      } else {
        // Not authenticated
        this.state.isAuthenticated = false;
        this.state.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      this.state.isAuthenticated = false;
      this.state.user = null;
    }
  }

  updateCurrentPath(path: string): void {
    this.state.currentPath = path;
  }

  getNavigationItems(): NavigationItem[] {
    const baseNavigation: NavigationItem[] = [
      { name: 'Home', href: '/' },
      { name: 'Agents', href: '/agents' },
      { name: 'AI Lab', href: '/lab' },
      { name: 'Tools', href: '/tools' },
      { name: 'Pricing', href: '/pricing' },
    ];

    // Add current state to navigation items
    return baseNavigation.map((item) => ({
      ...item,
      current: this.state.currentPath === item.href,
    }));
  }

  getUserMenuItems(): NavigationItem[] {
    if (!this.state.isAuthenticated) {
      return [
        { name: 'Sign in', href: '/auth/login' },
        { name: 'Sign up', href: '/auth/signup' },
      ];
    }

    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Profile', href: '/dashboard/profile' },
      { name: 'Billing', href: '/dashboard/billing' },
      { name: 'Security', href: '/dashboard/security' },
    ];
  }

  private trackAuthEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'authentication',
      });
    }
  }

  // Method to close menus when clicking outside
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside mobile menu
    if (this.state.isMobileMenuOpen) {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.contains(target)) {
        this.state.isMobileMenuOpen = false;
      }
    }

    // Check if click is outside profile menu
    if (this.state.isProfileMenuOpen) {
      const profileMenu = document.getElementById('profile-menu');
      if (profileMenu && !profileMenu.contains(target)) {
        this.state.isProfileMenuOpen = false;
      }
    }
  }

  // Utility method for responsive behavior
  handleResize(): void {
    // Close mobile menu on large screens
    if (window.innerWidth >= 768 && this.state.isMobileMenuOpen) {
      this.state.isMobileMenuOpen = false;
    }
  }

  getState(): HeaderState {
    return { ...this.state };
  }

  getActions(): HeaderActions {
    return this.actions;
  }

  setState(updates: Partial<HeaderState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default HeaderLogic;
