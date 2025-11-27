import mongoose from 'mongoose'

const { Schema } = mongoose

const AgentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  personality: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '🤖',
  },
  category: {
    type: String,
    enum: ['entertainment', 'education', 'productivity', 'health', 'gaming', 'creative', 'business'],
    default: 'entertainment',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  settings: {
    model: {
      type: String,
      default: 'gpt-3.5-turbo',
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    maxTokens: {
      type: Number,
      default: 150,
    },
  },
  usage: {
    totalChats: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
})

const Agent = mongoose.model('Agent', AgentSchema)
export default Agent
