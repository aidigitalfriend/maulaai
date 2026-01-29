'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { gsap, ScrollTrigger, SplitText, TextPlugin, MotionPathPlugin, CustomWiggle, CustomEase } from '@/lib/gsap'

interface SubscriptionData {
  success: boolean
  hasAccess?: boolean
  subscription?: any
  error?: string
  message?: string
}

function SubscriptionSuccessContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const [agentName, setAgentName] = useState('your AI agent')
  const [agentSlug, setAgentSlug] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [animationsReady, setAnimationsReady] = useState(false)

  useEffect(() => {
    const agent = searchParams.get('agent')
    const slug = searchParams.get('slug')
    const session = searchParams.get('session_id')

    if (agent) setAgentName(agent)
    if (slug) setAgentSlug(slug)
    if (session) setSessionId(session)

    if (session) {
      verifyStripeSession(session)
    } else {
      setVerificationStatus('error')
      setErrorMessage('No session ID provided. Please complete the subscription process first.')
      setAnimationsReady(true)
    }
  }, [searchParams])

  const verifyStripeSession = async (sessionId: string) => {
    try {
      const timeout = setTimeout(() => {
        setVerificationStatus('error')
        setErrorMessage('Verification timed out. Please check your subscription status in the dashboard.')
        setAnimationsReady(true)
      }, 10000)

      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 404) {
          setErrorMessage('Session not found. This might be an expired or invalid link.')
        } else if (response.status === 400) {
          setErrorMessage(errorData.error || 'Invalid session. Please try subscribing again.')
        } else {
          setErrorMessage('Failed to verify subscription. Please contact support.')
        }
        setVerificationStatus('error')
        setAnimationsReady(true)
        return
      }

      const data = await response.json()
      setSubscriptionData(data)
      setVerificationStatus('success')
      setAnimationsReady(true)
    } catch (error) {
      setVerificationStatus('error')
      setErrorMessage('Network error during verification. Please check your connection and try again.')
      setAnimationsReady(true)
    }
  }

  // GSAP Animations
  useEffect(() => {
    if (!containerRef.current || !animationsReady) return

    gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, MotionPathPlugin, CustomEase)
    
    CustomWiggle.create('successWiggle', { type: 'uniform', wiggles: 5 })
    CustomEase.create('successBounce', 'M0,0 C0.14,0.5 0.25,1.15 0.44,1.08 0.58,1.02 0.75,1 1,1')

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(['.success-card', '.detail-row', '.next-step', '.action-btn', '.confetti'], { autoAlpha: 0 })

      // Background orbs
      gsap.utils.toArray('.success-orb').forEach((orb: any, i) => {
        gsap.to(orb, {
          x: `random(-100, 100)`,
          y: `random(-100, 100)`,
          scale: `random(0.7, 1.4)`,
          rotation: 360,
          borderRadius: ['40% 60% 60% 40% / 60% 30% 70% 40%', '60% 40% 30% 70% / 40% 60% 40% 60%'],
          duration: 18 + i * 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      })

      // Confetti explosion
      gsap.utils.toArray('.confetti').forEach((conf: any, i) => {
        gsap.to(conf, {
          autoAlpha: 1,
          duration: 0.3,
          delay: 0.5 + i * 0.05
        })

        gsap.to(conf, {
          y: `random(100, 300)`,
          x: `random(-150, 150)`,
          rotation: `random(-360, 360)`,
          opacity: 0,
          duration: 2,
          delay: 0.5 + i * 0.05,
          ease: 'power1.out'
        })
      })

      // Success icon animation
      const successIcon = document.querySelector('.success-icon')
      if (successIcon) {
        gsap.from(successIcon, {
          scale: 0,
          rotation: -180,
          duration: 1,
          ease: 'elastic.out(1, 0.3)'
        })

        gsap.to(successIcon, {
          boxShadow: '0 0 60px rgba(34, 197, 94, 0.6)',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1
        })
      }

      // Title animation
      if (titleRef.current && verificationStatus === 'success') {
        const titleSplit = new SplitText(titleRef.current, { type: 'chars, words' })
        
        gsap.from(titleSplit.chars, {
          y: 60,
          rotationX: -90,
          opacity: 0,
          duration: 0.7,
          ease: 'successBounce',
          stagger: {
            amount: 0.5,
            from: 'center'
          },
          delay: 0.5
        })

        // Celebration wave
        gsap.to(titleSplit.chars, {
          y: -8,
          duration: 0.5,
          stagger: {
            amount: 0.8,
            from: 'start',
            repeat: -1,
            yoyo: true
          },
          ease: 'sine.inOut',
          delay: 1.5
        })
      }

      // Subtitle typewriter
      if (subtitleRef.current && verificationStatus === 'success') {
        const text = subtitleRef.current.textContent || ''
        subtitleRef.current.textContent = ''
        gsap.to(subtitleRef.current, {
          text: text,
          duration: 1.5,
          delay: 1,
          ease: 'none'
        })
      }

      // Subscription details card
      gsap.to('.success-card', {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: 1.2,
        ease: 'successBounce',
        from: { y: 50, scale: 0.9 }
      })

      // Detail rows stagger
      gsap.to('.detail-row', {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 1.5,
        ease: 'power2.out',
        from: { x: -30 }
      })

      // Next steps with stagger
      gsap.to('.next-step', {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
        delay: 1.8,
        ease: 'back.out(1.7)',
        from: { y: 20 }
      })

      // Action buttons
      gsap.to('.action-btn', {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        delay: 2.2,
        ease: 'successBounce',
        from: { y: 30, scale: 0.9 }
      })

      // Button hover setup
      gsap.utils.toArray('.action-btn').forEach((btn: any) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.05, y: -5, duration: 0.3 })
        })
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, y: 0, duration: 0.3 })
        })
      })

    }, containerRef)

    return () => ctx.revert()
  }, [animationsReady, verificationStatus])

  const handleAgentRedirect = () => {
    if (agentSlug) {
      router.push(`/agents/${agentSlug}?fresh=1`)
    }
  }

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-green-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-gray-400 text-lg">Verifying your subscription...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="success-orb absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-r from-red-600/20 to-rose-600/20 blur-3xl" />
          <div className="success-orb absolute top-1/2 -right-32 w-[400px] h-[400px] bg-gradient-to-r from-orange-500/15 to-red-600/15 blur-3xl" />
        </div>

        <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
          <div className="success-icon w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center text-5xl mb-8 border border-red-500/30">
            ❌
          </div>

          <h1 ref={titleRef} className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Verification Failed
          </h1>

          <p className="text-xl text-red-400 max-w-2xl text-center mb-12">
            {errorMessage || 'We could not verify your subscription. Please try again or contact support.'}
          </p>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
            <Link
              href="/dashboard"
              className="action-btn flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold text-center hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 opacity-0"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/support/contact-us"
              className="action-btn flex-1 py-4 px-6 bg-white/5 border border-red-500/30 rounded-xl text-red-400 font-semibold text-center hover:bg-red-500/10 transition-all duration-300 opacity-0"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="success-orb absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-3xl" />
        <div className="success-orb absolute top-1/2 -right-32 w-[400px] h-[400px] bg-gradient-to-r from-blue-500/15 to-cyan-600/15 blur-3xl" />
        <div className="success-orb absolute -bottom-32 left-1/4 w-[350px] h-[350px] bg-gradient-to-r from-purple-500/10 to-pink-600/10 blur-3xl" />
      </div>

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="confetti absolute w-3 h-3 opacity-0"
            style={{
              top: '30%',
              left: `${30 + Math.random() * 40}%`,
              backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
              borderRadius: i % 2 === 0 ? '50%' : '0'
            }}
          />
        ))}
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Success Icon */}
        <div className="success-icon w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center text-5xl mb-8 border border-green-500/30">
          ✅
        </div>

        <h1
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-center"
        >
          Subscription Confirmed!
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl text-gray-400 max-w-2xl text-center mb-12"
        >
          You now have full access to <span className="text-green-400 font-semibold">{agentName}</span>.
        </p>

        {/* Subscription Details Card */}
        {subscriptionData?.subscription && (
          <div className="success-card w-full max-w-2xl bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-10 opacity-0">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Subscription Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="detail-row flex justify-between p-4 bg-white/5 rounded-xl opacity-0">
                <span className="text-gray-400">Plan</span>
                <span className="font-semibold text-white capitalize">{subscriptionData.subscription.plan}</span>
              </div>
              <div className="detail-row flex justify-between p-4 bg-white/5 rounded-xl opacity-0">
                <span className="text-gray-400">Status</span>
                <span className={`font-semibold capitalize ${subscriptionData.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                  {subscriptionData.subscription.status}
                </span>
              </div>
              <div className="detail-row flex justify-between p-4 bg-white/5 rounded-xl opacity-0">
                <span className="text-gray-400">Price</span>
                <span className="font-semibold text-white">${subscriptionData.subscription.price}</span>
              </div>
              <div className="detail-row flex justify-between p-4 bg-white/5 rounded-xl opacity-0">
                <span className="text-gray-400">Access Period</span>
                <span className="font-semibold text-blue-400">
                  {subscriptionData.subscription.daysRemaining || subscriptionData.subscription.daysUntilRenewal || 0} days
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next Card */}
        <div className="success-card w-full max-w-2xl bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-10 opacity-0">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What's next?</h2>
          
          <ul className="space-y-4">
            {[
              '• Enjoy unlimited conversations with your subscribed agent.',
              '• Manage billing or cancel anytime from your dashboard.',
              '• Need help? Visit the support center for quick assistance.'
            ].map((step, i) => (
              <li key={i} className="next-step text-gray-300 p-3 bg-white/5 rounded-xl opacity-0">
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
          <Link
            href="/dashboard"
            className="action-btn flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold text-center hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/25 opacity-0"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleAgentRedirect}
            disabled={!agentSlug}
            className={`action-btn flex-1 py-4 px-6 bg-white/5 border border-green-500/30 rounded-xl text-green-400 font-semibold text-center hover:bg-green-500/10 transition-all duration-300 opacity-0 ${
              !agentSlug ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            Open Agent Chat
          </button>
        </div>

        {!agentSlug && (
          <p className="text-amber-400 text-sm mt-6 text-center">
            We couldn't detect which agent you subscribed to. Please return to the dashboard to continue.
          </p>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0d0d12] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin" />
            </div>
            <p className="text-gray-400">Loading subscription details...</p>
          </div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
