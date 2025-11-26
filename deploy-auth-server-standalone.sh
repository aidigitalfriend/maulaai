#!/bin/bash

# 🔧 Simple Auth Server Deployment Script
# Creates a standalone auth server with MongoDB integration

set -e

echo "🚀 Deploying Simple Auth Server..."
echo "==============================="

# Configuration
REMOTE_HOST="47.129.43.231"
REMOTE_USER="ubuntu"
SSH_KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo ""
echo "📝 Creating simple auth server..."

# Create a simple auth server that handles login, signup, and verify
cat > /tmp/auth-server-simple.js << 'EOF'
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

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || '872CMUf8STQzY5vohsjic9NkMKsOocZMQ/LD5Nx627k='
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Sp33dRacer007@onelastai.z7kxhzp.mongodb.net/onelastai'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

// MongoDB connection
let db = null

async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db('onelastai')
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Health check
app.get('/api/auth/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Simple Auth Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received:', { email: req.body.email })
    
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
    
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const users = db.collection('users')

    // Find user
    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
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
    console.log(`🚀 Simple Auth Server running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/api/auth/health`)
  })
}

startServer().catch(console.error)
EOF

echo "✅ Auth server created"

echo ""
echo "📦 Uploading auth server to production..."

# Upload the auth server
scp -i "$SSH_KEY" /tmp/auth-server-simple.js "$REMOTE_USER@$REMOTE_HOST:/home/ubuntu/shiny-friend-disco/backend/"

echo ""
echo "🔧 Installing dependencies and starting server..."

# Install dependencies and start server
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'REMOTE_COMMANDS'
cd /home/ubuntu/shiny-friend-disco/backend

# Install required packages
npm install express cors bcryptjs jsonwebtoken mongodb

# Stop any existing auth server
pm2 delete auth-server 2>/dev/null || true
pkill -f "auth-server-simple.js" || true

# Start the auth server
pm2 start auth-server-simple.js --name auth-server --env production
pm2 save

echo "✅ Auth server started"
REMOTE_COMMANDS

echo ""
echo "🧪 Testing auth server..."

sleep 5

# Test health endpoint
echo "Testing health endpoint:"
HEALTH_STATUS=$(curl -s -w "%{http_code}" https://onelastai.co/api/auth/health)
echo "Health response: $HEALTH_STATUS"

# Test verify endpoint (should return 401 for no token)
echo "Testing verify endpoint:"
VERIFY_STATUS=$(curl -s -w "%{http_code}" https://onelastai.co/api/auth/verify)
echo "Verify response: $VERIFY_STATUS"

echo ""
echo "🎉 Simple Auth Server Deployment Complete!"
echo "========================================="
echo ""
echo "📋 Available endpoints:"
echo "  - POST /api/auth/signup"
echo "  - POST /api/auth/login"  
echo "  - GET  /api/auth/verify"
echo "  - GET  /api/auth/health"
echo ""
echo "🔍 Next steps:"
echo "1. Test login/signup flow"
echo "2. Verify token persistence on refresh"
echo "3. Check database population"