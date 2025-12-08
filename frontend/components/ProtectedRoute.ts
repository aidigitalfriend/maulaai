// ProtectedRoute Logic
// Handles authentication checks, redirect logic, and route protection

export interface ProtectedRouteState {
  isAuthenticated: boolean | null; // null = checking
  isLoading: boolean;
  user: any | null;
  redirectPath: string | null;
  error: string | null;
}

export interface ProtectedRouteActions {
  checkAuthentication: () => Promise<boolean>;
  redirectToLogin: (currentPath?: string) => void;
  clearError: () => void;
}

export class ProtectedRouteLogic {
  private state: ProtectedRouteState;
  private actions: ProtectedRouteActions;

  constructor() {
    this.state = {
      isAuthenticated: null,
      isLoading: true,
      user: null,
      redirectPath: null,
      error: null,
    };

    this.actions = {
      checkAuthentication: this.checkAuthentication.bind(this),
      redirectToLogin: this.redirectToLogin.bind(this),
      clearError: this.clearError.bind(this),
    };
  }

  async checkAuthentication(): Promise<boolean> {
    try {
      this.state.isLoading = true;
      this.state.error = null;

      // Check localStorage first for quick response
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');

      if (!storedToken) {
        this.state.isAuthenticated = false;
        return false;
      }

      if (storedUser) {
        this.state.user = JSON.parse(storedUser);
        this.state.isAuthenticated = true;
      }

      // Verify with server
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        this.state.isAuthenticated = true;
        this.state.user = userData.user;

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData.user));

        return true;
      } else {
        // Token invalid or expired
        this.state.isAuthenticated = false;
        this.state.user = null;

        // Clear invalid tokens
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');

        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.state.error = 'Authentication verification failed';
      this.state.isAuthenticated = false;
      return false;
    } finally {
      this.state.isLoading = false;
    }
  }

  redirectToLogin(currentPath?: string): void {
    // Store the current path to redirect back after login
    if (currentPath) {
      localStorage.setItem('redirectAfterLogin', currentPath);
    }

    // Track unauthorized access attempt
    this.trackSecurityEvent('unauthorized_access_attempt', {
      attempted_path: currentPath || window.location.pathname,
    });

    // Redirect to login page
    const loginUrl = `/auth/login${
      currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ''
    }`;
    window.location.href = loginUrl;
  }

  clearError(): void {
    this.state.error = null;
  }

  // Check if user has specific role or permission
  hasPermission(requiredRole?: string | string[]): boolean {
    if (!this.state.isAuthenticated || !this.state.user) {
      return false;
    }

    if (!requiredRole) {
      return true; // Just need to be authenticated
    }

    const userRoles = this.state.user.roles || [];

    if (Array.isArray(requiredRole)) {
      return requiredRole.some((role) => userRoles.includes(role));
    } else {
      return userRoles.includes(requiredRole);
    }
  }

  // Check if user subscription is active
  hasActiveSubscription(): boolean {
    if (!this.state.user) return false;

    const subscription = this.state.user.subscription;
    if (!subscription) return false;

    return (
      subscription.status === 'active' &&
      new Date(subscription.expiresAt) > new Date()
    );
  }

  // Get user profile information
  getUserProfile(): any {
    return this.state.user;
  }

  // Method to handle token refresh
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.accessToken);

        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Handle logout
  async logout(): Promise<void> {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API success
      this.state.isAuthenticated = false;
      this.state.user = null;

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');

      // Track logout
      this.trackSecurityEvent('user_logout');

      // Redirect to home or login page
      window.location.href = '/';
    }
  }

  private trackSecurityEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'security',
      });
    }
  }

  getState(): ProtectedRouteState {
    return { ...this.state };
  }

  getActions(): ProtectedRouteActions {
    return this.actions;
  }

  setState(updates: Partial<ProtectedRouteState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default ProtectedRouteLogic;
