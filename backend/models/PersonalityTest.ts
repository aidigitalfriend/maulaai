import { ObjectId } from 'mongodb'

export interface IPersonalityTest extends any {
  experimentId: ObjectId;
  userId: ObjectId;
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
    previousTest?: ObjectId;
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

export default PersonalityTest
