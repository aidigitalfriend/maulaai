import { ObjectId } from 'mongodb'

export interface ISmartAssistant extends any {
  experimentId: ObjectId;
  userId: ObjectId;
  name: string;
  description?: string;
  assistantType:
    | 'personal'
    | 'business'
    | 'educational'
    | 'creative'
    | 'technical'
    | 'health'
    | 'finance'
    | 'travel'
    | 'custom';
  personality: {
    traits: {
      extraversion: number; // 0-1
      agreeableness: number;
      conscientiousness: number;
      neuroticism: number;
      openness: number;
    };
    communication: {
      tone:
        | 'formal'
        | 'casual'
        | 'friendly'
        | 'professional'
        | 'humorous'
        | 'empathetic';
      verbosity: 'concise' | 'balanced' | 'detailed';
      style: 'direct' | 'conversational' | 'supportive' | 'analytical';
    };
    behavior: {
      proactivity: number; // 0-1
      curiosity: number;
      patience: number;
      adaptability: number;
    };
  };
  capabilities: {
    knowledgeDomains: string[];
    skills: {
      skill: string;
      proficiency: number; // 0-1
      examples: string[];
    }[];
    languages: string[];
    specializations: string[];
  };
  configuration: {
    aiModel: string;
    temperature: number; // 0-2
    maxTokens: number;
    contextWindow: number;
    memoryDepth: number; // how many interactions to remember
    learningRate: number; // how quickly to adapt
  };
  conversations: {
    conversationId: string;
    messages: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: Date;
      metadata?: {
        emotions?: string[];
        intent?: string;
        confidence?: number;
        processingTime?: number;
      };
    }[];
    summary?: string;
    mood?: string;
    topics: string[];
    satisfaction?: number;
    startedAt: Date;
    lastActiveAt: Date;
  }[];
  memory: {
    shortTerm: {
      key: string;
      value: any;
      relevance: number;
      expiresAt?: Date;
    }[];
    longTerm: {
      category: 'preference' | 'fact' | 'relationship' | 'goal' | 'habit';
      key: string;
      value: any;
      confidence: number;
      lastUpdated: Date;
      importance: number;
    }[];
    contextual: {
      situation: string;
      context: any;
      relevantFor: string[];
      createdAt: Date;
    }[];
  };
  learning: {
    interactions: number;
    improvements: {
      area: string;
      before: number;
      after: number;
      timestamp: Date;
      feedback?: string;
    }[];
    userFeedback: {
      rating: number;
      comment?: string;
      category: 'helpful' | 'accurate' | 'friendly' | 'fast' | 'understanding';
      timestamp: Date;
    }[];
    adaptations: {
      trigger: string;
      change: string;
      impact: number;
      timestamp: Date;
    }[];
  };
  tasks: {
    taskId: string;
    type:
      | 'reminder'
      | 'research'
      | 'planning'
      | 'monitoring'
      | 'notification'
      | 'automation';
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: Date;
    completedAt?: Date;
    result?: string;
    steps?: {
      step: string;
      completed: boolean;
      timestamp?: Date;
    }[];
  }[];
  integrations: {
    service: string;
    enabled: boolean;
    credentials?: string; // encrypted
    permissions: string[];
    lastSync?: Date;
    status: 'connected' | 'disconnected' | 'error';
  }[];
  analytics: {
    totalInteractions: number;
    averageResponseTime: number;
    satisfactionScore: number;
    topTopics: {
      topic: string;
      count: number;
    }[];
    usagePatterns: {
      timeOfDay: Record<string, number>;
      dayOfWeek: Record<string, number>;
      sessionLength: number[];
    };
  };
  settings: {
    isActive: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      dataRetention: number; // days
      shareAnalytics: boolean;
      anonymizeData: boolean;
    };
    automation: {
      proactiveMode: boolean;
      autoLearn: boolean;
      suggestTasks: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export default SmartAssistant
