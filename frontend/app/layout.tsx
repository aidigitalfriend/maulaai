import type { Metadata } from 'next';
import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import RSCErrorBoundary from '@/components/RSCErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/lib/loading-context';
import SplashScreenWrapper from '@/components/SplashScreenWrapper';
import '@/styles/globals.css';

// Metadata for SEO and browser tabs
export const metadata: Metadata = {
  title: 'One Last AI - Your AI Dream Team',
  description:
    "Transform your workflow with 20+ specialized AI personalities. From Einstein's genius to Shakespeare's creativity - unlock the power of history's greatest minds.",
  keywords: [
    'AI',
    'artificial intelligence',
    'AI agents',
    'chatbot',
    'Einstein AI',
    'AI personalities',
    'machine learning',
  ],
  authors: [{ name: 'One Last AI' }],
  creator: 'One Last AI',
  publisher: 'One Last AI',
  metadataBase: new URL('https://onelastai.co'),
  alternates: {
    canonical: 'https://onelastai.co',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://onelastai.co',
    title: 'One Last AI - Your AI Dream Team',
    description:
      "Transform your workflow with 20+ specialized AI personalities. From Einstein's genius to Shakespeare's creativity.",
    siteName: 'One Last AI',
    images: [
      {
        url: '/images/logos/company-logo.png',
        width: 1200,
        height: 630,
        alt: 'One Last AI - AI Dream Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'One Last AI - Your AI Dream Team',
    description:
      'Transform your workflow with 20+ specialized AI personalities.',
    images: ['/images/logos/company-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/logos/company-logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      {
        url: '/images/logos/company-logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: [{ url: '/images/logos/company-logo.png' }],
  },
  manifest: '/site.webmanifest',
};

// Fix #1: Root Layout with proper structure and spacing
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {/* Console Error Filter - Suppress RSC 503 errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                const originalError = console.error;
                const suppressPatterns = [
                  /GET.*\\?_rsc=.*503.*Service Unavailable/,
                  /_rsc=.*503/,
                  /Service Unavailable.*_rsc/,
                  /Failed to fetch.*_rsc/
                ];
                function shouldSuppress(message) {
                  const messageStr = String(message);
                  return suppressPatterns.some(pattern => pattern.test(messageStr));
                }
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (!shouldSuppress(message)) {
                    originalError.apply(console, args);
                  }
                };
                if (typeof window !== 'undefined') {
                  window.addEventListener('unhandledrejection', function(event) {
                    if (event.reason && typeof event.reason === 'string' && event.reason.includes('_rsc=')) {
                      event.preventDefault();
                    }
                  });
                }
              })();
            `,
          }}
        />
        {/* Performance Monitoring Initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                // Initialize performance monitoring
                if (typeof window !== 'undefined') {
                  window.addEventListener('load', function() {
                    // Small delay to ensure all resources are loaded
                    setTimeout(function() {
                      // Import and initialize performance monitoring
                      import('/lib/performance.js').then(function(module) {
                        if (module.initPerformanceMonitoring) {
                          module.initPerformanceMonitoring();
                        }
                      }).catch(function(err) {
                        console.warn('Performance monitoring failed to load:', err);
                      });
                    }, 100);
                  });
                }
              })();
            `,
          }}
        />

        <LoadingProvider>
          <AuthProvider>
            <RSCErrorBoundary>
              {/* Global Splash Screen - Temporarily disabled */}
              {/* <SplashScreenWrapper /> */}

              {/* Global Navigation - Fix #2: Consistent Navigation */}
              <Header />

              {/* Main Content Area - Fix #1: Proper Layout System */}
              <main className="flex-1">{children}</main>

              {/* Conditional Footer - Hidden on agent pages */}
              <ConditionalFooter />
            </RSCErrorBoundary>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
