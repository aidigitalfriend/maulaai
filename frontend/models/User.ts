import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string; // Optional for passwordless users
  authMethod: 'password' | 'passwordless';
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
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
  delete user.__v;
  return user;
};

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
