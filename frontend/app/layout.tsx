import dynamicImport from 'next/dynamic'
import Header from '@/components/Header'
import ConditionalFooter from '@/components/ConditionalFooter'
import AuthProvider from '@/lib/auth-context'
import { LoadingProvider } from '@/lib/loading-context'
import '@/styles/globals.css'

const SplashScreenWrapper = dynamicImport(
  () => import('@/components/SplashScreenWrapper'),
  { ssr: false }
)

// Fix #1: Root Layout with proper structure and spacing
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <LoadingProvider>
          <AuthProvider>
            {/* Global Splash Screen */}
            <SplashScreenWrapper />
            
            {/* Global Navigation - Fix #2: Consistent Navigation */}
            <Header />
            
            {/* Main Content Area - Fix #1: Proper Layout System */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Conditional Footer - Hidden on agent pages */}
            <ConditionalFooter />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}