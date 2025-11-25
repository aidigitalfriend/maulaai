import mongoose, { Schema, Document } from 'mongoose'

export interface IJobApplication extends Document {
  position: string
  jobId: string
  fullName: string
  email: string
  contactNumber: string
  address: string
  age: number
  currentPosition: string
  yearsExperience: string
  expertise: string[]
  workHistory: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  portfolioUrl?: string
  additionalInfo?: string
  expectations?: string
  resumeUrl?: string
  coverLetterUrl?: string
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewNotes?: string
  ipAddress: string
  userAgent: string
  applicationId: string
  createdAt: Date
  updatedAt: Date
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    position: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    currentPosition: {
      type: String,
      required: true,
      trim: true,
    },
    yearsExperience: {
      type: String,
      required: true,
    },
    expertise: [{
      type: String,
      required: true,
      trim: true,
    }],
    workHistory: [{
      company: {
        type: String,
        required: true,
        trim: true,
      },
      position: {
        type: String,
        required: true,
        trim: true,
      },
      duration: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    }],
    portfolioUrl: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    expectations: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    coverLetterUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'interview', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
      index: true,
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
JobApplicationSchema.index({ email: 1, position: 1 })
JobApplicationSchema.index({ status: 1, submittedAt: -1 })
JobApplicationSchema.index({ position: 1, submittedAt: -1 })

// Methods
JobApplicationSchema.methods.toJSON = function () {
  const application = this.toObject()
  delete application.__v
  return application
}

export default mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema)