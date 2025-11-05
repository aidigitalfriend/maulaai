'use client''use client'



import { useState } from 'react'import { useState } from 'react'

import { Code, Send, Loader2, ArrowLeft, Plus, Trash2, Copy, Check } from 'lucide-react'import { Send, Plus, Trash2, Copy, Clock } from 'lucide-react'

import Link from 'next/link'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

interface Header {

  id: stringinterface Header {

  key: string  id: string

  value: string  key: string

  enabled: boolean  value: string

}}



interface QueryParam {export default function APITesterPage() {

  id: string  const [url, setUrl] = useState('https://api.example.com/endpoint')

  key: string  const [method, setMethod] = useState('GET')

  value: string  const [headers, setHeaders] = useState<Header[]>([

  enabled: boolean    { id: '1', key: 'Content-Type', value: 'application/json' }

}  ])

  const [body, setBody] = useState('{\n  "key": "value"\n}')

interface ApiResponse {  const [response, setResponse] = useState<any>(null)

  status: number  const [isLoading, setIsLoading] = useState(false)

  statusText: string  const [responseTime, setResponseTime] = useState<number | null>(null)

  headers: Record<string, string>  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

  data: any

  time: number  const addHeader = () => {

}    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }])

  }

const REQUEST_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

  const removeHeader = (id: string) => {

const CONTENT_TYPES = [    setHeaders(headers.filter(h => h.id !== id))

  { label: 'JSON (application/json)', value: 'application/json' },  }

  { label: 'Form Data (multipart/form-data)', value: 'multipart/form-data' },

  { label: 'URL Encoded (application/x-www-form-urlencoded)', value: 'application/x-www-form-urlencoded' },  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {

  { label: 'Plain Text (text/plain)', value: 'text/plain' },    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))

  { label: 'XML (application/xml)', value: 'application/xml' },  }

  { label: 'HTML (text/html)', value: 'text/html' }

]  const sendRequest = async () => {

    setIsLoading(true)

const AUTH_TYPES = [    setResponse(null)

  { label: 'No Auth', value: 'none' },    setResponseTime(null)

  { label: 'Bearer Token', value: 'bearer' },

  { label: 'Basic Auth', value: 'basic' },    const startTime = performance.now()

  { label: 'API Key', value: 'apikey' }

]    try {

      const requestHeaders: Record<string, string> = {}

const BODY_TYPES = [      headers.forEach(h => {

  { label: 'JSON', value: 'json' },        if (h.key.trim()) {

  { label: 'Raw Text', value: 'raw' },          requestHeaders[h.key] = h.value

  { label: 'Form Data', value: 'formdata' },        }

  { label: 'URL Encoded', value: 'urlencoded' }      })

]

      const options: RequestInit = {

const PRESET_APIS = [        method,

  {        headers: requestHeaders,

    name: 'JSONPlaceholder - Get Posts',      }

    method: 'GET',

    url: 'https://jsonplaceholder.typicode.com/posts'      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {

  },        options.body = body

  {      }

    name: 'JSONPlaceholder - Create Post',

    method: 'POST',      const res = await fetch(url, options)

    url: 'https://jsonplaceholder.typicode.com/posts',      const endTime = performance.now()

    body: JSON.stringify({ title: 'Test Post', body: 'Test Body', userId: 1 }, null, 2)      setResponseTime(Math.round(endTime - startTime))

  },

  {      const contentType = res.headers.get('content-type')

    name: 'GitHub - Get User',      let data

    method: 'GET',

    url: 'https://api.github.com/users/github'      if (contentType?.includes('application/json')) {

  },        data = await res.json()

  {      } else {

    name: 'REST Countries - All',        data = await res.text()

    method: 'GET',      }

    url: 'https://restcountries.com/v3.1/all'

  },      setResponse({

  {        status: res.status,

    name: 'Cat Facts API',        statusText: res.statusText,

    method: 'GET',        headers: Object.fromEntries(res.headers.entries()),

    url: 'https://catfact.ninja/fact'        data

  }      })

]    } catch (error: any) {

      const endTime = performance.now()

export default function ApiTesterPage() {      setResponseTime(Math.round(endTime - startTime))

  const [method, setMethod] = useState('GET')      setResponse({

  const [url, setUrl] = useState('')        error: true,

  const [authType, setAuthType] = useState('none')        message: error.message || 'Request failed'

  const [bearerToken, setBearerToken] = useState('')      })

  const [basicUsername, setBasicUsername] = useState('')    } finally {

  const [basicPassword, setBasicPassword] = useState('')      setIsLoading(false)

  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key')    }

  const [apiKeyValue, setApiKeyValue] = useState('')  }

  const [headers, setHeaders] = useState<Header[]>([

    { id: '1', key: '', value: '', enabled: true }  const copyResponse = () => {

  ])    if (response) {

  const [queryParams, setQueryParams] = useState<QueryParam[]>([      navigator.clipboard.writeText(JSON.stringify(response, null, 2))

    { id: '1', key: '', value: '', enabled: true }    }

  ])  }

  const [bodyType, setBodyType] = useState('json')

  const [body, setBody] = useState('')  return (

  const [loading, setLoading] = useState(false)    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">

  const [response, setResponse] = useState<ApiResponse | null>(null)      <div className="container-custom py-20">

  const [error, setError] = useState('')        {/* Header */}

  const [copied, setCopied] = useState(false)        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold mb-4">

  const addHeader = () => {            API <span className="text-gradient">Tester</span>

    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '', enabled: true }])          </h1>

  }          <p className="text-xl text-neural-300 max-w-2xl mx-auto">

            Test and debug your APIs with a powerful, easy-to-use HTTP client

  const removeHeader = (id: string) => {          </p>

    setHeaders(headers.filter(h => h.id !== id))        </div>

  }

        {/* Main Content */}

  const updateHeader = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))          {/* Request Section */}

  }          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">

            <h2 className="text-2xl font-bold mb-6">Request</h2>

  const addQueryParam = () => {

    setQueryParams([...queryParams, { id: Date.now().toString(), key: '', value: '', enabled: true }])            {/* URL and Method */}

  }            <div className="space-y-4 mb-6">

              <div className="flex gap-3">

  const removeQueryParam = (id: string) => {                <select

    setQueryParams(queryParams.filter(q => q.id !== id))                  value={method}

  }                  onChange={(e) => setMethod(e.target.value)}

                  className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg font-semibold focus:outline-none focus:border-brand-600 transition"

  const updateQueryParam = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {                >

    setQueryParams(queryParams.map(q => q.id === id ? { ...q, [field]: value } : q))                  {HTTP_METHODS.map(m => (

  }                    <option key={m} value={m}>{m}</option>

                  ))}

  const loadPreset = (preset: typeof PRESET_APIS[0]) => {                </select>

    setMethod(preset.method)                <input

    setUrl(preset.url)                  type="text"

    if (preset.body) {                  value={url}

      setBody(preset.body)                  onChange={(e) => setUrl(e.target.value)}

      setBodyType('json')                  placeholder="Enter API endpoint URL"

    } else {                  className="flex-1 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg focus:outline-none focus:border-brand-600 transition"

      setBody('')                />

    }              </div>

  }            </div>



  const formatJson = () => {            {/* Tabs */}

    try {            <div className="flex gap-4 mb-4 border-b border-neural-700">

      const parsed = JSON.parse(body)              <button

      setBody(JSON.stringify(parsed, null, 2))                onClick={() => setActiveTab('body')}

    } catch (e) {                className={`px-4 py-2 font-semibold transition ${

      // Invalid JSON, do nothing                  activeTab === 'body'

    }                    ? 'text-brand-400 border-b-2 border-brand-400'

  }                    : 'text-neural-400 hover:text-white'

                }`}

  const copyResponse = () => {              >

    if (response) {                Body

      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))              </button>

      setCopied(true)              <button

      setTimeout(() => setCopied(false), 2000)                onClick={() => setActiveTab('headers')}

    }                className={`px-4 py-2 font-semibold transition ${

  }                  activeTab === 'headers'

                    ? 'text-brand-400 border-b-2 border-brand-400'

  const handleSend = async () => {                    : 'text-neural-400 hover:text-white'

    if (!url.trim()) {                }`}

      setError('Please enter a URL')              >

      return                Headers ({headers.length})

    }              </button>

            </div>

    setLoading(true)

    setError('')            {/* Body Tab */}

    setResponse(null)            {activeTab === 'body' && (

              <div>

    try {                <textarea

      // Build query params                  value={body}

      const enabledParams = queryParams.filter(p => p.enabled && p.key.trim())                  onChange={(e) => setBody(e.target.value)}

      let finalUrl = url                  placeholder="Request body (JSON, XML, etc.)"

      if (enabledParams.length > 0) {                  className="w-full h-64 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg font-mono text-sm focus:outline-none focus:border-brand-600 transition resize-none"

        const params = new URLSearchParams()                  disabled={!['POST', 'PUT', 'PATCH'].includes(method)}

        enabledParams.forEach(p => params.append(p.key, p.value))                />

        finalUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`              </div>

      }            )}



      // Build headers            {/* Headers Tab */}

      const requestHeaders: Record<string, string> = {}            {activeTab === 'headers' && (

                    <div className="space-y-3">

      // Add auth headers                {headers.map(header => (

      if (authType === 'bearer' && bearerToken) {                  <div key={header.id} className="flex gap-3">

        requestHeaders['Authorization'] = `Bearer ${bearerToken}`                    <input

      } else if (authType === 'basic' && basicUsername) {                      type="text"

        const encoded = btoa(`${basicUsername}:${basicPassword}`)                      value={header.key}

        requestHeaders['Authorization'] = `Basic ${encoded}`                      onChange={(e) => updateHeader(header.id, 'key', e.target.value)}

      } else if (authType === 'apikey' && apiKeyValue) {                      placeholder="Header key"

        requestHeaders[apiKeyHeader] = apiKeyValue                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"

      }                    />

                    <input

      // Add custom headers                      type="text"

      headers.filter(h => h.enabled && h.key.trim()).forEach(h => {                      value={header.value}

        requestHeaders[h.key] = h.value                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}

      })                      placeholder="Header value"

                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"

      // Add content type for body requests                    />

      if (['POST', 'PUT', 'PATCH'].includes(method) && body && !requestHeaders['Content-Type']) {                    <button

        if (bodyType === 'json') {                      onClick={() => removeHeader(header.id)}

          requestHeaders['Content-Type'] = 'application/json'                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition"

        } else if (bodyType === 'urlencoded') {                    >

          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'                      <Trash2 className="w-5 h-5" />

        } else if (bodyType === 'raw') {                    </button>

          requestHeaders['Content-Type'] = 'text/plain'                  </div>

        }                ))}

      }                <button

                  onClick={addHeader}

      const startTime = Date.now()                  className="flex items-center gap-2 px-4 py-2 text-brand-400 hover:bg-brand-600/20 rounded-lg transition"

                >

      const apiResponse = await fetch('/api/tools/api-tester', {                  <Plus className="w-4 h-4" />

        method: 'POST',                  Add Header

        headers: { 'Content-Type': 'application/json' },                </button>

        body: JSON.stringify({              </div>

          method,            )}

          url: finalUrl,

          headers: requestHeaders,            {/* Send Button */}

          body: body || undefined            <button

        })              onClick={sendRequest}

      })              disabled={isLoading || !url.trim()}

              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg font-semibold transition"

      const data = await apiResponse.json()            >

      const endTime = Date.now()              {isLoading ? (

                <>Processing...</>

      if (data.success) {              ) : (

        setResponse({                <>

          status: data.data.status,                  <Send className="w-5 h-5" />

          statusText: data.data.statusText,                  Send Request

          headers: data.data.headers,                </>

          data: data.data.data,              )}

          time: endTime - startTime            </button>

        })          </div>

      } else {

        setError(data.error || 'Request failed')          {/* Response Section */}

      }          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">

    } catch (err: any) {            <div className="flex items-center justify-between mb-6">

      setError(err.message || 'Failed to send request')              <h2 className="text-2xl font-bold">Response</h2>

    } finally {              {response && (

      setLoading(false)                <button

    }                  onClick={copyResponse}

  }                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 hover:bg-brand-600/20 rounded-lg transition"

                >

  return (                  <Copy className="w-4 h-4" />

    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">                  Copy

      <div className="container-custom py-12">                </button>

        <Link               )}

          href="/tools/network-tools"            </div>

          className="inline-flex items-center gap-2 text-neural-300 hover:text-white mb-8 transition-colors"

        >            {!response && !isLoading && (

          <ArrowLeft className="w-4 h-4" />              <div className="h-full flex items-center justify-center text-center text-neural-400">

          Back to Network Tools                <div>

        </Link>                  <Send className="w-16 h-16 mx-auto mb-4 opacity-50" />

                  <p>Send a request to see the response</p>

        <div className="text-center mb-12">                </div>

          <div className="flex items-center justify-center mb-6">              </div>

            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">            )}

              <Code className="w-10 h-10 text-white" />

            </div>            {isLoading && (

          </div>              <div className="h-full flex items-center justify-center">

          <h1 className="text-4xl md:text-5xl font-bold mb-4">                <div className="flex gap-2">

            API <span className="text-gradient bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Tester</span>                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" />

          </h1>                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />

          <p className="text-xl text-neural-300 max-w-2xl mx-auto">                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />

            Professional API testing tool with advanced features                </div>

          </p>              </div>

        </div>            )}



        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">            {response && (

          {/* Left Panel - Request Configuration */}              <div className="space-y-4">

          <div className="lg:col-span-2 space-y-6">                {/* Status */}

            {/* Presets */}                {!response.error && (

            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">                  <div className="flex items-center gap-4">

              <h3 className="text-lg font-semibold text-white mb-4">Quick Presets</h3>                    <div className={`px-3 py-1 rounded-lg font-semibold ${

              <div className="flex flex-wrap gap-2">                      response.status >= 200 && response.status < 300

                {PRESET_APIS.map((preset, idx) => (                        ? 'bg-green-600/20 text-green-400'

                  <button                        : response.status >= 400

                    key={idx}                        ? 'bg-red-600/20 text-red-400'

                    onClick={() => loadPreset(preset)}                        : 'bg-yellow-600/20 text-yellow-400'

                    className="px-3 py-2 bg-neural-700 hover:bg-neural-600 rounded-lg text-sm transition-colors"                    }`}>

                  >                      {response.status} {response.statusText}

                    {preset.name}                    </div>

                  </button>                    {responseTime && (

                ))}                      <div className="flex items-center gap-1 text-neural-400 text-sm">

              </div>                        <Clock className="w-4 h-4" />

            </div>                        {responseTime}ms

                      </div>

            {/* URL and Method */}                    )}

            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">                  </div>

              <h3 className="text-lg font-semibold text-white mb-4">Request</h3>                )}

              <div className="flex gap-3">

                <select                {/* Error */}

                  value={method}                {response.error && (

                  onChange={(e) => setMethod(e.target.value)}                  <div className="px-4 py-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">

                  className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"                    <div className="font-semibold mb-1">Error</div>

                >                    <div className="text-sm">{response.message}</div>

                  {REQUEST_METHODS.map(m => (                  </div>

                    <option key={m} value={m}>{m}</option>                )}

                  ))}

                </select>                {/* Response Data */}

                <input                <div className="bg-neural-900 rounded-lg p-4 max-h-96 overflow-auto">

                  type="text"                  <pre className="text-sm text-neural-200 whitespace-pre-wrap break-words font-mono">

                  value={url}                    {JSON.stringify(response.error ? response : response.data, null, 2)}

                  onChange={(e) => setUrl(e.target.value)}                  </pre>

                  placeholder="Enter API endpoint URL"                </div>

                  className="flex-1 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"              </div>

                />            )}

                <button          </div>

                  onClick={handleSend}        </div>

                  disabled={loading || !url.trim()}      </div>

                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:from-neural-700 disabled:to-neural-700 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:cursor-not-allowed"    </div>

                >  )

                  {loading ? (}

                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="w-full px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none mb-4"
              >
                {AUTH_TYPES.map(auth => (
                  <option key={auth.value} value={auth.value}>{auth.label}</option>
                ))}
              </select>

              {authType === 'bearer' && (
                <input
                  type="text"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="Enter bearer token"
                  className="w-full px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              )}

              {authType === 'basic' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={basicUsername}
                    onChange={(e) => setBasicUsername(e.target.value)}
                    placeholder="Username"
                    className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                  <input
                    type="password"
                    value={basicPassword}
                    onChange={(e) => setBasicPassword(e.target.value)}
                    placeholder="Password"
                    className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>
              )}

              {authType === 'apikey' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={apiKeyHeader}
                    onChange={(e) => setApiKeyHeader(e.target.value)}
                    placeholder="Header name"
                    className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                  <input
                    type="text"
                    value={apiKeyValue}
                    onChange={(e) => setApiKeyValue(e.target.value)}
                    placeholder="API key value"
                    className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Query Parameters */}
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Query Parameters</h3>
                <button
                  onClick={addQueryParam}
                  className="px-3 py-1 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg text-violet-400 text-sm flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {queryParams.map((param) => (
                  <div key={param.id} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => updateQueryParam(param.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-neural-600 bg-neural-700"
                    />
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                      placeholder="Key"
                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 outline-none text-sm"
                    />
                    <button
                      onClick={() => removeQueryParam(param.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Headers */}
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Headers</h3>
                <button
                  onClick={addHeader}
                  className="px-3 py-1 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg text-violet-400 text-sm flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {headers.map((header) => (
                  <div key={header.id} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded border-neural-600 bg-neural-700"
                    />
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                      placeholder="Header name"
                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 outline-none text-sm"
                    />
                    <button
                      onClick={() => removeHeader(header.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Request Body</h3>
                  <div className="flex gap-2">
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className="px-3 py-1 bg-neural-700 border border-neural-600 rounded-lg text-white text-sm focus:border-brand-500 outline-none"
                    >
                      {BODY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {bodyType === 'json' && (
                      <button
                        onClick={formatJson}
                        className="px-3 py-1 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg text-violet-400 text-sm transition-colors"
                      >
                        Format JSON
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter request body'}
                  className="w-full h-64 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white placeholder-neural-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none font-mono text-sm resize-none"
                />
              </div>
            )}
          </div>

          {/* Right Panel - Response */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Response</h3>
                {response && (
                  <button
                    onClick={copyResponse}
                    className="p-2 hover:bg-neural-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-neural-400" />
                    )}
                  </button>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {response && (
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between p-3 bg-neural-700 rounded-lg">
                    <span className="text-neural-300 text-sm">Status</span>
                    <span className={`font-semibold ${response.status < 300 ? 'text-green-400' : response.status < 400 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between p-3 bg-neural-700 rounded-lg">
                    <span className="text-neural-300 text-sm">Time</span>
                    <span className="text-violet-400 font-semibold">{response.time}ms</span>
                  </div>

                  {/* Response Data */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Body</h4>
                    <div className="bg-neural-700 rounded-lg p-3 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-neural-200 font-mono whitespace-pre-wrap break-words">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Response Headers */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Headers</h4>
                    <div className="bg-neural-700 rounded-lg p-3 max-h-64 overflow-y-auto space-y-1">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-violet-400 font-mono">{key}:</span>
                          <span className="text-neural-300 ml-2 font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!response && !error && !loading && (
                <div className="text-center py-12 text-neural-400">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Configure and send a request to see the response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
