import mongoose from 'mongoose'

export interface ICreativeWriting extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
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
      userId: mongoose.Types.ObjectId
      role: 'co-author' | 'editor' | 'reviewer' | 'beta_reader'
      contributions: string[]
    }[]
    versions?: {
      version: number
      content: string
      changes: string
      author: mongoose.Types.ObjectId
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
      reviewerId: mongoose.Types.ObjectId
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

const creativeWritingSchema = new mongoose.Schema<ICreativeWriting>({
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
  genre: {
    type: String,
    enum: ['fiction', 'poetry', 'screenplay', 'song_lyrics', 'comedy', 'drama', 'horror', 'fantasy', 'sci_fi', 'romance', 'mystery', 'autobiography', 'essay'],
    required: true,
    index: true
  },
  subGenre: {
    type: String,
    maxlength: 100
  },
  writingType: {
    type: String,
    enum: ['short_story', 'novel_chapter', 'poem', 'haiku', 'song', 'script', 'monologue', 'dialogue', 'letter', 'diary', 'article'],
    required: true,
    index: true
  },
  prompt: {
    original: { type: String, required: true, maxlength: 2000 },
    enhanced: { type: String, maxlength: 3000 },
    themes: [{ type: String, maxlength: 100 }],
    characters: [{ type: String, maxlength: 100 }],
    setting: { type: String, maxlength: 500 },
    mood: { type: String, maxlength: 100 },
    constraints: [{ type: String, maxlength: 200 }]
  },
  content: {
    title: { type: String, maxlength: 200 },
    text: { type: String, required: true, maxlength: 50000 },
    wordCount: { type: Number, required: true, min: 0 },
    characterCount: { type: Number, required: true, min: 0 },
    paragraphCount: { type: Number, required: true, min: 0 },
    readingTime: { type: Number, required: true, min: 0 }
  },
  structure: {
    sections: [{
      title: { type: String, required: true, maxlength: 200 },
      content: { type: String, required: true, maxlength: 10000 },
      wordCount: { type: Number, required: true, min: 0 },
      order: { type: Number, required: true, min: 1 }
    }],
    chapters: [{
      number: { type: Number, required: true, min: 1 },
      title: { type: String, required: true, maxlength: 200 },
      summary: { type: String, required: true, maxlength: 1000 }
    }],
    verses: [{
      number: { type: Number, required: true, min: 1 },
      content: { type: String, required: true, maxlength: 1000 },
      rhymeScheme: { type: String, maxlength: 20 }
    }]
  },
  style: {
    tone: {
      type: String,
      enum: ['formal', 'informal', 'humorous', 'serious', 'dramatic', 'mysterious', 'romantic', 'dark', 'uplifting'],
      required: true
    },
    voice: {
      type: String,
      enum: ['first_person', 'second_person', 'third_person_limited', 'third_person_omniscient'],
      required: true
    },
    tense: {
      type: String,
      enum: ['past', 'present', 'future'],
      required: true
    },
    perspective: { type: String, maxlength: 200 },
    narrativeStyle: { type: String, maxlength: 200 }
  },
  literaryElements: {
    themes: [{ type: String, maxlength: 100 }],
    symbols: [{ type: String, maxlength: 100 }],
    metaphors: [{ type: String, maxlength: 200 }],
    characterDevelopment: { type: String, maxlength: 1000 },
    plotDevices: [{ type: String, maxlength: 100 }],
    literaryDevices: [{ type: String, maxlength: 100 }]
  },
  analysis: {
    readabilityScore: { type: Number, min: 0, max: 100 },
    sentimentAnalysis: {
      overall: { type: String, enum: ['positive', 'negative', 'neutral'] },
      score: { type: Number, min: -1, max: 1 },
      emotions: [{ type: String, maxlength: 50 }]
    },
    styleAnalysis: {
      complexity: { type: String, enum: ['simple', 'moderate', 'complex'] },
      vocabulary: { type: String, enum: ['basic', 'intermediate', 'advanced'] },
      uniqueness: { type: Number, min: 0, max: 1 }
    },
    characterAnalysis: {
      mainCharacters: [{
        name: { type: String, required: true, maxlength: 100 },
        traits: [{ type: String, maxlength: 50 }],
        development: { type: String, maxlength: 500 }
      }]
    }
  },
  collaboration: {
    isCollaborative: { type: Boolean, default: false },
    contributors: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['co-author', 'editor', 'reviewer', 'beta_reader'], required: true },
      contributions: [{ type: String, maxlength: 300 }]
    }],
    versions: [{
      version: { type: Number, required: true, min: 1 },
      content: { type: String, required: true, maxlength: 50000 },
      changes: { type: String, required: true, maxlength: 1000 },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      timestamp: { type: Date, required: true }
    }]
  },
  feedback: {
    aiSuggestions: [{
      type: { type: String, enum: ['grammar', 'style', 'plot', 'character', 'pacing', 'dialogue'], required: true },
      suggestion: { type: String, required: true, maxlength: 500 },
      priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
      applied: { type: Boolean, default: false }
    }],
    peerReviews: [{
      reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comments: { type: String, required: true, maxlength: 2000 },
      categories: {
        plot: { type: Number, min: 1, max: 5 },
        characters: { type: Number, min: 1, max: 5 },
        style: { type: Number, min: 1, max: 5 },
        originality: { type: Number, min: 1, max: 5 }
      },
      timestamp: { type: Date, required: true }
    }]
  },
  generation: {
    aiModel: { type: String, required: true, maxlength: 100 },
    parameters: {
      creativity: { type: Number, required: true, min: 0, max: 1 },
      coherence: { type: Number, required: true, min: 0, max: 1 },
      originalityBoost: { type: Number, required: true, min: 0, max: 1 },
      lengthTarget: { type: Number, min: 0 }
    },
    iterations: [{
      version: { type: Number, required: true, min: 1 },
      prompt: { type: String, required: true, maxlength: 2000 },
      output: { type: String, required: true, maxlength: 50000 },
      rating: { type: Number, min: 1, max: 5 },
      selected: { type: Boolean, default: false }
    }],
    processingTime: { type: Number, required: true, min: 0 }
  },
  publication: {
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    platform: { type: String, maxlength: 100 },
    visibility: {
      type: String,
      enum: ['private', 'friends', 'public', 'community'],
      default: 'private',
      index: true
    },
    license: { type: String, maxlength: 100 },
    downloadCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 }
  },
  tags: [{ type: String, maxlength: 50 }],
  inspiration: {
    sources: [{ type: String, maxlength: 200 }],
    influences: [{ type: String, maxlength: 200 }],
    references: [{ type: String, maxlength: 200 }]
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
creativeWritingSchema.index({ userId: 1, genre: 1 })
creativeWritingSchema.index({ writingType: 1, 'publication.visibility': 1 })
creativeWritingSchema.index({ tags: 1 })
creativeWritingSchema.index({ 'content.wordCount': 1 })

// Methods
creativeWritingSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200
  this.content.readingTime = Math.ceil(this.content.wordCount / wordsPerMinute)
  return this.content.readingTime
}

creativeWritingSchema.methods.addVersion = function(content: string, changes: string, authorId: mongoose.Types.ObjectId) {
  const newVersion = {
    version: (this.collaboration.versions?.length || 0) + 1,
    content,
    changes,
    author: authorId,
    timestamp: new Date()
  }
  
  if (!this.collaboration.versions) {
    this.collaboration.versions = []
  }
  
  this.collaboration.versions.push(newVersion)
  return this.save()
}

const CreativeWriting = mongoose.models.CreativeWriting || mongoose.model<ICreativeWriting>('CreativeWriting', creativeWritingSchema)
export default CreativeWriting