'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function PaymentContent() {
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
      // Build the current page URL to return to after login
      const currentUrl = `/payment?agent=${encodeURIComponent(
        agentName
      )}&slug=${agentSlug}&plan=${plan}&price=${price}&period=${period}`;
      const loginUrl = buildLoginUrl(currentUrl);
      router.push(loginUrl);
    } else if (state.user) {
      // Get user info from auth state
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
    let value = e.target.value.replace(/\s/g, ''); // Remove spaces
    let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim(); // Add space every 4 digits
    e.target.value = formattedValue;

    // Auto-advance when 16 digits entered
    if (value.length === 16 && expiryRef.current) {
      expiryRef.current.focus();
    }
  };

  // Auto-format expiry date as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;

    // Auto-advance when MM/YY complete (5 characters)
    if (e.target.value.length === 5 && cvvRef.current) {
      cvvRef.current.focus();
    }
  };

  // Auto-advance CVV
  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    e.target.value = value.slice(0, 3); // Max 3 digits

    // Auto-advance when 3 digits entered
    if (value.length === 3 && billingNameRef.current) {
      billingNameRef.current.focus();
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Get user info from auth state
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

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentSlug,
          agentName: agentName,
          plan: period, // 'daily', 'weekly', or 'monthly'
          userId: userId,
          userEmail: userEmail,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-6xl mb-6">💳</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Complete Your Subscription
          </h1>
          <p className="text-xl text-neural-600">
            You're about to subscribe to{' '}
            <span className="font-semibold text-brand-600">{agentName}</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer border-brand-600">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-brand-600"
                  />
                  <span className="text-2xl">💳</span>
                  <span className="font-medium">Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-brand-600"
                    disabled
                  />
                  <span className="text-2xl">🅿️</span>
                  <span className="font-medium">PayPal (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Card Form (shown when card is selected) */}
            {paymentMethod === 'card' && (
              <div className="space-y-6">
                {/* Account Information - Read Only */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-blue-900 mb-3">
                    Account Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">
                        Full Name
                      </label>
                      <div className="bg-white px-3 py-2 rounded border border-blue-200 text-sm font-semibold text-brand-600">
                        {userInfo?.name || 'Loading...'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800 mb-1">
                        Email Address
                      </label>
                      <div className="bg-white px-3 py-2 rounded border border-blue-200 text-sm font-semibold text-brand-600">
                        {userInfo?.email || 'Loading...'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    ℹ️ Your account details are pre-filled and cannot be changed
                    during checkout
                  </p>
                </div>

                {/* Card Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    ref={cardNumberRef}
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    onChange={handleCardNumberChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-lg font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      ref={expiryRef}
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={handleExpiryChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      ref={cvvRef}
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      onChange={handleCVVChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-lg font-mono"
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-sm text-gray-900 mb-4">
                    Billing Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        ref={billingNameRef}
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        placeholder="123 Main Street"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Apartment, suite, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="New York"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          placeholder="NY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="10001"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="JP">Japan</option>
                          <option value="TH">Thailand</option>
                          <option value="SG">Singapore</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-3">
                  <span className="text-2xl">🔒</span>
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-xs">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Notice */}
            {paymentMethod === 'paypal' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  You'll be redirected to PayPal to complete your payment
                  securely.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Agent:</span>
                <span className="font-semibold">{agentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold capitalize">{plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing Cycle:</span>
                <span className="font-semibold">Every {billing.cycle}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-brand-600">${billing.amount} USD</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">What's Included:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited conversations with {agentName}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time responses
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Voice interaction (if supported)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Cancel anytime
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Next billing:</strong> In {billing.nextBilling} from
                today
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Subscribe for ${price}/${billing.cycle}`
              )}
            </button>

            {/* Legal & Policy Information */}
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">📋</span> Terms & Conditions
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  By subscribing, you agree to our Terms of Service. Your
                  subscription will auto-renew at the end of each billing cycle.
                  You maintain full control and can cancel anytime.
                </p>
                <Link
                  href="/terms"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center"
                >
                  Read More →
                </Link>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <span className="mr-2">🔄</span> Refund Policy
                </h4>
                <p className="text-xs text-green-700 leading-relaxed mb-2">
                  We offer a 7-day money-back guarantee. If you're not satisfied
                  with your subscription, contact us within 7 days for a full
                  refund, no questions asked.
                </p>
                <Link
                  href="/refund-policy"
                  className="text-xs font-semibold text-green-700 hover:text-green-800 transition-colors inline-flex items-center"
                >
                  Read More →
                </Link>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="mr-2">🔒</span> Privacy Policy
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed mb-2">
                  Your privacy is our priority. We never share your personal
                  information with third parties. All data is encrypted and
                  stored securely in compliance with GDPR and CCPA.
                </p>
                <Link
                  href="/privacy-policy"
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors inline-flex items-center"
                >
                  Read More →
                </Link>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                  <span className="mr-2">✨</span> Satisfaction Guarantee
                </h4>
                <ul className="text-xs text-purple-700 space-y-1 mb-2">
                  <li>• Cancel anytime from your dashboard</li>
                  <li>• No hidden fees or charges</li>
                  <li>• 24/7 customer support</li>
                  <li>• Instant access to all features</li>
                </ul>
                <Link
                  href="/support"
                  className="text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors inline-flex items-center"
                >
                  Read More →
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Questions? Contact us at{' '}
              <span className="font-semibold text-brand-600">
                support@onelastai.com
              </span>
            </p>
          </div>
        </div>

        {/* Back Links */}
        <div className="flex gap-6 justify-center mt-12">
          <Link
            href={`/subscribe?agent=${encodeURIComponent(
              agentName
            )}&slug=${agentSlug}`}
            className="text-brand-600 hover:text-brand-700 transition-colors"
          >
            ← Back to Plan Selection
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/agents"
            className="text-brand-600 hover:text-brand-700 transition-colors"
          >
            Back to All Agents →
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p>Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
