import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// THEME SETTINGS MODEL
// ============================================
const themeSettingsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Theme Mode
    mode: {
      type: String,
      enum: ['light', 'dark', 'auto', 'system'],
      default: 'auto',
      required: true,
    },

    // Color Scheme
    colors: {
      primary: {
        type: String,
        enum: [
          'brand',
          'blue',
          'green',
          'purple',
          'orange',
          'red',
          'pink',
          'indigo',
          'teal',
          'custom',
        ],
        default: 'brand',
      },
      secondary: {
        type: String,
        enum: ['auto', 'complementary', 'monochrome', 'triadic', 'custom'],
        default: 'auto',
      },
      accent: {
        type: String,
        default: '#3b82f6',
      },
      background: {
        type: String,
        enum: ['default', 'paper', 'gradient', 'image', 'custom'],
        default: 'default',
      },
      surface: {
        type: String,
        enum: ['flat', 'elevated', 'outlined', 'custom'],
        default: 'elevated',
      },
    },

    // Custom Colors (when 'custom' is selected)
    customColors: {
      primary: {
        main: String,
        light: String,
        dark: String,
        contrast: String,
      },
      secondary: {
        main: String,
        light: String,
        dark: String,
        contrast: String,
      },
      background: {
        default: String,
        paper: String,
        image: String,
      },
      text: {
        primary: String,
        secondary: String,
        disabled: String,
      },
      error: String,
      warning: String,
      info: String,
      success: String,
    },

    // Typography
    typography: {
      fontFamily: {
        type: String,
        enum: ['default', 'sans', 'serif', 'mono', 'custom'],
        default: 'default',
      },
      customFontFamily: String,
      fontSize: {
        type: String,
        enum: ['xs', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
      },
      fontWeight: {
        type: String,
        enum: ['light', 'normal', 'medium', 'semibold', 'bold'],
        default: 'normal',
      },
      lineHeight: {
        type: String,
        enum: ['tight', 'normal', 'relaxed', 'loose'],
        default: 'normal',
      },
      letterSpacing: {
        type: String,
        enum: ['tighter', 'tight', 'normal', 'wide', 'wider'],
        default: 'normal',
      },
    },

    // Layout Preferences
    layout: {
      compactMode: {
        type: Boolean,
        default: false,
      },
      sidebarWidth: {
        type: String,
        enum: ['narrow', 'normal', 'wide'],
        default: 'normal',
      },
      contentWidth: {
        type: String,
        enum: ['narrow', 'normal', 'wide', 'full'],
        default: 'normal',
      },
      headerStyle: {
        type: String,
        enum: ['minimal', 'standard', 'prominent'],
        default: 'standard',
      },
      navigationStyle: {
        type: String,
        enum: ['sidebar', 'top', 'bottom', 'floating'],
        default: 'sidebar',
      },
      cardStyle: {
        type: String,
        enum: ['flat', 'outlined', 'elevated', 'minimal'],
        default: 'elevated',
      },
    },

    // Animation and Motion
    motion: {
      enableAnimations: {
        type: Boolean,
        default: true,
      },
      animationSpeed: {
        type: String,
        enum: ['slow', 'normal', 'fast', 'instant'],
        default: 'normal',
      },
      transitionType: {
        type: String,
        enum: [
          'ease',
          'linear',
          'ease-in',
          'ease-out',
          'ease-in-out',
          'spring',
        ],
        default: 'ease-in-out',
      },
      parallaxEffects: {
        type: Boolean,
        default: true,
      },
      hoverEffects: {
        type: Boolean,
        default: true,
      },
      loadingAnimations: {
        type: Boolean,
        default: true,
      },
    },

    // Visual Effects
    effects: {
      borderRadius: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
        default: 'md',
      },
      shadows: {
        type: String,
        enum: ['none', 'subtle', 'normal', 'prominent'],
        default: 'normal',
      },
      blur: {
        enabled: { type: Boolean, default: false },
        intensity: {
          type: String,
          enum: ['light', 'medium', 'heavy'],
          default: 'medium',
        },
      },
      gradients: {
        enabled: { type: Boolean, default: true },
        style: {
          type: String,
          enum: ['linear', 'radial', 'conic'],
          default: 'linear',
        },
      },
      glassmorphism: {
        type: Boolean,
        default: false,
      },
      neumorphism: {
        type: Boolean,
        default: false,
      },
    },

    // Accessibility
    accessibility: {
      highContrast: {
        type: Boolean,
        default: false,
      },
      reducedMotion: {
        type: Boolean,
        default: false,
      },
      focusIndicators: {
        type: Boolean,
        default: true,
      },
      screenReader: {
        enabled: { type: Boolean, default: false },
        verbosity: {
          type: String,
          enum: ['minimal', 'normal', 'detailed'],
          default: 'normal',
        },
      },
      colorBlind: {
        enabled: { type: Boolean, default: false },
        type: {
          type: String,
          enum: ['protanopia', 'deuteranopia', 'tritanopia', 'monochromacy'],
        },
      },
      fontSize: {
        scale: { type: Number, default: 1.0, min: 0.8, max: 2.0 },
        dyslexiaFriendly: { type: Boolean, default: false },
      },
    },

    // Dashboard Customization
    dashboard: {
      gridLayout: {
        type: String,
        enum: ['compact', 'comfortable', 'spacious'],
        default: 'comfortable',
      },
      widgetStyle: {
        type: String,
        enum: ['minimal', 'standard', 'detailed'],
        default: 'standard',
      },
      chartStyle: {
        type: String,
        enum: ['minimal', 'detailed', 'colorful'],
        default: 'detailed',
      },
      showBackground: {
        type: Boolean,
        default: true,
      },
      backgroundImage: String,
      backgroundOpacity: {
        type: Number,
        default: 0.1,
        min: 0,
        max: 1,
      },
    },

    // Chat Interface
    chat: {
      bubbleStyle: {
        type: String,
        enum: ['rounded', 'square', 'minimal'],
        default: 'rounded',
      },
      messageSpacing: {
        type: String,
        enum: ['compact', 'normal', 'spacious'],
        default: 'normal',
      },
      showTimestamps: {
        type: Boolean,
        default: true,
      },
      showAvatars: {
        type: Boolean,
        default: true,
      },
      codeHighlighting: {
        type: Boolean,
        default: true,
      },
      syntaxTheme: {
        type: String,
        enum: ['github', 'monokai', 'solarized', 'dracula', 'vs-code'],
        default: 'github',
      },
    },

    // Custom CSS
    customization: {
      enableCustomCSS: {
        type: Boolean,
        default: false,
      },
      customCSS: String,
      cssVariables: [
        {
          name: String,
          value: String,
          description: String,
        },
      ],
      importedThemes: [String], // URLs to external themes
      themePresets: [
        {
          name: String,
          settings: Schema.Types.Mixed,
          isDefault: Boolean,
          createdAt: Date,
        },
      ],
    },

    // Seasonal and Context
    seasonal: {
      enableSeasonalThemes: {
        type: Boolean,
        default: true,
      },
      currentSeason: {
        type: String,
        enum: ['spring', 'summer', 'autumn', 'winter', 'none'],
        default: 'none',
      },
      holidayThemes: {
        type: Boolean,
        default: true,
      },
      timeBasedThemes: {
        enabled: { type: Boolean, default: false },
        schedule: [
          {
            startTime: String,
            endTime: String,
            theme: String,
          },
        ],
      },
    },

    // Performance
    performance: {
      enableGPUAcceleration: {
        type: Boolean,
        default: true,
      },
      enableImageOptimization: {
        type: Boolean,
        default: true,
      },
      enableCaching: {
        type: Boolean,
        default: true,
      },
      lowPowerMode: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    metadata: {
      lastApplied: {
        type: Date,
        default: Date.now,
      },
      version: {
        type: String,
        default: '1.0',
      },
      migratedFrom: String,
      appliedCount: {
        type: Number,
        default: 1,
      },
      favoriteThemes: [String],
      recentlyUsed: [
        {
          theme: String,
          usedAt: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'themesettings',
  }
);

// Indexes for performance
themeSettingsSchema.index({ userId: 1 });
themeSettingsSchema.index({ mode: 1 });
themeSettingsSchema.index({ 'colors.primary': 1 });

// Pre-save middleware to update metadata
themeSettingsSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.metadata.lastApplied = new Date();
    this.metadata.appliedCount += 1;
  }
  next();
});

// Method to get compiled CSS variables
themeSettingsSchema.methods.getCSSVariables = function () {
  const variables = {};

  // Mode-based variables
  variables['--theme-mode'] = this.mode;

  // Color variables
  if (this.colors.primary !== 'custom') {
    const colorMap = {
      brand: '#3b82f6',
      blue: '#2563eb',
      green: '#16a34a',
      purple: '#9333ea',
      orange: '#ea580c',
      red: '#dc2626',
      pink: '#db2777',
      indigo: '#4f46e5',
      teal: '#0891b2',
    };
    variables['--color-primary'] =
      colorMap[this.colors.primary] || colorMap.brand;
  } else if (this.customColors.primary) {
    variables['--color-primary'] = this.customColors.primary.main;
    variables['--color-primary-light'] = this.customColors.primary.light;
    variables['--color-primary-dark'] = this.customColors.primary.dark;
  }

  // Typography variables
  const fontSizeMap = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  };
  variables['--font-size-base'] = fontSizeMap[this.typography.fontSize];

  // Layout variables
  variables['--layout-compact'] = this.layout.compactMode ? 'true' : 'false';
  variables['--border-radius'] = this.effects.borderRadius;

  // Animation variables
  variables['--animation-duration'] = this.motion.animationSpeed;
  variables['--enable-animations'] = this.motion.enableAnimations ? '1' : '0';

  // Custom CSS variables
  if (this.customization.cssVariables) {
    this.customization.cssVariables.forEach((variable) => {
      variables[`--custom-${variable.name}`] = variable.value;
    });
  }

  return variables;
};

// Method to apply theme preset
themeSettingsSchema.methods.applyPreset = function (presetName) {
  const preset = this.customization.themePresets.find(
    (p) => p.name === presetName
  );
  if (!preset) throw new Error('Theme preset not found');

  // Apply preset settings
  Object.assign(this, preset.settings);

  // Add to recently used
  this.metadata.recentlyUsed.unshift({
    theme: presetName,
    usedAt: new Date(),
  });

  // Keep only last 10 recently used
  if (this.metadata.recentlyUsed.length > 10) {
    this.metadata.recentlyUsed = this.metadata.recentlyUsed.slice(0, 10);
  }

  return this.save();
};

// Static method to get default theme settings
themeSettingsSchema.statics.getDefaultSettings = function () {
  return {
    mode: 'auto',
    colors: {
      primary: 'brand',
      secondary: 'auto',
      background: 'default',
      surface: 'elevated',
    },
    typography: {
      fontFamily: 'default',
      fontSize: 'md',
      fontWeight: 'normal',
      lineHeight: 'normal',
    },
    layout: {
      compactMode: false,
      sidebarWidth: 'normal',
      contentWidth: 'normal',
    },
    motion: {
      enableAnimations: true,
      animationSpeed: 'normal',
    },
    effects: {
      borderRadius: 'md',
      shadows: 'normal',
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      focusIndicators: true,
    },
  };
};

// Virtual for theme summary
themeSettingsSchema.virtual('summary').get(function () {
  return {
    mode: this.mode,
    primaryColor: this.colors.primary,
    fontSize: this.typography.fontSize,
    compactMode: this.layout.compactMode,
    animationsEnabled: this.motion.enableAnimations,
    customized:
      this.customization.enableCustomCSS ||
      this.colors.primary === 'custom' ||
      this.customization.themePresets.length > 0,
  };
});

export default mongoose.model('ThemeSettings', themeSettingsSchema);
