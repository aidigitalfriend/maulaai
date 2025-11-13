# AI Lab - Production Testing Guide

## 🧪 Complete Testing Checklist

After deploying the AI Lab integration, test each experiment thoroughly to ensure everything works in production.

---

## 🎯 Testing Instructions

### **1. Image Playground** 🎨
**URL**: https://onelastai.co/lab/image-playground

**Test Cases**:
```
✅ Test 1: Basic Generation
- Prompt: "sunset over mountains"
- Style: Realistic
- Expected: High-quality photorealistic image from Stability AI

✅ Test 2: Different Styles
- Prompt: "futuristic city"
- Styles: Try all 8 (Realistic, Artistic, Anime, Fantasy, Sci-Fi, Cyberpunk, Oil Painting, Watercolor)
- Expected: Each style produces distinct artistic interpretation

✅ Test 3: Download
- Generate any image
- Click "Download Image"
- Expected: PNG file downloads successfully
```

---

### **2. Voice Cloning** 🎤
**URL**: https://onelastai.co/lab/voice-cloning

**Test Cases**:
```
✅ Test 1: Basic TTS
- Text: "Hello, this is a test of the voice cloning system."
- Voice: Rachel (default)
- Expected: Clear MP3 audio plays in browser

✅ Test 2: Different Voices
- Try selecting different voices from dropdown
- Expected: Voice list loads, each voice generates different audio

✅ Test 3: Long Text
- Text: "The quick brown fox jumps over the lazy dog. This is a longer text to test the voice generation system with multiple sentences and various words."
- Expected: Complete audio generation without truncation
```

---

### **3. Music Generator** 🎵
**URL**: https://onelastai.co/lab/music-generator

**Test Cases**:
```
✅ Test 1: Basic Generation
- Prompt: "upbeat electronic dance music"
- Genre: Electronic
- Mood: Energetic
- Duration: 30 seconds
- Expected: MP3 track plays with electronic characteristics

✅ Test 2: Different Genres
- Try: Pop, Rock, Classical, Jazz, Hip-Hop, Electronic, Ambient
- Expected: Each genre produces distinct musical style

✅ Test 3: Different Durations
- Try: 15s, 30s, 45s, 60s
- Expected: Track length matches selected duration
```

---

### **4. Dream Interpreter** 💭
**URL**: https://onelastai.co/lab/dream-interpreter

**Test Cases**:
```
✅ Test 1: Simple Dream
- Dream: "I was flying over the ocean and saw dolphins jumping in the water."
- Expected: Analysis with main theme, emotions, symbols, interpretation

✅ Test 2: Complex Dream
- Dream: "I was in my childhood home but everything was different. The walls were moving and I couldn't find the exit. My family was there but they didn't recognize me."
- Expected: Detailed psychological analysis from GPT-4

✅ Test 3: Symbolic Dream
- Dream: "I was climbing a mountain and kept falling, but each time I got a little higher."
- Expected: Symbolic interpretation with personal growth themes
```

---

### **5. Emotion Visualizer** ❤️
**URL**: https://onelastai.co/lab/emotion-visualizer

**Test Cases**:
```
✅ Test 1: Positive Text
- Text: "I'm so happy and excited about this amazing opportunity! Everything is wonderful!"
- Expected: High joy, anticipation scores; positive overall sentiment

✅ Test 2: Negative Text
- Text: "I'm feeling sad and disappointed about the situation. Nothing seems to be going right."
- Expected: High sadness scores; negative overall sentiment

✅ Test 3: Mixed Emotions
- Text: "I'm nervous but excited about the presentation. It's scary but also thrilling."
- Expected: Mixed scores showing fear, anticipation, joy
```

---

### **6. Story Weaver** 📖
**URL**: https://onelastai.co/lab/story-weaver

**Test Cases**:
```
✅ Test 1: Continue Story
- Initial: "Once upon a time, in a magical forest, there lived a curious fox named Felix."
- Genre: Fantasy
- Action: Continue
- Expected: 2-3 new paragraphs continuing the fantasy story

✅ Test 2: Enhance Writing
- Initial: "The man walked down the street. He was tired."
- Action: Enhance
- Expected: More descriptive, engaging writing

✅ Test 3: Complete Story
- Initial: "Sarah had been searching for the ancient artifact for years. Finally, she stood at the entrance to the temple..."
- Action: Complete
- Expected: Satisfying story conclusion
```

---

### **7. Personality Mirror** 🧠
**URL**: https://onelastai.co/lab/personality-mirror

**Test Cases**:
```
✅ Test 1: Professional Writing
- Sample: "I focus on efficiency and delivering results. I prefer structured environments where I can plan ahead and execute systematically. I value clear communication and measurable outcomes."
- Expected: High Conscientiousness, lower Openness scores

✅ Test 2: Creative Writing
- Sample: "I love exploring new ideas and possibilities! My mind is always wandering to what could be. I enjoy spontaneity and thinking outside the box. Rules feel constraining to me."
- Expected: High Openness, lower Conscientiousness scores

✅ Test 3: Social Writing
- Sample: "I thrive in group settings and love meeting new people. Social gatherings energize me and I'm always the one organizing events. I care deeply about my friendships."
- Expected: High Extraversion, Agreeableness scores
```

---

### **8. Future Predictor** 🔮
**URL**: https://onelastai.co/lab/future-predictor

**Test Cases**:
```
✅ Test 1: Technology Prediction
- Topic: "artificial intelligence in healthcare"
- Timeframe: Next 5 years
- Expected: Trend analysis with confidence %, scenarios, insights

✅ Test 2: Business Prediction
- Topic: "electric vehicle adoption"
- Timeframe: Next 10 years
- Expected: Market trend predictions with probabilities

✅ Test 3: Social Prediction
- Topic: "remote work culture"
- Timeframe: Next 3 years
- Expected: Social trend analysis with multiple scenarios
```

---

### **9. Neural Art Studio** 🎨
**URL**: https://onelastai.co/lab/neural-art

**Test Cases**:
```
✅ Test 1: Van Gogh Style
- Upload: Any photo (landscape, portrait, object)
- Style: Van Gogh
- Expected: Image transformed with swirling brushstrokes

✅ Test 2: Multiple Styles
- Same uploaded image
- Try: Picasso (cubism), Monet (impressionism), Warhol (pop art)
- Expected: Each style produces distinct artistic interpretation

✅ Test 3: Download Artwork
- Transform any image
- Click "Download Artwork"
- Expected: Stylized image downloads as PNG
```

---

### **10. Battle Arena** ⚔️
**URL**: https://onelastai.co/lab/battle-arena

**Test Cases**:
```
✅ Test 1: Full Tournament
- Player 1: GPT-4
- Player 2: Claude 3
- Prompts:
  Round 1: "Explain quantum computing to a 10-year-old"
  Round 2: "Write a haiku about technology"
  Round 3: "Solve this riddle: I speak without a mouth and hear without ears. What am I?"
- Expected: Both models respond each round, voting works, winner declared

✅ Test 2: Different Model Matchups
- Try: GPT-4 vs Gemini, Claude vs Mistral, etc.
- Expected: All model combinations work correctly

✅ Test 3: Response Time Tracking
- Any matchup, any prompt
- Expected: Response times (ms) and token counts displayed
```

---

### **11. Debate Arena** 💬
**URL**: https://onelastai.co/lab/debate-arena

**Test Cases**:
```
✅ Test 1: Basic Functionality
- Check if "Coming Soon" banner is removed
- Test any debate features present
- Expected: No banner, functional debate system (if different from Battle Arena)

Note: Verify if this is separate from Battle Arena or same feature
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to generate" Error
**Cause**: API key missing or invalid
**Solution**: 
1. SSH to server: `ssh ubuntu@47.129.43.231`
2. Check backend logs: `pm2 logs backend --lines 50`
3. Verify .env file has all API keys
4. Restart backend: `pm2 restart backend`

### Issue: Images/Audio Not Loading
**Cause**: Response format mismatch or CORS issue
**Solution**:
1. Check browser console for errors (F12)
2. Verify API response format matches frontend expectations
3. Check network tab for failed requests

### Issue: Slow Response Times
**Cause**: AI model processing time (normal for some models)
**Expected Times**:
- Image Generation: 5-10 seconds
- Voice Generation: 3-5 seconds
- Music Generation: 10-20 seconds
- Text Generation: 2-5 seconds
- Style Transfer: 10-15 seconds
- Battle Arena: 5-15 seconds (parallel calls)

### Issue: Build Errors
**Solution**:
```bash
ssh ubuntu@47.129.43.231
cd ~/shiny-friend-disco

# Clear caches
rm -rf backend/node_modules backend/.next
rm -rf frontend/node_modules frontend/.next

# Reinstall
cd backend && npm install
cd ../frontend && npm install

# Rebuild
cd ~/shiny-friend-disco/backend && npm run build
cd ~/shiny-friend-disco/frontend && npm run build

# Restart
pm2 restart all
```

---

## ✅ Testing Success Criteria

All experiments should:
- [ ] Load without errors
- [ ] Accept user input
- [ ] Show loading states while processing
- [ ] Display real AI-generated results
- [ ] Handle errors gracefully with user-friendly messages
- [ ] Allow downloading/sharing results (where applicable)
- [ ] No "Coming Soon" banners visible
- [ ] Respond within reasonable time (see expected times above)

---

## 📊 Testing Results Template

Use this template to track testing results:

```
Date: ___________
Tester: ___________

| Experiment | Status | Issues | Notes |
|------------|--------|--------|-------|
| Image Playground | ✅/❌ | | |
| Voice Cloning | ✅/❌ | | |
| Music Generator | ✅/❌ | | |
| Dream Interpreter | ✅/❌ | | |
| Emotion Visualizer | ✅/❌ | | |
| Story Weaver | ✅/❌ | | |
| Personality Mirror | ✅/❌ | | |
| Future Predictor | ✅/❌ | | |
| Neural Art Studio | ✅/❌ | | |
| Battle Arena | ✅/❌ | | |
| Debate Arena | ✅/❌ | | |

Overall Status: ✅ All Pass / ⚠️ Some Issues / ❌ Major Issues
```

---

## 🔍 Monitoring Commands

```bash
# Connect to server
ssh ubuntu@47.129.43.231

# Check PM2 status
pm2 status

# View frontend logs
pm2 logs frontend --lines 100

# View backend logs
pm2 logs backend --lines 100

# Check disk space
df -h

# Check memory usage
free -m

# Check CPU usage
top

# Restart services if needed
pm2 restart backend
pm2 restart frontend

# View all logs
pm2 logs --lines 200
```

---

**Happy Testing! 🎉**

If all tests pass, the AI Lab real-time integration is successfully deployed and ready for users!
