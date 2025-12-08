/**
 * Email Verification Logic - Authentication Module
 * Handles email verification flow, token validation, and verification actions
 */

export interface VerificationState {
  isLoading: boolean;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
  success: boolean;
  verified: boolean;
  canResend: boolean;
  countdown: number;
  email: string | null;
  token: string | null;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  verified?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
  redirectUrl?: string;
}

export interface ResendResponse {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
}

export class VerifyEmailLogic {
  private state: VerificationState;
  private resendTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      isLoading: false,
      isVerifying: false,
      isResending: false,
      error: null,
      success: false,
      verified: false,
      canResend: false,
      countdown: 60,
      email: null,
      token: null,
    };
  }

  /**
   * Initialize verification flow
   */
  initialize(email?: string, token?: string): void {
    this.state.email = email || null;
    this.state.token = token || null;
    this.state.canResend = false;
    this.state.countdown = 60;

    if (token) {
      this.verifyToken(token);
    } else {
      this.startResendCountdown();
    }
  }

  /**
   * Verify email token
   */
  async verifyToken(token: string): Promise<VerificationResponse> {
    this.state.isVerifying = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }

      this.state.success = true;
      this.state.verified = true;
      this.trackVerificationEvent('verification_success');

      return {
        success: true,
        message: data.message || 'Email verified successfully',
        verified: true,
        user: data.user,
        token: data.token,
        redirectUrl: data.redirectUrl || '/dashboard',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Email verification failed';
      this.state.error = message;
      this.trackVerificationEvent('verification_failed', { error: message });
      throw new Error(message);
    } finally {
      this.state.isVerifying = false;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email?: string): Promise<ResendResponse> {
    const targetEmail = email || this.state.email;
    if (!targetEmail) {
      throw new Error('Email address is required');
    }

    if (!this.state.canResend) {
      throw new Error(
        `Please wait ${this.state.countdown} seconds before resending`
      );
    }

    this.state.isResending = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      // Reset countdown and disable resend
      this.state.canResend = false;
      this.state.countdown = data.cooldownSeconds || 60;
      this.startResendCountdown();

      this.trackVerificationEvent('resend_verification', {
        email: targetEmail,
      });

      return {
        success: true,
        message: data.message || 'Verification email sent successfully',
        cooldownSeconds: data.cooldownSeconds,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email';
      this.state.error = message;
      this.trackVerificationEvent('resend_failed', { error: message });
      throw new Error(message);
    } finally {
      this.state.isResending = false;
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verification-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      this.state.verified = data.verified || false;
      return this.state.verified;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
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
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Parse verification URL
   */
  parseVerificationUrl(url: string): { email?: string; token?: string } {
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
   * Generate verification email content
   */
  getVerificationInstructions(email: string): {
    steps: string[];
    troubleshooting: string[];
    supportInfo: string;
  } {
    return {
      steps: [
        'Check your email inbox for a verification message',
        'Look for an email from "noreply@onelastai.co"',
        'Click the "Verify Email Address" button in the email',
        "You'll be redirected back to complete your signup",
      ],
      troubleshooting: [
        'Check your spam or junk folder',
        'Ensure the email address is correct',
        'Wait a few minutes for the email to arrive',
        'Add our domain to your trusted senders list',
      ],
      supportInfo:
        'If you continue having issues, please contact our support team',
    };
  }

  /**
   * Handle verification completion
   */
  handleVerificationSuccess(response: VerificationResponse): void {
    this.state.success = true;
    this.state.verified = true;
    this.state.error = null;

    // Store user session if provided
    if (response.token && response.user) {
      this.storeUserSession(response.token, response.user);
    }

    this.trackVerificationEvent('verification_completed');
  }

  /**
   * Store user session after verification
   */
  private storeUserSession(token: string, user: any): void {
    try {
      // Store in localStorage or cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error storing user session:', error);
    }
  }

  /**
   * Clear verification state
   */
  clear(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }

    this.state = {
      isLoading: false,
      isVerifying: false,
      isResending: false,
      error: null,
      success: false,
      verified: false,
      canResend: false,
      countdown: 60,
      email: null,
      token: null,
    };
  }

  /**
   * Get current state
   */
  getState(): VerificationState {
    return { ...this.state };
  }

  /**
   * Set email for verification
   */
  setEmail(email: string): void {
    this.state.email = email;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.error = null;
  }

  /**
   * Get formatted countdown time
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
   * Track verification analytics events
   */
  private trackVerificationEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Email Verification', {
          event,
          email: this.state.email,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking verification event:', error);
    }
  }

  /**
   * Handle magic link verification
   */
  async verifyMagicLink(
    token: string,
    email?: string
  ): Promise<VerificationResponse> {
    this.state.isVerifying = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: email || this.state.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Magic link verification failed');
      }

      this.handleVerificationSuccess(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Magic link verification failed';
      this.state.error = message;
      throw new Error(message);
    } finally {
      this.state.isVerifying = false;
    }
  }

  /**
   * Check if verification is expired
   */
  isVerificationExpired(timestamp: string): boolean {
    try {
      const verificationTime = new Date(timestamp);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - verificationTime.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 24; // 24-hour expiration
    } catch (error) {
      return true; // Assume expired if can't parse
    }
  }

  /**
   * Cleanup on component unmount
   */
  cleanup(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = null;
    }
  }
}

// Export singleton instance
export const verifyEmailLogic = new VerifyEmailLogic();

// Export utility functions
export const verificationUtils = {
  /**
   * Format email for display (hide middle characters)
   */
  formatEmailDisplay(email: string): string {
    if (!email) return '';

    const [localPart, domain] = email.split('@');
    if (!domain) return email;

    if (localPart.length <= 3) {
      return email;
    }

    const visibleChars = Math.max(2, Math.floor(localPart.length * 0.3));
    const hiddenCount = localPart.length - visibleChars * 2;
    const maskedLocal =
      localPart.slice(0, visibleChars) +
      '*'.repeat(hiddenCount) +
      localPart.slice(-visibleChars);

    return `${maskedLocal}@${domain}`;
  },

  /**
   * Get email provider icon
   */
  getEmailProviderInfo(email: string): {
    name: string;
    icon: string;
    webmailUrl: string;
  } {
    const domain = email.split('@')[1]?.toLowerCase();

    const providers: Record<
      string,
      { name: string; icon: string; webmailUrl: string }
    > = {
      'gmail.com': {
        name: 'Gmail',
        icon: '📧',
        webmailUrl: 'https://mail.google.com',
      },
      'outlook.com': {
        name: 'Outlook',
        icon: '📮',
        webmailUrl: 'https://outlook.live.com',
      },
      'hotmail.com': {
        name: 'Hotmail',
        icon: '📮',
        webmailUrl: 'https://outlook.live.com',
      },
      'yahoo.com': {
        name: 'Yahoo',
        icon: '📬',
        webmailUrl: 'https://mail.yahoo.com',
      },
      'icloud.com': {
        name: 'iCloud',
        icon: '☁️',
        webmailUrl: 'https://www.icloud.com/mail',
      },
    };

    return providers[domain] || { name: 'Email', icon: '📧', webmailUrl: '#' };
  },

  /**
   * Generate verification email preview
   */
  generateEmailPreview(email: string): string {
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Verify Your Email Address</h2>
        <p>Hi there!</p>
        <p>Thanks for signing up! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Verify Email Address
          </a>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The OneLastAI Team</p>
      </div>
    `;
  },
};
