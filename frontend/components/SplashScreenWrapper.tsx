'use client'

import { useLoading } from '@/lib/loading-context'
import SplashScreen from '@/components/SplashScreen'

export default function SplashScreenWrapper() {
  const { isLoading } = useLoading()

  return <SplashScreen isLoading={isLoading} />
}
