#!/bin/bash

# Emergency auth fix for production
# This script creates a minimal server with auth endpoints

cd /home/ubuntu/shiny-friend-disco/backend

# Create backup of current server
cp server-simple.js server-simple.js.backup

# Create minimal working server with auth
cat > server-simple-auth.js << 'EOF'
/**
 * Minimal server with auth endpoints for production
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

// Security middleware
app.use(helmet())

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://onelastai.co', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(express.json({ limit: '10mb' }))

// MongoDB connection
let client
let db

async function connectToMongoDB() {
  try {
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    db = client.db('ai-lab-main')
    console.log('Connected to MongoDB successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

// Initialize MongoDB connection
await connectToMongoDB()

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' })
}

// ----------------------------
// AUTH ROUTES
// ----------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() })
})

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await db.collection('users').findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' })
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() })
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: false
    }

    const result = await db.collection('users').insertOne(newUser)
    const token = generateToken(result.insertedId)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertedId,
        email: newUser.email,
        name: newUser.name
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Failed to create account' })
  }
})

// Verify endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    res.json({
      message: 'Token verified',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
})

// Catch all other routes
app.all('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth server running on port ${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 CORS origins: ${corsOptions.origin.join(', ')}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  if (client) {
    await client.close()
  }
  process.exit(0)
})
EOF

# Update PM2 to use the new server file
pm2 delete shiny-backend 2>/dev/null || true
pm2 start server-simple-auth.js --name shiny-backend --log-date-format="YYYY-MM-DD HH:mm:ss"
pm2 save

echo "Emergency auth server deployed successfully"
pm2 status