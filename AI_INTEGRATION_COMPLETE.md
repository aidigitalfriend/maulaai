# Complete AI & External API Integration

## 🎯 Provider Priority System

**Auto-Fallback Order:**
1. **Gemini** (PRIMARY) - Fast, cost-effective, multimodal
2. **OpenAI** (SECONDARY) - Most versatile, reliable
3. **Mistral** (TERTIARY) - European alternative, strong performance
4. **Anthropic** (QUATERNARY) - Best for long context, safety
5. **Cohere** (FALLBACK) - Enterprise-grade, multilingual

## 🤖 AI Models Available

### 1. Chat/Reasoning Models

#### Gemini (Google)
- `gemini-2.0-flash-exp` ⚡ (Default - Fast & Free)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

#### OpenAI
- `gpt-4o` (Default)
- `gpt-4o-mini` (Fast & Cheap)
- `gpt-5` (Advanced Reasoning)
- `o1-preview` (Deep Thinking)
- `o1-mini` (Fast Reasoning)

#### Mistral
- `mistral-large-latest` (Default)
- `mistral-medium`
- `mistral-small`
- `codestral` (Code specialist)

#### Anthropic
- `claude-3-5-sonnet-20241022` (Default)
- `claude-3-opus`
- `claude-3-sonnet`
- `claude-3-haiku`

#### Cohere
- `command-r-plus` (Default)
- `command-r`
- `command`

### 2. Embedding Models

#### Gemini
- `text-embedding-004` (768 dims, multilingual)

#### OpenAI
- `text-embedding-3-small` (1536 dims)
- `text-embedding-3-large` (3072 dims)

#### Cohere
- `embed-english-v3.0` (1024 dims)
- `embed-multilingual-v3.0` (1024 dims, 100+ languages)

### 3. Image Generation

#### OpenAI
- `dall-e-3` (1024x1024, 1792x1024, 1024x1792)
- Quality: `standard` | `hd`
- Style: `vivid` | `natural`

### 4. Speech-to-Text

#### OpenAI
- `whisper-1` (Accurate, slower)
- `gpt-4o-mini-transcribe` (Fast, real-time)

### 5. Text-to-Speech

#### OpenAI
- `tts-1` (Fast, standard quality)
- `tts-1-hd` (High quality)
- `gpt-4o-mini-tts` (Ultra fast)
- `gpt-4o-mini-tts-hd` (Fast + HD)

**Voices:** alloy, echo, fable, onyx, nova, shimmer

## 🌐 External APIs Integrated

### 1. NASA API
```typescript
// Get Astronomy Picture of the Day
const apod = await multiModalAI.getNASAData('planetary/apod')

// Mars Rover Photos
const mars = await multiModalAI.getNASAData('mars-photos/api/v1/rovers/curiosity/photos?sol=1000')

// Near Earth Objects
const asteroids = await multiModalAI.getNASAData('neo/rest/v1/feed')
```

**Use Cases:**
- Space education agents
- Astronomy data for Professor Astrology
- Science facts for Einstein
- Daily space content

### 2. News API
```typescript
// Get latest news
const news = await multiModalAI.getNews('artificial intelligence', 'en')

// Specific topics
const techNews = await multiModalAI.getNews('technology')
const cryptoNews = await multiModalAI.getNews('cryptocurrency')
```

**Use Cases:**
- Current events in conversations
- News-aware agents
- Trend analysis
- Content recommendations

### 3. Alpha Vantage (Finance)
```typescript
// Stock prices
const stock = await multiModalAI.getStockData('AAPL', 'daily')

// Crypto prices
const crypto = await multiModalAI.getStockData('BTC')

// Forex rates
const forex = await multiModalAI.getStockData('USD/EUR')
```

**Use Cases:**
- Financial advice agents
- Investment tracking
- Market analysis
- Economic data

### 4. Shodan (Security)
```typescript
// Search for IoT devices
const devices = await multiModalAI.getShodanData('apache')

// Check vulnerabilities
const vulns = await multiModalAI.getShodanData('vuln:CVE-2021-44228')
```

**Use Cases:**
- Security awareness
- Tech Wizard agent
- Network analysis
- Cybersecurity education

### 5. Pinecone (Vector Database)
- Configured via `PINECONE_API_KEY`
- Used for semantic memory
- Long-term agent memory
- Knowledge base search

### 6. ElevenLabs (Voice)
- High-quality TTS
- Voice cloning capabilities
- Multiple languages
- Emotional speech

## 💻 Usage Examples

### Auto Provider Selection (Recommended)
```typescript
// Uses Gemini → OpenAI → Mistral → Anthropic → Cohere
const response = await multiModalAI.getChatResponse(
  "Explain quantum physics",
  "einstein"
  // No provider specified = auto fallback
)
```

### Force Specific Provider
```typescript
// Force Gemini
const geminiResponse = await multiModalAI.getChatResponse(
  "Hello!",
  "einstein",
  { provider: 'gemini', model: 'gemini-2.0-flash-exp' }
)

// Force OpenAI
const openaiResponse = await multiModalAI.getChatResponse(
  "Hello!",
  "einstein",
  { provider: 'openai', model: 'gpt-4o' }
)
```

### Embeddings with Auto-Fallback
```typescript
// Uses Gemini → OpenAI → Cohere
const embedding = await multiModalAI.getEmbedding(
  "Store this in vector DB"
  // Auto-selects best available provider
)
```

### Combined AI + External APIs
```typescript
// Get NASA data, then chat about it
const nasaData = await multiModalAI.getNASAData('planetary/apod')
const explanation = await multiModalAI.getChatResponse(
  `Explain this: ${nasaData.explanation}`,
  "einstein"
)

// Get news, analyze with AI
const news = await multiModalAI.getNews('AI technology')
const summary = await multiModalAI.getChatResponse(
  `Summarize these headlines: ${JSON.stringify(news.articles)}`,
  "ben-sega"
)

// Get stock data, financial advice
const stockData = await multiModalAI.getStockData('TSLA')
const advice = await multiModalAI.getChatResponse(
  `Analyze this stock data: ${JSON.stringify(stockData)}`,
  "mrs-boss"
)
```

### Voice Conversation with External Data
```typescript
// User asks about space via voice
const userAudio = recordedAudioBlob
const userText = await multiModalAI.quickTranscribe(userAudio)

// Get NASA data
const spaceData = await multiModalAI.getNASAData('planetary/apod')

// AI responds with space info
const response = await multiModalAI.quickChat(
  `${userText}. Here's today's space info: ${spaceData.explanation}`,
  "einstein"
)

// Speak response
await multiModalAI.speakAndPlay(response, "einstein")
```

## 🔑 Required Environment Variables

```env
# AI Providers (Auto-fallback order)
GEMINI_API_KEY=AIza...              # PRIMARY
OPENAI_API_KEY=sk-...               # SECONDARY
MISTRAL_API_KEY=...                 # TERTIARY
ANTHROPIC_API_KEY=sk-ant-...        # QUATERNARY
COHERE_API_KEY=...                  # FALLBACK

# External APIs
NASA_API_KEY=DEMO_KEY               # Free: https://api.nasa.gov
NEWS_API_KEY=...                    # https://newsapi.org
ALPHA_VANTAGE_API_KEY=...           # https://www.alphavantage.co
SHODAN_API_KEY=...                  # https://www.shodan.io
PINECONE_API_KEY=...                # https://www.pinecone.io
ELEVENLABS_API_KEY=...              # https://elevenlabs.io
```

## 📊 Check API Status

```typescript
const status = multiModalAI.getAPIStatus()

console.log('AI Providers:', status.ai)
// {
//   gemini: true,
//   openai: true,
//   mistral: true,
//   anthropic: false,
//   cohere: false
// }

console.log('External APIs:', status.external)
// {
//   nasa: true,
//   news: true,
//   alphaVantage: false,
//   shodan: false,
//   pinecone: false,
//   elevenLabs: false
// }
```

## 🎯 Agent-Specific Use Cases

### Einstein (Scientist)
```typescript
// Space data + AI explanation
const nasaData = await multiModalAI.getNASAData()
const response = await multiModalAI.quickChat(
  `Explain the physics of: ${nasaData.title}`,
  'einstein'
)
```

### Mrs Boss (Finance)
```typescript
// Stock data + financial advice
const stockData = await multiModalAI.getStockData('AAPL')
const advice = await multiModalAI.quickChat(
  `Give me a business analysis of this stock: ${JSON.stringify(stockData)}`,
  'mrs-boss'
)
```

### Tech Wizard (Security)
```typescript
// Shodan data + security analysis
const devices = await multiModalAI.getShodanData('apache')
const analysis = await multiModalAI.quickChat(
  `Analyze these security findings: ${JSON.stringify(devices)}`,
  'tech-wizard'
)
```

### Travel Buddy (News)
```typescript
// Travel news + recommendations
const travelNews = await multiModalAI.getNews('travel destinations')
const suggestions = await multiModalAI.quickChat(
  `Based on current trends, recommend destinations: ${JSON.stringify(travelNews)}`,
  'travel-buddy'
)
```

### Professor Astrology (NASA)
```typescript
// Cosmic events + astrological interpretation
const spaceData = await multiModalAI.getNASAData()
const reading = await multiModalAI.quickChat(
  `Give an astrological reading based on: ${spaceData.explanation}`,
  'professor-astrology'
)
```

## 🚀 Performance Optimization

### 1. Provider Selection
- **Real-time chat**: `gemini-2.0-flash` or `gpt-4o-mini`
- **Complex reasoning**: `gpt-4o` or `claude-3-5-sonnet`
- **Code tasks**: `codestral` or `gpt-4o`
- **Long context**: `claude-3-5-sonnet` (200K tokens)
- **Cost-effective**: `gemini` models (free tier)

### 2. Caching
```typescript
// Cache embeddings in vector DB
const embedding = await multiModalAI.getEmbedding(text)
await pinecone.upsert({ id, values: embedding.embedding })

// Cache API responses
const cachedNASA = cache.get('nasa-apod-2024-10-29')
if (!cachedNASA) {
  const data = await multiModalAI.getNASAData()
  cache.set('nasa-apod-2024-10-29', data, 86400) // 24h
}
```

### 3. Parallel Requests
```typescript
// Multiple agents responding simultaneously
const [einstein, boss, wizard] = await Promise.all([
  multiModalAI.quickChat(message, 'einstein'),
  multiModalAI.quickChat(message, 'mrs-boss'),
  multiModalAI.quickChat(message, 'tech-wizard')
])
```

## 🔒 Security Best Practices

1. **API Key Management**
   - Never commit `.env` files
   - Use separate keys for dev/prod
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement request throttling
   - Monitor API usage
   - Set spending limits

3. **Input Validation**
   - Sanitize user inputs
   - Validate API responses
   - Handle errors gracefully

4. **Error Handling**
   - Auto-fallback to backup providers
   - Log all failures
   - Graceful degradation

## 📈 Cost Optimization

**Free Tier Recommendations:**
1. **Primary**: Gemini (generous free tier)
2. **Secondary**: OpenAI (pay-per-use)
3. **Embeddings**: Gemini (free)
4. **External**: NASA (free), News API (500 req/day free)

**Estimated Costs (per 1M tokens):**
- Gemini Flash: $0.075 input / $0.30 output
- GPT-4o-mini: $0.15 input / $0.60 output
- GPT-4o: $5 input / $15 output
- Claude 3.5 Sonnet: $3 input / $15 output
- Mistral Large: $2 input / $6 output

## 🐛 Troubleshooting

### Provider Not Available
```typescript
const status = multiModalAI.getAPIStatus()
if (!status.ai.gemini) {
  console.log('Gemini not configured, falling back to OpenAI')
}
```

### API Key Invalid
```
Error: Gemini not initialized
Solution: Check GEMINI_API_KEY in .env file
```

### Rate Limit Exceeded
```
Error: 429 Too Many Requests
Solution: Implement exponential backoff or switch providers
```

### No Providers Available
```
Error: No AI provider available
Solution: Configure at least one API key (GEMINI_API_KEY recommended)
```

## 📚 Additional Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Mistral AI Docs](https://docs.mistral.ai/)
- [Anthropic Docs](https://docs.anthropic.com/)
- [Cohere Docs](https://docs.cohere.com/)
- [NASA API](https://api.nasa.gov/)
- [News API](https://newsapi.org/docs)
- [Alpha Vantage](https://www.alphavantage.co/documentation/)
- [Shodan](https://developer.shodan.io/)
