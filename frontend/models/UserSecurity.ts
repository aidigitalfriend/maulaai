import mongoose, { Schema, Document } from 'mongoose'

export interface IUserSecurity extends Document {
  userId: string
  email: string
  passwordLastChanged: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  backupCodes?: string[]
  trustedDevices?: Array<{
    deviceId: string
    deviceName: string
    lastUsed: Date
    location?: string
    ipAddress?: string
  }>
  loginHistory?: Array<{
    timestamp: Date
    ipAddress: string
    location?: string
    userAgent?: string
    success: boolean
  }>
  securityQuestions?: Array<{
    question: string
    answerHash: string
  }>
  accountLocked: boolean
  lockReason?: string
  lockExpires?: Date
  failedLoginAttempts: number
  lastFailedLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSecuritySchema = new Schema<IUserSecurity>({
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
  passwordLastChanged: {
    type: Date,
    default: Date.now
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  backupCodes: [{
    type: String
  }],
  trustedDevices: [{
    deviceId: {
      type: String,
      required: true
    },
    deviceName: {
      type: String,
      required: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    location: String,
    ipAddress: String
  }],
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      required: true
    },
    location: String,
    userAgent: String,
    success: {
      type: Boolean,
      default: true
    }
  }],
  securityQuestions: [{
    question: {
      type: String,
      required: true
    },
    answerHash: {
      type: String,
      required: true
    }
  }],
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockReason: String,
  lockExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lastFailedLogin: Date
}, {
  timestamps: true
})

// Indexes
UserSecuritySchema.index({ userId: 1 })
UserSecuritySchema.index({ email: 1 })
UserSecuritySchema.index({ accountLocked: 1 })

export default mongoose.models.UserSecurity || mongoose.model<IUserSecurity>('UserSecurity', UserSecuritySchema)