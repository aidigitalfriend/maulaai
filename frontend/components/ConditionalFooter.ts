// ConditionalFooter Logic
// Handles path-based footer visibility and responsive footer behavior

export interface ConditionalFooterState {
  shouldShowFooter: boolean;
  currentPath: string;
  isVisible: boolean;
}

export interface ConditionalFooterActions {
  updatePath: (path: string) => void;
  checkFooterVisibility: (path: string) => boolean;
  setVisibility: (visible: boolean) => void;
}

export class ConditionalFooterLogic {
  private state: ConditionalFooterState;
  private actions: ConditionalFooterActions;
  private hiddenPaths: string[];

  constructor() {
    this.state = {
      shouldShowFooter: true,
      currentPath: '/',
      isVisible: true,
    };

    this.actions = {
      updatePath: this.updatePath.bind(this),
      checkFooterVisibility: this.checkFooterVisibility.bind(this),
      setVisibility: this.setVisibility.bind(this),
    };

    // Define paths where footer should be hidden
    this.hiddenPaths = [
      '/auth/login',
      '/auth/signup',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/verify-2fa',
      '/payment/success',
      '/payment/cancel',
      '/payment',
      '/subscribe',
    ];

    // Initialize with current path
    if (typeof window !== 'undefined') {
      this.updatePath(window.location.pathname);
    }
  }

  updatePath(path: string): void {
    this.state.currentPath = path;
    this.state.shouldShowFooter = this.checkFooterVisibility(path);

    // Analytics tracking for path changes
    this.trackPathChange(path, this.state.shouldShowFooter);
  }

  checkFooterVisibility(path: string): boolean {
    // Check if current path matches any hidden path patterns
    const shouldHide = this.hiddenPaths.some((hiddenPath) => {
      // Exact match
      if (hiddenPath === path) return true;

      // Prefix match (for paths like /auth/* or /payment/*)
      if (hiddenPath.endsWith('/') && path.startsWith(hiddenPath)) return true;

      // Pattern match for paths without trailing slash
      if (path.startsWith(hiddenPath + '/')) return true;

      return false;
    });

    return !shouldHide;
  }

  setVisibility(visible: boolean): void {
    this.state.isVisible = visible;
  }

  // Add a new path to the hidden paths list
  addHiddenPath(path: string): void {
    if (!this.hiddenPaths.includes(path)) {
      this.hiddenPaths.push(path);
      // Re-check current path visibility
      this.state.shouldShowFooter = this.checkFooterVisibility(
        this.state.currentPath
      );
    }
  }

  // Remove a path from the hidden paths list
  removeHiddenPath(path: string): void {
    this.hiddenPaths = this.hiddenPaths.filter((p) => p !== path);
    // Re-check current path visibility
    this.state.shouldShowFooter = this.checkFooterVisibility(
      this.state.currentPath
    );
  }

  // Get the list of hidden paths
  getHiddenPaths(): string[] {
    return [...this.hiddenPaths];
  }

  // Check if a specific path should show footer
  shouldShowFooterForPath(path: string): boolean {
    return this.checkFooterVisibility(path);
  }

  // Method to handle route changes from Next.js router
  handleRouteChange(path: string): void {
    this.updatePath(path);
  }

  private trackPathChange(path: string, footerVisible: boolean): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view_with_footer', {
        page_path: path,
        footer_visible: footerVisible,
        event_category: 'navigation',
      });
    }
  }

  getState(): ConditionalFooterState {
    return { ...this.state };
  }

  getActions(): ConditionalFooterActions {
    return this.actions;
  }

  setState(updates: Partial<ConditionalFooterState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default ConditionalFooterLogic;
