'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CreditCard, Shield, Clock, Check, Lock, ArrowLeft, ArrowRight, FileText, RefreshCw, Sparkles } from 'lucide-react';

function PaymentContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // Form refs for auto-advance
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const billingNameRef = useRef<HTMLInputElement>(null);

  const agentName = searchParams.get('agent') || 'AI Agent';
  const agentSlug = searchParams.get('slug') || 'agent';
  const plan = searchParams.get('plan') || 'daily';
  const price = searchParams.get('price') || '$1';
  const period = searchParams.get('period') || 'daily';

  // Helper function to build login URL with return path
  const buildLoginUrl = (returnUrl: string) => {
    return `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
  };

  // Check authentication and get user info on mount
  useEffect(() => {
    if (state.isLoading) {
      return;
    }

    if (!state.isAuthenticated) {
      const currentUrl = `/payment?agent=${encodeURIComponent(
        agentName
      )}&slug=${agentSlug}&plan=${plan}&price=${price}&period=${period}`;
      const loginUrl = buildLoginUrl(currentUrl);
      router.push(loginUrl);
    } else if (state.user) {
      setUserInfo({
        name: state.user.name || 'User',
        email: state.user.email || '',
      });
    }
  }, [
    state.isLoading,
    state.isAuthenticated,
    state.user,
    agentName,
    agentSlug,
    plan,
    price,
    period,
    router,
  ]);

  // Calculate billing details
  const getBillingDetails = () => {
    switch (period) {
      case 'daily':
        return { amount: 1, cycle: 'day', nextBilling: '24 hours' };
      case 'weekly':
        return { amount: 5, cycle: 'week', nextBilling: '7 days' };
      case 'monthly':
        return { amount: 19, cycle: 'month', nextBilling: '30 days' };
      default:
        return { amount: 1, cycle: 'day', nextBilling: '24 hours' };
    }
  };

  const billing = getBillingDetails();

  // Auto-format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = formattedValue;
    if (value.length === 16 && expiryRef.current) {
      expiryRef.current.focus();
    }
  };

  // Auto-format expiry date as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
    if (e.target.value.length === 5 && cvvRef.current) {
      cvvRef.current.focus();
    }
  };

  // Auto-advance CVV
  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.slice(0, 3);
    if (value.length === 3 && billingNameRef.current) {
      billingNameRef.current.focus();
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      if (!state.isAuthenticated || !state.user) {
        alert('Please log in to continue');
        router.push(
          buildLoginUrl(window.location.pathname + window.location.search)
        );
        return;
      }

      const userId =
        state.user.id || localStorage.getItem('userId') || 'user_' + Date.now();
      const userEmail =
        state.user.email ||
        localStorage.getItem('userEmail') ||
        'user@example.com';

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentSlug,
          agentName: agentName,
          plan: period,
          userId: userId,
          userEmail: userEmail,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert('Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.header-icon', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
    })
      .from('.header-title', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.2')
      .from('.header-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.3')
      .from('.form-card', {
        opacity: 0,
        x: -30,
        duration: 0.6,
      }, '-=0.2')
      .from('.summary-card', {
        opacity: 0,
        x: 30,
        duration: 0.6,
      }, '-=0.4');
  }, { scope: containerRef });

  const inputStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative py-16 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="header-icon text-6xl mb-6">💳</div>
          <h1 className="header-title text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Complete Your Purchase
            </span>
          </h1>
          <p className="header-subtitle text-xl text-white/60">
            You&apos;re about to purchase access to{' '}
            <span className="font-semibold text-purple-400">{agentName}</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div 
            className="form-card p-8 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Payment Details</h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                <label 
                  className="flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: paymentMethod === 'card' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: paymentMethod === 'card' ? '2px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-purple-500"
                  />
                  <CreditCard className="w-6 h-6 text-purple-400" />
                  <span className="font-medium text-white">Credit/Debit Card</span>
                </label>
                <label 
                  className="flex items-center space-x-3 p-4 rounded-xl cursor-not-allowed opacity-50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    disabled
                    className="text-purple-500"
                  />
                  <span className="text-2xl">🅿️</span>
                  <span className="font-medium text-white/50">PayPal (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Card Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-6">
                {/* Account Information */}
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <h3 className="font-semibold text-sm text-cyan-400 mb-3">
                    Account Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">
                        Full Name
                      </label>
                      <div 
                        className="px-3 py-2 rounded text-sm font-semibold text-purple-400"
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        {userInfo?.name || 'Loading...'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1">
                        Email Address
                      </label>
                      <div 
                        className="px-3 py-2 rounded text-sm font-semibold text-purple-400"
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        {userInfo?.email || 'Loading...'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-cyan-400/70 mt-2">
                    ℹ️ Your account details are pre-filled
                  </p>
                </div>

                {/* Card Details */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Card Number
                  </label>
                  <input
                    ref={cardNumberRef}
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    onChange={handleCardNumberChange}
                    className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg font-mono"
                    style={inputStyles}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Expiry Date
                    </label>
                    <input
                      ref={expiryRef}
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={handleExpiryChange}
                      className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg font-mono"
                      style={inputStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      CVV
                    </label>
                    <input
                      ref={cvvRef}
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      onChange={handleCVVChange}
                      className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg font-mono"
                      style={inputStyles}
                    />
                  </div>
                </div>

                {/* Security Badge */}
                <div 
                  className="p-3 rounded-xl flex items-center space-x-3"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-400">Secure Payment</p>
                    <p className="text-xs text-emerald-400/70">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div 
            className="summary-card p-8 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Agent:</span>
                <span className="font-semibold text-white">{agentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Plan:</span>
                <span className="font-semibold capitalize text-white">{plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Access Period:</span>
                <span className="font-semibold capitalize text-white">
                  {billing.cycle === 'day'
                    ? '1 Day'
                    : billing.cycle === 'week'
                    ? '1 Week'
                    : '1 Month'}
                </span>
              </div>
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-purple-400">${billing.amount} USD</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl p-4 mb-6"
              style={{ background: 'rgba(255, 255, 255, 0.03)' }}
            >
              <h3 className="font-semibold mb-3 text-white">What&apos;s Included:</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Unlimited conversations with {agentName}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Real-time responses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Voice interaction (if supported)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Cancel anytime
                </li>
              </ul>
            </div>

            <div 
              className="rounded-xl p-4 mb-6"
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
              }}
            >
              <p className="text-cyan-400 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  <strong>Access expires:</strong> In {billing.nextBilling} (NO auto-renewal)
                </span>
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(168, 85, 247, 0.4)',
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Purchase {billing.cycle === 'day' ? 'Daily' : billing.cycle === 'week' ? 'Weekly' : 'Monthly'} Access for {price}
                </span>
              )}
            </button>

            {/* Policy Cards */}
            <div className="mt-6 space-y-3">
              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Terms & Conditions
                </h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  One-time purchase with NO auto-renewal.
                </p>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refund Policy
                </h4>
                <p className="text-xs text-emerald-400/70 leading-relaxed">
                  All sales are final. No refunds.
                </p>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                }}
              >
                <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Satisfaction Guarantee
                </h4>
                <p className="text-xs text-purple-400/70 leading-relaxed">
                  24/7 support • No hidden fees • Instant access
                </p>
              </div>
            </div>

            <p className="text-xs text-white/30 text-center mt-6">
              Questions? Contact us at{' '}
              <span className="font-semibold text-purple-400">
                support@onelastai.com
              </span>
            </p>
          </div>
        </div>

        {/* Back Links */}
        <div className="flex gap-6 justify-center mt-12">
          <Link
            href={`/subscribe?agent=${encodeURIComponent(agentName)}&slug=${agentSlug}`}
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plan Selection
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/agents"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            Back to All Agents
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white/60">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
