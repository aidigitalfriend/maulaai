// SearchInput Logic
// Handles search functionality, debouncing, filters, and autocomplete

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface SearchFilter {
  id: string;
  label: string;
  value: string;
  active: boolean;
  count?: number;
}

export interface SearchState {
  query: string;
  isSearching: boolean;
  isFocused: boolean;
  showSuggestions: boolean;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  filters: SearchFilter[];
  activeFilters: string[];
  results: any[];
  totalResults: number;
  hasSearched: boolean;
  error: string | null;
}

export interface SearchActions {
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  clearSearch: () => void;
  setFocus: (focused: boolean) => void;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  toggleFilter: (filterId: string) => void;
  setFilters: (filters: SearchFilter[]) => void;
  clearFilters: () => void;
}

export class SearchInputLogic {
  private state: SearchState;
  private actions: SearchActions;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private searchController: AbortController | null = null;
  private onSearchCallback?: (query: string, filters: string[]) => Promise<any>;

  constructor(onSearch?: (query: string, filters: string[]) => Promise<any>) {
    this.onSearchCallback = onSearch;

    this.state = {
      query: '',
      isSearching: false,
      isFocused: false,
      showSuggestions: false,
      suggestions: [],
      recentSearches: this.loadRecentSearches(),
      filters: [],
      activeFilters: [],
      results: [],
      totalResults: 0,
      hasSearched: false,
      error: null,
    };

    this.actions = {
      setQuery: this.setQuery.bind(this),
      search: this.search.bind(this),
      clearSearch: this.clearSearch.bind(this),
      setFocus: this.setFocus.bind(this),
      selectSuggestion: this.selectSuggestion.bind(this),
      addRecentSearch: this.addRecentSearch.bind(this),
      clearRecentSearches: this.clearRecentSearches.bind(this),
      toggleFilter: this.toggleFilter.bind(this),
      setFilters: this.setFilters.bind(this),
      clearFilters: this.clearFilters.bind(this),
    };
  }

  setQuery(query: string): void {
    this.state.query = query;
    this.state.error = null;

    // Clear previous debounce
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Auto-search with debouncing
    if (query.trim().length > 0) {
      this.debounceTimeout = setTimeout(() => {
        this.fetchSuggestions(query);

        // Trigger search if query is substantial
        if (query.trim().length >= 3) {
          this.search(query);
        }
      }, 300);
    } else {
      this.state.suggestions = [];
      this.state.showSuggestions = false;
    }
  }

  async search(query?: string): Promise<void> {
    const searchQuery = query || this.state.query;

    if (!searchQuery.trim()) {
      return;
    }

    // Cancel previous search
    if (this.searchController) {
      this.searchController.abort();
    }

    this.searchController = new AbortController();
    this.state.isSearching = true;
    this.state.error = null;
    this.state.showSuggestions = false;

    try {
      // Add to recent searches
      this.addRecentSearch(searchQuery);

      // Perform search
      let results = [];
      if (this.onSearchCallback) {
        results = await this.onSearchCallback(
          searchQuery,
          this.state.activeFilters
        );
      }

      // Update state with results
      this.state.results = results || [];
      this.state.totalResults = Array.isArray(results) ? results.length : 0;
      this.state.hasSearched = true;
      this.state.isSearching = false;

      this.trackSearchEvent('search_completed', {
        query: searchQuery,
        filters: this.state.activeFilters,
        results_count: this.state.totalResults,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.state.error = 'Search failed. Please try again.';
        this.state.results = [];
        this.state.totalResults = 0;
      }
      this.state.isSearching = false;
    }
  }

  clearSearch(): void {
    this.state.query = '';
    this.state.results = [];
    this.state.totalResults = 0;
    this.state.hasSearched = false;
    this.state.error = null;
    this.state.suggestions = [];
    this.state.showSuggestions = false;

    // Cancel ongoing search
    if (this.searchController) {
      this.searchController.abort();
    }

    this.state.isSearching = false;
  }

  setFocus(focused: boolean): void {
    this.state.isFocused = focused;

    if (focused) {
      // Show suggestions/recent searches when focused
      if (this.state.query.length > 0) {
        this.state.showSuggestions = true;
      } else if (this.state.recentSearches.length > 0) {
        this.state.suggestions = this.state.recentSearches.map(
          (search, index) => ({
            id: `recent-${index}`,
            text: search,
            category: 'Recent',
          })
        );
        this.state.showSuggestions = true;
      }
    } else {
      // Hide suggestions when focus is lost (with delay)
      setTimeout(() => {
        this.state.showSuggestions = false;
      }, 200);
    }
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.state.query = suggestion.text;
    this.state.showSuggestions = false;
    this.search(suggestion.text);

    this.trackSearchEvent('suggestion_selected', {
      suggestion_text: suggestion.text,
      suggestion_category: suggestion.category,
    });
  }

  addRecentSearch(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return;

    // Remove if already exists
    this.state.recentSearches = this.state.recentSearches.filter(
      (search) => search.toLowerCase() !== trimmedQuery.toLowerCase()
    );

    // Add to beginning
    this.state.recentSearches.unshift(trimmedQuery);

    // Keep only last 10
    this.state.recentSearches = this.state.recentSearches.slice(0, 10);

    // Save to localStorage
    this.saveRecentSearches();
  }

  clearRecentSearches(): void {
    this.state.recentSearches = [];
    this.saveRecentSearches();
  }

  toggleFilter(filterId: string): void {
    const filter = this.state.filters.find((f) => f.id === filterId);
    if (!filter) return;

    filter.active = !filter.active;

    // Update active filters array
    if (filter.active) {
      this.state.activeFilters.push(filterId);
    } else {
      this.state.activeFilters = this.state.activeFilters.filter(
        (id) => id !== filterId
      );
    }

    // Re-search with new filters
    if (this.state.query.trim()) {
      this.search();
    }

    this.trackSearchEvent('filter_toggled', {
      filter_id: filterId,
      filter_active: filter.active,
      active_filters: this.state.activeFilters,
    });
  }

  setFilters(filters: SearchFilter[]): void {
    this.state.filters = filters;

    // Update active filters array
    this.state.activeFilters = filters
      .filter((filter) => filter.active)
      .map((filter) => filter.id);
  }

  clearFilters(): void {
    this.state.filters.forEach((filter) => {
      filter.active = false;
    });
    this.state.activeFilters = [];

    // Re-search without filters
    if (this.state.query.trim()) {
      this.search();
    }
  }

  private async fetchSuggestions(query: string): Promise<void> {
    if (query.length < 2) {
      this.state.suggestions = [];
      return;
    }

    try {
      // This would typically make an API call for suggestions
      // For now, we'll use recent searches and mock suggestions
      const suggestions: SearchSuggestion[] = [];

      // Add matching recent searches
      const matchingRecent = this.state.recentSearches
        .filter((search) => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          category: 'Recent',
        }));

      suggestions.push(...matchingRecent);

      // Add mock autocomplete suggestions
      const mockSuggestions = this.generateMockSuggestions(query);
      suggestions.push(...mockSuggestions);

      this.state.suggestions = suggestions.slice(0, 8);
      this.state.showSuggestions = suggestions.length > 0;
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      this.state.suggestions = [];
    }
  }

  private generateMockSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];

    // Common search patterns
    const patterns = [
      'how to',
      'what is',
      'best practices',
      'tutorial',
      'guide',
      'example',
    ];

    patterns.forEach((pattern, index) => {
      if (
        pattern.includes(query.toLowerCase()) ||
        query.toLowerCase().includes(pattern)
      ) {
        suggestions.push({
          id: `suggestion-${index}`,
          text: `${pattern} ${query}`,
          category: 'Suggestions',
        });
      }
    });

    return suggestions.slice(0, 3);
  }

  private loadRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const saved = localStorage.getItem('recent-searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveRecentSearches(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        'recent-searches',
        JSON.stringify(this.state.recentSearches)
      );
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }

  // Keyboard navigation for suggestions
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.showSuggestions || this.state.suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // Implement arrow key navigation
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Implement arrow key navigation
        break;
      case 'Enter':
        event.preventDefault();
        if (this.state.query.trim()) {
          this.search();
        }
        break;
      case 'Escape':
        this.state.showSuggestions = false;
        break;
    }
  }

  // Get CSS classes for different states
  getInputClasses(): string {
    const baseClasses = [
      'w-full',
      'px-4',
      'py-2',
      'border',
      'rounded-lg',
      'focus:outline-none',
      'focus:ring-2',
      'transition-colors',
      'duration-200',
    ];

    const stateClasses = this.state.error
      ? ['border-red-500', 'focus:ring-red-500']
      : this.state.isFocused
      ? ['border-blue-500', 'focus:ring-blue-500']
      : ['border-gray-300', 'focus:ring-blue-500'];

    return [...baseClasses, ...stateClasses].join(' ');
  }

  getSuggestionClasses(isSelected: boolean = false): string {
    const baseClasses = [
      'px-4',
      'py-2',
      'cursor-pointer',
      'text-sm',
      'transition-colors',
      'duration-150',
    ];

    const stateClasses = isSelected
      ? ['bg-blue-500', 'text-white']
      : ['hover:bg-gray-100', 'text-gray-700'];

    return [...baseClasses, ...stateClasses].join(' ');
  }

  private trackSearchEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'search',
      });
    }
  }

  // Cleanup method
  cleanup(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    if (this.searchController) {
      this.searchController.abort();
    }
  }

  getState(): SearchState {
    return { ...this.state };
  }

  getActions(): SearchActions {
    return this.actions;
  }

  setState(updates: Partial<SearchState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default SearchInputLogic;
