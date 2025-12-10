import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
  },
  authMethod: {
    type: String,
    enum: ['password', 'passwordless'],
    default: 'password',
  },
  emailVerified: {
    type: Date,
  },
  image: {
    type: String,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  phoneNumber: {
    type: String,
  },
  location: {
    type: String,
  },
  timezone: {
    type: String,
  },
  profession: {
    type: String,
  },
  company: {
    type: String,
  },
  socialLinks: {
    twitter: { type: String },
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  sessionId: {
    type: String,
  },
  sessionExpiry: {
    type: Date,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
  },
  backupCodes: [
    {
      type: String,
    },
  ],
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ sessionId: 1 });
UserSchema.index({ resetPasswordToken: 1 });

// Virtual for account lock
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to update updatedAt
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform output
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.twoFactorSecret;
  delete userObject.backupCodes;
  delete userObject.resetPasswordToken;
  delete userObject.sessionId;
  return userObject;
};

export default mongoose.model('User', UserSchema);
