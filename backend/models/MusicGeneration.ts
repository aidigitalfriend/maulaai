import mongoose from 'mongoose'

export interface IMusicGeneration extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
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
    originalTrack?: mongoose.Types.ObjectId
    remixes?: mongoose.Types.ObjectId[]
    contributors?: {
      userId: mongoose.Types.ObjectId
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
      userId: mongoose.Types.ObjectId
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

const musicGenerationSchema = new mongoose.Schema<IMusicGeneration>({
  experimentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabExperiment',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  genre: {
    type: String,
    enum: ['classical', 'jazz', 'rock', 'pop', 'electronic', 'ambient', 'hip-hop', 'country', 'blues', 'experimental'],
    required: true,
    index: true
  },
  subGenre: {
    type: String,
    maxlength: 100
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'energetic', 'calm', 'mysterious', 'romantic', 'aggressive', 'melancholic', 'uplifting'],
    required: true,
    index: true
  },
  tempo: {
    bpm: { type: Number, required: true, min: 20, max: 300 },
    feel: { type: String, enum: ['slow', 'moderate', 'fast', 'variable'], required: true }
  },
  keySignature: {
    key: { type: String, required: true, maxlength: 10 },
    mode: { type: String, enum: ['major', 'minor', 'dorian', 'mixolydian', 'other'], required: true }
  },
  timeSignature: {
    type: String,
    required: true,
    maxlength: 10
  },
  duration: {
    seconds: { type: Number, required: true, min: 10, max: 600 },
    bars: { type: Number, min: 1 },
    structure: { type: String, maxlength: 100 }
  },
  instruments: [{
    instrument: { type: String, required: true, maxlength: 100 },
    role: { type: String, enum: ['melody', 'harmony', 'bass', 'percussion', 'lead', 'pad'], required: true },
    prominence: { type: String, enum: ['primary', 'secondary', 'background'], required: true }
  }],
  inputPrompt: {
    textPrompt: { type: String, maxlength: 1000 },
    referenceTrack: { type: String, maxlength: 200 },
    emotionalDirection: { type: String, maxlength: 500 },
    styleInfluences: [{ type: String, maxlength: 100 }]
  },
  generationParams: {
    creativity: { type: Number, required: true, min: 0, max: 1 },
    complexity: { type: Number, required: true, min: 0, max: 1 },
    variation: { type: Number, required: true, min: 0, max: 1 },
    humanization: { type: Number, required: true, min: 0, max: 1 },
    aiModel: { type: String, required: true, maxlength: 100 },
    seed: { type: Number }
  },
  audioFiles: {
    fullTrack: {
      url: { type: String, maxlength: 500 },
      format: { type: String, enum: ['mp3', 'wav', 'flac'] },
      quality: { type: String, maxlength: 50 },
      fileSize: { type: Number, min: 0 }
    },
    preview: {
      url: { type: String, maxlength: 500 },
      duration: { type: Number, min: 0 }
    },
    stems: [{
      instrument: { type: String, required: true, maxlength: 100 },
      url: { type: String, required: true, maxlength: 500 },
      format: { type: String, required: true, maxlength: 20 }
    }],
    midiFile: {
      url: { type: String, maxlength: 500 },
      fileSize: { type: Number, min: 0 }
    }
  },
  musicTheory: {
    chordProgression: [{ type: String, maxlength: 50 }],
    scaleUsed: [{ type: String, maxlength: 50 }],
    harmonicAnalysis: { type: String, maxlength: 1000 },
    rhythmPattern: { type: String, maxlength: 500 },
    structuralAnalysis: { type: String, maxlength: 1000 }
  },
  analytics: {
    spectrogramUrl: { type: String, maxlength: 500 },
    frequencyAnalysis: mongoose.Schema.Types.Mixed,
    rhythmAnalysis: mongoose.Schema.Types.Mixed,
    harmonyAnalysis: mongoose.Schema.Types.Mixed,
    energyLevel: { type: Number, min: 0, max: 1 },
    danceability: { type: Number, min: 0, max: 1 },
    valence: { type: Number, min: 0, max: 1 }
  },
  collaboration: {
    isRemixable: { type: Boolean, default: true },
    originalTrack: { type: mongoose.Schema.Types.ObjectId, ref: 'MusicGeneration' },
    remixes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicGeneration' }],
    contributors: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, required: true, maxlength: 100 },
      contribution: { type: String, required: true, maxlength: 300 }
    }]
  },
  ratings: {
    overall: { type: Number, min: 1, max: 5 },
    creativity: { type: Number, min: 1, max: 5 },
    musicality: { type: Number, min: 1, max: 5 },
    production: { type: Number, min: 1, max: 5 },
    originality: { type: Number, min: 1, max: 5 },
    votes: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 }
    }]
  },
  tags: [{ type: String, maxlength: 50 }],
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  licenseType: {
    type: String,
    enum: ['personal', 'commercial', 'creative_commons', 'royalty_free'],
    default: 'personal',
    index: true
  },
  processingTime: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes
musicGenerationSchema.index({ userId: 1, genre: 1 })
musicGenerationSchema.index({ mood: 1, tempo: 1 })
musicGenerationSchema.index({ tags: 1 })
musicGenerationSchema.index({ 'ratings.overall': -1 })
musicGenerationSchema.index({ isPublic: 1, createdAt: -1 })

// Methods
musicGenerationSchema.methods.addRating = function(userId: mongoose.Types.ObjectId, rating: number, comment?: string) {
  const existingVote = this.ratings.votes.find(vote => vote.userId.equals(userId))
  
  if (existingVote) {
    existingVote.rating = rating
    if (comment) existingVote.comment = comment
  } else {
    this.ratings.votes.push({ userId, rating, comment })
  }
  
  // Recalculate overall rating
  const totalRating = this.ratings.votes.reduce((sum, vote) => sum + vote.rating, 0)
  this.ratings.overall = totalRating / this.ratings.votes.length
  
  return this.save()
}

musicGenerationSchema.methods.createRemix = function(newTrackId: mongoose.Types.ObjectId) {
  this.collaboration.remixes.push(newTrackId)
  return this.save()
}

const MusicGeneration = mongoose.models.MusicGeneration || mongoose.model<IMusicGeneration>('MusicGeneration', musicGenerationSchema)
export default MusicGeneration