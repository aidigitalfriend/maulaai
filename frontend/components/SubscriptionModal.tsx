'use client'

import { useState } from 'react'
import { XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '../../services/agentSubscriptionService'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: (plan: string) => Promise<void>
  agentName: string
  agentId: string
  isLoading?: boolean
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onSubscribe, 
  agentName,
  agentId,
  isLoading = false
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('daily')

  if (!isOpen) return null

  const handleSubscribe = async () => {
    try {
      await onSubscribe(selectedPlan)
      onClose()
    } catch (error) {
      // Error handling will be done in parent component
      console.error('Subscription error:', error)
    }
  }

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const baseFeatures = [
      'Unlimited chat messages',
      'Chat history saved',
      'Real-time responses',
      'Mobile & desktop access'
    ]
    
    switch(plan.id) {
      case 'daily':
        return [...baseFeatures, '24-hour access']
      case 'weekly':
        return [...baseFeatures, '7-day access', 'Priority support']
      case 'monthly':
        return [...baseFeatures, '30-day access', 'Priority support', 'Advanced features']
      default:
        return baseFeatures
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Subscribe to {agentName}
            </h2>
            <p className="text-gray-600 mt-1">
              Choose your plan to start chatting with {agentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative border rounded-xl p-6 cursor-pointer transition-all duration-200
                  ${selectedPlan === plan.id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                  ${plan.id === 'monthly' ? 'ring-2 ring-amber-200 border-amber-400' : ''}
                `}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {/* Best Value Badge */}
                {plan.id === 'monthly' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                      Best Value
                    </span>
                  </div>
                )}

                {/* Radio Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedPlan === plan.id
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedPlan === plan.id && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {plan.priceFormatted}
                    </div>
                    <div className="text-sm text-gray-500">
                      per {plan.period}
                    </div>
                  </div>
                </div>

                {/* Plan Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {plan.displayName}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {getPlanFeatures(plan).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Cancel anytime. No hidden fees.
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`
                  px-8 py-2 rounded-lg font-medium transition-colors
                  ${isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }
                `}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Subscribe to ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.displayName}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}