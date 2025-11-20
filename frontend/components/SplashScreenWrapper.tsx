'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/lib/loading-context'
import SplashScreen from '@/components/SplashScreen'

export default function SplashScreenWrapper() {
  const { isLoading, setIsLoading } = useLoading()
  const pathname = usePathname()
  const [shouldShowSplash, setShouldShowSplash] = useState(false)

  useEffect(() => {
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
  }, [pathname, setIsLoading])

  // Mark as seen when splash completes (when isLoading becomes false)
  useEffect(() => {
    if (shouldShowSplash && !isLoading) {
      localStorage.setItem('hasSeenSplash', 'true')
    }
  }, [shouldShowSplash, isLoading])

  // Only render splash screen if conditions are met
  if (!shouldShowSplash) {
    return null
  }

  return <SplashScreen isLoading={isLoading} />
}
