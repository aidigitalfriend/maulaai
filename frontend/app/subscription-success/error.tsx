'use client';

import Link from 'next/link';

export default function SubscriptionSuccessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">
      <div className="container-custom section-padding-lg flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-4xl mb-6">
          ⚠️
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-neural-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-red-600 max-w-2xl mb-8">
          We encountered an error while processing your subscription. This is
          usually temporary.
        </p>

        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 w-full max-w-2xl mb-8">
          <h3 className="text-lg font-semibold text-neural-900 mb-3">
            Error Details
          </h3>
          <p className="text-sm text-neural-600 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-neural-400">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-xl">
          <button
            onClick={reset}
            className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex-1 py-3 px-6 rounded-lg font-semibold border border-brand-600 text-brand-600 hover:bg-brand-50 transition-colors text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/support/contact-us"
            className="flex-1 py-3 px-6 rounded-lg font-semibold border border-red-600 text-red-600 hover:bg-red-50 transition-colors text-center"
          >
            Contact Support
          </Link>
        </div>

        <div className="mt-8 text-sm text-neural-500">
          <p>
            If this problem persists, please contact our support team with the
            error details above.
          </p>
        </div>
      </div>
    </div>
  );
}
