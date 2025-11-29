import mongoose from 'mongoose';

export interface IPersonalityTest extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  testType:
    | 'big5'
    | 'mbti'
    | 'enneagram'
    | 'disc'
    | 'strengths'
    | 'emotional_intelligence'
    | 'career'
    | 'relationship'
    | 'custom';
  questions: {
    id: string;
    question: string;
    type: 'multiple_choice' | 'scale' | 'yes_no' | 'text' | 'scenario';
    options?: string[];
    scaleRange?: { min: number; max: number; labels?: string[] };
    category?: string;
    weight?: number;
  }[];
  responses: {
    questionId: string;
    answer: string | number | string[];
    responseTime?: number;
    confidence?: number;
  }[];
  results: {
    primaryType: string;
    secondaryType?: string;
    traits: {
      name: string;
      score: number;
      percentile?: number;
      description: string;
      category: 'strength' | 'weakness' | 'neutral';
    }[];
    dimensions: {
      dimension: string;
      score: number;
      interpretation: string;
    }[];
    summary: {
      overall: string;
      strengths: string[];
      challenges: string[];
      recommendations: string[];
    };
  };
  interpretation: {
    career: {
      suitedRoles: string[];
      workEnvironment: string;
      leadership: string;
      teamwork: string;
    };
    relationships: {
      communication: string;
      compatibility: string[];
      conflictStyle: string;
      socialNeeds: string;
    };
    personalGrowth: {
      development: string[];
      potentialBlindSpots: string[];
      growthPath: string;
    };
  };
  comparison: {
    previousTest?: mongoose.Types.ObjectId;
    changes?: {
      trait: string;
      previousScore: number;
      currentScore: number;
      change: number;
    }[];
    populationComparison?: {
      trait: string;
      userScore: number;
      averageScore: number;
      percentile: number;
    }[];
  };
  accuracy: {
    confidence: number;
    reliability: number;
    consistency: number;
    sampleSize?: number;
  };
  metadata: {
    duration: number; // in minutes
    completionRate: number;
    aiModel: string;
    version: string;
    language: string;
  };
  sharing: {
    isPublic: boolean;
    shareCode?: string;
    anonymized: boolean;
    allowComparison: boolean;
  };
  feedback: {
    accuracy?: number;
    usefulness?: number;
    comments?: string;
    wouldRecommend?: boolean;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const personalityTestSchema = new mongoose.Schema<IPersonalityTest>(
  {
    experimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabExperiment',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    testType: {
      type: String,
      enum: [
        'big5',
        'mbti',
        'enneagram',
        'disc',
        'strengths',
        'emotional_intelligence',
        'career',
        'relationship',
        'custom',
      ],
      required: true,
      index: true,
    },
    questions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true, maxlength: 500 },
        type: {
          type: String,
          enum: ['multiple_choice', 'scale', 'yes_no', 'text', 'scenario'],
          required: true,
        },
        options: [{ type: String, maxlength: 200 }],
        scaleRange: {
          min: { type: Number },
          max: { type: Number },
          labels: [{ type: String, maxlength: 50 }],
        },
        category: { type: String, maxlength: 100 },
        weight: { type: Number, min: 0, max: 1, default: 1 },
      },
    ],
    responses: [
      {
        questionId: { type: String, required: true },
        answer: mongoose.Schema.Types.Mixed,
        responseTime: { type: Number, min: 0 },
        confidence: { type: Number, min: 0, max: 1 },
      },
    ],
    results: {
      primaryType: { type: String, required: true, maxlength: 100 },
      secondaryType: { type: String, maxlength: 100 },
      traits: [
        {
          name: { type: String, required: true, maxlength: 100 },
          score: { type: Number, required: true, min: 0, max: 1 },
          percentile: { type: Number, min: 0, max: 100 },
          description: { type: String, required: true, maxlength: 500 },
          category: {
            type: String,
            enum: ['strength', 'weakness', 'neutral'],
            required: true,
          },
        },
      ],
      dimensions: [
        {
          dimension: { type: String, required: true, maxlength: 100 },
          score: { type: Number, required: true, min: 0, max: 1 },
          interpretation: { type: String, required: true, maxlength: 500 },
        },
      ],
      summary: {
        overall: { type: String, required: true, maxlength: 1000 },
        strengths: [{ type: String, maxlength: 200 }],
        challenges: [{ type: String, maxlength: 200 }],
        recommendations: [{ type: String, maxlength: 300 }],
      },
    },
    interpretation: {
      career: {
        suitedRoles: [{ type: String, maxlength: 100 }],
        workEnvironment: { type: String, maxlength: 500 },
        leadership: { type: String, maxlength: 500 },
        teamwork: { type: String, maxlength: 500 },
      },
      relationships: {
        communication: { type: String, maxlength: 500 },
        compatibility: [{ type: String, maxlength: 100 }],
        conflictStyle: { type: String, maxlength: 500 },
        socialNeeds: { type: String, maxlength: 500 },
      },
      personalGrowth: {
        development: [{ type: String, maxlength: 300 }],
        potentialBlindSpots: [{ type: String, maxlength: 200 }],
        growthPath: { type: String, maxlength: 500 },
      },
    },
    comparison: {
      previousTest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalityTest',
      },
      changes: [
        {
          trait: { type: String, required: true, maxlength: 100 },
          previousScore: { type: Number, required: true },
          currentScore: { type: Number, required: true },
          change: { type: Number, required: true },
        },
      ],
      populationComparison: [
        {
          trait: { type: String, required: true, maxlength: 100 },
          userScore: { type: Number, required: true },
          averageScore: { type: Number, required: true },
          percentile: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
    },
    accuracy: {
      confidence: { type: Number, required: true, min: 0, max: 1 },
      reliability: { type: Number, required: true, min: 0, max: 1 },
      consistency: { type: Number, required: true, min: 0, max: 1 },
      sampleSize: { type: Number, min: 0 },
    },
    metadata: {
      duration: { type: Number, required: true, min: 0 },
      completionRate: { type: Number, required: true, min: 0, max: 1 },
      aiModel: { type: String, required: true, maxlength: 100 },
      version: { type: String, required: true, maxlength: 20 },
      language: { type: String, required: true, maxlength: 10 },
    },
    sharing: {
      isPublic: { type: Boolean, default: false, index: true },
      shareCode: { type: String, unique: true, sparse: true },
      anonymized: { type: Boolean, default: true },
      allowComparison: { type: Boolean, default: false },
    },
    feedback: {
      accuracy: { type: Number, min: 1, max: 5 },
      usefulness: { type: Number, min: 1, max: 5 },
      comments: { type: String, maxlength: 1000 },
      wouldRecommend: { type: Boolean },
    },
    tags: [{ type: String, maxlength: 50 }],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
personalityTestSchema.index({ userId: 1, testType: 1 });
personalityTestSchema.index({ 'results.primaryType': 1 });
personalityTestSchema.index({ tags: 1 });

// Methods
personalityTestSchema.methods.getCompletionPercentage = function () {
  return (this.responses.length / this.questions.length) * 100;
};

personalityTestSchema.methods.getTopTraits = function (count: number = 5) {
  return this.results.traits.sort((a, b) => b.score - a.score).slice(0, count);
};

personalityTestSchema.methods.generateShareCode = function () {
  this.sharing.shareCode = Math.random().toString(36).substring(2, 15);
  return this.save();
};

const PersonalityTest =
  mongoose.models.PersonalityTest ||
  mongoose.model<IPersonalityTest>('PersonalityTest', personalityTestSchema);
export default PersonalityTest;
