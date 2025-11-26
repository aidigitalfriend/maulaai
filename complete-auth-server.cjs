const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()
const PORT = 3006

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://onelastai.co', 'http://47.129.43.231'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || '872CMUf8STQzY5vohsjic9NkMKsOocZMQ/LD5Nx627k='
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net/onelastai?retryWrites=true&w=majority&appName=onelastai-co'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

console.log('🔧 Starting Complete Auth Server')
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
    
    // Check if users collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray()
    if (collections.length > 0) {
      const userCount = await db.collection('users').countDocuments()
      console.log(`👥 Users collection found with ${userCount} users`)
    } else {
      console.log('👥 Users collection will be created on first signup')
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.log('⚠️  Server will start without database connection')
  }
}

// Middleware to check database connection
const requireDB = (req, res, next) => {
  if (!db) {
    return res.status(500).json({ 
      message: 'Database not available', 
      error: 'MongoDB connection not established'
    })
  }
  next()
}

// Health check (works even without DB)
app.get('/api/auth/health', (req, res) => {
  const dbStatus = db ? 'connected' : 'disconnected'
  res.json({ 
    status: 'healthy', 
    service: 'Complete Auth Server',
    version: '3.0.0',
    database: dbStatus,
    port: PORT,
    mongodb_uri: MONGODB_URI ? 'configured' : 'missing',
    jwt_secret: JWT_SECRET ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  })
})

// Test database endpoint
app.get('/api/auth/test-db', requireDB, async (req, res) => {
  try {
    const result = await db.admin().ping()
    const userCount = await db.collection('users').countDocuments()
    
    res.json({
      message: 'Database test successful',
      ping: result,
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Database test error:', error)
    res.status(500).json({ 
      message: 'Database test failed', 
      error: error.message 
    })
  }
})

// Signup endpoint
app.post('/api/auth/signup', requireDB, async (req, res) => {
  try {
    console.log('📝 Signup request received:', { 
      email: req.body.email, 
      name: req.body.name,
      timestamp: new Date().toISOString()
    })
    
    const { email, name, password } = req.body

    if (!email || !password) {
      console.log('❌ Missing required fields')
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password, name: !!name }
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email)
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate password length
    if (password.length < 8) {
      console.log('❌ Password too short')
      return res.status(400).json({ message: 'Password must be at least 8 characters long' })
    }

    const users = db.collection('users')

    // Check if user exists
    console.log('🔍 Checking if user exists:', email.toLowerCase())
    const existingUser = await users.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log('❌ User already exists:', existingUser._id)
      return res.status(409).json({ message: 'User already exists with this email' })
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)
    console.log('✅ Password hashed successfully')

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

    console.log('💾 Creating user in database...')
    const result = await users.insertOne(newUser)
    console.log('✅ User created successfully:', result.insertedId)

    // Create JWT token
    console.log('🎫 Creating JWT token...')
    const token = jwt.sign(
      { userId: result.insertedId, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    console.log('✅ JWT token created')

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertedId,
        email: newUser.email,
        name: newUser.name,
        authMethod: newUser.authMethod,
        createdAt: newUser.createdAt
      }
    })

    console.log('🎉 Signup completed successfully for:', email)

  } catch (error) {
    console.error('❌ Signup error:', error)
    res.status(500).json({ 
      message: 'Failed to create account',
      error: error.message
    })
  }
})

// Login endpoint
app.post('/api/auth/login', requireDB, async (req, res) => {
  try {
    console.log('🔐 Login request received:', { 
      email: req.body.email,
      timestamp: new Date().toISOString()
    })
    
    const { email, password } = req.body

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password }
      })
    }

    const users = db.collection('users')

    // Find user
    console.log('🔍 Looking for user:', email.toLowerCase())
    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log('❌ User not found:', email)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    console.log('✅ User found:', user._id)

    // Check password
    console.log('🔐 Verifying password...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    console.log('✅ Password verified')

    // Update last login
    console.log('📝 Updating last login time...')
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { lastLoginAt: new Date() },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
      }
    )

    // Create JWT token
    console.log('🎫 Creating JWT token...')
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('🎉 Login successful for:', user.email)

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
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message
    })
  }
})

// Verify endpoint
app.get('/api/auth/verify', requireDB, async (req, res) => {
  try {
    console.log('🔍 Verify request received:', {
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    })
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header')
      return res.status(401).json({ 
        message: 'No token provided',
        received: authHeader ? 'invalid format' : 'missing header'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('🎫 Token received, verifying... (length:', token.length, ')')

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ Token verified for user:', decoded.userId, 'email:', decoded.email)
    } catch (jwtError) {
      console.log('❌ Invalid token:', jwtError.message)
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: jwtError.message
      })
    }

    const users = db.collection('users')

    // Find user by ID from token
    console.log('🔍 Looking up user by ID:', decoded.userId)
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
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    })
  }
})

// List users endpoint (for debugging)
app.get('/api/auth/users', requireDB, async (req, res) => {
  try {
    const users = db.collection('users')
    const userList = await users.find(
      {}, 
      { projection: { password: 0 } }
    ).limit(10).toArray()
    
    res.json({
      message: 'Users retrieved successfully',
      count: userList.length,
      users: userList
    })
  } catch (error) {
    console.error('❌ List users error:', error)
    res.status(500).json({ 
      message: 'Failed to retrieve users',
      error: error.message
    })
  }
})

// Start server
async function startServer() {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`🚀 Complete Auth Server running on port ${PORT}`)
    console.log(`📍 Health check: http://localhost:${PORT}/api/auth/health`)
    console.log(`📍 Test DB: http://localhost:${PORT}/api/auth/test-db`)
    console.log(`🔐 Ready to handle authentication requests`)
    console.log('')
    console.log('Available endpoints:')
    console.log('  POST /api/auth/signup - Create new account')
    console.log('  POST /api/auth/login - Login to account')
    console.log('  GET  /api/auth/verify - Verify JWT token')
    console.log('  GET  /api/auth/health - Health check')
    console.log('  GET  /api/auth/test-db - Test database connection')
    console.log('  GET  /api/auth/users - List users (debug)')
  })
}

startServer().catch(console.error)