'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

export default function ConversationHistoryPage() {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neural-900 mb-4">
            Please log in to view conversations
          </h1>
          <Link href="/auth/login" className="btn-primary inline-block">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const conversations = [
    {
      id: 1,
      agent: 'Tech Wizard',
      topic: 'API Integration Help',
      date: '2024-01-15',
      duration: '12m',
    },
    {
      id: 2,
      agent: 'Einstein',
      topic: 'Physics Concepts',
      date: '2024-01-14',
      duration: '8m',
    },
    {
      id: 3,
      agent: 'Chef Biew',
      topic: 'Recipe Suggestions',
      date: '2024-01-13',
      duration: '15m',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
            Conversation History
          </h1>
          <p className="text-neural-600">
            Review and manage your past interactions
          </p>
        </div>
      </section>

      {/* Conversations List */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-2xl">
          <div className="space-y-4 mb-8">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white rounded-lg border border-neural-200 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-neural-900 mb-1">
                      {conv.agent}
                    </h3>
                    <p className="text-sm text-neural-600">{conv.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neural-600">{conv.date}</p>
                    <p className="text-xs text-neural-500">{conv.duration}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty state message */}
          <div className="bg-neural-50 rounded-lg p-8 text-center border border-dashed border-neural-300">
            <p className="text-neural-600 mb-4">
              Load more conversations or search history
            </p>
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
