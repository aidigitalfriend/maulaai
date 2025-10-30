'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Hide footer on all agent pages (any path starting with /agents/)
  const isAgentPage = pathname?.startsWith('/agents/')
  
  // Don't render footer on agent pages
  if (isAgentPage) {
    return null
  }
  
  return <Footer />
}
