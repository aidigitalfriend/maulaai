import mongoose from 'mongoose'

const { Schema } = mongoose

const UserPreferencesSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  theme: {
    mode: { type: String, default: 'light', enum: ['light', 'dark', 'system'] },
    primaryColor: { type: String, default: 'brand' },
    fontSize: { type: String, default: 'medium', enum: ['small', 'medium', 'large'] },
    compactMode: { type: Boolean, default: false }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, default: 'immediate', enum: ['immediate', 'daily', 'weekly'] },
      types: {
        system: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        updates: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
        community: { type: Boolean, default: true }
      }
    },
    push: {
      enabled: { type: Boolean, default: true },
      quiet: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' }
      }
    },
    desktop: {
      enabled: { type: Boolean, default: false },
      sound: { type: Boolean, default: true }
    }
  },
  language: {
    primary: { type: String, default: 'en' },
    secondary: { type: String, default: '' },
    autoDetect: { type: Boolean, default: true }
  },
  accessibility: {
    highContrast: { type: Boolean, default: false },
    reduceMotion: { type: Boolean, default: false },
    screenReader: { type: Boolean, default: false },
    keyboardNavigation: { type: Boolean, default: true }
  },
  privacy: {
    profileVisibility: { type: String, default: 'public', enum: ['public', 'private', 'friends'] },
    activityTracking: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false }
  },
  advanced: {
    autoSave: { type: Boolean, default: true },
    autoBackup: { type: Boolean, default: true },
    debugMode: { type: Boolean, default: false },
    betaFeatures: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

const UserPreferences = mongoose.model('UserPreferences', UserPreferencesSchema)

export default UserPreferences