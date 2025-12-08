/**
 * AgentSidebar Logic - Agent Components Module
 * Handles agent navigation, filtering, categorization, and sidebar management
 */

export interface AgentSidebarState {
  isLoading: boolean;
  error: string | null;
  isCollapsed: boolean;
  agents: AgentSidebarItem[];
  filteredAgents: AgentSidebarItem[];
  categories: AgentCategory[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'name' | 'popularity' | 'recent' | 'rating';
  sortOrder: 'asc' | 'desc';
  currentAgentSlug: string;
  favoriteAgents: string[];
  recentAgents: string[];
  viewMode: 'list' | 'grid' | 'compact';
  showOnlySubscribed: boolean;
  showOnlyFavorites: boolean;
}

export interface AgentSidebarItem {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  emoji: string;
  category: string;
  description: string;
  rating: number;
  totalReviews: number;
  popularity: number;
  lastUsed?: string;
  isSubscribed: boolean;
  isFavorite: boolean;
  isNew: boolean;
  status: 'online' | 'offline' | 'maintenance';
  pricing: 'free' | 'premium' | 'freemium';
  capabilities: string[];
  tags: string[];
}

export interface AgentCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  color: string;
  subcategories?: AgentSubcategory[];
}

export interface AgentSubcategory {
  id: string;
  name: string;
  count: number;
  parentId: string;
}

export interface SidebarFilters {
  category: string;
  pricing: string[];
  status: string[];
  rating: number;
  capabilities: string[];
  tags: string[];
}

export interface SortOption {
  key: 'name' | 'popularity' | 'recent' | 'rating';
  label: string;
  icon: string;
  description: string;
}

export class AgentSidebarLogic {
  private state: AgentSidebarState;
  private searchDebounceTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      isLoading: false,
      error: null,
      isCollapsed: false,
      agents: [],
      filteredAgents: [],
      categories: [],
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      currentAgentSlug: '',
      favoriteAgents: [],
      recentAgents: [],
      viewMode: 'list',
      showOnlySubscribed: false,
      showOnlyFavorites: false,
    };

    this.loadSidebarPreferences();
  }

  /**
   * Initialize sidebar with agents
   */
  async initialize(currentAgentSlug?: string): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;

    if (currentAgentSlug) {
      this.state.currentAgentSlug = currentAgentSlug;
    }

    try {
      // Load data in parallel
      const [agents, categories, favorites, recent] = await Promise.all([
        this.fetchAgents(),
        this.fetchCategories(),
        this.loadFavoriteAgents(),
        this.loadRecentAgents(),
      ]);

      this.state.agents = agents;
      this.state.categories = categories;
      this.state.favoriteAgents = favorites;
      this.state.recentAgents = recent;

      // Apply initial filtering and sorting
      this.applyFilters();
      this.applySorting();

      this.trackSidebarEvent('sidebar_initialized', {
        agentCount: agents.length,
        currentAgent: currentAgentSlug,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load agents';
      this.state.error = message;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Toggle sidebar collapse
   */
  toggleCollapse(): void {
    this.state.isCollapsed = !this.state.isCollapsed;
    this.saveSidebarPreferences();

    this.trackSidebarEvent('sidebar_toggled', {
      collapsed: this.state.isCollapsed,
    });
  }

  /**
   * Set search query with debounce
   */
  setSearchQuery(query: string): void {
    this.state.searchQuery = query;

    // Clear existing timeout
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }

    // Debounce search
    this.searchDebounceTimeout = setTimeout(() => {
      this.applyFilters();

      this.trackSidebarEvent('search_performed', {
        query: query.toLowerCase(),
        resultCount: this.state.filteredAgents.length,
      });
    }, 300);
  }

  /**
   * Set selected category
   */
  setSelectedCategory(categoryId: string): void {
    this.state.selectedCategory = categoryId;
    this.applyFilters();

    this.trackSidebarEvent('category_selected', {
      category: categoryId,
      resultCount: this.state.filteredAgents.length,
    });
  }

  /**
   * Set sorting options
   */
  setSorting(
    sortBy: 'name' | 'popularity' | 'recent' | 'rating',
    sortOrder?: 'asc' | 'desc'
  ): void {
    this.state.sortBy = sortBy;

    if (sortOrder) {
      this.state.sortOrder = sortOrder;
    } else {
      // Toggle sort order if same field
      this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
    }

    this.applySorting();
    this.saveSidebarPreferences();

    this.trackSidebarEvent('sorting_changed', {
      sortBy,
      sortOrder: this.state.sortOrder,
    });
  }

  /**
   * Set view mode
   */
  setViewMode(mode: 'list' | 'grid' | 'compact'): void {
    this.state.viewMode = mode;
    this.saveSidebarPreferences();

    this.trackSidebarEvent('view_mode_changed', { mode });
  }

  /**
   * Toggle filter options
   */
  toggleShowOnlySubscribed(): void {
    this.state.showOnlySubscribed = !this.state.showOnlySubscribed;
    this.applyFilters();
    this.saveSidebarPreferences();

    this.trackSidebarEvent('filter_subscribed_toggled', {
      enabled: this.state.showOnlySubscribed,
    });
  }

  toggleShowOnlyFavorites(): void {
    this.state.showOnlyFavorites = !this.state.showOnlyFavorites;
    this.applyFilters();
    this.saveSidebarPreferences();

    this.trackSidebarEvent('filter_favorites_toggled', {
      enabled: this.state.showOnlyFavorites,
    });
  }

  /**
   * Manage favorite agents
   */
  async toggleFavorite(agentId: string): Promise<void> {
    const isFavorite = this.state.favoriteAgents.includes(agentId);

    try {
      if (isFavorite) {
        // Remove from favorites
        this.state.favoriteAgents = this.state.favoriteAgents.filter(
          (id) => id !== agentId
        );
        await this.removeFavoriteAgent(agentId);
      } else {
        // Add to favorites
        this.state.favoriteAgents.push(agentId);
        await this.addFavoriteAgent(agentId);
      }

      // Update agent in state
      const agent = this.state.agents.find((a) => a.id === agentId);
      if (agent) {
        agent.isFavorite = !isFavorite;
      }

      this.saveFavoriteAgents();
      this.applyFilters(); // Re-filter if showing only favorites

      this.trackSidebarEvent('favorite_toggled', {
        agentId,
        isFavorite: !isFavorite,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      this.state.error = 'Failed to update favorites';
    }
  }

  /**
   * Track agent access
   */
  trackAgentAccess(agentSlug: string): void {
    this.state.currentAgentSlug = agentSlug;

    // Add to recent agents
    const agentId = this.state.agents.find((a) => a.slug === agentSlug)?.id;
    if (agentId && !this.state.recentAgents.includes(agentId)) {
      this.state.recentAgents.unshift(agentId);

      // Keep only last 10 recent agents
      this.state.recentAgents = this.state.recentAgents.slice(0, 10);

      this.saveRecentAgents();
    }

    // Update last used timestamp
    const agent = this.state.agents.find((a) => a.slug === agentSlug);
    if (agent) {
      agent.lastUsed = new Date().toISOString();
    }

    this.trackSidebarEvent('agent_accessed', { agentSlug });
  }

  /**
   * Clear search and filters
   */
  clearFilters(): void {
    this.state.searchQuery = '';
    this.state.selectedCategory = 'all';
    this.state.showOnlySubscribed = false;
    this.state.showOnlyFavorites = false;

    this.applyFilters();

    this.trackSidebarEvent('filters_cleared');
  }

  /**
   * Refresh agents data
   */
  async refreshAgents(): Promise<void> {
    this.state.isLoading = true;

    try {
      const agents = await this.fetchAgents();
      this.state.agents = agents;

      this.applyFilters();
      this.applySorting();

      this.trackSidebarEvent('agents_refreshed', {
        agentCount: agents.length,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to refresh agents';
      this.state.error = message;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Private helper methods
   */
  private async fetchAgents(): Promise<AgentSidebarItem[]> {
    const response = await fetch('/api/agents/sidebar');

    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }

    const data = await response.json();
    return data.agents || [];
  }

  private async fetchCategories(): Promise<AgentCategory[]> {
    const response = await fetch('/api/agents/categories');

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.categories || [];
  }

  private async addFavoriteAgent(agentId: string): Promise<void> {
    await fetch('/api/agents/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
  }

  private async removeFavoriteAgent(agentId: string): Promise<void> {
    await fetch(`/api/agents/favorites/${agentId}`, {
      method: 'DELETE',
    });
  }

  private loadFavoriteAgents(): string[] {
    try {
      const saved = localStorage.getItem('favoriteAgents');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading favorite agents:', error);
      return [];
    }
  }

  private saveFavoriteAgents(): void {
    try {
      localStorage.setItem(
        'favoriteAgents',
        JSON.stringify(this.state.favoriteAgents)
      );
    } catch (error) {
      console.error('Error saving favorite agents:', error);
    }
  }

  private loadRecentAgents(): string[] {
    try {
      const saved = localStorage.getItem('recentAgents');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading recent agents:', error);
      return [];
    }
  }

  private saveRecentAgents(): void {
    try {
      localStorage.setItem(
        'recentAgents',
        JSON.stringify(this.state.recentAgents)
      );
    } catch (error) {
      console.error('Error saving recent agents:', error);
    }
  }

  private loadSidebarPreferences(): void {
    try {
      const saved = localStorage.getItem('agentSidebarPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.state.isCollapsed = preferences.isCollapsed || false;
        this.state.sortBy = preferences.sortBy || 'name';
        this.state.sortOrder = preferences.sortOrder || 'asc';
        this.state.viewMode = preferences.viewMode || 'list';
        this.state.showOnlySubscribed = preferences.showOnlySubscribed || false;
        this.state.showOnlyFavorites = preferences.showOnlyFavorites || false;
      }
    } catch (error) {
      console.error('Error loading sidebar preferences:', error);
    }
  }

  private saveSidebarPreferences(): void {
    try {
      const preferences = {
        isCollapsed: this.state.isCollapsed,
        sortBy: this.state.sortBy,
        sortOrder: this.state.sortOrder,
        viewMode: this.state.viewMode,
        showOnlySubscribed: this.state.showOnlySubscribed,
        showOnlyFavorites: this.state.showOnlyFavorites,
      };
      localStorage.setItem(
        'agentSidebarPreferences',
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving sidebar preferences:', error);
    }
  }

  private applyFilters(): void {
    let filtered = [...this.state.agents];

    // Search filter
    if (this.state.searchQuery.trim()) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.specialty.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.capabilities.some((cap) => cap.toLowerCase().includes(query)) ||
          agent.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (this.state.selectedCategory !== 'all') {
      filtered = filtered.filter(
        (agent) => agent.category === this.state.selectedCategory
      );
    }

    // Subscription filter
    if (this.state.showOnlySubscribed) {
      filtered = filtered.filter((agent) => agent.isSubscribed);
    }

    // Favorites filter
    if (this.state.showOnlyFavorites) {
      filtered = filtered.filter((agent) =>
        this.state.favoriteAgents.includes(agent.id)
      );
    }

    this.state.filteredAgents = filtered;
  }

  private applySorting(): void {
    this.state.filteredAgents.sort((a, b) => {
      let comparison = 0;

      switch (this.state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'popularity':
          comparison = b.popularity - a.popularity;
          break;
        case 'recent':
          const aTime = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const bTime = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          comparison = bTime - aTime;
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
      }

      return this.state.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private trackSidebarEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Agent Sidebar', {
          event,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking sidebar event:', error);
    }
  }

  /**
   * Public getters
   */
  getState(): AgentSidebarState {
    return { ...this.state };
  }

  getFilteredAgents(): AgentSidebarItem[] {
    return [...this.state.filteredAgents];
  }

  getCategories(): AgentCategory[] {
    return [...this.state.categories];
  }

  getCurrentAgent(): AgentSidebarItem | null {
    return (
      this.state.agents.find(
        (agent) => agent.slug === this.state.currentAgentSlug
      ) || null
    );
  }

  getFavoriteAgents(): AgentSidebarItem[] {
    return this.state.agents.filter((agent) =>
      this.state.favoriteAgents.includes(agent.id)
    );
  }

  getRecentAgents(): AgentSidebarItem[] {
    return this.state.recentAgents
      .map((id) => this.state.agents.find((agent) => agent.id === id))
      .filter(Boolean) as AgentSidebarItem[];
  }

  getSortOptions(): SortOption[] {
    return [
      {
        key: 'name',
        label: 'Name',
        icon: '🔤',
        description: 'Sort alphabetically by name',
      },
      {
        key: 'popularity',
        label: 'Popularity',
        icon: '🔥',
        description: 'Sort by usage and popularity',
      },
      {
        key: 'recent',
        label: 'Recently Used',
        icon: '⏰',
        description: 'Sort by last usage time',
      },
      {
        key: 'rating',
        label: 'Rating',
        icon: '⭐',
        description: 'Sort by user ratings',
      },
    ];
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.state.error = null;
  }
}

// Export singleton instance
export const agentSidebarLogic = new AgentSidebarLogic();

// Export utility functions
export const agentSidebarUtils = {
  /**
   * Get agent status color
   */
  getStatusColor(status: string): string {
    const colors = {
      online: '#10B981',
      offline: '#6B7280',
      maintenance: '#F59E0B',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  },

  /**
   * Get pricing color
   */
  getPricingColor(pricing: string): string {
    const colors = {
      free: '#10B981',
      freemium: '#3B82F6',
      premium: '#8B5CF6',
    };
    return colors[pricing as keyof typeof colors] || '#6B7280';
  },

  /**
   * Format popularity score
   */
  formatPopularity(score: number): string {
    if (score < 1000) return score.toString();
    if (score < 1000000) return `${(score / 1000).toFixed(1)}K`;
    return `${(score / 1000000).toFixed(1)}M`;
  },

  /**
   * Format rating
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  },

  /**
   * Get category icon
   */
  getCategoryIcon(categoryId: string): string {
    const icons = {
      all: '🌟',
      productivity: '📊',
      creative: '🎨',
      entertainment: '🎭',
      education: '📚',
      business: '💼',
      health: '🏥',
      finance: '💰',
      technology: '💻',
      lifestyle: '🏡',
    };
    return icons[categoryId as keyof typeof icons] || '📁';
  },

  /**
   * Truncate text
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  /**
   * Get relative time
   */
  getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 30) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  /**
   * Generate agent URL
   */
  generateAgentUrl(slug: string): string {
    return `/agents/${slug}`;
  },

  /**
   * Validate search query
   */
  validateSearchQuery(query: string): { isValid: boolean; error?: string } {
    if (query.length > 100) {
      return { isValid: false, error: 'Search query too long' };
    }

    return { isValid: true };
  },

  /**
   * Get capability badges
   */
  getCapabilityBadges(
    capabilities: string[],
    maxShow: number = 3
  ): {
    visible: string[];
    hidden: number;
  } {
    const visible = capabilities.slice(0, maxShow);
    const hidden = Math.max(0, capabilities.length - maxShow);

    return { visible, hidden };
  },
};
