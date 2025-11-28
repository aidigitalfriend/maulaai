/**
 * Auth Storage Utility
 * Handles storing authentication tokens using both localStorage and cookies
 * for maximum session persistence across refreshes
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`
}

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  
  const nameEQ = name + '='
  const cookies = document.cookie.split(';')
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length)
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length)
    }
  }
  return null
}

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

// Main auth storage functions
export const authStorage = {
  /**
   * Store authentication token in both localStorage and cookies
   */
  setToken: (token: string, expiresInDays: number = 7) => {
    if (typeof window === 'undefined') return
    
    try {
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, token)
      
      // Store expiry timestamp
      const expiryTime = Date.now() + expiresInDays * 24 * 60 * 60 * 1000
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
      
      // Store in cookies as backup
      setCookie(TOKEN_KEY, token, expiresInDays)
      setCookie(TOKEN_EXPIRY_KEY, expiryTime.toString(), expiresInDays)
      
      console.log('✅ Auth token saved to localStorage and cookies')
    } catch (error) {
      console.error('❌ Error saving auth token:', error)
    }
  },

  /**
   * Get authentication token from localStorage or cookies
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    
    try {
      // Try localStorage first
      let token = localStorage.getItem(TOKEN_KEY)
      
      // Fallback to cookies if localStorage is empty
      if (!token) {
        token = getCookie(TOKEN_KEY)
        
        // If found in cookies, restore to localStorage
        if (token) {
          localStorage.setItem(TOKEN_KEY, token)
          console.log('🔄 Restored token from cookie to localStorage')
        }
      }
      
      // Check if token is expired
      if (token && authStorage.isTokenExpired()) {
        console.log('⚠️ Token expired, clearing session')
        authStorage.clearAll()
        return null
      }
      
      return token
    } catch (error) {
      console.error('❌ Error getting auth token:', error)
      return null
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true
    
    try {
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY) || getCookie(TOKEN_EXPIRY_KEY)
      if (!expiryStr) return true
      
      const expiryTime = parseInt(expiryStr, 10)
      return Date.now() > expiryTime
    } catch (error) {
      return true
    }
  },

  /**
   * Store user data
   */
  setUser: (user: any) => {
    if (typeof window === 'undefined') return
    
    try {
      const userJson = JSON.stringify(user)
      localStorage.setItem(USER_KEY, userJson)
      setCookie(USER_KEY, userJson, 7)
      console.log('✅ User data saved')
    } catch (error) {
      console.error('❌ Error saving user data:', error)
    }
  },

  /**
   * Get user data
   */
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null
    
    try {
      // Try localStorage first
      let userJson = localStorage.getItem(USER_KEY)
      
      // Fallback to cookies
      if (!userJson) {
        userJson = getCookie(USER_KEY)
        
        // Restore to localStorage if found in cookies
        if (userJson) {
          localStorage.setItem(USER_KEY, userJson)
        }
      }
      
      return userJson ? JSON.parse(userJson) : null
    } catch (error) {
      console.error('❌ Error getting user data:', error)
      return null
    }
  },

  /**
   * Clear all authentication data
   */
  clearAll: () => {
    if (typeof window === 'undefined') return
    
    try {
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
      
      // Clear cookies
      deleteCookie(TOKEN_KEY)
      deleteCookie(USER_KEY)
      deleteCookie(TOKEN_EXPIRY_KEY)
      
      console.log('✅ All auth data cleared')
    } catch (error) {
      console.error('❌ Error clearing auth data:', error)
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = authStorage.getToken()
    const user = authStorage.getUser()
    return !!(token && user && !authStorage.isTokenExpired())
  },

  /**
   * Refresh token expiry (extend session)
   */
  refreshExpiry: (expiresInDays: number = 7) => {
    const token = authStorage.getToken()
    if (token) {
      authStorage.setToken(token, expiresInDays)
    }
  }
}

export default authStorage
