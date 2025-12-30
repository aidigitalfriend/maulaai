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
  const isLabPage = pathname?.startsWith('/lab');
  const isToolsPage = pathname?.startsWith('/tools');
  const isCanvasAppPage = pathname === '/canvas-app';

  // Don't render footer on these pages
  if (
    isAgentPage ||
    isStudioPage ||
    isAuthPage ||
    isDashboardPage ||
    isLiveSupportPage ||
    isLabPage ||
    isToolsPage ||
    isCanvasAppPage
  ) {
    return null;
  }

  return <Footer />;
}
