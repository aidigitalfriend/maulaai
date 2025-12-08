/**
 * AgentSettingsModal Logic - Agent Components Module
 * Handles agent configuration, preferences, and settings management
 */

export interface AgentSettingsModalState {
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  isDirty: boolean;
  agentId: string;
  agentName: string;
  currentTab: 'general' | 'behavior' | 'voice' | 'appearance' | 'advanced';
  settings: AgentSettings;
  presets: SettingsPreset[];
  validation: ValidationState;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export interface AgentSettings {
  general: GeneralSettings;
  behavior: BehaviorSettings;
  voice: VoiceSettings;
  appearance: AppearanceSettings;
  advanced: AdvancedSettings;
}

export interface GeneralSettings {
  name: string;
  description: string;
  personality: string;
  language: string;
  timezone: string;
  responseSpeed: 'fast' | 'normal' | 'thoughtful';
  contextMemory: boolean;
  learningMode: boolean;
  safetyMode: boolean;
  autoSave: boolean;
  sessionTimeout: number; // minutes
  maxTokens: number;
}

export interface BehaviorSettings {
  conversationStyle: 'formal' | 'casual' | 'professional' | 'friendly';
  responseLength: 'brief' | 'normal' | 'detailed';
  creativity: number; // 0-100
  empathy: number; // 0-100
  assertiveness: number; // 0-100
  humor: number; // 0-100
  politeness: number; // 0-100
  curiosity: number; // 0-100
  roleplayMode: boolean;
  emotionalAwareness: boolean;
  contextualAdaptation: boolean;
  proactiveEngagement: boolean;
  conflictResolution: 'avoid' | 'gentle' | 'direct';
}

export interface VoiceSettings {
  enabled: boolean;
  voiceId: string;
  speed: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
  volume: number; // 0-100
  pauseLength: number; // seconds
  emotionIntensity: number; // 0-100
  pronunciation: PronunciationSettings;
  backgroundNoise: boolean;
  autoPlay: boolean;
  voiceCloning: boolean;
  customVoiceId?: string;
}

export interface PronunciationSettings {
  accent: string;
  emphasis: 'normal' | 'strong' | 'subtle';
  speechMarks: boolean;
  ssmlSupport: boolean;
  customPronunciations: Record<string, string>;
}

export interface AppearanceSettings {
  avatar: AvatarSettings;
  theme: ThemeSettings;
  animations: AnimationSettings;
  layout: LayoutSettings;
  branding: BrandingSettings;
}

export interface AvatarSettings {
  type: 'default' | 'custom' | 'generated' | 'none';
  imageUrl?: string;
  style: 'realistic' | 'cartoon' | 'abstract' | 'emoji';
  mood: 'happy' | 'neutral' | 'serious' | 'playful';
  animations: boolean;
  size: 'small' | 'medium' | 'large';
  border: boolean;
  shadow: boolean;
}

export interface ThemeSettings {
  colorScheme: 'auto' | 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  messageSpacing: number;
}

export interface AnimationSettings {
  enabled: boolean;
  typingIndicator: boolean;
  messageTransitions: boolean;
  avatarAnimations: boolean;
  buttonHovers: boolean;
  loadingAnimations: boolean;
  duration: 'fast' | 'normal' | 'slow';
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface LayoutSettings {
  chatWidth: 'narrow' | 'normal' | 'wide';
  messageAlignment: 'left' | 'center' | 'right';
  showTimestamps: boolean;
  showAvatars: boolean;
  compactMode: boolean;
  sidebarPosition: 'left' | 'right' | 'hidden';
  headerVisible: boolean;
  footerVisible: boolean;
}

export interface BrandingSettings {
  showLogo: boolean;
  logoUrl?: string;
  brandColor: string;
  customCSS?: string;
  footerText?: string;
  welcomeMessage?: string;
  farewellMessage?: string;
}

export interface AdvancedSettings {
  apiSettings: ApiSettings;
  debugging: DebuggingSettings;
  performance: PerformanceSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
  experimental: ExperimentalSettings;
}

export interface ApiSettings {
  endpoint: string;
  apiKey?: string;
  model: string;
  temperature: number; // 0-2
  topP: number; // 0-1
  topK: number;
  frequencyPenalty: number; // -2 to 2
  presencePenalty: number; // -2 to 2
  stopSequences: string[];
  maxTokens: number;
  streamingEnabled: boolean;
  retryAttempts: number;
  timeout: number; // seconds
}

export interface DebuggingSettings {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  showTokenUsage: boolean;
  showResponseTime: boolean;
  showApiCalls: boolean;
  exportLogs: boolean;
  sessionRecording: boolean;
  errorReporting: boolean;
}

export interface PerformanceSettings {
  caching: boolean;
  preloadMessages: boolean;
  lazyLoading: boolean;
  compressionEnabled: boolean;
  batchRequests: boolean;
  requestDeduplication: boolean;
  backgroundSync: boolean;
  resourceOptimization: boolean;
}

export interface IntegrationSettings {
  webhooks: WebhookSettings[];
  externalApis: ExternalApiSettings[];
  plugins: PluginSettings[];
  analytics: AnalyticsSettings;
}

export interface WebhookSettings {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  secret?: string;
  headers: Record<string, string>;
}

export interface ExternalApiSettings {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
  rateLimit: number;
  timeout: number;
}

export interface PluginSettings {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface AnalyticsSettings {
  enabled: boolean;
  provider: string;
  trackingId?: string;
  customEvents: boolean;
  userTracking: boolean;
  performanceTracking: boolean;
}

export interface SecuritySettings {
  contentFiltering: boolean;
  piiDetection: boolean;
  rateLimiting: boolean;
  ipWhitelist: string[];
  encryptionEnabled: boolean;
  sessionValidation: boolean;
  auditLogging: boolean;
  dataRetention: number; // days
}

export interface ExperimentalSettings {
  betaFeatures: boolean;
  aiEnhancements: boolean;
  multimodalSupport: boolean;
  realtimeCollaboration: boolean;
  advancedNlp: boolean;
  customModels: boolean;
  autoTesting: boolean;
}

export interface SettingsPreset {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'gaming' | 'business' | 'education' | 'creative';
  settings: Partial<AgentSettings>;
  isDefault: boolean;
  isCustom: boolean;
  createdAt: string;
  usage: number;
}

export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface SettingsExport {
  version: string;
  agentId: string;
  agentName: string;
  settings: AgentSettings;
  exportedAt: string;
  metadata: Record<string, any>;
}

export class AgentSettingsModalLogic {
  private state: AgentSettingsModalState;
  private originalSettings: AgentSettings | null = null;
  private autoSaveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      isLoading: false,
      error: null,
      isOpen: false,
      isDirty: false,
      agentId: '',
      agentName: '',
      currentTab: 'general',
      settings: this.getDefaultSettings(),
      presets: [],
      validation: { isValid: true, errors: {}, warnings: {} },
      saveStatus: 'idle',
    };
  }

  /**
   * Open settings modal
   */
  async openModal(agentId: string, agentName: string): Promise<void> {
    this.state.isOpen = true;
    this.state.isLoading = true;
    this.state.error = null;
    this.state.agentId = agentId;
    this.state.agentName = agentName;

    try {
      // Load settings and presets in parallel
      const [settings, presets] = await Promise.all([
        this.fetchAgentSettings(agentId),
        this.fetchSettingsPresets(),
      ]);

      this.state.settings = settings;
      this.state.presets = presets;
      this.originalSettings = JSON.parse(JSON.stringify(settings));

      this.validateSettings();

      this.trackSettingsEvent('modal_opened', {
        agentId,
        agentName,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load settings';
      this.state.error = message;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    // Check for unsaved changes
    if (this.state.isDirty) {
      const shouldSave = confirm(
        'You have unsaved changes. Do you want to save them before closing?'
      );
      if (shouldSave) {
        this.saveSettings();
      }
    }

    this.state.isOpen = false;
    this.state.currentTab = 'general';
    this.state.isDirty = false;
    this.originalSettings = null;
    this.clearAutoSave();

    this.trackSettingsEvent('modal_closed');
  }

  /**
   * Switch tab
   */
  switchTab(
    tab: 'general' | 'behavior' | 'voice' | 'appearance' | 'advanced'
  ): void {
    this.state.currentTab = tab;

    this.trackSettingsEvent('tab_switched', { tab });
  }

  /**
   * Update settings
   */
  updateSettings(path: string, value: any): void {
    // Use dot notation to update nested properties
    const keys = path.split('.');
    let current = this.state.settings as any;

    // Navigate to parent object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Set the value
    current[keys[keys.length - 1]] = value;

    this.state.isDirty = true;
    this.validateSettings();

    // Auto-save after delay
    this.scheduleAutoSave();

    this.trackSettingsEvent('setting_changed', {
      path,
      value: typeof value === 'string' ? value : typeof value,
    });
  }

  /**
   * Apply preset
   */
  applyPreset(presetId: string): void {
    const preset = this.state.presets.find((p) => p.id === presetId);
    if (!preset) return;

    // Merge preset settings with current settings
    this.state.settings = this.mergeSettings(
      this.state.settings,
      preset.settings
    );
    this.state.isDirty = true;

    this.validateSettings();

    this.trackSettingsEvent('preset_applied', {
      presetId,
      presetName: preset.name,
    });
  }

  /**
   * Save custom preset
   */
  async saveAsPreset(
    name: string,
    description: string,
    category: string
  ): Promise<void> {
    try {
      const preset: Omit<SettingsPreset, 'id' | 'createdAt' | 'usage'> = {
        name,
        description,
        category: category as any,
        settings: JSON.parse(JSON.stringify(this.state.settings)),
        isDefault: false,
        isCustom: true,
      };

      const response = await fetch('/api/agents/settings/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save preset');
      }

      // Add to presets list
      this.state.presets.push(data.preset);

      this.trackSettingsEvent('preset_saved', {
        presetName: name,
        category,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save preset';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Save settings
   */
  async saveSettings(): Promise<void> {
    if (!this.state.validation.isValid) {
      this.state.error = 'Please fix validation errors before saving';
      return;
    }

    this.state.saveStatus = 'saving';
    this.clearAutoSave();

    try {
      const response = await fetch(
        `/api/agents/${this.state.agentId}/settings`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.state.settings),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }

      this.state.isDirty = false;
      this.state.saveStatus = 'saved';
      this.originalSettings = JSON.parse(JSON.stringify(this.state.settings));

      // Clear saved status after delay
      setTimeout(() => {
        if (this.state.saveStatus === 'saved') {
          this.state.saveStatus = 'idle';
        }
      }, 2000);

      this.trackSettingsEvent('settings_saved', {
        agentId: this.state.agentId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save settings';
      this.state.error = message;
      this.state.saveStatus = 'error';
    }
  }

  /**
   * Reset settings
   */
  resetSettings(): void {
    if (!this.originalSettings) return;

    this.state.settings = JSON.parse(JSON.stringify(this.originalSettings));
    this.state.isDirty = false;
    this.validateSettings();

    this.trackSettingsEvent('settings_reset');
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.state.settings = this.getDefaultSettings();
    this.state.isDirty = true;
    this.validateSettings();

    this.trackSettingsEvent('settings_reset_to_defaults');
  }

  /**
   * Export settings
   */
  exportSettings(): void {
    const exportData: SettingsExport = {
      version: '1.0',
      agentId: this.state.agentId,
      agentName: this.state.agentName,
      settings: this.state.settings,
      exportedAt: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.state.agentName}-settings.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.trackSettingsEvent('settings_exported');
  }

  /**
   * Import settings
   */
  async importSettings(file: File): Promise<void> {
    try {
      const text = await file.text();
      const importData = JSON.parse(text) as SettingsExport;

      if (!importData.settings) {
        throw new Error('Invalid settings file format');
      }

      this.state.settings = this.mergeSettings(
        this.getDefaultSettings(),
        importData.settings
      );
      this.state.isDirty = true;
      this.validateSettings();

      this.trackSettingsEvent('settings_imported', {
        sourceAgentId: importData.agentId,
        sourceAgentName: importData.agentName,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to import settings';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Private helper methods
   */
  private async fetchAgentSettings(agentId: string): Promise<AgentSettings> {
    const response = await fetch(`/api/agents/${agentId}/settings`);

    if (!response.ok) {
      throw new Error('Failed to fetch agent settings');
    }

    const data = await response.json();
    return this.mergeSettings(this.getDefaultSettings(), data.settings || {});
  }

  private async fetchSettingsPresets(): Promise<SettingsPreset[]> {
    const response = await fetch('/api/agents/settings/presets');

    if (!response.ok) {
      throw new Error('Failed to fetch presets');
    }

    const data = await response.json();
    return data.presets || [];
  }

  private getDefaultSettings(): AgentSettings {
    return {
      general: {
        name: 'Agent',
        description: 'A helpful AI assistant',
        personality: 'friendly',
        language: 'en',
        timezone: 'UTC',
        responseSpeed: 'normal',
        contextMemory: true,
        learningMode: false,
        safetyMode: true,
        autoSave: true,
        sessionTimeout: 30,
        maxTokens: 2048,
      },
      behavior: {
        conversationStyle: 'friendly',
        responseLength: 'normal',
        creativity: 50,
        empathy: 70,
        assertiveness: 50,
        humor: 30,
        politeness: 80,
        curiosity: 60,
        roleplayMode: false,
        emotionalAwareness: true,
        contextualAdaptation: true,
        proactiveEngagement: false,
        conflictResolution: 'gentle',
      },
      voice: {
        enabled: false,
        voiceId: 'default',
        speed: 1.0,
        pitch: 1.0,
        volume: 80,
        pauseLength: 0.5,
        emotionIntensity: 50,
        pronunciation: {
          accent: 'neutral',
          emphasis: 'normal',
          speechMarks: false,
          ssmlSupport: false,
          customPronunciations: {},
        },
        backgroundNoise: false,
        autoPlay: false,
        voiceCloning: false,
      },
      appearance: {
        avatar: {
          type: 'default',
          style: 'realistic',
          mood: 'neutral',
          animations: true,
          size: 'medium',
          border: false,
          shadow: true,
        },
        theme: {
          colorScheme: 'auto',
          primaryColor: '#3B82F6',
          accentColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
          borderRadius: 8,
          fontFamily: 'system-ui',
          fontSize: 14,
          messageSpacing: 12,
        },
        animations: {
          enabled: true,
          typingIndicator: true,
          messageTransitions: true,
          avatarAnimations: true,
          buttonHovers: true,
          loadingAnimations: true,
          duration: 'normal',
          easing: 'ease-out',
        },
        layout: {
          chatWidth: 'normal',
          messageAlignment: 'left',
          showTimestamps: true,
          showAvatars: true,
          compactMode: false,
          sidebarPosition: 'left',
          headerVisible: true,
          footerVisible: true,
        },
        branding: {
          showLogo: false,
          brandColor: '#3B82F6',
          welcomeMessage: 'Hello! How can I help you today?',
        },
      },
      advanced: {
        apiSettings: {
          endpoint: '/api/chat',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          topP: 1.0,
          topK: 50,
          frequencyPenalty: 0,
          presencePenalty: 0,
          stopSequences: [],
          maxTokens: 2048,
          streamingEnabled: true,
          retryAttempts: 3,
          timeout: 30,
        },
        debugging: {
          enabled: false,
          logLevel: 'error',
          showTokenUsage: false,
          showResponseTime: false,
          showApiCalls: false,
          exportLogs: false,
          sessionRecording: false,
          errorReporting: true,
        },
        performance: {
          caching: true,
          preloadMessages: false,
          lazyLoading: true,
          compressionEnabled: true,
          batchRequests: false,
          requestDeduplication: true,
          backgroundSync: false,
          resourceOptimization: true,
        },
        integrations: {
          webhooks: [],
          externalApis: [],
          plugins: [],
          analytics: {
            enabled: false,
            provider: 'none',
            customEvents: false,
            userTracking: false,
            performanceTracking: false,
          },
        },
        security: {
          contentFiltering: true,
          piiDetection: true,
          rateLimiting: true,
          ipWhitelist: [],
          encryptionEnabled: true,
          sessionValidation: true,
          auditLogging: false,
          dataRetention: 30,
        },
        experimental: {
          betaFeatures: false,
          aiEnhancements: false,
          multimodalSupport: false,
          realtimeCollaboration: false,
          advancedNlp: false,
          customModels: false,
          autoTesting: false,
        },
      },
    };
  }

  private mergeSettings(
    defaults: AgentSettings,
    overrides: Partial<AgentSettings>
  ): AgentSettings {
    const merged = JSON.parse(JSON.stringify(defaults));

    Object.keys(overrides).forEach((key) => {
      const category = key as keyof AgentSettings;
      if (overrides[category] && typeof overrides[category] === 'object') {
        Object.assign(merged[category], overrides[category]);
      }
    });

    return merged;
  }

  private validateSettings(): void {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // Validate general settings
    if (!this.state.settings.general.name.trim()) {
      this.addError(errors, 'general.name', 'Agent name is required');
    }

    if (
      this.state.settings.general.maxTokens < 100 ||
      this.state.settings.general.maxTokens > 8192
    ) {
      this.addError(
        errors,
        'general.maxTokens',
        'Max tokens must be between 100 and 8192'
      );
    }

    // Validate behavior settings
    const behavior = this.state.settings.behavior;
    if (behavior.creativity < 0 || behavior.creativity > 100) {
      this.addError(
        errors,
        'behavior.creativity',
        'Creativity must be between 0 and 100'
      );
    }

    // Validate voice settings
    const voice = this.state.settings.voice;
    if (voice.speed < 0.5 || voice.speed > 2.0) {
      this.addError(errors, 'voice.speed', 'Speed must be between 0.5 and 2.0');
    }

    // Validate API settings
    const api = this.state.settings.advanced.apiSettings;
    if (api.temperature < 0 || api.temperature > 2) {
      this.addError(
        errors,
        'advanced.apiSettings.temperature',
        'Temperature must be between 0 and 2'
      );
    }

    // Add warnings
    if (behavior.creativity > 80 && api.temperature > 1.5) {
      this.addWarning(
        warnings,
        'behavior',
        'High creativity and temperature may produce unpredictable responses'
      );
    }

    this.state.validation = {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  private addError(
    errors: Record<string, string[]>,
    path: string,
    message: string
  ): void {
    if (!errors[path]) errors[path] = [];
    errors[path].push(message);
  }

  private addWarning(
    warnings: Record<string, string[]>,
    path: string,
    message: string
  ): void {
    if (!warnings[path]) warnings[path] = [];
    warnings[path].push(message);
  }

  private scheduleAutoSave(): void {
    if (!this.state.settings.general.autoSave) return;

    this.clearAutoSave();
    this.autoSaveTimeout = setTimeout(() => {
      if (this.state.isDirty && this.state.validation.isValid) {
        this.saveSettings();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity
  }

  private clearAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }

  private trackSettingsEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Agent Settings', {
          event,
          agentId: this.state.agentId,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking settings event:', error);
    }
  }

  /**
   * Public getters
   */
  getState(): AgentSettingsModalState {
    return { ...this.state };
  }

  getSettings(): AgentSettings {
    return JSON.parse(JSON.stringify(this.state.settings));
  }

  getPresets(): SettingsPreset[] {
    return [...this.state.presets];
  }

  getValidation(): ValidationState {
    return { ...this.state.validation };
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.state.error = null;
    this.state.saveStatus = 'idle';
  }
}

// Export singleton instance
export const agentSettingsModalLogic = new AgentSettingsModalLogic();

// Export utility functions
export const agentSettingsUtils = {
  /**
   * Get setting display name
   */
  getSettingDisplayName(path: string): string {
    const names: Record<string, string> = {
      'general.name': 'Agent Name',
      'general.description': 'Description',
      'general.personality': 'Personality',
      'general.responseSpeed': 'Response Speed',
      'behavior.conversationStyle': 'Conversation Style',
      'behavior.creativity': 'Creativity Level',
      'voice.speed': 'Speech Speed',
      'voice.pitch': 'Voice Pitch',
      'appearance.theme.primaryColor': 'Primary Color',
      'advanced.apiSettings.temperature': 'Temperature',
    };
    return names[path] || path;
  },

  /**
   * Format setting value for display
   */
  formatSettingValue(path: string, value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }

    if (typeof value === 'number') {
      if (path.includes('temperature') || path.includes('creativity')) {
        return `${Math.round(value)}%`;
      }
      return value.toString();
    }

    return String(value);
  },

  /**
   * Validate color value
   */
  isValidColor(color: string): boolean {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexPattern.test(color);
  },

  /**
   * Get personality options
   */
  getPersonalityOptions(): Array<{
    value: string;
    label: string;
    description: string;
  }> {
    return [
      {
        value: 'friendly',
        label: 'Friendly',
        description: 'Warm and approachable',
      },
      {
        value: 'professional',
        label: 'Professional',
        description: 'Business-oriented and formal',
      },
      { value: 'casual', label: 'Casual', description: 'Relaxed and informal' },
      {
        value: 'enthusiastic',
        label: 'Enthusiastic',
        description: 'Energetic and positive',
      },
      {
        value: 'analytical',
        label: 'Analytical',
        description: 'Logical and detail-oriented',
      },
      {
        value: 'creative',
        label: 'Creative',
        description: 'Imaginative and innovative',
      },
      {
        value: 'helpful',
        label: 'Helpful',
        description: 'Supportive and solution-focused',
      },
    ];
  },

  /**
   * Get conversation style options
   */
  getConversationStyleOptions(): Array<{
    value: string;
    label: string;
    description: string;
  }> {
    return [
      {
        value: 'formal',
        label: 'Formal',
        description: 'Structured and professional language',
      },
      {
        value: 'casual',
        label: 'Casual',
        description: 'Relaxed and conversational',
      },
      {
        value: 'professional',
        label: 'Professional',
        description: 'Business-appropriate tone',
      },
      {
        value: 'friendly',
        label: 'Friendly',
        description: 'Warm and personable',
      },
    ];
  },

  /**
   * Export settings validation
   */
  validateExportData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.version) {
      errors.push('Missing version information');
    }

    if (!data.settings) {
      errors.push('Missing settings data');
    }

    if (!data.agentId) {
      errors.push('Missing agent ID');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
