import mongoose, { Schema, Document } from 'mongoose'

export interface IUserProfile extends Document {
  userId: string
  email: string
  name: string
  avatar?: string
  bio?: string
  phoneNumber?: string
  location?: string
  timezone?: string
  profession?: string
  company?: string
  website?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
    productUpdates: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  profession: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: true
    },
    productUpdates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
})

// Indexes
UserProfileSchema.index({ userId: 1 })
UserProfileSchema.index({ email: 1 })

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema)