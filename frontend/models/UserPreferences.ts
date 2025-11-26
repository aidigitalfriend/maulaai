import mongoose, { Schema, Document } from 'mongoose'

export interface IUserPreferences extends Document {
  userId: string
  email: string
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  notifications: {
    email: {
      enabled: boolean
      frequency: 'immediate' | 'daily' | 'weekly'
      types: string[]
    }
    push: {
      enabled: boolean
      types: string[]
    }
    sms: {
      enabled: boolean
      types: string[]
    }
  }
  dashboard: {
    defaultView: string
    widgets: string[]
    layout: 'grid' | 'list'
  }
  accessibility: {
    highContrast: boolean
    largeText: boolean
    reduceMotion: boolean
    screenReader: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    allowDataCollection: boolean
    shareUsageStats: boolean
  }
  integrations: {
    [key: string]: {
      enabled: boolean
      settings: any
    }
  }
  createdAt: Date
  updatedAt: Date
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY'
  },
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    default: '12h'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly'],
        default: 'daily'
      },
      types: [{
        type: String
      }]
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      types: [{
        type: String
      }]
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      types: [{
        type: String
      }]
    }
  },
  dashboard: {
    defaultView: {
      type: String,
      default: 'overview'
    },
    widgets: [{
      type: String
    }],
    layout: {
      type: String,
      enum: ['grid', 'list'],
      default: 'grid'
    }
  },
  accessibility: {
    highContrast: {
      type: Boolean,
      default: false
    },
    largeText: {
      type: Boolean,
      default: false
    },
    reduceMotion: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    }
  },
  privacy: {
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowDataCollection: {
      type: Boolean,
      default: true
    },
    shareUsageStats: {
      type: Boolean,
      default: false
    }
  },
  integrations: {
    type: Map,
    of: {
      enabled: {
        type: Boolean,
        default: false
      },
      settings: Schema.Types.Mixed
    },
    default: {}
  }
}, {
  timestamps: true
})

// Indexes
UserPreferencesSchema.index({ userId: 1 })
UserPreferencesSchema.index({ email: 1 })

export default mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema)