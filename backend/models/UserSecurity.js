import mongoose from 'mongoose'

const { Schema } = mongoose

const UserSecuritySchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  passwordLastChanged: {
    type: Date,
    default: Date.now
  },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    method: { type: String, default: 'none' }, // 'none', 'authenticator', 'sms'
    secret: { type: String, default: '' },
    backupCodes: [String],
    enabledDate: Date
  },
  trustedDevices: [{
    deviceId: String,
    name: String,
    type: String, // 'desktop', 'mobile', 'tablet'
    browser: String,
    location: String,
    ipAddress: String,
    addedDate: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now }
  }],
  loginHistory: [{
    date: { type: Date, default: Date.now },
    location: String,
    device: String,
    browser: String,
    ipAddress: String,
    status: { type: String, enum: ['success', 'failed', 'blocked'] },
    failureReason: String
  }],
  securityScore: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  recommendations: [{
    type: { type: String, enum: ['info', 'warning', 'error'] },
    title: String,
    description: String,
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    dismissed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
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

const UserSecurity = mongoose.model('UserSecurity', UserSecuritySchema)

export default UserSecurity