'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on specific pages
  const isAgentPage = pathname?.startsWith('/agents/');
  const isStudioPage = pathname === '/studio';
  const isAuthPage = pathname?.startsWith('/auth/');
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isLiveSupportPage = pathname === '/support/live-support';

  // Don't render footer on these pages
  if (isAgentPage || isStudioPage || isAuthPage || isDashboardPage || isLiveSupportPage) {
    return null;
  }

  return <Footer />;
}
