'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { gsap, ScrollTrigger, SplitText, TextPlugin, Flip, MotionPathPlugin, CustomWiggle, CustomEase, ScrollToPlugin } from '@/lib/gsap'

function SubscriptionContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { state } = useAuth()
  const agentName = searchParams.get('agent') || 'AI Agent'
  const agentSlug = searchParams.get('slug') || 'agent'
  const intent = searchParams.get('intent')
  const [checking, setChecking] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [cancelling, setCancelling] = useState(false)
  const [animationsReady, setAnimationsReady] = useState(false)

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      if (!state.isAuthenticated || !state.user) {
        const currentUrl = `/subscribe?agent=${encodeURIComponent(agentName)}&slug=${agentSlug}`
        router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
        return
      }

      try {
        const user = state.user
        if (user) {
          const response = await fetch('/api/subscriptions/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              agentId: agentSlug,
            }),
          })

          const data = await response.json()

          if ((data.hasAccess || data.hasActiveSubscription) && data.subscription) {
            const subscription = data.subscription
            if (!subscription.daysUntilRenewal && subscription.expiryDate) {
              const expiry = new Date(subscription.expiryDate)
              const now = new Date()
              subscription.daysUntilRenewal = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            }
            setActiveSubscription(subscription)

            if (intent === 'cancel') {
              setTimeout(() => {
                const cancelButton = document.querySelector('[data-cancel-button]') as HTMLButtonElement
                if (cancelButton) cancelButton.click()
              }, 500)
            }
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      }

      setChecking(false)
      setAnimationsReady(true)
    }

    checkAccessAndRedirect()
  }, [agentName, agentSlug, router, state.isAuthenticated, state.user, intent])

  // GSAP Animations
  useEffect(() => {
    if (!containerRef.current || !animationsReady || checking) return

    gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, Flip, MotionPathPlugin, CustomEase, ScrollToPlugin)
    
    CustomWiggle.create('subscribeWiggle', { type: 'easeOut', wiggles: 4 })
    CustomEase.create('subscribeBounce', 'M0,0 C0.14,0.5 0.25,1.1 0.44,1.08 0.58,1.02 0.75,1 1,1')

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(['.plan-card', '.info-card', '.active-sub-card', '.floating-icon', '.badge-pill'], { autoAlpha: 0 })

      // Background orbs animation
      gsap.utils.toArray('.subscribe-orb').forEach((orb: any, i) => {
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

      // Floating particles
      gsap.utils.toArray('.particle').forEach((particle: any) => {
        gsap.to(particle, {
          y: `random(-80, 80)`,
          x: `random(-50, 50)`,
          opacity: `random(0.2, 0.6)`,
          scale: `random(0.5, 1.5)`,
          duration: `random(4, 8)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      })

      // Title animation
      if (titleRef.current) {
        const titleSplit = new SplitText(titleRef.current, { type: 'chars, words' })
        
        gsap.from(titleSplit.chars, {
          y: 80,
          rotationX: -90,
          opacity: 0,
          duration: 0.8,
          ease: 'subscribeBounce',
          stagger: {
            amount: 0.6,
            from: 'center'
          }
        })

        // Shimmer effect
        gsap.to(titleSplit.chars, {
          backgroundPosition: '200% center',
          duration: 3,
          repeat: -1,
          stagger: { amount: 1, repeat: -1 },
          ease: 'none'
        })
      }

      // Subtitle typewriter
      if (subtitleRef.current) {
        const text = subtitleRef.current.textContent || ''
        subtitleRef.current.textContent = ''
        gsap.to(subtitleRef.current, {
          text: text,
          duration: 1.5,
          delay: 0.6,
          ease: 'none'
        })
      }

      // Badge pills entrance
      gsap.to('.badge-pill', {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.8,
        ease: 'back.out(2)',
        from: { y: 20, scale: 0.8 }
      })

      // Floating icons with motion path
      gsap.utils.toArray('.floating-icon').forEach((icon: any, i) => {
        gsap.to(icon, {
          autoAlpha: 0.6,
          duration: 0.5,
          delay: 1 + i * 0.2
        })

        gsap.to(icon, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          rotation: `random(-15, 15)`,
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      })

      // Active subscription card
      if (activeSubscription) {
        gsap.to('.active-sub-card', {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 1,
          ease: 'subscribeBounce',
          from: { y: 50, scale: 0.9 }
        })

        // Celebrate animation
        gsap.to('.celebrate-icon', {
          rotation: 15,
          scale: 1.1,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })

        // Progress bar animation
        const progressFill = document.querySelector('.progress-fill')
        if (progressFill && activeSubscription.daysUntilRenewal) {
          const maxDays = activeSubscription.plan === 'monthly' ? 30 : activeSubscription.plan === 'weekly' ? 7 : 1
          const progress = (activeSubscription.daysUntilRenewal / maxDays) * 100
          gsap.to(progressFill, {
            width: `${progress}%`,
            duration: 1.5,
            delay: 1.3,
            ease: 'power2.out'
          })
        }
      } else {
        // Plan cards with 3D flip entrance
        gsap.utils.toArray('.plan-card').forEach((card: any, i) => {
          gsap.to(card, {
            autoAlpha: 1,
            rotationY: 0,
            scale: 1,
            duration: 0.8,
            delay: 1 + i * 0.2,
            ease: 'subscribeBounce',
            from: { rotationY: 90, scale: 0.8 }
          })

          // Hover effects
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              scale: 1.05,
              y: -15,
              boxShadow: '0 30px 60px -15px rgba(59, 130, 246, 0.3)',
              duration: 0.3
            })
            gsap.to(card.querySelector('.plan-icon'), {
              rotation: 360,
              scale: 1.2,
              duration: 0.6
            })
          })

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              scale: 1,
              y: 0,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              duration: 0.3
            })
            gsap.to(card.querySelector('.plan-icon'), {
              rotation: 0,
              scale: 1,
              duration: 0.6
            })
          })
        })
      }

      // Info cards entrance
      gsap.to('.info-card', {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.info-section',
          start: 'top 80%'
        }
      })

      // Recommended badge pulse
      gsap.to('.recommended-badge', {
        scale: 1.05,
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

    }, containerRef)

    return () => ctx.revert()
  }, [animationsReady, checking, activeSubscription])

  const handleCancelSubscription = async () => {
    if (!state.user || !activeSubscription) return

    if (!confirm(`Are you sure you want to cancel your ${activeSubscription.plan} subscription to ${agentName}? You will lose access immediately.`)) {
      return
    }

    setCancelling(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: state.user.id,
          agentId: agentSlug,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      setActiveSubscription(null)
      alert('Access cancelled successfully. You can purchase again anytime to continue using this agent.')

      if (intent === 'cancel') {
        router.push('/dashboard/agent-management')
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to cancel access. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const subscriptionPlans = [
    {
      type: 'Daily',
      price: '$1',
      period: 'per day',
      icon: '⚡',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'No auto-renewal',
      ],
      recommended: false,
      billingCycle: 'daily',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      type: 'Weekly',
      price: '$5',
      period: 'per week',
      icon: '🌟',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'No auto-renewal',
        'Save 29% vs daily',
      ],
      recommended: true,
      billingCycle: 'weekly',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      type: 'Monthly',
      price: '$15',
      period: 'per month',
      icon: '👑',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'No auto-renewal',
        'Save 39% vs daily',
        'Best value',
      ],
      recommended: false,
      billingCycle: 'monthly',
      gradient: 'from-purple-500 to-pink-600'
    },
  ]

  const handleSubscribe = async (plan: any) => {
    setErrorMessage(null)

    if (!state.isAuthenticated || !state.user) {
      const currentUrl = `/subscribe?agent=${encodeURIComponent(agentName)}&slug=${agentSlug}`
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    if (processingPlan) return

    setProcessingPlan(plan.billingCycle)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentSlug,
          agentName,
          plan: plan.billingCycle,
          userId: state.user.id,
          userEmail: state.user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success || !data.url) {
        if (data.alreadySubscribed && data.existingSubscription) {
          const expiryDate = new Date(data.existingSubscription.expiryDate).toLocaleDateString()
          throw new Error(
            `You already have an active ${data.existingSubscription.plan} subscription. ` +
            `It expires on ${expiryDate} (${data.existingSubscription.daysUntilRenewal || 0} days remaining).`
          )
        }
        throw new Error(data.error || 'Failed to start checkout session')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Stripe checkout error:', error)
      const message = error instanceof Error ? error.message : 'Unable to start checkout. Please try again.'
      setErrorMessage(message)
      setProcessingPlan(null)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-gray-400 text-lg">Checking access status...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background - Agents Page Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="subscribe-orb absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[150px]" />
        <div className="subscribe-orb absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[120px]" />
        <div className="subscribe-orb absolute top-2/3 left-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      {/* Floating Particles - Cyan Theme */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1.5 h-1.5 rounded-full bg-cyan-400/40"
            style={{
              left: `${5 + i * 6}%`,
              top: `${10 + (i % 5) * 18}%`
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-icon absolute top-[15%] left-[8%] text-4xl opacity-0">💳</div>
        <div className="floating-icon absolute top-[25%] right-[10%] text-3xl opacity-0">✨</div>
        <div className="floating-icon absolute bottom-[35%] left-[15%] text-4xl opacity-0">🔒</div>
        <div className="floating-icon absolute bottom-[20%] right-[12%] text-3xl opacity-0">🚀</div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Agent Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-3xl mb-8 shadow-2xl shadow-cyan-500/30">
            <span className="text-5xl">🤖</span>
          </div>

          <h1
            ref={titleRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent"
          >
            {agentName}
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            {activeSubscription
              ? `Manage your access to ${agentName}`
              : `Choose a one-time purchase plan for access to ${agentName}`}
          </p>

          {/* Warning Badge */}
          <div className="badge-pill inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm opacity-0">
            <span>⚠️</span>
            <span>One agent per purchase • No auto-renewal</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-8 px-4 relative z-10">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-center backdrop-blur-sm">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Active Subscription Card */}
      {activeSubscription && (
        <div className="max-w-3xl mx-auto mb-16 px-4 relative z-10">
          <div className="active-sub-card rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-green-500/30 backdrop-blur-sm p-8 shadow-2xl shadow-cyan-500/10 opacity-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Active Subscription
                </div>
                <h2 className="text-2xl font-bold text-white">You have access to {agentName}</h2>
              </div>
              <div className="celebrate-icon text-6xl">🎉</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 border border-cyan-500/20">
                <div className="text-sm text-gray-400 mb-1">Plan</div>
                <div className="text-xl font-bold text-white capitalize">{activeSubscription.plan}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-cyan-500/20">
                <div className="text-sm text-gray-400 mb-1">Time Remaining</div>
                <div className="text-xl font-bold text-cyan-400">{activeSubscription.daysUntilRenewal || 0} days</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-cyan-500/20">
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="text-xl font-bold text-green-400">Active</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="progress-fill h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full" style={{ width: 0 }} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/agents/${agentSlug}`}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold text-center hover:shadow-xl shadow-lg shadow-cyan-500/25 transition-all duration-300"
              >
                Open Agent Chat
              </Link>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                data-cancel-button
                className="flex-1 py-4 px-6 bg-white/5 border border-red-500/30 rounded-xl text-red-400 font-semibold hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Access'}
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-6 text-center">
              💡 After expiration or cancellation, you can purchase a new plan anytime
            </p>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      {!activeSubscription && (
        <div ref={cardsRef} className="relative px-4 pb-16 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {subscriptionPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`plan-card group relative rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm p-8 opacity-0 shadow-2xl shadow-cyan-500/10 ${
                    plan.recommended 
                      ? 'border-2 border-cyan-500/50 scale-105' 
                      : 'border border-gray-700/50 hover:border-cyan-500/30'
                  }`}
                  style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-purple-500/30 rounded-br-2xl" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {plan.recommended && (
                    <div className="recommended-badge absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white text-sm font-semibold shadow-lg shadow-cyan-500/30">
                      Most Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className={`plan-icon inline-flex text-4xl p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-4`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.type}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{plan.price}</span>
                        <span className="text-gray-400">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300">
                          <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingPlan !== null}
                      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        plan.recommended
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40'
                          : 'bg-white/10 text-white border border-gray-700/50 hover:bg-white/20 hover:border-cyan-500/30'
                      } ${processingPlan !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {processingPlan === plan.billingCycle ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        `Get ${plan.type} Access`
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="info-section relative py-16 px-4 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm p-8 border border-gray-700/50 shadow-2xl shadow-cyan-500/10">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/20 rounded-br-2xl pointer-events-none" />
            
            <h2 className="text-2xl font-bold text-white mb-8 text-center bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Important Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🔒',
                  title: 'Individual Purchases',
                  desc: 'Each agent requires its own purchase. No auto-renewal, no recurring charges.'
                },
                {
                  icon: '💳',
                  title: 'Unified Pricing',
                  desc: 'All agents use the same simple pricing: $1/day, $5/week, or $15/month.'
                },
                {
                  icon: '🔄',
                  title: 'Easy Cancellation',
                  desc: 'Cancel anytime. Access expires naturally at the end of your chosen period.'
                },
                {
                  icon: '⚡',
                  title: 'Instant Access',
                  desc: 'Once you purchase, you\'ll have immediate unlimited conversations.'
                }
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="info-card p-6 rounded-2xl bg-white/5 border border-gray-700/50 hover:border-cyan-500/30 transition-all opacity-0"
                  style={{ transform: 'translateY(30px)' }}
                >
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-cyan-400 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="relative py-12 px-4 text-center z-10">
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Agents
        </Link>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
            </div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  )
}
