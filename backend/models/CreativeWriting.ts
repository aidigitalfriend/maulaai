import { ObjectId } from 'mongodb'

export interface ICreativeWriting extends any {
  experimentId: ObjectId
  userId: ObjectId
  title: string
  genre: 'fiction' | 'poetry' | 'screenplay' | 'song_lyrics' | 'comedy' | 'drama' | 'horror' | 'fantasy' | 'sci_fi' | 'romance' | 'mystery' | 'autobiography' | 'essay'
  subGenre?: string
  writingType: 'short_story' | 'novel_chapter' | 'poem' | 'haiku' | 'song' | 'script' | 'monologue' | 'dialogue' | 'letter' | 'diary' | 'article'
  prompt: {
    original: string
    enhanced?: string
    themes?: string[]
    characters?: string[]
    setting?: string
    mood?: string
    constraints?: string[]
  }
  content: {
    title?: string
    text: string
    wordCount: number
    characterCount: number
    paragraphCount: number
    readingTime: number // in minutes
  }
  structure: {
    sections?: {
      title: string
      content: string
      wordCount: number
      order: number
    }[]
    chapters?: {
      number: number
      title: string
      summary: string
    }[]
    verses?: {
      number: number
      content: string
      rhymeScheme?: string
    }[]
  }
  style: {
    tone: 'formal' | 'informal' | 'humorous' | 'serious' | 'dramatic' | 'mysterious' | 'romantic' | 'dark' | 'uplifting'
    voice: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient'
    tense: 'past' | 'present' | 'future'
    perspective?: string
    narrativeStyle?: string
  }
  literaryElements: {
    themes: string[]
    symbols: string[]
    metaphors: string[]
    characterDevelopment?: string
    plotDevices?: string[]
    literaryDevices?: string[]
  }
  analysis: {
    readabilityScore?: number
    sentimentAnalysis?: {
      overall: 'positive' | 'negative' | 'neutral'
      score: number
      emotions: string[]
    }
    styleAnalysis?: {
      complexity: 'simple' | 'moderate' | 'complex'
      vocabulary: 'basic' | 'intermediate' | 'advanced'
      uniqueness: number
    }
    characterAnalysis?: {
      mainCharacters: {
        name: string
        traits: string[]
        development: string
      }[]
    }
  }
  collaboration: {
    isCollaborative: boolean
    contributors?: {
      userId: ObjectId
      role: 'co-author' | 'editor' | 'reviewer' | 'beta_reader'
      contributions: string[]
    }[]
    versions?: {
      version: number
      content: string
      changes: string
      author: ObjectId
      timestamp: Date
    }[]
  }
  feedback: {
    aiSuggestions?: {
      type: 'grammar' | 'style' | 'plot' | 'character' | 'pacing' | 'dialogue'
      suggestion: string
      priority: 'low' | 'medium' | 'high'
      applied: boolean
    }[]
    peerReviews?: {
      reviewerId: ObjectId
      rating: number
      comments: string
      categories: {
        plot?: number
        characters?: number
        style?: number
        originality?: number
      }
      timestamp: Date
    }[]
  }
  generation: {
    aiModel: string
    parameters: {
      creativity: number
      coherence: number
      originalityBoost: number
      lengthTarget?: number
    }
    iterations: {
      version: number
      prompt: string
      output: string
      rating?: number
      selected: boolean
    }[]
    processingTime: number
  }
  publication: {
    isPublished: boolean
    publishedAt?: Date
    platform?: string
    visibility: 'private' | 'friends' | 'public' | 'community'
    license?: string
    downloadCount?: number
    views?: number
  }
  tags: string[]
  inspiration: {
    sources?: string[]
    influences?: string[]
    references?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export default CreativeWriting
