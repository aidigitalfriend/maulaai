import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string; // Optional for passwordless users
  authMethod: 'password' | 'passwordless';
  emailVerified?: Date;
  image?: string;
  avatar?: string; // Profile avatar URL
  bio?: string; // Profile bio
  phoneNumber?: string; // Profile phone
  location?: string; // Profile location
  timezone?: string; // Profile timezone
  profession?: string; // Professional info
  company?: string; // Professional info
  website?: string; // Professional info
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    productUpdates?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  sessionId?: string;
  sessionExpiry?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  tempTwoFactorSecret?: string;
  backupCodes?: string[];
  tempBackupCodes?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      // Only required for password-based auth
      // Passwordless users won't have this field
    },
    authMethod: {
      type: String,
      enum: ['password', 'passwordless'],
      default: 'password',
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    timezone: {
      type: String,
      default: null,
    },
    profession: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    socialLinks: {
      linkedin: {
        type: String,
        default: null,
      },
      twitter: {
        type: String,
        default: null,
      },
      github: {
        type: String,
        default: null,
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      marketingEmails: {
        type: Boolean,
        default: true,
      },
      productUpdates: {
        type: Boolean,
        default: true,
      },
    },
    lastLoginAt: {
      type: Date,
      default: null,
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
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    sessionExpiry: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    tempTwoFactorSecret: {
      type: String,
      default: null,
    },
    backupCodes: {
      type: [String],
      default: [],
    },
    tempBackupCodes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 * Skip if:
 * - Password not modified
 * - Password is undefined (passwordless user)
 * - Password is empty
 * NOTE: Password hashing is now handled manually in API routes
 * to avoid bcryptjs compatibility issues with Next.js
 */
/*
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})
*/

/**
 * Compare password method
 * Used during credential-based login
 * NOTE: Password comparison is now handled manually in API routes
 * to avoid bcryptjs compatibility issues with Next.js
 */
/*
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false
  }
  return await bcrypt.compare(candidatePassword, this.password)
}
*/

/**
 * Instance method: Check if reset token is valid
 */
UserSchema.methods.isResetTokenValid = function (): boolean {
  return this.resetPasswordExpires && this.resetPasswordExpires > new Date();
};

/**
 * Instance method: Generate reset token
 */
UserSchema.methods.generateResetToken = function (): string {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  return resetToken;
};

/**
 * JSON response method
 * Don't expose password or sensitive fields
 */
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.twoFactorSecret;
  delete user.tempTwoFactorSecret;
  delete user.backupCodes;
  delete user.tempBackupCodes;
  delete user.__v;
  return user;
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
