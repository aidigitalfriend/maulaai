// Button Logic
// Handles various button states, types, and interactions

export interface ButtonVariant {
  variant:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
}

export interface ButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  loadingText: string;
  clickCount: number;
  lastClickTime: number;
  variant: ButtonVariant['variant'];
  size: ButtonVariant['size'];
}

export interface ButtonActions {
  setLoading: (loading: boolean, text?: string) => void;
  setDisabled: (disabled: boolean) => void;
  handleClick: (event: MouseEvent) => void;
  setVariant: (variant: ButtonVariant['variant']) => void;
  setSize: (size: ButtonVariant['size']) => void;
  resetState: () => void;
}

export class ButtonLogic {
  private state: ButtonState;
  private actions: ButtonActions;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private rippleElements: HTMLElement[] = [];

  constructor(
    initialVariant: ButtonVariant['variant'] = 'default',
    initialSize: ButtonVariant['size'] = 'default'
  ) {
    this.state = {
      isLoading: false,
      isDisabled: false,
      loadingText: 'Loading...',
      clickCount: 0,
      lastClickTime: 0,
      variant: initialVariant,
      size: initialSize,
    };

    this.actions = {
      setLoading: this.setLoading.bind(this),
      setDisabled: this.setDisabled.bind(this),
      handleClick: this.handleClick.bind(this),
      setVariant: this.setVariant.bind(this),
      setSize: this.setSize.bind(this),
      resetState: this.resetState.bind(this),
    };
  }

  setLoading(loading: boolean, text?: string): void {
    this.state.isLoading = loading;
    if (text) {
      this.state.loadingText = text;
    }

    // Automatically disable when loading
    if (loading) {
      this.state.isDisabled = true;
    } else {
      this.state.isDisabled = false;
    }

    this.trackButtonEvent('loading_state_changed', {
      is_loading: loading,
      loading_text: text || this.state.loadingText,
    });
  }

  setDisabled(disabled: boolean): void {
    this.state.isDisabled = disabled;
  }

  setVariant(variant: ButtonVariant['variant']): void {
    this.state.variant = variant;
  }

  setSize(size: ButtonVariant['size']): void {
    this.state.size = size;
  }

  handleClick(event: MouseEvent): void {
    // Prevent action if disabled or loading
    if (this.state.isDisabled || this.state.isLoading) {
      event.preventDefault();
      return;
    }

    const currentTime = Date.now();

    // Update click tracking
    this.state.clickCount++;
    this.state.lastClickTime = currentTime;

    // Add ripple effect
    this.addRippleEffect(event);

    // Debounce rapid clicks
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.trackButtonEvent('button_clicked', {
        variant: this.state.variant,
        size: this.state.size,
        click_count: this.state.clickCount,
        timestamp: currentTime,
      });
    }, 100);
  }

  private addRippleEffect(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
    `;

    // Ensure button has relative positioning for ripple
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }

    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    this.rippleElements.push(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      this.rippleElements = this.rippleElements.filter((el) => el !== ripple);
    }, 600);
  }

  resetState(): void {
    this.state.isLoading = false;
    this.state.isDisabled = false;
    this.state.clickCount = 0;
    this.state.lastClickTime = 0;
    this.state.loadingText = 'Loading...';

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }

    // Clear any remaining ripples
    this.rippleElements.forEach((ripple) => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    });
    this.rippleElements = [];
  }

  // Get CSS classes for the button based on variant and size
  getButtonClasses(): string {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'whitespace-nowrap',
      'rounded-md',
      'text-sm',
      'font-medium',
      'ring-offset-background',
      'transition-colors',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      'disabled:pointer-events-none',
      'disabled:opacity-50',
      'relative',
      'overflow-hidden',
    ];

    // Variant classes
    const variantClasses = {
      default: ['bg-primary', 'text-primary-foreground', 'hover:bg-primary/90'],
      destructive: [
        'bg-destructive',
        'text-destructive-foreground',
        'hover:bg-destructive/90',
      ],
      outline: [
        'border',
        'border-input',
        'bg-background',
        'hover:bg-accent',
        'hover:text-accent-foreground',
      ],
      secondary: [
        'bg-secondary',
        'text-secondary-foreground',
        'hover:bg-secondary/80',
      ],
      ghost: ['hover:bg-accent', 'hover:text-accent-foreground'],
      link: ['text-primary', 'underline-offset-4', 'hover:underline'],
    };

    // Size classes
    const sizeClasses = {
      default: ['h-10', 'px-4', 'py-2'],
      sm: ['h-9', 'rounded-md', 'px-3'],
      lg: ['h-11', 'rounded-md', 'px-8'],
      icon: ['h-10', 'w-10'],
    };

    return [
      ...baseClasses,
      ...variantClasses[this.state.variant],
      ...sizeClasses[this.state.size],
      this.state.isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
    ].join(' ');
  }

  // Get loading spinner element
  getLoadingSpinner(): string {
    return `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
  }

  // Check if button should show as pressed/active
  isPressed(): boolean {
    return (
      this.state.isLoading ||
      (this.state.lastClickTime > 0 &&
        Date.now() - this.state.lastClickTime < 150)
    );
  }

  // Get appropriate ARIA attributes
  getAriaAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};

    if (this.state.isDisabled) {
      attributes['aria-disabled'] = 'true';
    }

    if (this.state.isLoading) {
      attributes['aria-busy'] = 'true';
      attributes['aria-live'] = 'polite';
    }

    if (this.isPressed()) {
      attributes['aria-pressed'] = 'true';
    }

    return attributes;
  }

  // Get button text with loading state
  getButtonText(originalText: string): string {
    return this.state.isLoading ? this.state.loadingText : originalText;
  }

  // Async action wrapper with automatic loading state
  async executeAsyncAction<T>(
    action: () => Promise<T>,
    loadingText?: string
  ): Promise<T> {
    this.setLoading(true, loadingText);

    try {
      const result = await action();
      this.setLoading(false);
      return result;
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  private trackButtonEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'button',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.rippleElements.forEach((ripple) => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    });

    this.resetState();
  }

  getState(): ButtonState {
    return { ...this.state };
  }

  getActions(): ButtonActions {
    return this.actions;
  }

  setState(updates: Partial<ButtonState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default ButtonLogic;
