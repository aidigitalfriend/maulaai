const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://onelastai.co'

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let visitorId = localStorage.getItem('visitorId')
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('visitorId', visitorId)
  }
  return visitorId
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}

function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('userId')
}

export async function trackPageView(path: string, title?: string) {
  try {
    await fetch(`${API_BASE}/api/analytics/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        userId: getUserId(),
        url: path,
        title: title || (typeof document !== 'undefined' ? document.title : ''),
        referrer: typeof document !== 'undefined' ? document.referrer : ''
      })
    })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

export async function trackEvent(eventType: string, eventName: string, eventData?: any) {
  try {
    await fetch(`${API_BASE}/api/analytics/track/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        userId: getUserId(),
        eventType,
        eventName,
        eventData
      })
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

export async function trackSignup(userId: string, email: string) {
  localStorage.setItem('userId', userId)
  await trackEvent('user_action', 'signup', { email })
}

export async function trackLogin(userId: string, email: string) {
  localStorage.setItem('userId', userId)
  await trackEvent('user_action', 'login', { email })
}
