// Card Logic
// Handles card interactions, states, and animations

export interface CardVariant {
  variant: 'default' | 'outlined' | 'elevated' | 'filled' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  interactive: boolean;
}

export interface CardState {
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isLoading: boolean;
  isExpanded: boolean;
  variant: CardVariant['variant'];
  size: CardVariant['size'];
  interactive: CardVariant['interactive'];
  clickable: boolean;
  disabled: boolean;
  selected: boolean;
}

export interface CardActions {
  setHovered: (hovered: boolean) => void;
  setPressed: (pressed: boolean) => void;
  setFocused: (focused: boolean) => void;
  setLoading: (loading: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  setSelected: (selected: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  handleClick: (event: MouseEvent) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
}

export class CardLogic {
  private state: CardState;
  private actions: CardActions;
  private onClickCallback?: (event: MouseEvent) => void;
  private onSelectCallback?: (selected: boolean) => void;

  constructor(
    variant: CardVariant['variant'] = 'default',
    size: CardVariant['size'] = 'md',
    interactive: boolean = false,
    onClick?: (event: MouseEvent) => void,
    onSelect?: (selected: boolean) => void
  ) {
    this.onClickCallback = onClick;
    this.onSelectCallback = onSelect;

    this.state = {
      isHovered: false,
      isPressed: false,
      isFocused: false,
      isLoading: false,
      isExpanded: false,
      variant,
      size,
      interactive,
      clickable: !!onClick,
      disabled: false,
      selected: false,
    };

    this.actions = {
      setHovered: this.setHovered.bind(this),
      setPressed: this.setPressed.bind(this),
      setFocused: this.setFocused.bind(this),
      setLoading: this.setLoading.bind(this),
      setExpanded: this.setExpanded.bind(this),
      setSelected: this.setSelected.bind(this),
      setDisabled: this.setDisabled.bind(this),
      handleClick: this.handleClick.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
    };
  }

  setHovered(hovered: boolean): void {
    if (this.state.disabled) return;
    this.state.isHovered = hovered;
  }

  setPressed(pressed: boolean): void {
    if (this.state.disabled) return;
    this.state.isPressed = pressed;
  }

  setFocused(focused: boolean): void {
    if (this.state.disabled) return;
    this.state.isFocused = focused;
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;

    // Disable interactions while loading
    if (loading) {
      this.state.disabled = true;
    }
  }

  setExpanded(expanded: boolean): void {
    this.state.isExpanded = expanded;

    this.trackCardEvent('card_expanded', {
      expanded,
      variant: this.state.variant,
    });
  }

  setSelected(selected: boolean): void {
    this.state.selected = selected;

    if (this.onSelectCallback) {
      this.onSelectCallback(selected);
    }

    this.trackCardEvent('card_selected', {
      selected,
      variant: this.state.variant,
    });
  }

  setDisabled(disabled: boolean): void {
    this.state.disabled = disabled;

    // Clear interactive states when disabled
    if (disabled) {
      this.state.isHovered = false;
      this.state.isPressed = false;
      this.state.isFocused = false;
    }
  }

  handleClick(event: MouseEvent): void {
    if (this.state.disabled || this.state.isLoading) {
      event.preventDefault();
      return;
    }

    // Handle selection toggle if no custom click handler
    if (!this.onClickCallback && this.state.interactive) {
      this.setSelected(!this.state.selected);
    }

    // Execute custom click handler
    if (this.onClickCallback) {
      this.onClickCallback(event);
    }

    this.trackCardEvent('card_clicked', {
      variant: this.state.variant,
      size: this.state.size,
      selected: this.state.selected,
    });
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (this.state.disabled || this.state.isLoading) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handleClick(event as any);
        break;

      case 'Escape':
        if (this.state.isExpanded) {
          this.setExpanded(false);
        }
        break;
    }
  }

  // Get CSS classes for the card container
  getCardClasses(): string {
    const baseClasses = [
      'relative',
      'transition-all',
      'duration-200',
      'ease-in-out',
    ];

    // Variant classes
    const variantClasses = {
      default: [
        'bg-white',
        'dark:bg-gray-800',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
      ],
      outlined: [
        'bg-transparent',
        'border-2',
        'border-gray-300',
        'dark:border-gray-600',
      ],
      elevated: [
        'bg-white',
        'dark:bg-gray-800',
        'shadow-md',
        'border',
        'border-gray-100',
        'dark:border-gray-700',
      ],
      filled: [
        'bg-gray-50',
        'dark:bg-gray-900',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
      ],
      ghost: ['bg-transparent', 'border-0'],
    };

    // Size classes
    const sizeClasses = {
      sm: ['p-4', 'rounded-md'],
      md: ['p-6', 'rounded-lg'],
      lg: ['p-8', 'rounded-xl'],
    };

    // Interactive classes
    const interactiveClasses =
      this.state.clickable && !this.state.disabled
        ? ['cursor-pointer']
        : this.state.disabled
        ? ['cursor-not-allowed', 'opacity-50']
        : [];

    // State classes
    const stateClasses = [];

    if (this.state.isHovered && !this.state.disabled) {
      if (this.state.variant === 'elevated') {
        stateClasses.push('shadow-lg', 'scale-[1.02]');
      } else {
        stateClasses.push(
          'shadow-sm',
          'border-gray-300',
          'dark:border-gray-500'
        );
      }
    }

    if (this.state.isPressed && !this.state.disabled) {
      stateClasses.push('scale-[0.98]');
    }

    if (this.state.isFocused && !this.state.disabled) {
      stateClasses.push('ring-2', 'ring-blue-500', 'ring-offset-2');
    }

    if (this.state.selected) {
      stateClasses.push('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
    }

    if (this.state.isExpanded) {
      stateClasses.push('z-10', 'scale-105', 'shadow-xl');
    }

    return [
      ...baseClasses,
      ...variantClasses[this.state.variant],
      ...sizeClasses[this.state.size],
      ...interactiveClasses,
      ...stateClasses,
    ].join(' ');
  }

  // Get CSS classes for the card content
  getContentClasses(): string {
    const baseClasses = ['relative', 'z-10'];

    if (this.state.isLoading) {
      baseClasses.push('opacity-50');
    }

    return baseClasses.join(' ');
  }

  // Get CSS classes for the card header
  getHeaderClasses(): string {
    const sizeClasses = {
      sm: ['mb-2'],
      md: ['mb-3'],
      lg: ['mb-4'],
    };

    return [
      'flex',
      'items-center',
      'justify-between',
      ...sizeClasses[this.state.size],
    ].join(' ');
  }

  // Get CSS classes for the card body
  getBodyClasses(): string {
    const sizeClasses = {
      sm: ['space-y-2'],
      md: ['space-y-3'],
      lg: ['space-y-4'],
    };

    return ['flex', 'flex-col', ...sizeClasses[this.state.size]].join(' ');
  }

  // Get CSS classes for the card footer
  getFooterClasses(): string {
    const sizeClasses = {
      sm: ['mt-2', 'pt-2'],
      md: ['mt-3', 'pt-3'],
      lg: ['mt-4', 'pt-4'],
    };

    return [
      'flex',
      'items-center',
      'justify-between',
      'border-t',
      'border-gray-200',
      'dark:border-gray-700',
      ...sizeClasses[this.state.size],
    ].join(' ');
  }

  // Get loading overlay element
  getLoadingOverlay(): string | null {
    if (!this.state.isLoading) return null;

    return `
      <div class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    `;
  }

  // Get selection indicator
  getSelectionIndicator(): string | null {
    if (!this.state.selected) return null;

    return `
      <div class="absolute top-2 right-2 z-30">
        <div class="bg-blue-500 text-white rounded-full p-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>
    `;
  }

  // Get ARIA attributes for accessibility
  getAriaAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};

    if (this.state.clickable) {
      attributes['role'] = 'button';
      attributes['tabindex'] = this.state.disabled ? '-1' : '0';
    }

    if (this.state.disabled) {
      attributes['aria-disabled'] = 'true';
    }

    if (this.state.selected) {
      attributes['aria-selected'] = 'true';
    }

    if (this.state.isExpanded) {
      attributes['aria-expanded'] = 'true';
    }

    if (this.state.isLoading) {
      attributes['aria-busy'] = 'true';
    }

    return attributes;
  }

  // Animation helper for smooth transitions
  animateIn(): void {
    // This could be enhanced with more sophisticated animations
    this.state.isExpanded = true;

    setTimeout(() => {
      this.state.isExpanded = false;
    }, 300);
  }

  private trackCardEvent(event: string, properties: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'card',
      });
    }
  }

  getState(): CardState {
    return { ...this.state };
  }

  getActions(): CardActions {
    return this.actions;
  }

  setState(updates: Partial<CardState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default CardLogic;
