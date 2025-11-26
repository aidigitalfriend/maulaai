const express = require('express')
const app = express()
const PORT = 3006

// Basic middleware
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Auth server is working!', port: PORT })
})

// Health check
app.get('/api/auth/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Simple Auth Server Test',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Test signup route
app.post('/api/auth/signup', (req, res) => {
  console.log('Signup test route hit')
  res.json({ message: 'Signup test route works', body: req.body })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Auth Server running on port ${PORT}`)
  console.log(`📍 Test: http://localhost:${PORT}/`)
  console.log(`📍 Health: http://localhost:${PORT}/api/auth/health`)
})