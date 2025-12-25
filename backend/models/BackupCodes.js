import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// BACKUP CODES MODEL
// ============================================
const backupCodesSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // 2FA Reference
    twoFactorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TwoFactorAuthentication',
      required: true,
      index: true,
    },

    // Backup Code Details
    codeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Hashed backup code (never store plain text)
    codeHash: {
      type: String,
      required: true,
      unique: true,
    },

    // Code Display (first 4 chars for identification)
    codePrefix: {
      type: String,
      required: true,
      length: 4,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'revoked'],
      default: 'active',
      required: true,
      index: true,
    },

    // Usage Information
    usage: {
      used: {
        type: Boolean,
        default: false,
      },
      usedAt: {
        type: Date,
        default: null,
      },
      usedFrom: {
        ipAddress: String,
        userAgent: String,
        location: {
          country: String,
          region: String,
          city: String,
        },
        device: {
          type: String,
          os: String,
          browser: String,
        },
      },
      attemptId: String, // Link to login history
      sessionId: String,
    },

    // Generation Information
    generation: {
      generatedAt: {
        type: Date,
        default: Date.now,
      },
      generationMethod: {
        type: String,
        enum: ['initial_setup', 'regeneration', 'recovery'],
        default: 'initial_setup',
      },
      batchId: String, // Links codes generated together
      sequence: Number, // Position in the batch (1-10)
    },

    // Expiration
    expiresAt: {
      type: Date,
      required: false, // Backup codes can be permanent
    },

    // Security Features
    security: {
      algorithm: {
        type: String,
        default: 'bcrypt',
      },
      rounds: {
        type: Number,
        default: 12,
      },
      createdWithDevice: {
        fingerprint: String,
        trusted: Boolean,
      },
    },

    // Audit Trail
    audit: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      lastAccessed: Date,
      accessCount: {
        type: Number,
        default: 0,
      },
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      revokedAt: Date,
      revokeReason: {
        type: String,
        enum: [
          'user_request',
          'security_breach',
          'regeneration',
          'expiration',
          'admin_action',
        ],
      },
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      format: {
        type: String,
        enum: ['numeric', 'alphanumeric', 'hex'],
        default: 'alphanumeric',
      },
      length: {
        type: Number,
        default: 16,
      },
      checksumIncluded: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    collection: 'backupcodes',
  }
);

// Indexes for performance
backupCodesSchema.index({ userId: 1, status: 1 });
backupCodesSchema.index({ twoFactorId: 1, status: 1 });
backupCodesSchema.index({ codeId: 1 });
backupCodesSchema.index({ codeHash: 1 });
backupCodesSchema.index({ 'generation.batchId': 1, 'generation.sequence': 1 });
backupCodesSchema.index({ status: 1, expiresAt: 1 });

// Compound indexes for common queries
backupCodesSchema.index({ userId: 1, status: 1, 'generation.generatedAt': -1 });
backupCodesSchema.index({ userId: 1, 'usage.used': 1, status: 1 });

// TTL index for expired codes (if expiresAt is set)
backupCodesSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true } },
  }
);

// Virtual for checking if code is valid
backupCodesSchema.virtual('isValid').get(function () {
  return (
    this.status === 'active' &&
    !this.usage.used &&
    (!this.expiresAt || this.expiresAt > new Date())
  );
});

// Static method to verify backup code
backupCodesSchema.statics.verifyCode = async function (userId, plainCode) {
  const bcrypt = require('bcryptjs');

  // Find all active codes for user
  const codes = await this.find({
    userId,
    status: 'active',
    'usage.used': false,
  });

  // Check each code
  for (let code of codes) {
    const isMatch = await bcrypt.compare(plainCode, code.codeHash);
    if (isMatch) {
      return code;
    }
  }

  return null;
};

// Method to mark code as used
backupCodesSchema.methods.markAsUsed = function (usageDetails) {
  this.usage.used = true;
  this.usage.usedAt = new Date();
  this.usage.usedFrom = usageDetails;
  this.status = 'used';
  this.audit.accessCount += 1;
  return this.save();
};

export default mongoose.model('BackupCodes', backupCodesSchema);
