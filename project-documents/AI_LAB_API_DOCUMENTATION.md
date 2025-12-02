# AI Lab API Documentation

## 🚀 Overview

The AI Lab API provides comprehensive REST endpoints for managing AI experiments across 11 specialized domains. Each domain offers full CRUD operations, file uploads, real-time processing, and advanced analytics.

## 🔐 Authentication

All endpoints require authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

For development, the API accepts requests without authentication and uses a dummy user.

## 📋 Base URL

```
http://localhost:3005/api/ai-lab
```

## 🎯 Common Response Format

All endpoints return responses in this format:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Descriptive message",
  "meta": {...},
  "timestamp": "2025-11-25T10:30:00.000Z"
}
```

## 📊 Core Endpoints

### Health Check
```
GET /health
```
Returns API health status and service availability.

### Statistics
```
GET /stats
```
Returns user's AI Lab statistics and usage metrics.

### Capabilities
```
GET /capabilities
```
Returns available AI models, features, and limits.

## 🧪 Lab Experiments (Core)

### List Experiments
```
GET /experiments?page=1&limit=10&type=image_generation&status=completed&search=neural
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by experiment type
- `status`: Filter by status (pending, processing, completed, failed)
- `search`: Search in title, description, and tags

### Create Experiment
```
POST /experiments
Content-Type: multipart/form-data

{
  "title": "Neural Art Generation",
  "description": "Experimenting with AI art styles",
  "type": "image_generation",
  "configuration": {...},
  "tags": ["ai", "art", "neural"]
}
```

### Get Experiment
```
GET /experiments/:id
```

### Update Experiment
```
PUT /experiments/:id
Content-Type: multipart/form-data
```

### Delete Experiment
```
DELETE /experiments/:id
```

## 📈 Dataset Analysis

### Create Analysis
```
POST /dataset-analysis
Content-Type: multipart/form-data

{
  "title": "Sales Data Analysis",
  "experimentId": "experiment_id",
  "analysisType": "statistical",
  "dataset": [FILE]
}
```

**Supported Formats:** CSV, JSON, Excel, Parquet

### List Analyses
```
GET /dataset-analysis?format=csv&status=completed
```

## 🎨 Image Generation

### Create Generation Request
```
POST /image-generation

{
  "title": "Cyberpunk Landscape",
  "experimentId": "experiment_id",
  "prompt": "A neon-lit cyberpunk cityscape at night",
  "style": "digital_art",
  "dimensions": { "width": 1024, "height": 1024 },
  "aiModel": "dall-e-3",
  "parameters": {
    "creativity": 0.8,
    "quality": "hd"
  }
}
```

### List Generations
```
GET /image-generation?style=digital_art&status=completed
```

## 😊 Emotion Analysis

### Create Analysis
```
POST /emotion-analysis
Content-Type: multipart/form-data

{
  "title": "Speech Emotion Analysis",
  "experimentId": "experiment_id",
  "inputType": "audio",
  "input": [AUDIO_FILE]
}
```

**Supported Input Types:** text, image, audio, video, voice

### List Analyses
```
GET /emotion-analysis?inputType=text&sentiment=positive
```

## 🔮 Future Prediction

### Create Prediction
```
POST /future-prediction

{
  "title": "Tech Industry Forecast",
  "experimentId": "experiment_id",
  "predictionType": "technology",
  "timeframe": {
    "period": "long",
    "duration": 1825
  },
  "inputData": {
    "context": "Current state of AI development",
    "currentSituation": "Rapid LLM advancement",
    "historicalData": "Past 10 years of tech trends"
  }
}
```

### List Predictions
```
GET /future-prediction?type=business&timeframe=short
```

## 🎵 Music Generation

### Create Music
```
POST /music-generation

{
  "title": "Ambient Meditation Track",
  "experimentId": "experiment_id",
  "genre": "ambient",
  "mood": "calm",
  "tempo": { "bpm": 60, "feel": "slow" },
  "duration": { "seconds": 180 },
  "instruments": [
    {
      "instrument": "synthesizer",
      "role": "pad",
      "prominence": "primary"
    }
  ]
}
```

### Rate Music
```
POST /music-generation/:id/rate

{
  "rating": 4,
  "comment": "Beautiful ambient soundscape"
}
```

## 🧠 Personality Test

### Create Test
```
POST /personality-test

{
  "title": "Big Five Personality Assessment",
  "experimentId": "experiment_id",
  "testType": "big5",
  "questions": [
    {
      "id": "q1",
      "question": "I am the life of the party",
      "type": "scale",
      "scaleRange": { "min": 1, "max": 5 }
    }
  ]
}
```

### Submit Responses
```
POST /personality-test/:id/respond

{
  "responses": [
    { "questionId": "q1", "answer": 4 }
  ]
}
```

## ✍️ Creative Writing

### Create Project
```
POST /creative-writing

{
  "title": "Sci-Fi Short Story",
  "experimentId": "experiment_id",
  "genre": "sci_fi",
  "writingType": "short_story",
  "prompt": {
    "original": "A world where AI has emotions",
    "themes": ["technology", "consciousness"]
  },
  "content": {
    "text": "In the year 2087, AIs began to dream..."
  }
}
```

### Add Review
```
POST /creative-writing/:id/review

{
  "rating": 5,
  "comments": "Excellent world-building",
  "categories": {
    "plot": 5,
    "characters": 4,
    "style": 5
  }
}
```

## 🤖 Smart Assistant

### Create Assistant
```
POST /smart-assistant

{
  "name": "PersonalAI",
  "experimentId": "experiment_id",
  "assistantType": "personal",
  "personality": {
    "traits": {
      "extraversion": 0.7,
      "agreeableness": 0.9
    },
    "communication": {
      "tone": "friendly",
      "style": "conversational"
    }
  }
}
```

### Chat with Assistant
```
POST /smart-assistant/:id/chat

{
  "conversationId": "conv_123",
  "message": "What's the weather like today?"
}
```

### Update Memory
```
POST /smart-assistant/:id/memory

{
  "category": "preference",
  "key": "favorite_color",
  "value": "blue",
  "confidence": 0.9
}
```

## 🥽 Virtual Reality

### Create VR Experience
```
POST /virtual-reality
Content-Type: multipart/form-data

{
  "title": "Virtual Museum Tour",
  "experimentId": "experiment_id",
  "experienceType": "vr",
  "category": "education",
  "environment": {
    "name": "Ancient Rome",
    "type": "historical"
  },
  "assets": [3D_MODELS, TEXTURES, AUDIO]
}
```

### Start Session
```
POST /virtual-reality/:id/session

{
  "sessionId": "session_123"
}
```

### Rate Experience
```
POST /virtual-reality/:id/rate

{
  "overall": 5,
  "immersion": 5,
  "comfort": 4,
  "content": 5,
  "performance": 4
}
```

## 🌍 Language Learning

### Create Program
```
POST /language-learning

{
  "title": "Spanish for Travelers",
  "experimentId": "experiment_id",
  "targetLanguage": "es",
  "nativeLanguage": "en",
  "proficiencyLevel": "beginner",
  "learningGoals": {
    "primary": "travel",
    "specific": ["ordering food", "asking directions"]
  }
}
```

### Add Vocabulary
```
POST /language-learning/:id/vocabulary

{
  "word": "hola",
  "translation": "hello",
  "category": "greetings",
  "difficulty": 2
}
```

### Submit Pronunciation
```
POST /language-learning/:id/pronunciation
Content-Type: multipart/form-data

{
  "word": "hola",
  "phonetic": "/ˈo.la/",
  "audio": [AUDIO_FILE]
}
```

## 📁 File Upload Support

### Supported File Types
- **Images:** JPG, PNG, GIF, WebP
- **Audio:** MP3, WAV, FLAC, OGG
- **Video:** MP4, AVI, MOV, WebM
- **Documents:** PDF, DOC, DOCX, TXT
- **Data:** CSV, JSON, Excel, Parquet
- **3D Models:** FBX, OBJ, GLTF, DAE

### Upload Limits
- **Max File Size:** 50MB per file
- **Max Files:** 20 files per request
- **Total Request Size:** 100MB

## 🔧 Error Handling

### Common Error Codes

- **400 Bad Request:** Invalid input or validation errors
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **413 Payload Too Large:** File size exceeds limits
- **422 Unprocessable Entity:** Invalid file type
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": ["Title is required"],
  "timestamp": "2025-11-25T10:30:00.000Z"
}
```

## 📊 Pagination

List endpoints support pagination:

```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 95,
      "pages": 10
    }
  }
}
```

## 🚦 Rate Limits

- **Standard Users:** 1,000 requests/hour
- **Premium Users:** 10,000 requests/hour
- **File Uploads:** 100 uploads/hour
- **AI Processing:** 500 requests/hour

## 🔄 WebSocket Support (Future)

Real-time updates will be available via WebSocket connections:

```javascript
const socket = io('ws://localhost:3005/ai-lab')
socket.on('experiment:update', (data) => {
  console.log('Experiment updated:', data)
})
```

## 🧪 Testing the API

### Using cURL
```bash
# Health check
curl http://localhost:3005/api/ai-lab/health

# Create experiment
curl -X POST http://localhost:3005/api/ai-lab/experiments \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Test Experiment","type":"image_generation"}'

# Upload dataset
curl -X POST http://localhost:3005/api/ai-lab/dataset-analysis \\
  -F "title=Sales Analysis" \\
  -F "dataset=@sales_data.csv"
```

### Using JavaScript
```javascript
// Create experiment
const response = await fetch('/api/ai-lab/experiments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    title: 'Neural Art Generation',
    type: 'image_generation'
  })
})

const result = await response.json()
console.log(result)
```

## 📚 SDK and Libraries

### JavaScript/Node.js
```bash
npm install ai-lab-sdk
```

```javascript
import { AILabClient } from 'ai-lab-sdk'

const client = new AILabClient({
  apiUrl: 'http://localhost:3005/api/ai-lab',
  apiKey: 'your-api-key'
})

const experiment = await client.experiments.create({
  title: 'My Experiment',
  type: 'image_generation'
})
```

### Python
```bash
pip install ai-lab-python
```

```python
from ai_lab import AILabClient

client = AILabClient(
    api_url='http://localhost:3005/api/ai-lab',
    api_key='your-api-key'
)

experiment = client.experiments.create(
    title='My Experiment',
    type='image_generation'
)
```

## 🔍 Advanced Features

### Batch Operations
```
POST /experiments/batch
```

### Export Data
```
GET /experiments/:id/export?format=json
```

### Search
```
GET /search?q=neural%20networks&type=all&limit=20
```

### Analytics
```
GET /analytics/usage?period=last_30_days
GET /analytics/performance?experiment_id=123
```

---

**📞 Support:** For API support, contact our development team or check the GitHub repository for issues and updates.