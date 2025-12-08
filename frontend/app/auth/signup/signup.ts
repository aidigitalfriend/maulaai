/**
 * Signup Logic - Authentication Module
 * Handles user registration, validation, and signup process
 */

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted?: boolean;
}

export interface SignupState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: ValidationErrors;
  currentStep: 'form' | 'verification' | 'complete';
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
  requiresVerification?: boolean;
}

export class SignupLogic {
  private state: SignupState;

  constructor() {
    this.state = {
      isLoading: false,
      error: null,
      success: false,
      validationErrors: {},
      currentStep: 'form',
    };
  }

  /**
   * Validate signup form data
   */
  validateForm(data: SignupFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (data.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (data.email.trim().length > 320) {
      errors.email = 'Email address is too long';
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (data.password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    } else if (!/(?=.*[a-z])/.test(data.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(data.password)) {
      errors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  }

  /**
   * Check password strength
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
      suggestions.push('Consider using 12+ characters for better security');

    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else suggestions.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else suggestions.push('Add special characters (!@#$%^&*)');

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
   * Check if email is already registered
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return true; // Assume available if check fails
    }
  }

  /**
   * Submit signup form
   */
  async submitSignup(formData: SignupFormData): Promise<SignupResponse> {
    // Validate form
    const validationErrors = this.validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      this.state.validationErrors = validationErrors;
      throw new Error('Please fix the validation errors');
    }

    this.state.isLoading = true;
    this.state.error = null;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          authMethod: 'password',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      this.state.success = true;
      this.state.currentStep = data.requiresVerification
        ? 'verification'
        : 'complete';

      return {
        success: true,
        message: data.message || 'Account created successfully',
        user: data.user,
        token: data.token,
        requiresVerification: data.requiresVerification,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      this.state.error = message;
      throw new Error(message);
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email';
      throw new Error(message);
    }
  }

  /**
   * Handle OAuth signup (Google, GitHub, etc.)
   */
  async initiateOAuthSignup(
    provider: 'google' | 'github' | 'discord'
  ): Promise<void> {
    try {
      window.location.href = `/api/auth/oauth/${provider}?action=signup`;
    } catch (error) {
      throw new Error(`Failed to initiate ${provider} signup`);
    }
  }

  /**
   * Clear errors
   */
  clearError(): void {
    this.state.error = null;
    this.state.validationErrors = {};
  }

  /**
   * Reset state
   */
  reset(): void {
    this.state = {
      isLoading: false,
      error: null,
      success: false,
      validationErrors: {},
      currentStep: 'form',
    };
  }

  /**
   * Get current state
   */
  getState(): SignupState {
    return { ...this.state };
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
  }

  /**
   * Generate secure password suggestion
   */
  generateSecurePassword(length: number = 12): string {
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

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  /**
   * Handle signup success
   */
  handleSignupSuccess(response: SignupResponse): void {
    this.state.success = true;
    this.state.error = null;

    if (response.requiresVerification) {
      this.state.currentStep = 'verification';
    } else {
      this.state.currentStep = 'complete';
    }
  }

  /**
   * Track signup analytics
   */
  trackSignupEvent(step: string, properties?: Record<string, any>): void {
    try {
      // Analytics tracking (replace with your analytics service)
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Signup Step', {
          step,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking signup event:', error);
    }
  }
}

// Export singleton instance
export const signupLogic = new SignupLogic();

// Export utility functions
export const signupUtils = {
  /**
   * Format validation error messages
   */
  formatValidationError(errors: ValidationErrors): string {
    const errorMessages = Object.values(errors).filter(Boolean);
    return errorMessages.join('. ');
  },

  /**
   * Check if form is valid
   */
  isFormValid(errors: ValidationErrors): boolean {
    return Object.keys(errors).length === 0;
  },

  /**
   * Get signup progress percentage
   */
  getSignupProgress(step: 'form' | 'verification' | 'complete'): number {
    const steps = { form: 33, verification: 66, complete: 100 };
    return steps[step] || 0;
  },
};
