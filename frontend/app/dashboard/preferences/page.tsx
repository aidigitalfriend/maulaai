'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Cog6ToothIcon,
  PaintBrushIcon,
  BellIcon,
  GlobeAltIcon,
  EyeIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
  DevicePhoneMobileIcon,
  LanguageIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    theme: {
      mode: 'light', // light, dark, system
      primaryColor: 'brand', // brand, blue, green, purple, orange
      fontSize: 'medium', // small, medium, large
      compactMode: false
    },
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate', // immediate, daily, weekly
        types: {
          system: true,
          security: true,
          updates: true,
          marketing: false,
          community: true
        }
      },
      push: {
        enabled: true,
        quiet: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      },
      desktop: {
        enabled: false,
        sound: true
      }
    },
    language: {
      primary: 'en',
      secondary: 'es',
      autoDetect: true
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNavigation: true
    },
    privacy: {
      profileVisibility: 'public', // public, private, friends
      activityTracking: true,
      analytics: true,
      dataSharing: false
    },
    advanced: {
      autoSave: true,
      autoBackup: true,
      debugMode: false,
      betaFeatures: false
    }
  })

  const updatePreference = (path, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev }
      const keys = path.split('.')
      let current = newPrefs
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newPrefs
    })
  }

  const themes = [
    { id: 'light', name: 'Light', icon: SunIcon, description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes in low light' },
    { id: 'system', name: 'System', description: 'Matches your device settings' }
  ]

  const colors = [
    { id: 'brand', name: 'Brand Blue', color: 'bg-brand-500' },
    { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
    { id: 'green', name: 'Forest Green', color: 'bg-green-500' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-500' },
    { id: 'orange', name: 'Sunset Orange', color: 'bg-orange-500' }
  ]

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'zh', name: 'Chinese', native: '中文' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
                Preferences
              </h1>
              <p className="text-neural-600">Customize your experience and interface settings</p>
            </div>
            <Link href="/dashboard/overview" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Preferences Content */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-4xl">
          <div className="space-y-8">
            
            {/* Appearance Settings */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center mb-6">
                <PaintBrushIcon className="w-6 h-6 text-brand-500 mr-3" />
                <h3 className="text-xl font-semibold text-neural-900">Appearance</h3>
              </div>
              
              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <h4 className="font-medium text-neural-900 mb-3">Theme Mode</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => updatePreference('theme.mode', theme.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          preferences.theme.mode === theme.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-neural-200 hover:border-neural-300'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          {theme.icon && <theme.icon className="w-5 h-5 mr-2" />}
                          <h5 className="font-medium text-neural-900">{theme.name}</h5>
                        </div>
                        <p className="text-sm text-neural-600">{theme.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Color */}
                <div>
                  <h4 className="font-medium text-neural-900 mb-3">Primary Color</h4>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        onClick={() => updatePreference('theme.primaryColor', color.id)}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          preferences.theme.primaryColor === color.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-neural-200 hover:border-neural-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${color.color} mr-2`}></div>
                        <span className="text-sm font-medium text-neural-900">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <h4 className="font-medium text-neural-900 mb-3">Font Size</h4>
                  <div className="flex space-x-4">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updatePreference('theme.fontSize', size)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          preferences.theme.fontSize === size
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-neural-200 hover:border-neural-300'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neural-900">Compact Mode</h4>
                    <p className="text-sm text-neural-600">Reduce spacing and padding for more content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.theme.compactMode}
                      onChange={(e) => updatePreference('theme.compactMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center mb-6">
                <BellIcon className="w-6 h-6 text-brand-500 mr-3" />
                <h3 className="text-xl font-semibold text-neural-900">Notifications</h3>
              </div>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="border border-neural-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-neural-900">Email Notifications</h4>
                      <p className="text-sm text-neural-600">Receive updates and alerts via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.notifications.email.enabled}
                        onChange={(e) => updatePreference('notifications.email.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                  
                  {preferences.notifications.email.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neural-700 mb-2">Frequency</label>
                        <select 
                          value={preferences.notifications.email.frequency}
                          onChange={(e) => updatePreference('notifications.email.frequency', e.target.value)}
                          className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Summary</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neural-700 mb-3">Notification Types</label>
                        <div className="space-y-3">
                          {Object.entries(preferences.notifications.email.types).map(([type, enabled]) => (
                            <div key={type} className="flex items-center justify-between">
                              <span className="text-sm text-neural-700 capitalize">
                                {type === 'system' && 'System Updates'}
                                {type === 'security' && 'Security Alerts'}
                                {type === 'updates' && 'Product Updates'}
                                {type === 'marketing' && 'Marketing & Promotions'}
                                {type === 'community' && 'Community Activity'}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={enabled}
                                  onChange={(e) => updatePreference(`notifications.email.types.${type}`, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Push Notifications */}
                <div className="border border-neural-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-neural-900">Push Notifications</h4>
                      <p className="text-sm text-neural-600">Receive instant notifications on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.notifications.push.enabled}
                        onChange={(e) => updatePreference('notifications.push.enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                  
                  {preferences.notifications.push.enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-neural-900">Quiet Hours</h5>
                          <p className="text-sm text-neural-600">Disable notifications during specified hours</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={preferences.notifications.push.quiet.enabled}
                            onChange={(e) => updatePreference('notifications.push.quiet.enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                      </div>
                      
                      {preferences.notifications.push.quiet.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neural-700 mb-2">From</label>
                            <input 
                              type="time" 
                              value={preferences.notifications.push.quiet.start}
                              onChange={(e) => updatePreference('notifications.push.quiet.start', e.target.value)}
                              className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neural-700 mb-2">To</label>
                            <input 
                              type="time" 
                              value={preferences.notifications.push.quiet.end}
                              onChange={(e) => updatePreference('notifications.push.quiet.end', e.target.value)}
                              className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center mb-6">
                <GlobeAltIcon className="w-6 h-6 text-brand-500 mr-3" />
                <h3 className="text-xl font-semibold text-neural-900">Language & Region</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neural-700 mb-2">Primary Language</label>
                  <select 
                    value={preferences.language.primary}
                    onChange={(e) => updatePreference('language.primary', e.target.value)}
                    className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.native})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neural-700 mb-2">Secondary Language</label>
                  <select 
                    value={preferences.language.secondary}
                    onChange={(e) => updatePreference('language.secondary', e.target.value)}
                    className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neural-900">Auto-detect Language</h4>
                    <p className="text-sm text-neural-600">Automatically detect content language</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.language.autoDetect}
                      onChange={(e) => updatePreference('language.autoDetect', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
              <div className="flex items-center mb-6">
                <EyeIcon className="w-6 h-6 text-brand-500 mr-3" />
                <h3 className="text-xl font-semibold text-neural-900">Accessibility</h3>
              </div>
              
              <div className="space-y-6">
                {Object.entries({
                  highContrast: {
                    title: 'High Contrast',
                    description: 'Increase color contrast for better visibility'
                  },
                  reduceMotion: {
                    title: 'Reduce Motion',
                    description: 'Minimize animations and transitions'
                  },
                  screenReader: {
                    title: 'Screen Reader Support',
                    description: 'Enhanced compatibility with screen readers'
                  },
                  keyboardNavigation: {
                    title: 'Keyboard Navigation',
                    description: 'Enable keyboard shortcuts and navigation'
                  }
                }).map(([key, { title, description }]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neural-900">{title}</h4>
                      <p className="text-sm text-neural-600">{description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.accessibility[key]}
                        onChange={(e) => updatePreference(`accessibility.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <button className="btn-secondary">
                Reset to Default
              </button>
              <button className="btn-primary">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}