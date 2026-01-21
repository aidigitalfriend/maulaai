import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 100 },
    avatarUrl: { type: String },
    specialty: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    systemPrompt: { type: String, required: true },
    welcomeMessage: { type: String, required: true },
    specialties: [{ type: String, maxlength: 50 }],
    tags: [{ type: String, maxlength: 50 }],
    color: { type: String, maxlength: 100 },
    aiProvider: {
      primary: {
        type: String,
        enum: [
          'openai',
          'anthropic',
          'gemini',
          'cohere',
          'mistral',
          'xai',
          'huggingface',
          'groq',
        ],
      },
      fallbacks: [{ type: String }],
      model: { type: String },
      reasoning: { type: String },
    },
    pricing: {
      daily: { type: Number, min: 0 },
      weekly: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 },
    },
    stats: {
      totalUsers: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      averageRating: { type: Number, min: 0, max: 5, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'deprecated'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes
agentSchema.index({ id: 1 }, { unique: true }); // Unique agent lookup
agentSchema.index({ status: 1 }); // Active agents
agentSchema.index({ 'aiProvider.primary': 1 }); // Provider analytics
agentSchema.index({ tags: 1 }); // Tag-based search
agentSchema.index({ 'stats.totalUsers': -1 }); // Popular agents
agentSchema.index({ specialties: 1 }); // Specialty filtering

// Validation
agentSchema.pre('save', function (next) {
  if (this.stats.averageRating < 0 || this.stats.averageRating > 5) {
    return next(new Error('Average rating must be between 0 and 5'));
  }
  if (
    this.pricing.daily < 0 ||
    this.pricing.weekly < 0 ||
    this.pricing.monthly < 0
  ) {
    return next(new Error('Pricing cannot be negative'));
  }
  next();
});

// Instance methods
agentSchema.methods.isActive = function () {
  return this.status === 'active';
};

agentSchema.methods.updateStats = function (newRating, newSession) {
  if (newRating !== undefined) {
    // Calculate new average rating
    const currentTotal = this.stats.averageRating * this.stats.totalSessions;
    this.stats.totalSessions += 1;
    this.stats.averageRating =
      (currentTotal + newRating) / this.stats.totalSessions;
  } else if (newSession) {
    this.stats.totalSessions += 1;
  }
  return this.save();
};

agentSchema.methods.incrementUsers = function () {
  this.stats.totalUsers += 1;
  return this.save();
};

// Static methods
agentSchema.statics.findActive = function () {
  return this.find({ status: 'active' });
};

agentSchema.statics.findByProvider = function (provider) {
  return this.find({ 'aiProvider.primary': provider, status: 'active' });
};

agentSchema.statics.findPopular = function (limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'stats.totalUsers': -1 })
    .limit(limit);
};

agentSchema.statics.findByTags = function (tags) {
  return this.find({
    tags: { $in: tags },
    status: 'active',
  });
};

agentSchema.statics.findBySpecialties = function (specialties) {
  return this.find({
    specialties: { $in: specialties },
    status: 'active',
  });
};

export default mongoose.model('Agent', agentSchema);
