// Dropdown Logic
// Handles dropdown menu state, positioning, and keyboard navigation

export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
  children?: DropdownItem[];
  onClick?: () => void;
}

export interface DropdownState {
  isOpen: boolean;
  isAnimating: boolean;
  selectedIndex: number;
  items: DropdownItem[];
  position: 'bottom' | 'top' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  offset: { x: number; y: number };
  closeOnSelect: boolean;
  closeOnOutsideClick: boolean;
  triggerElement: HTMLElement | null;
}

export interface DropdownActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setItems: (items: DropdownItem[]) => void;
  selectItem: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  handleTriggerClick: (event: MouseEvent) => void;
  handleOutsideClick: (event: MouseEvent) => void;
  setPosition: (position: DropdownState['position']) => void;
  setAlign: (align: DropdownState['align']) => void;
}

export class DropdownLogic {
  private state: DropdownState;
  private actions: DropdownActions;
  private dropdownRef: HTMLElement | null = null;
  private onItemSelectCallback?: (item: DropdownItem) => void;

  constructor(
    items: DropdownItem[] = [],
    onItemSelect?: (item: DropdownItem) => void
  ) {
    this.onItemSelectCallback = onItemSelect;

    this.state = {
      isOpen: false,
      isAnimating: false,
      selectedIndex: -1,
      items,
      position: 'bottom',
      align: 'start',
      offset: { x: 0, y: 4 },
      closeOnSelect: true,
      closeOnOutsideClick: true,
      triggerElement: null,
    };

    this.actions = {
      open: this.open.bind(this),
      close: this.close.bind(this),
      toggle: this.toggle.bind(this),
      setItems: this.setItems.bind(this),
      selectItem: this.selectItem.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
      handleTriggerClick: this.handleTriggerClick.bind(this),
      handleOutsideClick: this.handleOutsideClick.bind(this),
      setPosition: this.setPosition.bind(this),
      setAlign: this.setAlign.bind(this),
    };

    // Set up outside click listener
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.actions.handleOutsideClick);
      document.addEventListener('keydown', this.actions.handleKeyDown);
    }
  }

  open(): void {
    if (this.state.isOpen) return;

    this.state.isOpen = true;
    this.state.isAnimating = true;
    this.state.selectedIndex = -1;

    // Calculate position if needed
    this.calculatePosition();

    // Reset animation state
    setTimeout(() => {
      this.state.isAnimating = false;
    }, 150);

    this.trackDropdownEvent('dropdown_opened', {
      items_count: this.state.items.length,
      position: this.state.position,
    });
  }

  close(): void {
    if (!this.state.isOpen) return;

    this.state.isAnimating = true;
    this.state.selectedIndex = -1;

    // Animation delay
    setTimeout(() => {
      this.state.isOpen = false;
      this.state.isAnimating = false;
    }, 150);

    this.trackDropdownEvent('dropdown_closed', {});
  }

  toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setItems(items: DropdownItem[]): void {
    this.state.items = items;
    this.state.selectedIndex = -1;
  }

  selectItem(index: number): void {
    const item = this.state.items[index];
    if (!item || item.disabled || item.separator) return;

    this.state.selectedIndex = index;

    // Execute item click handler
    if (item.onClick) {
      item.onClick();
    }

    // Execute callback
    if (this.onItemSelectCallback) {
      this.onItemSelectCallback(item);
    }

    // Close dropdown if configured to do so
    if (this.state.closeOnSelect) {
      this.close();
    }

    this.trackDropdownEvent('dropdown_item_selected', {
      item_id: item.id,
      item_label: item.label,
      index,
    });
  }

  setPosition(position: DropdownState['position']): void {
    this.state.position = position;
  }

  setAlign(align: DropdownState['align']): void {
    this.state.align = align;
  }

  handleTriggerClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.state.triggerElement = event.currentTarget as HTMLElement;
    this.toggle();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.isOpen) {
      // Open dropdown with Enter or Space when focused on trigger
      if (event.key === 'Enter' || event.key === ' ') {
        const activeElement = document.activeElement;
        if (
          activeElement &&
          activeElement.getAttribute('data-dropdown-trigger') === 'true'
        ) {
          event.preventDefault();
          this.state.triggerElement = activeElement as HTMLElement;
          this.open();
        }
      }
      return;
    }

    const enabledItems = this.state.items.filter(
      (item) => !item.disabled && !item.separator
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateToNext(enabledItems);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.navigateToPrevious(enabledItems);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.state.selectedIndex >= 0) {
          this.selectItem(this.state.selectedIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        // Return focus to trigger
        if (this.state.triggerElement) {
          this.state.triggerElement.focus();
        }
        break;

      case 'Home':
        event.preventDefault();
        this.state.selectedIndex = 0;
        this.scrollToSelectedItem();
        break;

      case 'End':
        event.preventDefault();
        this.state.selectedIndex = enabledItems.length - 1;
        this.scrollToSelectedItem();
        break;

      default:
        // Handle character navigation
        this.handleCharacterNavigation(event.key);
    }
  }

  handleOutsideClick(event: MouseEvent): void {
    if (!this.state.isOpen || !this.state.closeOnOutsideClick) return;

    const target = event.target as HTMLElement;

    // Check if click is outside dropdown and trigger
    if (
      this.dropdownRef &&
      !this.dropdownRef.contains(target) &&
      this.state.triggerElement &&
      !this.state.triggerElement.contains(target)
    ) {
      this.close();
    }
  }

  private navigateToNext(enabledItems: DropdownItem[]): void {
    if (enabledItems.length === 0) return;

    let nextIndex = this.state.selectedIndex + 1;
    if (nextIndex >= this.state.items.length) {
      nextIndex = 0;
    }

    // Find next enabled item
    while (nextIndex < this.state.items.length) {
      const item = this.state.items[nextIndex];
      if (!item.disabled && !item.separator) {
        this.state.selectedIndex = nextIndex;
        break;
      }
      nextIndex++;
    }

    this.scrollToSelectedItem();
  }

  private navigateToPrevious(enabledItems: DropdownItem[]): void {
    if (enabledItems.length === 0) return;

    let prevIndex = this.state.selectedIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.state.items.length - 1;
    }

    // Find previous enabled item
    while (prevIndex >= 0) {
      const item = this.state.items[prevIndex];
      if (!item.disabled && !item.separator) {
        this.state.selectedIndex = prevIndex;
        break;
      }
      prevIndex--;
    }

    this.scrollToSelectedItem();
  }

  private handleCharacterNavigation(char: string): void {
    if (char.length !== 1) return;

    const matchingIndex = this.state.items.findIndex(
      (item, index) =>
        index > this.state.selectedIndex &&
        !item.disabled &&
        !item.separator &&
        item.label.toLowerCase().startsWith(char.toLowerCase())
    );

    if (matchingIndex !== -1) {
      this.state.selectedIndex = matchingIndex;
      this.scrollToSelectedItem();
    } else {
      // Wrap around to beginning
      const wrapIndex = this.state.items.findIndex(
        (item) =>
          !item.disabled &&
          !item.separator &&
          item.label.toLowerCase().startsWith(char.toLowerCase())
      );

      if (wrapIndex !== -1) {
        this.state.selectedIndex = wrapIndex;
        this.scrollToSelectedItem();
      }
    }
  }

  private scrollToSelectedItem(): void {
    if (this.state.selectedIndex < 0 || !this.dropdownRef) return;

    const selectedElement = this.dropdownRef.querySelector(
      `[data-dropdown-item="${this.state.selectedIndex}"]`
    ) as HTMLElement;

    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }

  private calculatePosition(): void {
    if (!this.state.triggerElement || typeof window === 'undefined') return;

    const triggerRect = this.state.triggerElement.getBoundingClientRect();
    const dropdownHeight = 300; // Estimated max height
    const dropdownWidth = 200; // Estimated width

    // Calculate vertical position
    if (triggerRect.bottom + dropdownHeight > window.innerHeight) {
      if (triggerRect.top - dropdownHeight > 0) {
        this.state.position = 'top';
      }
    }

    // Calculate horizontal alignment
    if (triggerRect.left + dropdownWidth > window.innerWidth) {
      this.state.align = 'end';
    }
  }

  // Get CSS classes for the dropdown container
  getDropdownClasses(): string {
    const baseClasses = [
      'absolute',
      'z-50',
      'min-w-[12rem]',
      'rounded-md',
      'border',
      'border-gray-200',
      'dark:border-gray-700',
      'bg-white',
      'dark:bg-gray-800',
      'shadow-lg',
      'transition-all',
      'duration-150',
      'overflow-hidden',
    ];

    // Position classes
    const positionClasses = {
      bottom: ['top-full', `mt-${this.state.offset.y}`],
      top: ['bottom-full', `mb-${this.state.offset.y}`],
      left: ['right-full', `mr-${this.state.offset.x}`],
      right: ['left-full', `ml-${this.state.offset.x}`],
    };

    // Alignment classes
    const alignClasses = {
      start:
        this.state.position === 'bottom' || this.state.position === 'top'
          ? ['left-0']
          : ['top-0'],
      center:
        this.state.position === 'bottom' || this.state.position === 'top'
          ? ['left-1/2', '-translate-x-1/2']
          : ['top-1/2', '-translate-y-1/2'],
      end:
        this.state.position === 'bottom' || this.state.position === 'top'
          ? ['right-0']
          : ['bottom-0'],
    };

    // Animation classes
    const animationClasses =
      this.state.isOpen && !this.state.isAnimating
        ? ['opacity-100', 'scale-100']
        : ['opacity-0', 'scale-95', 'pointer-events-none'];

    return [
      ...baseClasses,
      ...positionClasses[this.state.position],
      ...alignClasses[this.state.align],
      ...animationClasses,
    ].join(' ');
  }

  // Get CSS classes for dropdown items
  getItemClasses(item: DropdownItem, index: number): string {
    const baseClasses = [
      'relative',
      'flex',
      'cursor-default',
      'select-none',
      'items-center',
      'px-3',
      'py-2',
      'text-sm',
      'transition-colors',
      'duration-150',
    ];

    if (item.separator) {
      return [
        'border-t',
        'border-gray-200',
        'dark:border-gray-600',
        'my-1',
      ].join(' ');
    }

    const stateClasses = [];

    if (item.disabled) {
      stateClasses.push('opacity-50', 'cursor-not-allowed');
    } else {
      stateClasses.push('cursor-pointer');

      if (index === this.state.selectedIndex) {
        stateClasses.push('bg-blue-500', 'text-white');
      } else if (item.danger) {
        stateClasses.push(
          'text-red-600',
          'hover:bg-red-50',
          'dark:hover:bg-red-900/20'
        );
      } else {
        stateClasses.push(
          'text-gray-700',
          'dark:text-gray-200',
          'hover:bg-gray-100',
          'dark:hover:bg-gray-700'
        );
      }
    }

    return [...baseClasses, ...stateClasses].join(' ');
  }

  // Get ARIA attributes for the dropdown
  getDropdownAriaAttributes(): Record<string, string> {
    return {
      role: 'menu',
      'aria-orientation': 'vertical',
      'aria-labelledby': this.state.triggerElement?.id || '',
      'data-dropdown-content': 'true',
    };
  }

  // Get ARIA attributes for dropdown items
  getItemAriaAttributes(
    item: DropdownItem,
    index: number
  ): Record<string, string> {
    if (item.separator) {
      return { role: 'separator' };
    }

    return {
      role: 'menuitem',
      'aria-disabled': item.disabled ? 'true' : 'false',
      'data-dropdown-item': index.toString(),
      tabindex: '-1',
    };
  }

  // Set dropdown reference for outside click detection
  setDropdownRef(ref: HTMLElement | null): void {
    this.dropdownRef = ref;
  }

  private trackDropdownEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'dropdown',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.actions.handleOutsideClick);
      document.removeEventListener('keydown', this.actions.handleKeyDown);
    }
  }

  getState(): DropdownState {
    return { ...this.state };
  }

  getActions(): DropdownActions {
    return this.actions;
  }

  setState(updates: Partial<DropdownState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default DropdownLogic;
