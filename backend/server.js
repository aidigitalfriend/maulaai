import { Server } from 'socket.io'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3001

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join user to their own room for private messaging
    socket.on('join-support', (data) => {
      const { userId, sessionId } = data
      socket.join(`support_${userId}`)
      console.log(`User ${userId} joined support session: ${sessionId}`)
      
      // Send acknowledgment
      socket.emit('joined', { sessionId, status: 'connected' })
    })

    // Handle support messages
    socket.on('support-message', async (data) => {
      const { userId, message, attachments, sessionId } = data
      
      try {
        // Emit typing indicator to user
        socket.to(`support_${userId}`).emit('agent-typing', { typing: true })
        
        // Process message through AI router (will implement this)
        // For now, echo back with delay to simulate processing
        setTimeout(() => {
          socket.to(`support_${userId}`).emit('agent-typing', { typing: false })
          socket.to(`support_${userId}`).emit('agent-response', {
            message: `I received your message: "${message}". I'm processing this now...`,
            timestamp: new Date().toISOString(),
            sessionId
          })
        }, 2000)

      } catch (error) {
        console.error('Error processing support message:', error)
        socket.emit('error', { message: 'Failed to process message' })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> WebSocket server running on ws://${hostname}:${port}`)
    })
})