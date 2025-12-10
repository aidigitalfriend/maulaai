'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default function ConversationHistoryPage() {
  const { state } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

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

  // Fetch conversations
  const fetchConversations = async (page = 1, search = '') => {
    try {
      if (search) setSearching(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(
        `https://onelastai.co/api/user/conversations/${state.user.id}?${params}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        setConversations(result.data.conversations);
        setPagination(result.data.pagination);
      } else {
        console.error('Failed to fetch conversations');
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (state.user?.id) {
      fetchConversations();
    }
  }, [state.user]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchConversations(1, searchTerm.trim());
    } else {
      fetchConversations(1);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchConversations(newPage, searchTerm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
                Conversation History
              </h1>
              <p className="text-neural-600">
                Review and manage your past interactions
              </p>
            </div>
            <Link href="/dashboard/overview" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neural-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neural-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-brand-500 text-white text-sm rounded hover:bg-brand-600 disabled:opacity-50"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Conversations List */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-4xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p className="text-neural-600">Loading your conversations...</p>
            </div>
          ) : conversations.length > 0 ? (
            <>
              <div className="space-y-4 mb-8">
                {conversations.map((conv, i) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-white rounded-lg border border-neural-200 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-brand-500 mr-2" />
                          <h3 className="font-semibold text-neural-900">
                            {conv.agent}
                          </h3>
                        </div>
                        <p className="text-neural-700 mb-2">{conv.topic}</p>
                        {conv.lastMessage && (
                          <p className="text-sm text-neural-500">
                            "{conv.lastMessage.content}"
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-neural-600">{conv.date}</p>
                        <p className="text-xs text-neural-500">
                          {conv.duration}
                        </p>
                        <p className="text-xs text-neural-500">
                          {conv.messageCount} messages
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="flex items-center px-4 py-2 border border-neural-200 rounded-lg hover:bg-neural-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </button>

                  <span className="text-neural-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center px-4 py-2 border border-neural-200 rounded-lg hover:bg-neural-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-neural-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neural-900 mb-2">
                No conversations found
              </h3>
              <p className="text-neural-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Start a conversation to see your history here'}
              </p>
              <Link
                href="/dashboard/overview"
                className="btn-primary inline-block"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
