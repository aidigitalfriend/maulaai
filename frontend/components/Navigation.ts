// Navigation Logic
// Handles responsive navigation, menu state, and active link detection

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  current: boolean;
  children?: NavigationItem[];
  badge?: string | number;
  external?: boolean;
}

export interface NavigationState {
  isMobileMenuOpen: boolean;
  activeDropdown: string | null;
  currentPath: string;
  navigationItems: NavigationItem[];
  isScrolled: boolean;
}

export interface NavigationActions {
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleDropdown: (itemName: string) => void;
  closeAllDropdowns: () => void;
  updateActivePath: (path: string) => void;
  handleScroll: () => void;
}

export class NavigationLogic {
  private state: NavigationState;
  private actions: NavigationActions;

  constructor() {
    this.state = {
      isMobileMenuOpen: false,
      activeDropdown: null,
      currentPath: '/',
      navigationItems: this.getDefaultNavigation(),
      isScrolled: false,
    };

    this.actions = {
      toggleMobileMenu: this.toggleMobileMenu.bind(this),
      closeMobileMenu: this.closeMobileMenu.bind(this),
      toggleDropdown: this.toggleDropdown.bind(this),
      closeAllDropdowns: this.closeAllDropdowns.bind(this),
      updateActivePath: this.updateActivePath.bind(this),
      handleScroll: this.handleScroll.bind(this),
    };

    // Initialize current path
    if (typeof window !== 'undefined') {
      this.updateActivePath(window.location.pathname);

      // Add scroll listener
      window.addEventListener('scroll', this.handleScroll);

      // Add resize listener to close mobile menu on large screens
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  private getDefaultNavigation(): NavigationItem[] {
    return [
      {
        name: 'Home',
        href: '/',
        current: false,
      },
      {
        name: 'Agents',
        href: '/agents',
        current: false,
        children: [
          { name: 'Browse All', href: '/agents', current: false },
          { name: 'Categories', href: '/agents/categories', current: false },
          { name: 'Create Agent', href: '/agents/create', current: false },
        ],
      },
      {
        name: 'AI Lab',
        href: '/lab',
        current: false,
        badge: 'New',
        children: [
          { name: 'Image Generator', href: '/lab/neural-art', current: false },
          {
            name: 'Music Generator',
            href: '/lab/music-generator',
            current: false,
          },
          { name: 'Story Weaver', href: '/lab/story-weaver', current: false },
          { name: 'Battle Arena', href: '/lab/battle-arena', current: false },
          { name: 'All Features', href: '/lab', current: false },
        ],
      },
      {
        name: 'Tools',
        href: '/tools',
        current: false,
        children: [
          {
            name: 'Developer Utils',
            href: '/tools/developer-utils',
            current: false,
          },
          {
            name: 'Network Tools',
            href: '/tools/network-tools',
            current: false,
          },
          { name: 'DNS Lookup', href: '/tools/dns-lookup', current: false },
          { name: 'SSL Checker', href: '/tools/ssl-checker', current: false },
          { name: 'All Tools', href: '/tools', current: false },
        ],
      },
      {
        name: 'Docs',
        href: '/docs',
        current: false,
        children: [
          {
            name: 'Getting Started',
            href: '/docs/agents/getting-started',
            current: false,
          },
          { name: 'API Reference', href: '/docs/api', current: false },
          { name: 'Tutorials', href: '/docs/tutorials', current: false },
          { name: 'Integrations', href: '/docs/integrations', current: false },
        ],
      },
      {
        name: 'Pricing',
        href: '/pricing',
        current: false,
      },
    ];
  }

  toggleMobileMenu(): void {
    this.state.isMobileMenuOpen = !this.state.isMobileMenuOpen;

    // Close any open dropdowns when mobile menu is toggled
    if (this.state.isMobileMenuOpen) {
      this.state.activeDropdown = null;
    }

    // Prevent body scroll when mobile menu is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.state.isMobileMenuOpen
        ? 'hidden'
        : '';
    }

    this.trackNavigationEvent('mobile_menu_toggled', {
      is_open: this.state.isMobileMenuOpen,
    });
  }

  closeMobileMenu(): void {
    this.state.isMobileMenuOpen = false;
    this.state.activeDropdown = null;

    // Re-enable body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggleDropdown(itemName: string): void {
    if (this.state.activeDropdown === itemName) {
      this.state.activeDropdown = null;
    } else {
      this.state.activeDropdown = itemName;
    }

    this.trackNavigationEvent('dropdown_toggled', {
      item_name: itemName,
      is_open: this.state.activeDropdown === itemName,
    });
  }

  closeAllDropdowns(): void {
    this.state.activeDropdown = null;
  }

  updateActivePath(path: string): void {
    this.state.currentPath = path;

    // Update current state for navigation items
    this.state.navigationItems = this.state.navigationItems.map((item) => ({
      ...item,
      current: this.isItemActive(item, path),
      children: item.children?.map((child) => ({
        ...child,
        current: this.isItemActive(child, path),
      })),
    }));
  }

  private isItemActive(item: NavigationItem, currentPath: string): boolean {
    // Exact match
    if (item.href === currentPath) return true;

    // Home page special case
    if (item.href === '/' && currentPath === '/') return true;
    if (item.href === '/' && currentPath !== '/') return false;

    // Prefix match for parent navigation items
    return (
      currentPath.startsWith(item.href + '/') ||
      currentPath.startsWith(item.href)
    );
  }

  handleScroll(): void {
    const scrolled = window.scrollY > 0;
    if (scrolled !== this.state.isScrolled) {
      this.state.isScrolled = scrolled;
    }
  }

  private handleResize(): void {
    // Close mobile menu on large screens (768px+)
    if (window.innerWidth >= 768 && this.state.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // Handle outside clicks to close dropdowns and mobile menu
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside navigation container
    const navContainer = document.getElementById('main-navigation');
    if (navContainer && !navContainer.contains(target)) {
      this.closeAllDropdowns();

      // Close mobile menu if clicked outside
      if (this.state.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    }
  }

  // Get navigation items with badges/notifications
  getNavigationWithNotifications(): NavigationItem[] {
    // This could be enhanced to fetch real-time notifications
    return this.state.navigationItems.map((item) => {
      // Add notification badges based on item
      switch (item.name) {
        case 'AI Lab':
          return { ...item, badge: 'New' };
        default:
          return item;
      }
    });
  }

  // Check if any dropdown is currently open
  hasOpenDropdown(): boolean {
    return this.state.activeDropdown !== null;
  }

  // Get the currently active navigation item
  getActiveItem(): NavigationItem | null {
    for (const item of this.state.navigationItems) {
      if (item.current) return item;

      if (item.children) {
        const activeChild = item.children.find((child) => child.current);
        if (activeChild) return activeChild;
      }
    }

    return null;
  }

  private trackNavigationEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'navigation',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('resize', this.handleResize);

      // Re-enable body scroll
      document.body.style.overflow = '';
    }
  }

  getState(): NavigationState {
    return { ...this.state };
  }

  getActions(): NavigationActions {
    return this.actions;
  }

  setState(updates: Partial<NavigationState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default NavigationLogic;
