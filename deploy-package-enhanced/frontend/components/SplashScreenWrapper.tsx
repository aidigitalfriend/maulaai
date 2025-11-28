'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/lib/loading-context'
import SplashScreen from '@/components/SplashScreen'

export default function SplashScreenWrapper() {
  const { isLoading, setIsLoading } = useLoading()
  const pathname = usePathname()
  const [shouldShowSplash, setShouldShowSplash] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side before doing anything
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Check if we should show the splash screen
    const hasSeenSplash = localStorage.getItem('hasSeenSplash')
    const isHomepage = pathname === '/'

    // Show splash only on homepage AND if user hasn't seen it before
    if (isHomepage && !hasSeenSplash) {
      setShouldShowSplash(true)
      // Keep loading state active for splash
      setIsLoading(true)
    } else {
      setShouldShowSplash(false)
      // If not showing splash, immediately set loading to false
      setIsLoading(false)
    }
  }, [pathname, setIsLoading, isClient])

  // Mark as seen when splash completes (when isLoading becomes false)
  useEffect(() => {
    if (shouldShowSplash && !isLoading && isClient) {
      localStorage.setItem('hasSeenSplash', 'true')
    }
  }, [shouldShowSplash, isLoading, isClient])

  // Don't render anything on server side or if not client
  if (!isClient) {
    return null
  }

  // Only render splash screen if conditions are met
  if (!shouldShowSplash) {
    return null
  }

  return <SplashScreen isLoading={isLoading} />
}
