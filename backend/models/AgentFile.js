/**
 * AGENT FILE MODEL
 * Stores file metadata in MongoDB, actual content in S3
 * Provides persistent file storage for agent workspaces
 */

import mongoose from 'mongoose';

const agentFileSchema = new mongoose.Schema({
  // File identification
  userId: {
    type: String,
    required: true,
    index: true,
  },
  agentId: {
    type: String,
    default: 'general',
    index: true,
  },
  sessionId: {
    type: String,
    default: null,
  },
  
  // File details
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  folder: {
    type: String,
    default: '/',
  },
  path: {
    type: String,
    required: true,
  },
  
  // File metadata
  mimeType: {
    type: String,
    default: 'text/plain',
  },
  size: {
    type: Number,
    default: 0,
  },
  encoding: {
    type: String,
    default: 'utf-8',
  },
  
  // Storage location
  storageType: {
    type: String,
    enum: ['mongodb', 's3', 'local'],
    default: 'mongodb',
  },
  s3Key: {
    type: String,
    default: null,
  },
  s3Bucket: {
    type: String,
    default: null,
  },
  s3Url: {
    type: String,
    default: null,
  },
  
  // For small files, store content directly in MongoDB (< 1MB)
  content: {
    type: String,
    default: null,
  },
  contentBinary: {
    type: Buffer,
    default: null,
  },
  
  // File state
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1,
  },
  previousVersions: [{
    version: Number,
    content: String,
    modifiedAt: Date,
    size: Number,
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'agent_files',
});

// Compound indexes for efficient queries
agentFileSchema.index({ userId: 1, path: 1 }, { unique: true });
agentFileSchema.index({ userId: 1, folder: 1 });
agentFileSchema.index({ userId: 1, agentId: 1 });
agentFileSchema.index({ userId: 1, isDeleted: 1 });
agentFileSchema.index({ createdAt: -1 });

// Virtual for full path
agentFileSchema.virtual('fullPath').get(function() {
  return this.folder === '/' ? `/${this.filename}` : `${this.folder}/${this.filename}`;
});

// Pre-save middleware
agentFileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  // Generate path from folder + filename
  this.path = this.folder === '/' ? `/${this.filename}` : `${this.folder}/${this.filename}`;
  next();
});

// Static methods
agentFileSchema.statics.findByUserAndPath = function(userId, path) {
  return this.findOne({ userId, path, isDeleted: false });
};

agentFileSchema.statics.findByUser = function(userId, folder = null) {
  const query = { userId, isDeleted: false };
  if (folder) query.folder = folder;
  return this.find(query).sort({ filename: 1 });
};

agentFileSchema.statics.softDelete = function(userId, path) {
  return this.findOneAndUpdate(
    { userId, path },
    { isDeleted: true, updatedAt: new Date() },
    { new: true }
  );
};

const AgentFile = mongoose.model('AgentFile', agentFileSchema);

export default AgentFile;
