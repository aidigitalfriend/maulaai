import { ObjectId } from 'mongodb'

export interface IFuturePrediction extends any {
  experimentId: ObjectId
  userId: ObjectId
  title: string
  predictionType: 'personal' | 'business' | 'technology' | 'society' | 'economy' | 'environment' | 'health'
  timeframe: {
    period: 'short' | 'medium' | 'long' // short: 1-30 days, medium: 1-12 months, long: 1-10 years
    specificDate?: Date
    duration: number // in days
  }
  inputData: {
    context: string
    currentSituation: string
    historicalData?: string
    externalFactors?: string[]
    constraints?: string[]
  }
  predictions: {
    scenario: 'optimistic' | 'realistic' | 'pessimistic'
    outcome: string
    probability: number // 0-1
    confidence: number // 0-1
    keyFactors: string[]
    timeline: {
      milestone: string
      expectedDate: Date
      probability: number
    }[]
  }[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: {
      risk: string
      impact: 'low' | 'medium' | 'high'
      probability: number
      mitigation: string
    }[]
  }
  opportunities: {
    opportunity: string
    potential: 'low' | 'medium' | 'high'
    timeline: string
    requirements: string[]
  }[]
  recommendations: {
    action: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    timeline: string
    expectedOutcome: string
  }[]
  methodology: {
    aiModels: string[]
    dataSources: string[]
    analysisMethod: string
    assumptions: string[]
    limitations: string[]
  }
  accuracy: {
    historicalAccuracy?: number
    modelConfidence: number
    uncertaintyRange: number
    validationMethod?: string
  }
  followUp: {
    reviewDate?: Date
    actualOutcome?: string
    accuracyScore?: number
    lessons?: string
    refinements?: string
  }
  tags: string[]
  isShared: boolean
  visibility: 'private' | 'friends' | 'public'
  createdAt: Date
  updatedAt: Date
}

export default FuturePrediction
