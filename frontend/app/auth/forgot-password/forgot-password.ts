/**
 * Forgot Password Logic - Authentication Module
 * Handles password reset flow, token validation, and password updates
 */

export interface ForgotPasswordState {
  isLoading: boolean;
  isSending: boolean;
  isResetting: boolean;
  error: string | null;
  success: boolean;
  emailSent: boolean;
  passwordReset: boolean;
  email: string | null;
  token: string | null;
  canResend: boolean;
  countdown: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
  resetToken?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
  redirectUrl?: string;
}

export class ForgotPasswordLogic {
  private state: ForgotPasswordState;
  private resendTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      isLoading: false,
      isSending: false,
      isResetting: false,
      error: null,
      success: false,
      emailSent: false,
      passwordReset: false,
      email: null,
      token: null,
      canResend: false,
      countdown: 60,
    };
  }

  /**
   * Initialize forgot password flow
   */
  initialize(email?: string, token?: string): void {
    this.state.email = email || null;
    this.state.token = token || null;

    if (token && email) {
      this.validateResetToken(token, email);
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      return 'Email address is required';
    }

    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }

    if (email.trim().length > 320) {
      return 'Email address is too long';
    }

    return null;
  }

  /**
   * Validate password format
   */
  validatePassword(password: string): string | null {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (password.length > 128) {
      return 'Password must be less than 128 characters';
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }

    return null;
  }

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation(
    password: string,
    confirmPassword: string
  ): string | null {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  }

  /**
   * Send password reset email
   */
  async sendResetEmail(email: string): Promise<ForgotPasswordResponse> {
    const emailError = this.validateEmail(email);
    if (emailError) {
      throw new Error(emailError);
    }

    this.state.isSending = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      this.state.emailSent = true;
      this.state.email = email.trim().toLowerCase();
      this.state.success = true;
      this.state.canResend = false;
      this.state.countdown = 60;
      this.startResendCountdown();

      this.trackPasswordResetEvent('reset_email_sent', { email });

      return {
        success: true,
        message: data.message || 'Password reset email sent successfully',
        emailSent: true,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send reset email';
      this.state.error = message;
      this.trackPasswordResetEvent('reset_email_failed', {
        email,
        error: message,
      });
      throw new Error(message);
    } finally {
      this.state.isSending = false;
    }
  }

  /**
   * Validate reset token
   */
  async validateResetToken(token: string, email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();
      return data.valid || false;
    } catch (error) {
      console.error('Error validating reset token:', error);
      return false;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    resetData: PasswordResetData
  ): Promise<ResetPasswordResponse> {
    // Validate inputs
    const passwordError = this.validatePassword(resetData.newPassword);
    if (passwordError) {
      throw new Error(passwordError);
    }

    const confirmError = this.validatePasswordConfirmation(
      resetData.newPassword,
      resetData.confirmPassword
    );
    if (confirmError) {
      throw new Error(confirmError);
    }

    this.state.isResetting = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetData.token,
          email: resetData.email,
          newPassword: resetData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      this.state.passwordReset = true;
      this.state.success = true;

      this.trackPasswordResetEvent('password_reset_success', {
        email: resetData.email,
      });

      return {
        success: true,
        message: data.message || 'Password reset successfully',
        user: data.user,
        token: data.token,
        redirectUrl: data.redirectUrl || '/dashboard',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password';
      this.state.error = message;
      this.trackPasswordResetEvent('password_reset_failed', {
        email: resetData.email,
        error: message,
      });
      throw new Error(message);
    } finally {
      this.state.isResetting = false;
    }
  }

  /**
   * Resend password reset email
   */
  async resendResetEmail(): Promise<void> {
    if (!this.state.email) {
      throw new Error('Email address not found');
    }

    if (!this.state.canResend) {
      throw new Error(
        `Please wait ${this.state.countdown} seconds before resending`
      );
    }

    await this.sendResetEmail(this.state.email);
  }

  /**
   * Start resend countdown timer
   */
  private startResendCountdown(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }

    this.resendTimer = setInterval(() => {
      if (this.state.countdown > 0) {
        this.state.countdown--;
      } else {
        this.state.canResend = true;
        if (this.resendTimer) {
          clearInterval(this.resendTimer);
          this.resendTimer = null;
        }
      }
    }, 1000);
  }

  /**
   * Get password strength score
   */
  getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8)
      suggestions.push('Consider using 12+ characters');

    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else suggestions.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else suggestions.push('Add special characters');

    const labels = [
      'Very Weak',
      'Weak',
      'Fair',
      'Good',
      'Strong',
      'Very Strong',
    ];
    const colors = [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#16a34a',
      '#15803d',
    ];

    return {
      score,
      label: labels[score] || 'Very Weak',
      color: colors[score] || '#ef4444',
      suggestions,
    };
  }

  /**
   * Parse reset URL parameters
   */
  parseResetUrl(url: string): { email?: string; token?: string } {
    try {
      const urlObj = new URL(url);
      const email = urlObj.searchParams.get('email');
      const token = urlObj.searchParams.get('token');

      return {
        email: email || undefined,
        token: token || undefined,
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Get reset instructions
   */
  getResetInstructions(email: string): {
    steps: string[];
    troubleshooting: string[];
    securityTips: string[];
  } {
    return {
      steps: [
        'Check your email inbox for a password reset message',
        'Look for an email from "noreply@onelastai.co"',
        'Click the "Reset Password" button in the email',
        'Enter your new password on the reset page',
      ],
      troubleshooting: [
        'Check your spam or junk folder',
        'Ensure the email address is correct',
        'Wait a few minutes for the email to arrive',
        'Try requesting a new reset link if the current one expired',
      ],
      securityTips: [
        'Use a strong, unique password',
        'Include uppercase, lowercase, numbers, and special characters',
        'Avoid using personal information in your password',
        'Consider using a password manager',
      ],
    };
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.state.error = null;
  }

  /**
   * Clear all state
   */
  clear(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }

    this.state = {
      isLoading: false,
      isSending: false,
      isResetting: false,
      error: null,
      success: false,
      emailSent: false,
      passwordReset: false,
      email: null,
      token: null,
      canResend: false,
      countdown: 60,
    };
  }

  /**
   * Get current state
   */
  getState(): ForgotPasswordState {
    return { ...this.state };
  }

  /**
   * Get formatted countdown
   */
  getFormattedCountdown(): string {
    const minutes = Math.floor(this.state.countdown / 60);
    const seconds = this.state.countdown % 60;

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }

  /**
   * Check if reset token is expired
   */
  isTokenExpired(timestamp: string): boolean {
    try {
      const resetTime = new Date(timestamp);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 1; // 1-hour expiration for reset tokens
    } catch (error) {
      return true;
    }
  }

  /**
   * Track password reset events
   */
  private trackPasswordResetEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Password Reset', {
          event,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking password reset event:', error);
    }
  }

  /**
   * Generate secure password
   */
  generateSecurePassword(length: number = 14): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one character from each category
    const categories = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      '!@#$%^&*',
    ];

    categories.forEach((category) => {
      password += category.charAt(Math.floor(Math.random() * category.length));
    });

    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  /**
   * Cleanup timers on unmount
   */
  cleanup(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }
}

// Export singleton instance
export const forgotPasswordLogic = new ForgotPasswordLogic();

// Export utility functions
export const passwordResetUtils = {
  /**
   * Format time remaining for reset token
   */
  formatTimeRemaining(expiresAt: string): string {
    try {
      const expires = new Date(expiresAt);
      const now = new Date();
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) return 'Expired';

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    } catch (error) {
      return 'Invalid';
    }
  },

  /**
   * Get password requirements checklist
   */
  getPasswordRequirements(): Array<{
    rule: string;
    check: (password: string) => boolean;
  }> {
    return [
      {
        rule: 'At least 8 characters long',
        check: (pwd) => pwd.length >= 8,
      },
      {
        rule: 'Contains uppercase letter',
        check: (pwd) => /[A-Z]/.test(pwd),
      },
      {
        rule: 'Contains lowercase letter',
        check: (pwd) => /[a-z]/.test(pwd),
      },
      {
        rule: 'Contains number',
        check: (pwd) => /\d/.test(pwd),
      },
      {
        rule: 'Contains special character',
        check: (pwd) => /[^A-Za-z0-9]/.test(pwd),
      },
    ];
  },
};
