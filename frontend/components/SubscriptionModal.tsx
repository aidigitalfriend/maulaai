'use client';

import {
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSubscribeRedirect } from '../hooks/useSubscribeRedirect';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string;
  agentDescription?: string;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  agentName,
  agentId,
  agentDescription,
}: SubscriptionModalProps) {
  const redirectToSubscribe = useSubscribeRedirect(agentName, agentId);

  if (!isOpen) return null;

  const handleRedirectNow = () => {
    redirectToSubscribe();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
              Subscription required
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              Redirecting to subscribe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close subscription modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full border-2 border-indigo-200 border-b-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">
            Almost there...
          </h3>
          <p className="text-indigo-700">
            We're sending you to the subscription center for{' '}
            <span className="font-semibold">{agentName}</span>. You'll pick a
            plan and complete checkout on the next screen.
          </p>
          {agentDescription && (
            <p className="text-sm text-indigo-600 mt-3">{agentDescription}</p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRedirectNow}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Continue to subscribe
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center font-medium py-3 px-4 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-white"
            >
              Stay here
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          You'll only need to do this once. After subscribing, you'll have
          instant access to unlimited chats.
        </p>
      </div>
    </div>
  );
}
