import { ObjectId } from 'mongodb'

export interface ILanguageLearning extends any {
  experimentId: ObjectId;
  userId: ObjectId;
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
        userId: ObjectId;
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

export default LanguageLearning
