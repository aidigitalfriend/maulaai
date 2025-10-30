'use client'

import { useState } from 'react'
import { Send, Plus, Trash2, Copy, Clock } from 'lucide-react'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

interface Header {
  id: string
  key: string
  value: string
}

export default function APITesterPage() {
  const [url, setUrl] = useState('https://api.example.com/endpoint')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Content-Type', value: 'application/json' }
  ])
  const [body, setBody] = useState('{\n  "key": "value"\n}')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }])
  }

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id))
  }

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))
  }

  const sendRequest = async () => {
    setIsLoading(true)
    setResponse(null)
    setResponseTime(null)

    const startTime = performance.now()

    try {
      const requestHeaders: Record<string, string> = {}
      headers.forEach(h => {
        if (h.key.trim()) {
          requestHeaders[h.key] = h.value
        }
      })

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      }

      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        options.body = body
      }

      const res = await fetch(url, options)
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))

      const contentType = res.headers.get('content-type')
      let data

      if (contentType?.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data
      })
    } catch (error: any) {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setResponse({
        error: true,
        message: error.message || 'Request failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      <div className="container-custom py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            API <span className="text-gradient">Tester</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Test and debug your APIs with a powerful, easy-to-use HTTP client
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Section */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <h2 className="text-2xl font-bold mb-6">Request</h2>

            {/* URL and Method */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg font-semibold focus:outline-none focus:border-brand-600 transition"
                >
                  {HTTP_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter API endpoint URL"
                  className="flex-1 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg focus:outline-none focus:border-brand-600 transition"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b border-neural-700">
              <button
                onClick={() => setActiveTab('body')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'body'
                    ? 'text-brand-400 border-b-2 border-brand-400'
                    : 'text-neural-400 hover:text-white'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'headers'
                    ? 'text-brand-400 border-b-2 border-brand-400'
                    : 'text-neural-400 hover:text-white'
                }`}
              >
                Headers ({headers.length})
              </button>
            </div>

            {/* Body Tab */}
            {activeTab === 'body' && (
              <div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Request body (JSON, XML, etc.)"
                  className="w-full h-64 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg font-mono text-sm focus:outline-none focus:border-brand-600 transition resize-none"
                  disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
                />
              </div>
            )}

            {/* Headers Tab */}
            {activeTab === 'headers' && (
              <div className="space-y-3">
                {headers.map(header => (
                  <div key={header.id} className="flex gap-3">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                      placeholder="Header key"
                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                      placeholder="Header value"
                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"
                    />
                    <button
                      onClick={() => removeHeader(header.id)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className="flex items-center gap-2 px-4 py-2 text-brand-400 hover:bg-brand-600/20 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Header
                </button>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={sendRequest}
              disabled={isLoading || !url.trim()}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Request
                </>
              )}
            </button>
          </div>

          {/* Response Section */}
          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Response</h2>
              {response && (
                <button
                  onClick={copyResponse}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 hover:bg-brand-600/20 rounded-lg transition"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              )}
            </div>

            {!response && !isLoading && (
              <div className="h-full flex items-center justify-center text-center text-neural-400">
                <div>
                  <Send className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Send a request to see the response</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                {/* Status */}
                {!response.error && (
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-lg font-semibold ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-600/20 text-green-400'
                        : response.status >= 400
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {response.status} {response.statusText}
                    </div>
                    {responseTime && (
                      <div className="flex items-center gap-1 text-neural-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {responseTime}ms
                      </div>
                    )}
                  </div>
                )}

                {/* Error */}
                {response.error && (
                  <div className="px-4 py-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
                    <div className="font-semibold mb-1">Error</div>
                    <div className="text-sm">{response.message}</div>
                  </div>
                )}

                {/* Response Data */}
                <div className="bg-neural-900 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-neural-200 whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(response.error ? response : response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
