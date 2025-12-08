// Modal Logic
// Handles modal state management, accessibility, and user interactions

export interface ModalState {
  isOpen: boolean;
  isClosing: boolean;
  isAnimating: boolean;
  preventClose: boolean;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant: 'default' | 'alert' | 'confirm' | 'fullscreen';
  backdrop: boolean;
  backdropBlur: boolean;
  showCloseButton: boolean;
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  returnFocusElement: HTMLElement | null;
}

export interface ModalActions {
  open: (options?: Partial<ModalState>) => void;
  close: () => void;
  toggle: () => void;
  setTitle: (title: string) => void;
  setSize: (size: ModalState['size']) => void;
  setPreventClose: (prevent: boolean) => void;
  handleBackdropClick: (event: MouseEvent) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
}

export class ModalLogic {
  private state: ModalState;
  private actions: ModalActions;
  private focusTrap: HTMLElement[] = [];
  private originalOverflow: string = '';
  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;

  constructor(onOpen?: () => void, onClose?: () => void) {
    this.onOpenCallback = onOpen;
    this.onCloseCallback = onClose;

    this.state = {
      isOpen: false,
      isClosing: false,
      isAnimating: false,
      preventClose: false,
      title: '',
      size: 'md',
      variant: 'default',
      backdrop: true,
      backdropBlur: true,
      showCloseButton: true,
      closeOnEscape: true,
      closeOnBackdrop: true,
      returnFocusElement: null,
    };

    this.actions = {
      open: this.open.bind(this),
      close: this.close.bind(this),
      toggle: this.toggle.bind(this),
      setTitle: this.setTitle.bind(this),
      setSize: this.setSize.bind(this),
      setPreventClose: this.setPreventClose.bind(this),
      handleBackdropClick: this.handleBackdropClick.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
    };

    // Initialize keyboard event listener
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.actions.handleKeyDown);
    }
  }

  open(options?: Partial<ModalState>): void {
    if (this.state.isOpen || this.state.isAnimating) return;

    // Store the currently focused element to return focus later
    if (typeof document !== 'undefined') {
      this.state.returnFocusElement = document.activeElement as HTMLElement;
    }

    // Apply any options
    if (options) {
      Object.assign(this.state, options);
    }

    this.state.isOpen = true;
    this.state.isAnimating = true;

    // Prevent body scroll
    this.disableBodyScroll();

    // Set up focus trap
    setTimeout(() => {
      this.setupFocusTrap();
      this.state.isAnimating = false;
    }, 150);

    // Trigger callback
    if (this.onOpenCallback) {
      this.onOpenCallback();
    }

    this.trackModalEvent('modal_opened', {
      title: this.state.title,
      size: this.state.size,
      variant: this.state.variant,
    });
  }

  close(): void {
    if (!this.state.isOpen || this.state.isClosing || this.state.preventClose)
      return;

    this.state.isClosing = true;
    this.state.isAnimating = true;

    // Remove focus trap
    this.removeFocusTrap();

    // Animation delay before actually closing
    setTimeout(() => {
      this.state.isOpen = false;
      this.state.isClosing = false;
      this.state.isAnimating = false;

      // Restore body scroll
      this.enableBodyScroll();

      // Return focus to the element that was focused before opening
      if (this.state.returnFocusElement) {
        this.state.returnFocusElement.focus();
        this.state.returnFocusElement = null;
      }

      // Trigger callback
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }

      this.trackModalEvent('modal_closed', {
        title: this.state.title,
      });
    }, 150);
  }

  toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setTitle(title: string): void {
    this.state.title = title;
  }

  setSize(size: ModalState['size']): void {
    this.state.size = size;
  }

  setPreventClose(prevent: boolean): void {
    this.state.preventClose = prevent;
  }

  handleBackdropClick(event: MouseEvent): void {
    // Only close if clicking directly on the backdrop
    if (
      event.target === event.currentTarget &&
      this.state.closeOnBackdrop &&
      !this.state.preventClose
    ) {
      this.close();
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (this.state.closeOnEscape && !this.state.preventClose) {
          event.preventDefault();
          this.close();
        }
        break;

      case 'Tab':
        this.handleTabKey(event);
        break;
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusTrap.length === 0) return;

    const firstFocusable = this.focusTrap[0];
    const lastFocusable = this.focusTrap[this.focusTrap.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  private setupFocusTrap(): void {
    if (typeof document === 'undefined') return;

    const modal = document.querySelector('[data-modal-content]');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    this.focusTrap = Array.from(focusableElements).filter(
      (el) => !el.disabled && !el.hidden && el.tabIndex !== -1
    );

    // Focus the first focusable element
    if (this.focusTrap.length > 0) {
      this.focusTrap[0].focus();
    }
  }

  private removeFocusTrap(): void {
    this.focusTrap = [];
  }

  private disableBodyScroll(): void {
    if (typeof document === 'undefined') return;

    this.originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // For iOS Safari
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  }

  private enableBodyScroll(): void {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = this.originalOverflow;

    // For iOS Safari - restore scroll position
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY) * -1);
    }
  }

  // Get CSS classes for the modal backdrop
  getBackdropClasses(): string {
    const baseClasses = [
      'fixed',
      'inset-0',
      'z-50',
      'flex',
      'items-center',
      'justify-center',
      'transition-opacity',
      'duration-200',
    ];

    const visibilityClasses =
      this.state.isOpen && !this.state.isClosing
        ? ['opacity-100']
        : ['opacity-0'];

    const backdropClasses = this.state.backdrop ? ['bg-black/50'] : [];

    const blurClasses = this.state.backdropBlur ? ['backdrop-blur-sm'] : [];

    return [
      ...baseClasses,
      ...visibilityClasses,
      ...backdropClasses,
      ...blurClasses,
    ].join(' ');
  }

  // Get CSS classes for the modal content
  getContentClasses(): string {
    const baseClasses = [
      'relative',
      'bg-white',
      'dark:bg-gray-900',
      'rounded-lg',
      'shadow-xl',
      'transition-all',
      'duration-200',
      'max-h-[90vh]',
      'overflow-hidden',
      'focus:outline-none',
    ];

    // Size classes
    const sizeClasses = {
      sm: ['w-full', 'max-w-md', 'mx-4'],
      md: ['w-full', 'max-w-lg', 'mx-4'],
      lg: ['w-full', 'max-w-2xl', 'mx-4'],
      xl: ['w-full', 'max-w-4xl', 'mx-4'],
      full: ['w-[95vw]', 'h-[95vh]', 'max-w-none', 'max-h-none'],
    };

    // Animation classes
    const animationClasses =
      this.state.isOpen && !this.state.isClosing
        ? ['scale-100', 'opacity-100']
        : ['scale-95', 'opacity-0'];

    // Variant classes
    const variantClasses = {
      default: [],
      alert: ['border-l-4', 'border-yellow-500'],
      confirm: ['border-l-4', 'border-blue-500'],
      fullscreen: ['rounded-none'],
    };

    return [
      ...baseClasses,
      ...sizeClasses[this.state.size],
      ...animationClasses,
      ...variantClasses[this.state.variant],
    ].join(' ');
  }

  // Get CSS classes for the modal header
  getHeaderClasses(): string {
    return [
      'flex',
      'items-center',
      'justify-between',
      'p-6',
      'border-b',
      'border-gray-200',
      'dark:border-gray-700',
    ].join(' ');
  }

  // Get CSS classes for the modal body
  getBodyClasses(): string {
    return [
      'p-6',
      'overflow-y-auto',
      'max-h-[calc(90vh-140px)]', // Account for header and footer
    ].join(' ');
  }

  // Get CSS classes for the modal footer
  getFooterClasses(): string {
    return [
      'flex',
      'items-center',
      'justify-end',
      'space-x-3',
      'p-6',
      'border-t',
      'border-gray-200',
      'dark:border-gray-700',
    ].join(' ');
  }

  // Get ARIA attributes for accessibility
  getAriaAttributes(): Record<string, string> {
    return {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': this.state.title ? 'modal-title' : undefined,
      'aria-describedby': 'modal-content',
      'data-modal-content': 'true',
    };
  }

  // Check if modal should be rendered
  shouldRender(): boolean {
    return this.state.isOpen || this.state.isClosing;
  }

  private trackModalEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'modal',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.actions.handleKeyDown);
    }

    this.enableBodyScroll();
    this.removeFocusTrap();
  }

  getState(): ModalState {
    return { ...this.state };
  }

  getActions(): ModalActions {
    return this.actions;
  }

  setState(updates: Partial<ModalState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default ModalLogic;
