import mongoose from 'mongoose';

export interface ILanguageLearning extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetLanguage: string; // ISO 639-1 code (e.g., 'es', 'fr', 'ja')
  nativeLanguage: string;
  proficiencyLevel:
    | 'beginner'
    | 'elementary'
    | 'intermediate'
    | 'upper_intermediate'
    | 'advanced'
    | 'native';
  learningGoals: {
    primary:
      | 'conversation'
      | 'business'
      | 'academic'
      | 'travel'
      | 'cultural'
      | 'exam_prep'
      | 'general';
    specific: string[];
    timeline: {
      target: string;
      deadline: Date;
    }[];
  };
  curriculum: {
    lessons: {
      id: string;
      title: string;
      type:
        | 'vocabulary'
        | 'grammar'
        | 'pronunciation'
        | 'listening'
        | 'reading'
        | 'writing'
        | 'conversation';
      difficulty: number; // 1-10
      prerequisites: string[];
      estimatedDuration: number; // in minutes
      content: {
        instructions: string;
        materials: {
          type: 'text' | 'audio' | 'video' | 'interactive';
          url?: string;
          content?: string;
          transcript?: string;
        }[];
        exercises: {
          type:
            | 'multiple_choice'
            | 'fill_blank'
            | 'translation'
            | 'pronunciation'
            | 'conversation'
            | 'listening';
          question: string;
          options?: string[];
          correctAnswer: string | string[];
          explanation?: string;
          points: number;
        }[];
      };
      completed: boolean;
      score?: number;
      completedAt?: Date;
    }[];
    progress: {
      currentLesson: string;
      completionRate: number; // 0-1
      totalLessons: number;
      passedLessons: number;
    };
  };
  aiTutor: {
    personalityType:
      | 'encouraging'
      | 'strict'
      | 'patient'
      | 'funny'
      | 'professional';
    teachingStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    adaptability: {
      difficultyAdjustment: boolean;
      pacingControl: boolean;
      styleModification: boolean;
    };
    interactions: {
      sessionId: string;
      type: 'lesson' | 'practice' | 'conversation' | 'feedback' | 'assessment';
      messages: {
        role: 'tutor' | 'student';
        content: string;
        timestamp: Date;
        language: string;
        corrections?: {
          original: string;
          corrected: string;
          explanation: string;
        }[];
      }[];
      startTime: Date;
      endTime?: Date;
      rating?: number;
    }[];
  };
  pronunciation: {
    assessments: {
      word: string;
      phonetic: string;
      userAttempt: {
        audioUrl: string;
        phonetic: string;
        confidence: number;
      };
      aiAnalysis: {
        accuracy: number; // 0-1
        feedback: string;
        problemAreas: string[];
        suggestions: string[];
      };
      timestamp: Date;
    }[];
    overallAccuracy: number;
    problemSounds: {
      sound: string;
      accuracy: number;
      practiceCount: number;
    }[];
  };
  vocabulary: {
    knownWords: {
      word: string;
      translation: string;
      difficulty: number;
      category: string;
      mastery: number; // 0-1
      lastReviewed: Date;
      nextReview: Date;
      repetitions: number;
      mistakes: number;
    }[];
    totalVocabulary: number;
    dailyGoal: number;
    streakDays: number;
  };
  grammar: {
    concepts: {
      concept: string;
      level: number;
      mastery: number; // 0-1
      examples: string[];
      mistakes: {
        error: string;
        correction: string;
        explanation: string;
        frequency: number;
      }[];
      lastPracticed: Date;
    }[];
    overallMastery: number;
    weakAreas: string[];
  };
  conversationPractice: {
    sessions: {
      sessionId: string;
      partner: 'ai' | 'native_speaker' | 'fellow_learner';
      topic: string;
      duration: number; // in minutes
      transcript: {
        speaker: string;
        text: string;
        timestamp: number;
        corrections?: string;
      }[];
      analysis: {
        fluency: number; // 0-1
        accuracy: number;
        vocabulary: number;
        grammar: number;
        pronunciation: number;
        feedback: string;
      };
      timestamp: Date;
    }[];
    totalHours: number;
    averageRatings: {
      fluency: number;
      accuracy: number;
      confidence: number;
    };
  };
  culturalLearning: {
    topics: {
      topic: string;
      category:
        | 'history'
        | 'customs'
        | 'food'
        | 'holidays'
        | 'social_norms'
        | 'arts'
        | 'politics';
      content: string;
      media: {
        type: 'image' | 'video' | 'article' | 'podcast';
        url: string;
        title: string;
      }[];
      learned: boolean;
      interest: number; // 1-5
    }[];
    culturalScore: number; // 0-100
  };
  gamification: {
    level: number;
    experience: number;
    badges: {
      name: string;
      description: string;
      icon: string;
      earnedAt: Date;
      rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    }[];
    streaks: {
      type: 'daily_practice' | 'lesson_completion' | 'perfect_scores';
      current: number;
      longest: number;
      lastUpdate: Date;
    }[];
    leaderboard: {
      position: number;
      points: number;
      friends: {
        userId: mongoose.Types.ObjectId;
        username: string;
        points: number;
        level: number;
      }[];
    };
  };
  analytics: {
    studyTime: {
      daily: number[];
      weekly: number[];
      monthly: number[];
      total: number;
    };
    learningPatterns: {
      bestTimeOfDay: string;
      preferredDuration: number;
      mostEffectiveMethods: string[];
      retentionRate: number;
    };
    progress: {
      skillLevels: {
        listening: number;
        speaking: number;
        reading: number;
        writing: number;
      };
      overallProgress: number;
      estimatedTimeToGoal: number; // in days
    };
  };
  settings: {
    studyReminders: {
      enabled: boolean;
      times: string[];
      frequency: 'daily' | 'weekdays' | 'custom';
    };
    difficulty: {
      autoAdjust: boolean;
      currentLevel: number;
    };
    feedback: {
      immediate: boolean;
      detailed: boolean;
      pronunciation: boolean;
    };
    interface: {
      language: string;
      darkMode: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
  certifications: {
    name: string;
    level: string;
    issuedBy: string;
    issuedAt: Date;
    validUntil?: Date;
    certificateUrl?: string;
    score?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const languageLearningSchema = new mongoose.Schema<ILanguageLearning>(
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
    description: {
      type: String,
      maxlength: 1000,
    },
    targetLanguage: {
      type: String,
      required: true,
      maxlength: 10,
      index: true,
    },
    nativeLanguage: {
      type: String,
      required: true,
      maxlength: 10,
    },
    proficiencyLevel: {
      type: String,
      enum: [
        'beginner',
        'elementary',
        'intermediate',
        'upper_intermediate',
        'advanced',
        'native',
      ],
      required: true,
      index: true,
    },
    learningGoals: {
      primary: {
        type: String,
        enum: [
          'conversation',
          'business',
          'academic',
          'travel',
          'cultural',
          'exam_prep',
          'general',
        ],
        required: true,
      },
      specific: [{ type: String, maxlength: 200 }],
      timeline: [
        {
          target: { type: String, required: true, maxlength: 200 },
          deadline: { type: Date, required: true },
        },
      ],
    },
    curriculum: {
      lessons: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true, maxlength: 200 },
          type: {
            type: String,
            enum: [
              'vocabulary',
              'grammar',
              'pronunciation',
              'listening',
              'reading',
              'writing',
              'conversation',
            ],
            required: true,
          },
          difficulty: { type: Number, required: true, min: 1, max: 10 },
          prerequisites: [{ type: String }],
          estimatedDuration: { type: Number, required: true, min: 1 },
          content: {
            instructions: { type: String, required: true, maxlength: 2000 },
            materials: [
              {
                type: {
                  type: String,
                  enum: ['text', 'audio', 'video', 'interactive'],
                  required: true,
                },
                url: { type: String, maxlength: 500 },
                content: { type: String, maxlength: 5000 },
                transcript: { type: String, maxlength: 5000 },
              },
            ],
            exercises: [
              {
                type: {
                  type: String,
                  enum: [
                    'multiple_choice',
                    'fill_blank',
                    'translation',
                    'pronunciation',
                    'conversation',
                    'listening',
                  ],
                  required: true,
                },
                question: { type: String, required: true, maxlength: 500 },
                options: [{ type: String, maxlength: 200 }],
                correctAnswer: mongoose.Schema.Types.Mixed,
                explanation: { type: String, maxlength: 1000 },
                points: { type: Number, required: true, min: 1 },
              },
            ],
          },
          completed: { type: Boolean, default: false },
          score: { type: Number, min: 0, max: 100 },
          completedAt: { type: Date },
        },
      ],
      progress: {
        currentLesson: { type: String },
        completionRate: { type: Number, default: 0, min: 0, max: 1 },
        totalLessons: { type: Number, default: 0, min: 0 },
        passedLessons: { type: Number, default: 0, min: 0 },
      },
    },
    aiTutor: {
      personalityType: {
        type: String,
        enum: ['encouraging', 'strict', 'patient', 'funny', 'professional'],
        default: 'encouraging',
      },
      teachingStyle: {
        type: String,
        enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
        default: 'mixed',
      },
      adaptability: {
        difficultyAdjustment: { type: Boolean, default: true },
        pacingControl: { type: Boolean, default: true },
        styleModification: { type: Boolean, default: true },
      },
      interactions: [
        {
          sessionId: { type: String, required: true },
          type: {
            type: String,
            enum: [
              'lesson',
              'practice',
              'conversation',
              'feedback',
              'assessment',
            ],
            required: true,
          },
          messages: [
            {
              role: {
                type: String,
                enum: ['tutor', 'student'],
                required: true,
              },
              content: { type: String, required: true, maxlength: 2000 },
              timestamp: { type: Date, required: true },
              language: { type: String, required: true, maxlength: 10 },
              corrections: [
                {
                  original: { type: String, required: true, maxlength: 200 },
                  corrected: { type: String, required: true, maxlength: 200 },
                  explanation: { type: String, required: true, maxlength: 500 },
                },
              ],
            },
          ],
          startTime: { type: Date, required: true },
          endTime: { type: Date },
          rating: { type: Number, min: 1, max: 5 },
        },
      ],
    },
    pronunciation: {
      assessments: [
        {
          word: { type: String, required: true, maxlength: 100 },
          phonetic: { type: String, required: true, maxlength: 200 },
          userAttempt: {
            audioUrl: { type: String, required: true, maxlength: 500 },
            phonetic: { type: String, required: true, maxlength: 200 },
            confidence: { type: Number, required: true, min: 0, max: 1 },
          },
          aiAnalysis: {
            accuracy: { type: Number, required: true, min: 0, max: 1 },
            feedback: { type: String, required: true, maxlength: 500 },
            problemAreas: [{ type: String, maxlength: 100 }],
            suggestions: [{ type: String, maxlength: 200 }],
          },
          timestamp: { type: Date, required: true },
        },
      ],
      overallAccuracy: { type: Number, default: 0, min: 0, max: 1 },
      problemSounds: [
        {
          sound: { type: String, required: true, maxlength: 20 },
          accuracy: { type: Number, required: true, min: 0, max: 1 },
          practiceCount: { type: Number, default: 0, min: 0 },
        },
      ],
    },
    vocabulary: {
      knownWords: [
        {
          word: { type: String, required: true, maxlength: 100 },
          translation: { type: String, required: true, maxlength: 200 },
          difficulty: { type: Number, required: true, min: 1, max: 10 },
          category: { type: String, required: true, maxlength: 50 },
          mastery: { type: Number, default: 0, min: 0, max: 1 },
          lastReviewed: { type: Date },
          nextReview: { type: Date },
          repetitions: { type: Number, default: 0, min: 0 },
          mistakes: { type: Number, default: 0, min: 0 },
        },
      ],
      totalVocabulary: { type: Number, default: 0, min: 0 },
      dailyGoal: { type: Number, default: 10, min: 1 },
      streakDays: { type: Number, default: 0, min: 0 },
    },
    grammar: {
      concepts: [
        {
          concept: { type: String, required: true, maxlength: 100 },
          level: { type: Number, required: true, min: 1, max: 10 },
          mastery: { type: Number, default: 0, min: 0, max: 1 },
          examples: [{ type: String, maxlength: 200 }],
          mistakes: [
            {
              error: { type: String, required: true, maxlength: 200 },
              correction: { type: String, required: true, maxlength: 200 },
              explanation: { type: String, required: true, maxlength: 500 },
              frequency: { type: Number, default: 1, min: 1 },
            },
          ],
          lastPracticed: { type: Date },
        },
      ],
      overallMastery: { type: Number, default: 0, min: 0, max: 1 },
      weakAreas: [{ type: String, maxlength: 100 }],
    },
    conversationPractice: {
      sessions: [
        {
          sessionId: { type: String, required: true },
          partner: {
            type: String,
            enum: ['ai', 'native_speaker', 'fellow_learner'],
            required: true,
          },
          topic: { type: String, required: true, maxlength: 200 },
          duration: { type: Number, required: true, min: 1 },
          transcript: [
            {
              speaker: { type: String, required: true, maxlength: 100 },
              text: { type: String, required: true, maxlength: 1000 },
              timestamp: { type: Number, required: true },
              corrections: { type: String, maxlength: 1000 },
            },
          ],
          analysis: {
            fluency: { type: Number, required: true, min: 0, max: 1 },
            accuracy: { type: Number, required: true, min: 0, max: 1 },
            vocabulary: { type: Number, required: true, min: 0, max: 1 },
            grammar: { type: Number, required: true, min: 0, max: 1 },
            pronunciation: { type: Number, required: true, min: 0, max: 1 },
            feedback: { type: String, required: true, maxlength: 1000 },
          },
          timestamp: { type: Date, required: true },
        },
      ],
      totalHours: { type: Number, default: 0, min: 0 },
      averageRatings: {
        fluency: { type: Number, default: 0, min: 0, max: 1 },
        accuracy: { type: Number, default: 0, min: 0, max: 1 },
        confidence: { type: Number, default: 0, min: 0, max: 1 },
      },
    },
    culturalLearning: {
      topics: [
        {
          topic: { type: String, required: true, maxlength: 200 },
          category: {
            type: String,
            enum: [
              'history',
              'customs',
              'food',
              'holidays',
              'social_norms',
              'arts',
              'politics',
            ],
            required: true,
          },
          content: { type: String, required: true, maxlength: 2000 },
          media: [
            {
              type: {
                type: String,
                enum: ['image', 'video', 'article', 'podcast'],
                required: true,
              },
              url: { type: String, required: true, maxlength: 500 },
              title: { type: String, required: true, maxlength: 200 },
            },
          ],
          learned: { type: Boolean, default: false },
          interest: { type: Number, min: 1, max: 5 },
        },
      ],
      culturalScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    gamification: {
      level: { type: Number, default: 1, min: 1 },
      experience: { type: Number, default: 0, min: 0 },
      badges: [
        {
          name: { type: String, required: true, maxlength: 100 },
          description: { type: String, required: true, maxlength: 300 },
          icon: { type: String, required: true, maxlength: 200 },
          earnedAt: { type: Date, required: true },
          rarity: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
            required: true,
          },
        },
      ],
      streaks: [
        {
          type: {
            type: String,
            enum: ['daily_practice', 'lesson_completion', 'perfect_scores'],
            required: true,
          },
          current: { type: Number, default: 0, min: 0 },
          longest: { type: Number, default: 0, min: 0 },
          lastUpdate: { type: Date, required: true },
        },
      ],
      leaderboard: {
        position: { type: Number, min: 1 },
        points: { type: Number, default: 0, min: 0 },
        friends: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true,
            },
            username: { type: String, required: true, maxlength: 50 },
            points: { type: Number, required: true, min: 0 },
            level: { type: Number, required: true, min: 1 },
          },
        ],
      },
    },
    analytics: {
      studyTime: {
        daily: [{ type: Number, min: 0 }],
        weekly: [{ type: Number, min: 0 }],
        monthly: [{ type: Number, min: 0 }],
        total: { type: Number, default: 0, min: 0 },
      },
      learningPatterns: {
        bestTimeOfDay: { type: String, maxlength: 20 },
        preferredDuration: { type: Number, min: 1 },
        mostEffectiveMethods: [{ type: String, maxlength: 100 }],
        retentionRate: { type: Number, min: 0, max: 1 },
      },
      progress: {
        skillLevels: {
          listening: { type: Number, default: 0, min: 0, max: 1 },
          speaking: { type: Number, default: 0, min: 0, max: 1 },
          reading: { type: Number, default: 0, min: 0, max: 1 },
          writing: { type: Number, default: 0, min: 0, max: 1 },
        },
        overallProgress: { type: Number, default: 0, min: 0, max: 1 },
        estimatedTimeToGoal: { type: Number, min: 0 },
      },
    },
    settings: {
      studyReminders: {
        enabled: { type: Boolean, default: true },
        times: [{ type: String }],
        frequency: {
          type: String,
          enum: ['daily', 'weekdays', 'custom'],
          default: 'daily',
        },
      },
      difficulty: {
        autoAdjust: { type: Boolean, default: true },
        currentLevel: { type: Number, default: 1, min: 1, max: 10 },
      },
      feedback: {
        immediate: { type: Boolean, default: true },
        detailed: { type: Boolean, default: true },
        pronunciation: { type: Boolean, default: true },
      },
      interface: {
        language: { type: String, default: 'en', maxlength: 10 },
        darkMode: { type: Boolean, default: false },
        fontSize: {
          type: String,
          enum: ['small', 'medium', 'large'],
          default: 'medium',
        },
      },
    },
    certifications: [
      {
        name: { type: String, required: true, maxlength: 200 },
        level: { type: String, required: true, maxlength: 50 },
        issuedBy: { type: String, required: true, maxlength: 200 },
        issuedAt: { type: Date, required: true },
        validUntil: { type: Date },
        certificateUrl: { type: String, maxlength: 500 },
        score: { type: Number, min: 0, max: 100 },
      },
    ],
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
languageLearningSchema.index({ userId: 1, targetLanguage: 1 });
languageLearningSchema.index({ 'gamification.level': 1 });
languageLearningSchema.index({ 'vocabulary.totalVocabulary': 1 });

// Methods
languageLearningSchema.methods.calculateOverallProgress = function () {
  const weights = {
    vocabulary: 0.25,
    grammar: 0.25,
    pronunciation: 0.2,
    conversation: 0.3,
  };

  const progress =
    (this.vocabulary.totalVocabulary / 1000) * weights.vocabulary +
    this.grammar.overallMastery * weights.grammar +
    this.pronunciation.overallAccuracy * weights.pronunciation +
    this.conversationPractice.averageRatings.fluency * weights.conversation;

  this.analytics.progress.overallProgress = Math.min(progress, 1);
  return this.analytics.progress.overallProgress;
};

languageLearningSchema.methods.addVocabularyWord = function (
  word: string,
  translation: string,
  category: string,
  difficulty: number
) {
  this.vocabulary.knownWords.push({
    word,
    translation,
    category,
    difficulty,
    mastery: 0,
    repetitions: 0,
    mistakes: 0,
  });

  this.vocabulary.totalVocabulary++;
  return this.save();
};

const LanguageLearning =
  mongoose.models.LanguageLearning ||
  mongoose.model<ILanguageLearning>('LanguageLearning', languageLearningSchema);
export default LanguageLearning;
