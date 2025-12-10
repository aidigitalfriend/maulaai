'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  CreditCardIcon,
  DocumentTextIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default function BillingPage() {
  const { state } = useAuth();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neural-900 mb-4">
            Please log in to view billing
          </h1>
          <Link href="/auth/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // Fetch billing data on mount
  useEffect(() => {
    if (state.user?.id) {
      fetchBillingData();
    }
  }, [state.user]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://onelastai.co/api/user/billing/${state.user.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setBillingData(result.data);
      } else {
        setError('Failed to load billing data');
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Error loading billing information');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neural-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchBillingData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
                Billing & Usage
              </h1>
              <p className="text-neural-600">
                Manage your subscription and payment methods
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                billingData?.currentPlan?.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  billingData?.currentPlan?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                {billingData?.currentPlan?.status?.charAt(0).toUpperCase() + billingData?.currentPlan?.status?.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Overview */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-3xl">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-lg border border-neural-200 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neural-900">
                Current Plan
              </h2>
              <CreditCardIcon className="w-6 h-6 text-brand-500" />
            </div>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-neural-600 text-sm mb-1">Plan Type</p>
                <p className="text-lg font-semibold text-neural-900">
                  {billingData?.currentPlan?.name}
                </p>
              </div>
              <div>
                <p className="text-neural-600 text-sm mb-1">
                  {billingData?.currentPlan?.period?.charAt(0).toUpperCase() + billingData?.currentPlan?.period?.slice(1)} Cost
                </p>
                <p className="text-lg font-semibold text-neural-900">
                  ${billingData?.currentPlan?.price?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-neural-600 text-sm mb-1">Renewal Date</p>
                <p className="text-lg font-semibold text-neural-900">
                  {billingData?.currentPlan?.renewalDate}
                </p>
              </div>
              <div>
                <p className="text-neural-600 text-sm mb-1">Days Until Renewal</p>
                <p className="text-lg font-semibold text-neural-900">
                  {billingData?.currentPlan?.daysUntilRenewal} days
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/pricing" className="btn-secondary">
                {billingData?.currentPlan?.type === 'free' ? 'Upgrade Plan' : 'Change Plan'}
              </Link>
              {billingData?.currentPlan?.type !== 'free' && (
                <button className="btn-outline text-red-600 border-red-200 hover:bg-red-50">
                  Cancel Subscription
                </button>
              )}
            </div>
          </motion.div>

          {/* Usage Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-lg border border-neural-200 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neural-900">
                Usage This Period
              </h2>
              <ChartBarIcon className="w-6 h-6 text-brand-500" />
            </div>
            <div className="text-sm text-neural-600 mb-4">
              Billing period: {billingData?.usage?.billingCycle?.start} to {billingData?.usage?.billingCycle?.end}
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-neural-600">API Calls</p>
                  <span className="text-sm font-medium text-neural-900">
                    {billingData?.usage?.currentPeriod?.apiCalls?.percentage}%
                  </span>
                </div>
                <div className="w-full bg-neural-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      billingData?.usage?.currentPeriod?.apiCalls?.percentage > 80 
                        ? 'bg-red-500' 
                        : billingData?.usage?.currentPeriod?.apiCalls?.percentage > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-brand-500'
                    }`}
                    style={{ width: `${billingData?.usage?.currentPeriod?.apiCalls?.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neural-500 mt-1">
                  {billingData?.usage?.currentPeriod?.apiCalls?.used?.toLocaleString()} / {billingData?.usage?.currentPeriod?.apiCalls?.limit?.toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-neural-600">Storage</p>
                  <span className="text-sm font-medium text-neural-900">
                    {billingData?.usage?.currentPeriod?.storage?.percentage}%
                  </span>
                </div>
                <div className="w-full bg-neural-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      billingData?.usage?.currentPeriod?.storage?.percentage > 80 
                        ? 'bg-red-500' 
                        : billingData?.usage?.currentPeriod?.storage?.percentage > 60 
                          ? 'bg-yellow-500' 
                          : 'bg-brand-500'
                    }`}
                    style={{ width: `${billingData?.usage?.currentPeriod?.storage?.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neural-500 mt-1">
                  {(billingData?.usage?.currentPeriod?.storage?.used / 1024)?.toFixed(1)} GB / {(billingData?.usage?.currentPeriod?.storage?.limit / 1024)?.toFixed(1)} GB
                </p>
              </div>
            </div>
            
            {/* Upcoming Charges */}
            {billingData?.upcomingCharges?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-neural-100">
                <h3 className="text-sm font-medium text-neural-900 mb-3">Upcoming Charges</h3>
                {billingData.upcomingCharges.map((charge, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-neural-600">{charge.description}</span>
                    <span className="font-medium text-neural-900">{charge.amount} on {charge.date}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-white rounded-lg border border-neural-200 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neural-900">
                Recent Invoices
              </h2>
              <DocumentTextIcon className="w-6 h-6 text-brand-500" />
            </div>
            {billingData?.invoices?.length > 0 ? (
              <div className="space-y-3">
                {billingData.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center p-4 bg-neural-50 rounded-lg hover:bg-neural-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-neural-900">{inv.number}</p>
                      <p className="text-sm text-neural-600">{inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neural-900">
                        {inv.amount}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : inv.status === 'due'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-neural-300 mx-auto mb-3" />
                <p className="text-neural-500">No invoices found</p>
                <p className="text-sm text-neural-400 mt-1">Invoices will appear here when generated</p>
              </div>
            )}
          </motion.div>
          
          {/* Cost Breakdown */}
          {billingData?.costBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-white rounded-lg border border-neural-200 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neural-900">
                  Cost Breakdown
                </h2>
                <BanknotesIcon className="w-6 h-6 text-brand-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neural-600">Subscription</span>
                  <span className="font-medium">${billingData.costBreakdown.subscription?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neural-600">Usage Overages</span>
                  <span className="font-medium">${billingData.costBreakdown.usage?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neural-600">Taxes & Fees</span>
                  <span className="font-medium">${billingData.costBreakdown.taxes?.toFixed(2)}</span>
                </div>
                <div className="border-t border-neural-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-neural-900">Total</span>
                    <span className="font-bold text-lg text-neural-900">${billingData.costBreakdown.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/dashboard/overview"
              className="btn-secondary inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
