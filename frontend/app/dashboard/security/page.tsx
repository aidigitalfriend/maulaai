'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'

export default function SecuritySettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)

  const [securityData] = useState({
    lastPasswordChange: '2024-10-15',
    twoFactorAuth: {
      enabled: true,
      method: 'authenticator',
      backupCodes: 8
    },
    trustedDevices: [
      {
        id: 1,
        name: 'MacBook Pro',
        type: 'desktop',
        lastSeen: '2025-11-26T10:30:00Z',
        location: 'San Francisco, CA',
        browser: 'Chrome 119',
        current: true
      },
      {
        id: 2,
        name: 'iPhone 15 Pro',
        type: 'mobile',
        lastSeen: '2025-11-25T18:45:00Z',
        location: 'San Francisco, CA',
        browser: 'Safari Mobile',
        current: false
      },
      {
        id: 3,
        name: 'iPad Air',
        type: 'tablet',
        lastSeen: '2025-11-24T14:20:00Z',
        location: 'Oakland, CA',
        browser: 'Safari',
        current: false
      }
    ],
    loginHistory: [
      {
        id: 1,
        date: '2025-11-26T10:30:00Z',
        location: 'San Francisco, CA',
        device: 'MacBook Pro',
        status: 'success',
        ip: '192.168.1.100'
      },
      {
        id: 2,
        date: '2025-11-25T18:45:00Z',
        location: 'San Francisco, CA',
        device: 'iPhone 15 Pro',
        status: 'success',
        ip: '192.168.1.101'
      },
      {
        id: 3,
        date: '2025-11-25T09:15:00Z',
        location: 'Unknown',
        device: 'Unknown Device',
        status: 'blocked',
        ip: '203.0.113.42'
      },
      {
        id: 4,
        date: '2025-11-24T14:20:00Z',
        location: 'Oakland, CA',
        device: 'iPad Air',
        status: 'success',
        ip: '192.168.0.50'
      }
    ],
    securityScore: 85,
    recommendations: [
      {
        id: 1,
        type: 'warning',
        title: 'Enable SMS Backup for 2FA',
        description: 'Add SMS as a backup method for two-factor authentication',
        priority: 'medium'
      },
      {
        id: 2,
        type: 'info',
        title: 'Review Login Locations',
        description: 'Recent login from unknown location detected',
        priority: 'high'
      }
    ]
  })

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile':
      case 'tablet':
        return <DevicePhoneMobileIcon className="w-5 h-5" />
      default:
        return <ComputerDesktopIcon className="w-5 h-5" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'blocked':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-neural-600 bg-neural-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
                Security Settings
              </h1>
              <p className="text-neural-600">Manage your account security and privacy settings</p>
            </div>
            <Link href="/dashboard/overview" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Security Content */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Security Score */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-neural-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityData.securityScore / 100)}`}
                      className="text-brand-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-neural-900">{securityData.securityScore}%</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-neural-900 mb-2">Security Score</h3>
                <p className="text-sm text-neural-600 mb-4">Your account security rating</p>
                
                <div className="space-y-2 text-left">
                  {securityData.recommendations.map((rec) => (
                    <div key={rec.id} className={`p-3 rounded-lg ${rec.priority === 'high' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center">
                        {rec.priority === 'high' ? (
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-medium text-neural-900">{rec.title}</p>
                          <p className="text-xs text-neural-600">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                
                {/* Password & Authentication */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
                  <div className="flex items-center mb-6">
                    <KeyIcon className="w-6 h-6 text-brand-500 mr-3" />
                    <h3 className="text-xl font-semibold text-neural-900">Password & Authentication</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="border border-neural-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-neural-900">Password</h4>
                          <p className="text-sm text-neural-600">Last changed on {formatDate(securityData.lastPasswordChange)}</p>
                        </div>
                        <button className="btn-secondary">
                          Change Password
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neural-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter current password"
                              className="w-full p-3 pr-12 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5 text-neural-400" />
                              ) : (
                                <EyeIcon className="w-5 h-5 text-neural-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neural-700 mb-2">New Password</label>
                          <input 
                            type="password"
                            placeholder="Enter new password"
                            className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border border-neural-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-neural-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-neural-600">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neural-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neural-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                      </div>
                      
                      {twoFactorEnabled && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                              <div>
                                <p className="font-medium text-green-900">Authenticator App Active</p>
                                <p className="text-sm text-green-700">{securityData.twoFactorAuth.backupCodes} backup codes remaining</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowQRCode(!showQRCode)}
                              className="btn-ghost text-green-600"
                            >
                              <QrCodeIcon className="w-4 h-4 mr-1" />
                              QR Code
                            </button>
                          </div>
                          
                          {showQRCode && (
                            <div className="p-6 bg-neural-50 rounded-lg text-center">
                              <div className="w-32 h-32 bg-white border-2 border-neural-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <QrCodeIcon className="w-16 h-16 text-neural-400" />
                              </div>
                              <p className="text-sm text-neural-600">Scan this QR code with your authenticator app</p>
                            </div>
                          )}
                          
                          <div className="flex space-x-4">
                            <button className="btn-secondary flex-1">
                              View Backup Codes
                            </button>
                            <button className="btn-secondary flex-1">
                              Add SMS Backup
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trusted Devices */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="w-6 h-6 text-brand-500 mr-3" />
                      <h3 className="text-xl font-semibold text-neural-900">Trusted Devices</h3>
                    </div>
                    <button className="btn-ghost text-red-600">
                      Remove All
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {securityData.trustedDevices.map((device) => (
                      <div key={device.id} className={`p-4 border rounded-lg ${device.current ? 'border-brand-200 bg-brand-50' : 'border-neural-100'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-neural-100 rounded-lg mr-4">
                              {getDeviceIcon(device.type)}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium text-neural-900">{device.name}</h4>
                                {device.current && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-brand-100 text-brand-700 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-neural-600">{device.browser} • {device.location}</p>
                              <p className="text-xs text-neural-500">Last seen {formatDateTime(device.lastSeen)}</p>
                            </div>
                          </div>
                          {!device.current && (
                            <button className="btn-ghost text-red-600 text-sm">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login History */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <ClockIcon className="w-6 h-6 text-brand-500 mr-3" />
                      <h3 className="text-xl font-semibold text-neural-900">Login History</h3>
                    </div>
                    <button className="btn-ghost">
                      View All
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neural-100">
                          <th className="text-left py-3 text-sm font-medium text-neural-700">Date & Time</th>
                          <th className="text-left py-3 text-sm font-medium text-neural-700">Device</th>
                          <th className="text-left py-3 text-sm font-medium text-neural-700">Location</th>
                          <th className="text-left py-3 text-sm font-medium text-neural-700">Status</th>
                          <th className="text-left py-3 text-sm font-medium text-neural-700">IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityData.loginHistory.map((login) => (
                          <tr key={login.id} className="border-b border-neural-50">
                            <td className="py-4 text-sm text-neural-900">
                              {formatDateTime(login.date)}
                            </td>
                            <td className="py-4 text-sm text-neural-600">
                              {login.device}
                            </td>
                            <td className="py-4 text-sm text-neural-600">
                              {login.location}
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(login.status)}`}>
                                {login.status === 'success' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                                {login.status === 'blocked' && <XCircleIcon className="w-3 h-3 mr-1" />}
                                {login.status.charAt(0).toUpperCase() + login.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-neural-600 font-mono">
                              {login.ip}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}