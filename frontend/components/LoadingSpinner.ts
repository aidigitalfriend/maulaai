// LoadingSpinner Logic
// Handles loading animation states, sizes, and accessibility

export interface SpinnerVariant {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive';
}

export interface SpinnerState {
  isVisible: boolean;
  message: string;
  progress: number;
  isIndeterminate: boolean;
  size: SpinnerVariant['size'];
  variant: SpinnerVariant['variant'];
  duration: number;
  startTime: number;
}

export interface SpinnerActions {
  show: (message?: string) => void;
  hide: () => void;
  setMessage: (message: string) => void;
  setProgress: (progress: number) => void;
  setSize: (size: SpinnerVariant['size']) => void;
  setVariant: (variant: SpinnerVariant['variant']) => void;
  setIndeterminate: (indeterminate: boolean) => void;
}

export class LoadingSpinnerLogic {
  private state: SpinnerState;
  private actions: SpinnerActions;
  private animationFrame: number | null = null;
  private progressTimer: NodeJS.Timeout | null = null;

  constructor(
    initialSize: SpinnerVariant['size'] = 'md',
    initialVariant: SpinnerVariant['variant'] = 'default'
  ) {
    this.state = {
      isVisible: false,
      message: 'Loading...',
      progress: 0,
      isIndeterminate: true,
      size: initialSize,
      variant: initialVariant,
      duration: 0,
      startTime: 0,
    };

    this.actions = {
      show: this.show.bind(this),
      hide: this.hide.bind(this),
      setMessage: this.setMessage.bind(this),
      setProgress: this.setProgress.bind(this),
      setSize: this.setSize.bind(this),
      setVariant: this.setVariant.bind(this),
      setIndeterminate: this.setIndeterminate.bind(this),
    };
  }

  show(message?: string): void {
    this.state.isVisible = true;
    this.state.startTime = Date.now();

    if (message) {
      this.state.message = message;
    }

    // Start duration tracking
    this.startDurationTracking();

    this.trackSpinnerEvent('spinner_shown', {
      message: this.state.message,
      size: this.state.size,
      variant: this.state.variant,
      is_indeterminate: this.state.isIndeterminate,
    });
  }

  hide(): void {
    this.state.isVisible = false;
    this.state.duration = Date.now() - this.state.startTime;

    // Stop duration tracking
    this.stopDurationTracking();

    this.trackSpinnerEvent('spinner_hidden', {
      duration: this.state.duration,
      final_progress: this.state.progress,
    });

    // Reset progress when hiding
    this.state.progress = 0;
  }

  setMessage(message: string): void {
    this.state.message = message;
  }

  setProgress(progress: number): void {
    // Clamp progress between 0 and 100
    this.state.progress = Math.max(0, Math.min(100, progress));

    // Switch to determinate mode if progress is set
    if (!this.state.isIndeterminate) {
      this.state.isIndeterminate = false;
    }
  }

  setSize(size: SpinnerVariant['size']): void {
    this.state.size = size;
  }

  setVariant(variant: SpinnerVariant['variant']): void {
    this.state.variant = variant;
  }

  setIndeterminate(indeterminate: boolean): void {
    this.state.isIndeterminate = indeterminate;

    if (indeterminate) {
      this.state.progress = 0;
    }
  }

  private startDurationTracking(): void {
    const updateDuration = () => {
      if (this.state.isVisible) {
        this.state.duration = Date.now() - this.state.startTime;
        this.animationFrame = requestAnimationFrame(updateDuration);
      }
    };

    this.animationFrame = requestAnimationFrame(updateDuration);
  }

  private stopDurationTracking(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Get CSS classes for the spinner based on size and variant
  getSpinnerClasses(): string {
    const baseClasses = ['animate-spin', 'rounded-full', 'border-solid'];

    // Size classes
    const sizeClasses = {
      xs: ['w-4', 'h-4', 'border-2'],
      sm: ['w-6', 'h-6', 'border-2'],
      md: ['w-8', 'h-8', 'border-3'],
      lg: ['w-12', 'h-12', 'border-4'],
      xl: ['w-16', 'h-16', 'border-4'],
    };

    // Variant classes for border colors
    const variantClasses = {
      default: ['border-gray-200', 'border-t-gray-600'],
      primary: ['border-primary/20', 'border-t-primary'],
      secondary: ['border-secondary/20', 'border-t-secondary'],
      accent: ['border-accent/20', 'border-t-accent'],
      destructive: ['border-destructive/20', 'border-t-destructive'],
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.state.size],
      ...variantClasses[this.state.variant],
    ].join(' ');
  }

  // Get CSS classes for the container
  getContainerClasses(): string {
    return [
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'space-y-2',
      this.state.isVisible ? 'opacity-100' : 'opacity-0',
      'transition-opacity',
      'duration-200',
      'ease-in-out',
    ].join(' ');
  }

  // Get CSS classes for the message text
  getMessageClasses(): string {
    const baseClasses = ['text-sm', 'text-center', 'animate-pulse'];

    const variantTextClasses = {
      default: ['text-gray-600', 'dark:text-gray-400'],
      primary: ['text-primary'],
      secondary: ['text-secondary'],
      accent: ['text-accent'],
      destructive: ['text-destructive'],
    };

    return [...baseClasses, ...variantTextClasses[this.state.variant]].join(
      ' '
    );
  }

  // Get progress bar classes (for determinate mode)
  getProgressBarClasses(): string {
    const baseClasses = [
      'w-full',
      'bg-gray-200',
      'rounded-full',
      'h-2',
      'dark:bg-gray-700',
    ];
    return baseClasses.join(' ');
  }

  getProgressFillClasses(): string {
    const baseClasses = [
      'h-2',
      'rounded-full',
      'transition-all',
      'duration-300',
      'ease-out',
    ];

    const variantClasses = {
      default: ['bg-gray-600'],
      primary: ['bg-primary'],
      secondary: ['bg-secondary'],
      accent: ['bg-accent'],
      destructive: ['bg-destructive'],
    };

    return [...baseClasses, ...variantClasses[this.state.variant]].join(' ');
  }

  // Get progress percentage as CSS width
  getProgressWidth(): string {
    return `${this.state.progress}%`;
  }

  // Get formatted duration string
  getFormattedDuration(): string {
    const seconds = Math.floor(this.state.duration / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  }

  // Auto-increment progress for simulated loading
  simulateProgress(duration: number = 5000, onComplete?: () => void): void {
    this.setIndeterminate(false);

    const startTime = Date.now();
    const increment = 100 / (duration / 100); // Update every 100ms

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      this.setProgress(newProgress);

      if (newProgress >= 100) {
        if (onComplete) {
          onComplete();
        }
        return;
      }

      this.progressTimer = setTimeout(updateProgress, 100);
    };

    updateProgress();
  }

  // Stop simulated progress
  stopSimulation(): void {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
      this.progressTimer = null;
    }
  }

  // Get ARIA attributes for accessibility
  getAriaAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {
      role: 'status',
      'aria-live': 'polite',
    };

    if (!this.state.isIndeterminate) {
      attributes['aria-valuenow'] = this.state.progress.toString();
      attributes['aria-valuemin'] = '0';
      attributes['aria-valuemax'] = '100';
      attributes['aria-valuetext'] = `${Math.round(
        this.state.progress
      )}% complete`;
    }

    if (this.state.message) {
      attributes['aria-label'] = this.state.message;
    }

    return attributes;
  }

  // Check if spinner should be shown with overlay
  shouldShowOverlay(): boolean {
    return (
      this.state.isVisible &&
      this.state.size !== 'xs' &&
      this.state.size !== 'sm'
    );
  }

  // Async action wrapper with automatic spinner
  async withSpinner<T>(
    action: () => Promise<T>,
    message?: string,
    showProgress?: boolean
  ): Promise<T> {
    this.show(message);

    if (showProgress) {
      this.setIndeterminate(false);
    }

    try {
      const result = await action();
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }

  private trackSpinnerEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'loading',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    this.stopDurationTracking();
    this.stopSimulation();
    this.hide();
  }

  getState(): SpinnerState {
    return { ...this.state };
  }

  getActions(): SpinnerActions {
    return this.actions;
  }

  setState(updates: Partial<SpinnerState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default LoadingSpinnerLogic;
