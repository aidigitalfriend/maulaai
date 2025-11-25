/**
 * WebSocket Client for Real-Time Features
 * Centralized Socket.IO connection manager
 */

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5

export interface MetricsUpdate {
  rps: number
  avgResponseMs: number
  errorRate: number
  totalRequests: number
  connectedClients: number
  activeRooms: number
  timestamp: string
}

export interface ChatMessage {
  userId: string
  agent: string
  message: string
  timestamp: string
}

export interface CommunityPost {
  postId: string
  userId: string
  userName: string
  content: string
  timestamp: string
  likes: number
  comments: number
}

/**
 * Initialize WebSocket connection
 */
export function initializeSocket(): Socket {
  if (socket && socket.connected) {
    return socket
  }

  const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'
  
  socket = io(socketUrl, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    timeout: 20000
  })

  // Connection events
  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket?.id)
    reconnectAttempts = 0
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('🔴 WebSocket connection error:', error.message)
    reconnectAttempts++
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ Max reconnection attempts reached')
      socket?.disconnect()
    }
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts')
    reconnectAttempts = 0
  })

  // Global events
  socket.on('clients-update', (data: { connected: number; timestamp: string }) => {
    console.log('👥 Connected clients:', data.connected)
  })

  return socket
}

/**
 * Get existing socket instance
 */
export function getSocket(): Socket | null {
  return socket
}

/**
 * Join support chat room
 */
export function joinSupport(userId: string, sessionId: string, userName?: string): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('join-support', { userId, sessionId, userName })
  
  socket.once('joined', (data) => {
    console.log('✅ Joined support room:', data.room)
  })
}

/**
 * Join community room
 */
export function joinCommunity(userId: string, userName: string): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('join-community', { userId, userName })
}

/**
 * Subscribe to real-time metrics
 */
export function subscribeToMetrics(callback: (data: MetricsUpdate) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.emit('join-metrics')
  socket.on('metrics-update', callback)
  
  // Return unsubscribe function
  return () => {
    socket?.off('metrics-update', callback)
  }
}

/**
 * Subscribe to API request events
 */
export function subscribeToApiRequests(callback: (data: any) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.on('api-request', callback)
  
  return () => {
    socket?.off('api-request', callback)
  }
}

/**
 * Send chat message
 */
export function sendChatMessage(room: string, userId: string, message: string, agent?: string): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('chat-message', { room, userId, message, agent })
}

/**
 * Listen for chat messages
 */
export function onChatMessage(callback: (data: ChatMessage) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.on('message', callback)
  
  return () => {
    socket?.off('message', callback)
  }
}

/**
 * Listen for typing indicators
 */
export function onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.on('typing', callback)
  
  return () => {
    socket?.off('typing', callback)
  }
}

/**
 * Post to community
 */
export function postToCommunity(userId: string, userName: string, content: string, postId: string): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('community-post', { userId, userName, content, postId })
}

/**
 * Subscribe to new community posts
 */
export function onNewPost(callback: (data: CommunityPost) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.on('new-post', callback)
  
  return () => {
    socket?.off('new-post', callback)
  }
}

/**
 * Like a post
 */
export function likePost(postId: string, userId: string): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('post-like', { postId, userId })
}

/**
 * Subscribe to post likes
 */
export function onPostLiked(callback: (data: { postId: string; userId: string; timestamp: string }) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.on('post-liked', callback)
  
  return () => {
    socket?.off('post-liked', callback)
  }
}

/**
 * Comment on a post
 */
export function commentOnPost(postId: string, userId: string, userName: string, comment: string): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.emit('post-comment', { postId, userId, userName, comment })
}

/**
 * Subscribe to new comments
 */
export function onNewComment(callback: (data: any) => void): () => void {
  if (!socket) {
    console.error('Socket not initialized')
    return () => {}
  }

  socket.on('new-comment', callback)
  
  return () => {
    socket?.off('new-comment', callback)
  }
}

/**
 * Update user activity
 */
export function updateActivity(): void {
  if (!socket?.connected) return
  socket.emit('activity')
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Check if socket is connected
 */
export function isConnected(): boolean {
  return socket?.connected || false
}
