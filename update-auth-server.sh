#!/bin/bash

# 🔧 Update Auth Server with Correct Environment Variables

set -e

echo "🚀 Updating Auth Server..."
echo "========================="

# Configuration
REMOTE_HOST="47.129.43.231"
REMOTE_USER="ubuntu"
SSH_KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo ""
echo "📝 Creating updated auth server with correct MongoDB URI..."

# Create a updated auth server with correct environment
cat > /tmp/auth-server-fixed.cjs << 'EOF'
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { MongoClient } = require('mongodb')

const app = express()
const PORT = 3005

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://onelastai.co'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())

// Environment variables with correct defaults
const JWT_SECRET = process.env.JWT_SECRET || '872CMUf8STQzY5vohsjic9NkMKsOocZMQ/LD5Nx627k='
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net/onelastai?retryWrites=true&w=majority&appName=onelastai-co'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

console.log('🔧 Starting auth server with config:')
console.log('   Port:', PORT)
console.log('   MongoDB URI:', MONGODB_URI.replace(/:[^:@]*@/, ':***@'))
console.log('   JWT Secret:', JWT_SECRET ? '✅ Set' : '❌ Missing')

// MongoDB connection
let db = null

async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db('onelastai')
    console.log('✅ Connected to MongoDB')
    
    // Test the connection
    const testResult = await db.admin().ping()
    console.log('🏓 MongoDB ping successful:', testResult)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    // Don't exit, allow server to start for health checks
    console.log('⚠️  Server will start without database connection')
  }
}

// Health check (works even without DB)
app.get('/api/auth/health', (req, res) => {
  const dbStatus = db ? 'connected' : 'disconnected'
  res.json({ 
    status: 'healthy', 
    service: 'Auth Server v2',
    version: '2.0.0',
    database: dbStatus,
    port: PORT,
    timestamp: new Date().toISOString()
  })
})

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received:', { email: req.body.email })
    
    if (!db) {
      return res.status(500).json({ message: 'Database not available' })
    }

    const { email, name, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const users = db.collection('users')

    // Check if user exists
    const existingUser = await users.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' })
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Create user
    const newUser = {
      email: email.toLowerCase(),
      name: name || '',
      password: hashedPassword,
      authMethod: 'password',
      emailVerified: null,
      isActive: true,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null
    }

    const result = await users.insertOne(newUser)
    console.log('✅ User created:', result.insertedId)

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertedId,
        email: newUser.email,
        name: newUser.name,
        authMethod: newUser.authMethod
      }
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    res.status(500).json({ message: 'Failed to create account' })
  }
})

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', { email: req.body.email })
    
    if (!db) {
      return res.status(500).json({ message: 'Database not available' })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const users = db.collection('users')

    // Find user
    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log('❌ User not found:', email)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    console.log('🔐 Verifying password...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Update last login
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { lastLoginAt: new Date() },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
      }
    )

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Login successful:', user._id)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
        lastLoginAt: new Date()
      }
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Verify endpoint
app.get('/api/auth/verify', async (req, res) => {
  try {
    console.log('🔍 Verify request received')
    
    if (!db) {
      return res.status(500).json({ message: 'Database not available' })
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header')
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('🎫 Token received, verifying...')

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ Token verified for user:', decoded.userId)
    } catch (jwtError) {
      console.log('❌ Invalid token:', jwtError.message)
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const users = db.collection('users')

    // Find user by ID from token
    const { ObjectId } = require('mongodb')
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId)
      return res.status(401).json({ message: 'User not found' })
    }

    console.log('✅ User verified:', user.email)

    // Return user data (without password)
    res.json({
      message: 'Token valid',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    })

  } catch (error) {
    console.error('❌ Verify error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Start server
async function startServer() {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`🚀 Auth Server v2 running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/api/auth/health`)
    console.log(`🔐 Ready to handle authentication requests`)
  })
}

startServer().catch(console.error)
EOF

echo "✅ Updated auth server created"

echo ""
echo "📦 Uploading updated auth server to production..."

# Upload the updated auth server
scp -i "$SSH_KEY" /tmp/auth-server-fixed.cjs "$REMOTE_USER@$REMOTE_HOST:/home/ubuntu/shiny-friend-disco/backend/"

echo ""
echo "🔄 Restarting auth server with environment variables..."

# Restart server with proper environment variables
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'REMOTE_COMMANDS'
cd /home/ubuntu/shiny-friend-disco/backend

# Stop existing server
pm2 delete auth-server 2>/dev/null || true

# Start with environment variables from .env file
pm2 start auth-server-fixed.cjs --name auth-server --env production
pm2 save

echo "✅ Auth server restarted"
sleep 3

# Check logs
echo ""
echo "📋 Auth server logs:"
pm2 logs auth-server --lines 10 --nostream
REMOTE_COMMANDS

echo ""
echo "🧪 Testing updated auth server..."

sleep 5

# Test health endpoint
echo "Testing health endpoint:"
curl -s https://onelastai.co/api/auth/health | jq . 2>/dev/null || curl -s https://onelastai.co/api/auth/health

echo ""
echo "🎉 Auth Server Update Complete!"
echo "=============================="