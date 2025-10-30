'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/lib/loading-context'
import SplashScreen from '@/components/SplashScreen'

export default function SplashScreenWrapper() {
  const { isLoading } = useLoading()
  const pathname = usePathname()
  const [shouldShowSplash, setShouldShowSplash] = useState(false)

  useEffect(() => {
    // Check if we should show the splash screen
    const hasSeenSplash = localStorage.getItem('hasSeenSplash')
    const isHomepage = pathname === '/'
    
    // Show splash only on homepage AND if user hasn't seen it before
    if (isHomepage && !hasSeenSplash) {
      setShouldShowSplash(true)
      // Mark that user has seen the splash screen
      localStorage.setItem('hasSeenSplash', 'true')
    } else {
      setShouldShowSplash(false)
    }
  }, [pathname])

  // Only render splash screen if conditions are met
  if (!shouldShowSplash) {
    return null
  }

  return <SplashScreen isLoading={isLoading} />
}
