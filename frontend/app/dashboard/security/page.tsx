'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
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
  const { state } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 2FA data
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  
  // Device and history data
  const [trustedDevices, setTrustedDevices] = useState<any[]>([])
  const [loginHistory, setLoginHistory] = useState<any[]>([])

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
        id: 2,
        type: 'info',
        title: 'Review Login Locations',
        description: 'Recent login from unknown location detected',
        priority: 'high'
      }
    ]
  })

  // Fetch security data on mount
  useEffect(() => {
    if (state.user?.id) {
      fetchSecurityData()
    }
  }, [state.user])

  const fetchSecurityData = async () => {
    try {
      // Fetch trusted devices
      const devicesRes = await fetch(`/api/user/security/devices/${state.user.id}`)
      if (devicesRes.ok) {
        const devicesData = await devicesRes.json()
        setTrustedDevices(devicesData.devices || [])
      }

      // Fetch login history
      const historyRes = await fetch(`/api/user/security/login-history/${state.user.id}`)
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setLoginHistory(historyData.loginHistory || [])
      }
    } catch (error) {
      console.error('Error fetching security data:', error)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error changing password' })
    }
    setLoading(false)
  }

  const handleToggle2FA = async (enabled: boolean) => {
    if (enabled && !qrCodeUrl) {
      // Fetch QR code setup
      try {
        const res = await fetch(`/api/user/security/2fa/setup/${state.user.id}`)
        const data = await res.json()
        
        if (data.success) {
          setQrCodeUrl(data.qrCodeUrl)
          setBackupCodes(data.backupCodes || [])
          setShowQRCode(true)
          setShowBackupCodes(true)
        }
      } catch (error) {
        console.error('Error setting up 2FA:', error)
      }
    } else {
      // Toggle 2FA
      try {
        const res = await fetch('/api/user/security/2fa/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.user.id,
            enabled
          })
        })

        const data = await res.json()
        
        if (data.success) {
          setTwoFactorEnabled(enabled)
          setMessage({ type: 'success', text: data.message })
          
          if (enabled && data.backupCodes) {
            setBackupCodes(data.backupCodes)
            setShowBackupCodes(true)
          }
        }
      } catch (error) {
        console.error('Error toggling 2FA:', error)
      }
    }
  }

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this device?')) return

    try {
      const res = await fetch(`/api/user/security/devices/${state.user.id}/${deviceId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Device removed successfully' })
        fetchSecurityData() // Refresh data
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error removing device' })
    }
  }

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
                      {message.text && (
                        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                          {message.text}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-neural-900">Password</h4>
                          <p className="text-sm text-neural-600">Last changed on {formatDate(securityData.lastPasswordChange)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-neural-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter current password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
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
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neural-700 mb-2">Confirm Password</label>
                          <input 
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border border-neural-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
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
                            onChange={(e) => handleToggle2FA(e.target.checked)}
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
                                <p className="text-sm text-green-700">{backupCodes.length || securityData.twoFactorAuth.backupCodes} backup codes available</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowQRCode(!showQRCode)}
                              className="btn-ghost text-green-600"
                            >
                              <QrCodeIcon className="w-4 h-4 mr-1" />
                              View QR
                            </button>
                          </div>
                          
                          {showQRCode && qrCodeUrl && (
                            <div className="p-6 bg-neural-50 rounded-lg text-center">
                              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                                  alt="2FA QR Code"
                                  className="w-48 h-48"
                                />
                              </div>
                              <p className="text-sm text-neural-600">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => setShowBackupCodes(!showBackupCodes)}
                            className="btn-secondary w-full"
                          >
                            {showBackupCodes ? 'Hide' : 'View'} Backup Codes
                          </button>

                          {showBackupCodes && backupCodes.length > 0 && (
                            <div className="p-6 bg-yellow-50 rounded-lg">
                              <div className="flex items-start mb-4">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-medium text-yellow-900">Save these backup codes</p>
                                  <p className="text-sm text-yellow-700">Store them in a safe place. Each code can only be used once.</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-lg">
                                {backupCodes.map((code, index) => (
                                  <code key={index} className="text-sm font-mono text-neural-900 p-2 bg-neural-50 rounded">
                                    {code}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
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
                    {(trustedDevices.length > 0 ? trustedDevices : securityData.trustedDevices).map((device) => (
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
                            <button 
                              onClick={() => handleRemoveDevice(device.id)}
                              className="btn-ghost text-red-600 text-sm"
                            >
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
                        {(loginHistory.length > 0 ? loginHistory : securityData.loginHistory).map((login) => (
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