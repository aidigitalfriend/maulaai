/**
 * JOB APPLICATION MODEL
 * Handles career/job applications from /careers page
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const jobApplicationSchema = new Schema(
  {
    // Application identification
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicationNumber: { type: Number, unique: true },

    // Job position
    position: {
      id: { type: String, required: true, index: true },
      title: { type: String, required: true },
      department: { type: String },
      location: { type: String },
      type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
      },
    },

    // Applicant info
    applicant: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String },
      location: {
        city: { type: String },
        state: { type: String },
        country: { type: String },
        timezone: { type: String },
      },
      linkedIn: { type: String },
      github: { type: String },
      portfolio: { type: String },
      website: { type: String },
    },

    // If existing user
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // Resume/CV
    resume: {
      url: { type: String },
      filename: { type: String },
      parsedData: {
        skills: [{ type: String }],
        experience: [{ type: String }],
        education: [{ type: String }],
      },
    },

    // Cover letter
    coverLetter: {
      text: { type: String },
      url: { type: String }, // If uploaded as file
    },

    // Application questions
    responses: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],

    // Experience
    experience: {
      yearsTotal: { type: Number },
      currentCompany: { type: String },
      currentTitle: { type: String },
      relevantExperience: { type: String },
    },

    // Compensation
    compensation: {
      expectedSalary: { type: String },
      currentSalary: { type: String },
      willingToNegotiate: { type: Boolean },
    },

    // Availability
    availability: {
      startDate: { type: Date },
      noticePeriod: { type: String },
      willingToRelocate: { type: Boolean },
      workAuthorization: { type: String },
    },

    // Status tracking
    status: {
      type: String,
      enum: [
        'submitted',
        'reviewing',
        'phone-screen',
        'interview-scheduled',
        'interview-completed',
        'technical-assessment',
        'final-round',
        'offer-extended',
        'offer-accepted',
        'offer-declined',
        'hired',
        'rejected',
        'withdrawn',
      ],
      default: 'submitted',
      index: true,
    },

    // Review process
    reviews: [
      {
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewerName: { type: String },
        stage: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
        decision: { type: String, enum: ['advance', 'reject', 'hold'] },
        reviewedAt: { type: Date, default: Date.now },
      },
    ],

    // Interview scheduling
    interviews: [
      {
        type: { type: String, enum: ['phone', 'video', 'onsite', 'technical'] },
        scheduledAt: { type: Date },
        duration: { type: Number }, // minutes
        interviewers: [{ type: String }],
        meetingLink: { type: String },
        status: {
          type: String,
          enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
        },
        notes: { type: String },
      },
    ],

    // Technical assessment
    assessment: {
      type: { type: String },
      sentAt: { type: Date },
      dueDate: { type: Date },
      submittedAt: { type: Date },
      score: { type: Number },
      feedback: { type: String },
    },

    // Offer details (if extended)
    offer: {
      salary: { type: Number },
      equity: { type: String },
      benefits: [{ type: String }],
      startDate: { type: Date },
      expirationDate: { type: Date },
      extendedAt: { type: Date },
      respondedAt: { type: Date },
      response: { type: String, enum: ['accepted', 'declined', 'negotiating'] },
    },

    // Rejection reason (if rejected)
    rejection: {
      reason: { type: String },
      feedback: { type: String },
      notifiedAt: { type: Date },
    },

    // Source tracking
    source: {
      channel: { type: String }, // 'website', 'linkedin', 'referral', etc.
      referredBy: { type: String },
      campaign: { type: String },
    },

    // Tags for organization
    tags: [{ type: String }],

    // Internal notes
    notes: [
      {
        text: { type: String },
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Timestamps
    appliedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'jobapplications',
  }
);

// Auto-increment application number
jobApplicationSchema.pre('save', async function (next) {
  if (this.isNew && !this.applicationNumber) {
    const lastApp = await this.constructor.findOne(
      {},
      {},
      { sort: { applicationNumber: -1 } }
    );
    this.applicationNumber = lastApp ? lastApp.applicationNumber + 1 : 10001;
  }
  next();
});

// Indexes
jobApplicationSchema.index({ 'position.id': 1, status: 1 });
jobApplicationSchema.index(
  { 'applicant.email': 1, 'position.id': 1 },
  { unique: true }
);
jobApplicationSchema.index({ status: 1, appliedAt: -1 });

export const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model('JobApplication', jobApplicationSchema);
