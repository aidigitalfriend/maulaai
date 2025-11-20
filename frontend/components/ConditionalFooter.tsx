'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on all agent pages (any path starting with /agents/) and studio page
  const isAgentPage = pathname?.startsWith('/agents/')
  const isStudioPage = pathname === '/studio'
  
  // Don't render footer on agent pages or studio page
  if (isAgentPage || isStudioPage) {
    return null
  }
  
  return <Footer />
}
