'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on all agent pages (any path starting with /agents/), studio page, and auth pages
  const isAgentPage = pathname?.startsWith('/agents/');
  const isStudioPage = pathname === '/studio';
  const isAuthPage = pathname?.startsWith('/auth/');

  // Don't render footer on agent pages, studio page, or auth pages (dashboard SHOULD show footer)
  if (isAgentPage || isStudioPage || isAuthPage) {
    return null;
  }

  return <Footer />;
}
