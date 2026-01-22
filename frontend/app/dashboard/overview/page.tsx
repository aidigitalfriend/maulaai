'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  ShieldCheckIcon,
  CogIcon,
  GiftIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

// Helper function for API calls with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// API data fetching functions
const fetchUserData = async (userId: string) => {
  const [profileRes, rewardsRes] = await Promise.all([
    fetchWithTimeout(`/api/user/profile`, {
      credentials: 'include',
      cache: 'no-store',
    }),
    fetchWithTimeout(`/api/user/rewards/${userId}`, {
      credentials: 'include',
      cache: 'no-store',
    }),
  ]);

  if (!profileRes) {
    throw new Error('Unable to reach profile service');
  }

  const profileJson = await profileRes.json();
  if (!profileRes.ok || !profileJson?.profile) {
    throw new Error(profileJson?.message || 'Failed to load profile');
  }

  if (!rewardsRes) {
    throw new Error('Unable to reach rewards service');
  }

  const rewardsJson = await rewardsRes.json();
  if (!rewardsRes.ok) {
    throw new Error(rewardsJson?.message || 'Failed to load rewards');
  }

  return {
    profile: profileJson.profile,
    rewards: rewardsJson.data,
  };
};

const formatLanguagePreference = (language: any): string => {
  if (!language) return 'Not set';

  if (typeof language === 'string') {
    return language;
  }

  if (typeof language === 'object') {
    const primary = language.primary || language.code || '';
    const secondary = language.secondary || '';
    const parts = [primary, secondary].filter(Boolean).join(' / ');

    const autoDetectLabel =
      typeof language.autoDetect === 'boolean'
        ? language.autoDetect
          ? ' (Auto-detect on)'
          : ' (Auto-detect off)'
        : '';

    if (parts) {
      return `${parts}${autoDetectLabel}`.trim();
    }

    const objectValues = Object.values(language)
      .filter((value) => value !== undefined && value !== null)
      .join(', ');

    return objectValues || 'Not set';
  }

  return String(language);
};

export default function DashboardOverviewPage() {
  const { state } = useAuth(); // Get authenticated user
  const [userProfile, setUserProfile] = useState<any>(null);
  const [securitySettings, setSecuritySettings] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    if (!state.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [profileRewards, securityRes, preferencesRes] = await Promise.all([
        fetchUserData(state.user.id),
        fetchWithTimeout(`/api/user/security/${state.user.id}`, {
          credentials: 'include',
          cache: 'no-store',
        }),
        fetchWithTimeout(`/api/user/preferences/${state.user.id}`, {
          credentials: 'include',
          cache: 'no-store',
        }),
      ]);

      if (profileRewards) {
        const profile = profileRewards.profile;
        setUserProfile({
          ...profile,
          joinedDate: profile.createdAt
            ? new Date(profile.createdAt).toISOString().split('T')[0]
            : 'N/A',
          lastActive: profile.updatedAt
            ? new Date(profile.updatedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
        setRewards(profileRewards.rewards || null);
      }

      if (securityRes) {
        const securityJson = await securityRes.json();
        if (!securityRes.ok) {
          throw new Error(
            securityJson?.message || 'Failed to load security data'
          );
        }
        setSecuritySettings(securityJson.data);
      }

      if (preferencesRes) {
        const preferencesJson = await preferencesRes.json();
        if (!preferencesRes.ok) {
          throw new Error(
            preferencesJson?.message || 'Failed to load preferences'
          );
        }
        setPreferences(preferencesJson.data);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(
        err instanceof Error ? err.message : 'Unable to load dashboard data'
      );
    } finally {
      setIsLoading(false);
    }
  }, [state.user?.id]);

  useEffect(() => {
    if (!state.user?.id) {
      setIsLoading(false);
      return;
    }
    loadUserData();
  }, [state.user?.id, loadUserData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      label: 'AI Interactions',
      value: rewards?.rewardHistory?.length ?? 0,
    },
    {
      label: 'Days Active',
      value: rewards?.statistics?.daysActive ?? 0,
    },
    {
      label: 'Features Customized',
      value: preferences?.dashboard?.widgets?.length ?? 0,
    },
    {
      label: 'Security Score',
      value: securitySettings?.securityScore ?? 0,
      suffix: '%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Dashboard Overview */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dashboard Overview
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get started with your analytics and insights
          </p>

          {/* Go to Dashboard button in hero section */}
          <Link
            href="/dashboard"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg shadow-blue-900/25"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* Main Dashboard Sections */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div>
                <p className="font-semibold text-red-800">
                  Unable to refresh some account data
                </p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button
                onClick={loadUserData}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors self-start md:self-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Retry'}
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Profile Section */}
            <Link href="/dashboard/profile" className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      User Profile
                    </h3>
                    <p className="text-gray-600">
                      Manage your personal information
                    </p>
                  </div>
                </div>

                {userProfile && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/25">
                        {userProfile.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {userProfile.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>📍 {userProfile.location}</p>
                      <p>
                        💼 {userProfile.profession} at {userProfile.company}
                      </p>
                      <p>
                        📅 Member since{' '}
                        {new Date(userProfile.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700">
                  View and edit profile →
                </div>
              </div>
            </Link>

            {/* Security Settings Section */}
            <Link href="/dashboard/security" className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-green-300 transition-all">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/25">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Security Settings
                    </h3>
                    <p className="text-gray-600">
                      Password, 2FA, and security options
                    </p>
                  </div>
                </div>

                {securitySettings && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Two-Factor Authentication
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          securitySettings.twoFactorEnabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {securitySettings.twoFactorEnabled
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p>
                        🔐 Password last changed:{' '}
                        {new Date(
                          securitySettings.passwordLastChanged
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        📱 {securitySettings.trustedDevices?.length || 0}{' '}
                        trusted devices
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-emerald-700">
                  Manage security settings →
                </div>
              </div>
            </Link>

            {/* Preferences Section */}
            <Link href="/dashboard/preferences" className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-purple-300 transition-all">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/25">
                    <CogIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Preferences
                    </h3>
                    <p className="text-gray-600">
                      Themes, languages, and settings
                    </p>
                  </div>
                </div>

                {preferences && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Theme</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {preferences.theme}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Language</p>
                        <p className="font-medium text-gray-900">
                          {formatLanguagePreference(preferences.language)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p>🌍 {preferences.timezone}</p>
                      <p>💰 Currency: {preferences.currency}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700">
                  Customize preferences →
                </div>
              </div>
            </Link>

            {/* Rewards Center Section */}
            <Link href="/dashboard/rewards" className="group">
              <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-yellow-300 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-bl-[4rem] opacity-10"></div>

                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-yellow-500/25">
                    <GiftIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Rewards Center
                    </h3>
                    <p className="text-gray-600">
                      Points, badges, and achievements
                    </p>
                  </div>
                </div>

                {rewards && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {rewards?.totalPoints?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-gray-600">Total Points</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-5 h-5 text-yellow-500" />
                          <span className="text-lg font-semibold text-gray-900">
                            Level {rewards?.currentLevel || 1}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {rewards?.pointsToNextLevel || 0} to next level
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {rewards?.badges
                        ?.slice(0, 3)
                        .map((badge: any, idx: number) => (
                          <div key={idx} className="text-center p-2 bg-gray-50 rounded-xl">
                            <div className="text-2xl mb-1">
                              {badge.icon || '🎖️'}
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {badge.name}
                            </p>
                          </div>
                        )) || (
                        <div className="col-span-3 text-center text-gray-500 p-3 bg-gray-50 rounded-xl">
                          <div className="text-2xl mb-1">🎖️</div>
                          <p className="text-xs">No badges yet</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        🔥 {rewards?.streaks?.current || 0} day streak
                      </span>
                      <span className="text-gray-700">
                        🏆 {rewards?.badges?.length || 0} badges earned
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm font-medium bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent group-hover:from-yellow-700 group-hover:to-orange-700">
                  Explore rewards →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Activity Overview
            </h2>
            <p className="text-lg text-gray-600">
              Track your progress and engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}{' '}
                  {stat.suffix || ''}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
