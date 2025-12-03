import { ObjectId } from 'mongodb'

export interface IMusicGeneration extends any {
  experimentId: ObjectId
  userId: ObjectId
  title: string
  description?: string
  genre: 'classical' | 'jazz' | 'rock' | 'pop' | 'electronic' | 'ambient' | 'hip-hop' | 'country' | 'blues' | 'experimental'
  subGenre?: string
  mood: 'happy' | 'sad' | 'energetic' | 'calm' | 'mysterious' | 'romantic' | 'aggressive' | 'melancholic' | 'uplifting'
  tempo: {
    bpm: number
    feel: 'slow' | 'moderate' | 'fast' | 'variable'
  }
  keySignature: {
    key: string // e.g., 'C', 'G', 'F#'
    mode: 'major' | 'minor' | 'dorian' | 'mixolydian' | 'other'
  }
  timeSignature: string // e.g., '4/4', '3/4', '7/8'
  duration: {
    seconds: number
    bars?: number
    structure?: string // e.g., 'ABABCB'
  }
  instruments: {
    instrument: string
    role: 'melody' | 'harmony' | 'bass' | 'percussion' | 'lead' | 'pad'
    prominence: 'primary' | 'secondary' | 'background'
  }[]
  inputPrompt: {
    textPrompt?: string
    referenceTrack?: string
    emotionalDirection?: string
    styleInfluences?: string[]
  }
  generationParams: {
    creativity: number // 0-1
    complexity: number // 0-1
    variation: number // 0-1
    humanization: number // 0-1
    aiModel: string
    seed?: number
  }
  audioFiles: {
    fullTrack?: {
      url: string
      format: 'mp3' | 'wav' | 'flac'
      quality: string
      fileSize: number
    }
    preview?: {
      url: string
      duration: number
    }
    stems?: {
      instrument: string
      url: string
      format: string
    }[]
    midiFile?: {
      url: string
      fileSize: number
    }
  }
  musicTheory: {
    chordProgression?: string[]
    scaleUsed?: string[]
    harmonicAnalysis?: string
    rhythmPattern?: string
    structuralAnalysis?: string
  }
  analytics: {
    spectrogramUrl?: string
    frequencyAnalysis?: any
    rhythmAnalysis?: any
    harmonyAnalysis?: any
    energyLevel?: number
    danceability?: number
    valence?: number
  }
  collaboration: {
    isRemixable: boolean
    originalTrack?: ObjectId
    remixes?: ObjectId[]
    contributors?: {
      userId: ObjectId
      role: string
      contribution: string
    }[]
  }
  ratings: {
    overall?: number
    creativity?: number
    musicality?: number
    production?: number
    originality?: number
    votes: {
      userId: ObjectId
      rating: number
      comment?: string
    }[]
  }
  tags: string[]
  isPublic: boolean
  licenseType: 'personal' | 'commercial' | 'creative_commons' | 'royalty_free'
  processingTime: number
  createdAt: Date
  updatedAt: Date
}

export default MusicGeneration
