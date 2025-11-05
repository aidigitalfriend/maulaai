'use client'

import { useState } from 'react'

import { Send, Plus, Trash2, Copy, Clock } from 'lucide-react'

import Link from 'next/link'import { useState } from 'react'import { useState } from 'react'



interface Header {import { Code, Send, Loader2, ArrowLeft, Plus, Trash2, Copy, Check } from 'lucide-react'import { Send, Plus, Trash2, Copy, Clock } from 'lucide-react'

  id: string

  key: stringimport Link from 'next/link'

  value: string

  enabled: booleanconst HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

}

interface Header {

interface QueryParam {

  id: string  id: stringinterface Header {

  key: string

  value: string  key: string  id: string

  enabled: boolean

}  value: string  key: string



interface ApiResponse {  enabled: boolean  value: string

  status: number

  statusText: string}}

  headers: Record<string, string>

  data: any

  time?: number

}interface QueryParam {export default function APITesterPage() {



const quickPresets = [  id: string  const [url, setUrl] = useState('https://api.example.com/endpoint')

  {

    name: 'JSONPlaceholder - Get Posts',  key: string  const [method, setMethod] = useState('GET')

    method: 'GET',

    url: 'https://jsonplaceholder.typicode.com/posts'  value: string  const [headers, setHeaders] = useState<Header[]>([

  },

  {  enabled: boolean    { id: '1', key: 'Content-Type', value: 'application/json' }

    name: 'JSONPlaceholder - Create Post',

    method: 'POST',}  ])

    url: 'https://jsonplaceholder.typicode.com/posts',

    body: JSON.stringify({ title: 'Test Post', body: 'Test content', userId: 1 }, null, 2),  const [body, setBody] = useState('{\n  "key": "value"\n}')

    headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }]

  },interface ApiResponse {  const [response, setResponse] = useState<any>(null)

  {

    name: 'GitHub API - Get User',  status: number  const [isLoading, setIsLoading] = useState(false)

    method: 'GET',

    url: 'https://api.github.com/users/github'  statusText: string  const [responseTime, setResponseTime] = useState<number | null>(null)

  },

  {  headers: Record<string, string>  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')

    name: 'REST Countries - Get Country',

    method: 'GET',  data: any

    url: 'https://restcountries.com/v3.1/name/canada'

  },  time: number  const addHeader = () => {

  {

    name: 'Cat Facts API',}    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '' }])

    method: 'GET',

    url: 'https://catfact.ninja/fact'  }

  }

]const REQUEST_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']



export default function ApiTesterPage() {  const removeHeader = (id: string) => {

  const [method, setMethod] = useState('GET')

  const [url, setUrl] = useState('')const CONTENT_TYPES = [    setHeaders(headers.filter(h => h.id !== id))

  const [authType, setAuthType] = useState('none')

  const [bearerToken, setBearerToken] = useState('')  { label: 'JSON (application/json)', value: 'application/json' },  }

  const [basicUsername, setBasicUsername] = useState('')

  const [basicPassword, setBasicPassword] = useState('')  { label: 'Form Data (multipart/form-data)', value: 'multipart/form-data' },

  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key')

  const [apiKeyValue, setApiKeyValue] = useState('')  { label: 'URL Encoded (application/x-www-form-urlencoded)', value: 'application/x-www-form-urlencoded' },  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {

  const [headers, setHeaders] = useState<Header[]>([])

  const [queryParams, setQueryParams] = useState<QueryParam[]>([])  { label: 'Plain Text (text/plain)', value: 'text/plain' },    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))

  const [bodyType, setBodyType] = useState('json')

  const [body, setBody] = useState('')  { label: 'XML (application/xml)', value: 'application/xml' },  }

  const [loading, setLoading] = useState(false)

  const [response, setResponse] = useState<ApiResponse | null>(null)  { label: 'HTML (text/html)', value: 'text/html' }

  const [error, setError] = useState('')

  const [copied, setCopied] = useState(false)]  const sendRequest = async () => {



  const addHeader = () => {    setIsLoading(true)

    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '', enabled: true }])

  }const AUTH_TYPES = [    setResponse(null)



  const removeHeader = (id: string) => {  { label: 'No Auth', value: 'none' },    setResponseTime(null)

    setHeaders(headers.filter(h => h.id !== id))

  }  { label: 'Bearer Token', value: 'bearer' },



  const updateHeader = (id: string, field: keyof Header, value: string | boolean) => {  { label: 'Basic Auth', value: 'basic' },    const startTime = performance.now()

    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))

  }  { label: 'API Key', value: 'apikey' }



  const addQueryParam = () => {]    try {

    setQueryParams([...queryParams, { id: Date.now().toString(), key: '', value: '', enabled: true }])

  }      const requestHeaders: Record<string, string> = {}



  const removeQueryParam = (id: string) => {const BODY_TYPES = [      headers.forEach(h => {

    setQueryParams(queryParams.filter(q => q.id !== id))

  }  { label: 'JSON', value: 'json' },        if (h.key.trim()) {



  const updateQueryParam = (id: string, field: keyof QueryParam, value: string | boolean) => {  { label: 'Raw Text', value: 'raw' },          requestHeaders[h.key] = h.value

    setQueryParams(queryParams.map(q => q.id === id ? { ...q, [field]: value } : q))

  }  { label: 'Form Data', value: 'formdata' },        }



  const loadPreset = (preset: typeof quickPresets[0]) => {  { label: 'URL Encoded', value: 'urlencoded' }      })

    setMethod(preset.method)

    setUrl(preset.url)]

    if (preset.body) {

      setBody(preset.body)      const options: RequestInit = {

      setBodyType('json')

    } else {const PRESET_APIS = [        method,

      setBody('')

    }  {        headers: requestHeaders,

    if (preset.headers) {

      setHeaders(preset.headers)    name: 'JSONPlaceholder - Get Posts',      }

    } else {

      setHeaders([])    method: 'GET',

    }

    setQueryParams([])    url: 'https://jsonplaceholder.typicode.com/posts'      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {

    setAuthType('none')

    setResponse(null)  },        options.body = body

    setError('')

  }  {      }



  const formatJson = () => {    name: 'JSONPlaceholder - Create Post',

    try {

      const parsed = JSON.parse(body)    method: 'POST',      const res = await fetch(url, options)

      setBody(JSON.stringify(parsed, null, 2))

    } catch (e) {    url: 'https://jsonplaceholder.typicode.com/posts',      const endTime = performance.now()

      // Invalid JSON, don't format

    }    body: JSON.stringify({ title: 'Test Post', body: 'Test Body', userId: 1 }, null, 2)      setResponseTime(Math.round(endTime - startTime))

  }

  },

  const copyResponse = () => {

    if (response) {  {      const contentType = res.headers.get('content-type')

      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))

      setCopied(true)    name: 'GitHub - Get User',      let data

      setTimeout(() => setCopied(false), 2000)

    }    method: 'GET',

  }

    url: 'https://api.github.com/users/github'      if (contentType?.includes('application/json')) {

  const handleSend = async () => {

    if (!url.trim()) {  },        data = await res.json()

      setError('Please enter a URL')

      return  {      } else {

    }

    name: 'REST Countries - All',        data = await res.text()

    setLoading(true)

    setError('')    method: 'GET',      }

    setResponse(null)

    url: 'https://restcountries.com/v3.1/all'

    try {

      // Build full URL with query params  },      setResponse({

      const enabledParams = queryParams.filter(q => q.enabled && q.key)

      let fullUrl = url  {        status: res.status,

      if (enabledParams.length > 0) {

        const params = new URLSearchParams()    name: 'Cat Facts API',        statusText: res.statusText,

        enabledParams.forEach(p => params.append(p.key, p.value))

        fullUrl += (url.includes('?') ? '&' : '?') + params.toString()    method: 'GET',        headers: Object.fromEntries(res.headers.entries()),

      }

    url: 'https://catfact.ninja/fact'        data

      // Build headers

      const requestHeaders: Record<string, string> = {}  }      })

      headers.filter(h => h.enabled && h.key).forEach(h => {

        requestHeaders[h.key] = h.value]    } catch (error: any) {

      })

      const endTime = performance.now()

      // Add auth headers

      if (authType === 'bearer' && bearerToken) {export default function ApiTesterPage() {      setResponseTime(Math.round(endTime - startTime))

        requestHeaders['Authorization'] = `Bearer ${bearerToken}`

      } else if (authType === 'basic' && basicUsername && basicPassword) {  const [method, setMethod] = useState('GET')      setResponse({

        const encoded = btoa(`${basicUsername}:${basicPassword}`)

        requestHeaders['Authorization'] = `Basic ${encoded}`  const [url, setUrl] = useState('')        error: true,

      } else if (authType === 'apikey' && apiKeyHeader && apiKeyValue) {

        requestHeaders[apiKeyHeader] = apiKeyValue  const [authType, setAuthType] = useState('none')        message: error.message || 'Request failed'

      }

  const [bearerToken, setBearerToken] = useState('')      })

      // Prepare body

      let requestBody: any = undefined  const [basicUsername, setBasicUsername] = useState('')    } finally {

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {

        if (bodyType === 'json') {  const [basicPassword, setBasicPassword] = useState('')      setIsLoading(false)

          requestHeaders['Content-Type'] = 'application/json'

          requestBody = body  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key')    }

        } else if (bodyType === 'form') {

          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'  const [apiKeyValue, setApiKeyValue] = useState('')  }

          requestBody = body

        } else {  const [headers, setHeaders] = useState<Header[]>([

          requestBody = body

        }    { id: '1', key: '', value: '', enabled: true }  const copyResponse = () => {

      }

  ])    if (response) {

      const startTime = Date.now()

      const res = await fetch('/api/tools/api-tester', {  const [queryParams, setQueryParams] = useState<QueryParam[]>([      navigator.clipboard.writeText(JSON.stringify(response, null, 2))

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },    { id: '1', key: '', value: '', enabled: true }    }

        body: JSON.stringify({

          method,  ])  }

          url: fullUrl,

          headers: requestHeaders,  const [bodyType, setBodyType] = useState('json')

          body: requestBody

        })  const [body, setBody] = useState('')  return (

      })

  const [loading, setLoading] = useState(false)    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">

      const endTime = Date.now()

      const data = await res.json()  const [response, setResponse] = useState<ApiResponse | null>(null)      <div className="container-custom py-20">



      if (res.ok) {  const [error, setError] = useState('')        {/* Header */}

        setResponse({

          status: data.status,  const [copied, setCopied] = useState(false)        <div className="text-center mb-12">

          statusText: data.statusText,

          headers: data.headers,          <h1 className="text-5xl font-bold mb-4">

          data: data.data,

          time: endTime - startTime  const addHeader = () => {            API <span className="text-gradient">Tester</span>

        })

      } else {    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '', enabled: true }])          </h1>

        setError(data.error || 'Request failed')

      }  }          <p className="text-xl text-neural-300 max-w-2xl mx-auto">

    } catch (err: any) {

      setError(err.message || 'Failed to send request')            Test and debug your APIs with a powerful, easy-to-use HTTP client

    } finally {

      setLoading(false)  const removeHeader = (id: string) => {          </p>

    }

  }    setHeaders(headers.filter(h => h.id !== id))        </div>



  return (  }

    <div className="min-h-screen bg-neural-900 text-neutral-100">

      {/* Header */}        {/* Main Content */}

      <header className="bg-neural-800 border-b border-neural-700">

        <div className="container-custom py-6">  const updateHeader = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Link 

            href="/tools/network-tools"    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))          {/* Request Section */}

            className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-100 mb-4 transition-colors"

          >  }          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">

            <span>←</span>

            <span>Back to Network Tools</span>            <h2 className="text-2xl font-bold mb-6">Request</h2>

          </Link>

          <div className="flex items-center gap-4">  const addQueryParam = () => {

            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">

              <Send className="w-7 h-7 text-white" />    setQueryParams([...queryParams, { id: Date.now().toString(), key: '', value: '', enabled: true }])            {/* URL and Method */}

            </div>

            <div>  }            <div className="space-y-4 mb-6">

              <h1 className="text-3xl font-bold mb-2">API Tester</h1>

              <p className="text-neural-300">Professional API testing with presets and advanced options</p>              <div className="flex gap-3">

            </div>

          </div>  const removeQueryParam = (id: string) => {                <select

        </div>

      </header>    setQueryParams(queryParams.filter(q => q.id !== id))                  value={method}



      {/* Main Content */}  }                  onChange={(e) => setMethod(e.target.value)}

      <div className="container-custom py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">                  className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg font-semibold focus:outline-none focus:border-brand-600 transition"

          {/* Left Column - Configuration */}

          <div className="space-y-6">  const updateQueryParam = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {                >

            {/* Quick Presets */}

            <div className="card-modern p-6">    setQueryParams(queryParams.map(q => q.id === id ? { ...q, [field]: value } : q))                  {HTTP_METHODS.map(m => (

              <h2 className="text-xl font-semibold mb-4">Quick Presets</h2>

              <select  }                    <option key={m} value={m}>{m}</option>

                className="input-modern w-full"

                onChange={(e) => {                  ))}

                  const preset = quickPresets[parseInt(e.target.value)]

                  if (preset) loadPreset(preset)  const loadPreset = (preset: typeof PRESET_APIS[0]) => {                </select>

                }}

                defaultValue=""    setMethod(preset.method)                <input

              >

                <option value="" disabled>Select a preset...</option>    setUrl(preset.url)                  type="text"

                {quickPresets.map((preset, idx) => (

                  <option key={idx} value={idx}>{preset.name}</option>    if (preset.body) {                  value={url}

                ))}

              </select>      setBody(preset.body)                  onChange={(e) => setUrl(e.target.value)}

            </div>

      setBodyType('json')                  placeholder="Enter API endpoint URL"

            {/* URL and Method */}

            <div className="card-modern p-6">    } else {                  className="flex-1 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg focus:outline-none focus:border-brand-600 transition"

              <h2 className="text-xl font-semibold mb-4">Request</h2>

              <div className="space-y-4">      setBody('')                />

                <div className="flex gap-2">

                  <select    }              </div>

                    className="input-modern w-32"

                    value={method}  }            </div>

                    onChange={(e) => setMethod(e.target.value)}

                  >

                    <option value="GET">GET</option>

                    <option value="POST">POST</option>  const formatJson = () => {            {/* Tabs */}

                    <option value="PUT">PUT</option>

                    <option value="PATCH">PATCH</option>    try {            <div className="flex gap-4 mb-4 border-b border-neural-700">

                    <option value="DELETE">DELETE</option>

                    <option value="HEAD">HEAD</option>      const parsed = JSON.parse(body)              <button

                    <option value="OPTIONS">OPTIONS</option>

                  </select>      setBody(JSON.stringify(parsed, null, 2))                onClick={() => setActiveTab('body')}

                  <input

                    type="text"    } catch (e) {                className={`px-4 py-2 font-semibold transition ${

                    className="input-modern flex-1"

                    placeholder="https://api.example.com/endpoint"      // Invalid JSON, do nothing                  activeTab === 'body'

                    value={url}

                    onChange={(e) => setUrl(e.target.value)}    }                    ? 'text-brand-400 border-b-2 border-brand-400'

                  />

                </div>  }                    : 'text-neural-400 hover:text-white'

              </div>

            </div>                }`}



            {/* Authentication */}  const copyResponse = () => {              >

            <div className="card-modern p-6">

              <h2 className="text-xl font-semibold mb-4">Authentication</h2>    if (response) {                Body

              <div className="space-y-4">

                <select      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))              </button>

                  className="input-modern w-full"

                  value={authType}      setCopied(true)              <button

                  onChange={(e) => setAuthType(e.target.value)}

                >      setTimeout(() => setCopied(false), 2000)                onClick={() => setActiveTab('headers')}

                  <option value="none">No Auth</option>

                  <option value="bearer">Bearer Token</option>    }                className={`px-4 py-2 font-semibold transition ${

                  <option value="basic">Basic Auth</option>

                  <option value="apikey">API Key</option>  }                  activeTab === 'headers'

                </select>

                    ? 'text-brand-400 border-b-2 border-brand-400'

                {authType === 'bearer' && (

                  <input  const handleSend = async () => {                    : 'text-neural-400 hover:text-white'

                    type="text"

                    className="input-modern w-full"    if (!url.trim()) {                }`}

                    placeholder="Token"

                    value={bearerToken}      setError('Please enter a URL')              >

                    onChange={(e) => setBearerToken(e.target.value)}

                  />      return                Headers ({headers.length})

                )}

    }              </button>

                {authType === 'basic' && (

                  <div className="space-y-2">            </div>

                    <input

                      type="text"    setLoading(true)

                      className="input-modern w-full"

                      placeholder="Username"    setError('')            {/* Body Tab */}

                      value={basicUsername}

                      onChange={(e) => setBasicUsername(e.target.value)}    setResponse(null)            {activeTab === 'body' && (

                    />

                    <input              <div>

                      type="password"

                      className="input-modern w-full"    try {                <textarea

                      placeholder="Password"

                      value={basicPassword}      // Build query params                  value={body}

                      onChange={(e) => setBasicPassword(e.target.value)}

                    />      const enabledParams = queryParams.filter(p => p.enabled && p.key.trim())                  onChange={(e) => setBody(e.target.value)}

                  </div>

                )}      let finalUrl = url                  placeholder="Request body (JSON, XML, etc.)"



                {authType === 'apikey' && (      if (enabledParams.length > 0) {                  className="w-full h-64 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg font-mono text-sm focus:outline-none focus:border-brand-600 transition resize-none"

                  <div className="space-y-2">

                    <input        const params = new URLSearchParams()                  disabled={!['POST', 'PUT', 'PATCH'].includes(method)}

                      type="text"

                      className="input-modern w-full"        enabledParams.forEach(p => params.append(p.key, p.value))                />

                      placeholder="Header Name (e.g., X-API-Key)"

                      value={apiKeyHeader}        finalUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`              </div>

                      onChange={(e) => setApiKeyHeader(e.target.value)}

                    />      }            )}

                    <input

                      type="text"

                      className="input-modern w-full"

                      placeholder="API Key Value"      // Build headers            {/* Headers Tab */}

                      value={apiKeyValue}

                      onChange={(e) => setApiKeyValue(e.target.value)}      const requestHeaders: Record<string, string> = {}            {activeTab === 'headers' && (

                    />

                  </div>                    <div className="space-y-3">

                )}

              </div>      // Add auth headers                {headers.map(header => (

            </div>

      if (authType === 'bearer' && bearerToken) {                  <div key={header.id} className="flex gap-3">

            {/* Query Parameters */}

            <div className="card-modern p-6">        requestHeaders['Authorization'] = `Bearer ${bearerToken}`                    <input

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-semibold">Query Parameters</h2>      } else if (authType === 'basic' && basicUsername) {                      type="text"

                <button

                  onClick={addQueryParam}        const encoded = btoa(`${basicUsername}:${basicPassword}`)                      value={header.key}

                  className="btn-secondary text-sm flex items-center gap-2"

                >        requestHeaders['Authorization'] = `Basic ${encoded}`                      onChange={(e) => updateHeader(header.id, 'key', e.target.value)}

                  <Plus className="w-4 h-4" />

                  Add      } else if (authType === 'apikey' && apiKeyValue) {                      placeholder="Header key"

                </button>

              </div>        requestHeaders[apiKeyHeader] = apiKeyValue                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"

              <div className="space-y-2">

                {queryParams.length === 0 ? (      }                    />

                  <p className="text-neural-400 text-sm">No query parameters</p>

                ) : (                    <input

                  queryParams.map((param) => (

                    <div key={param.id} className="flex items-center gap-2">      // Add custom headers                      type="text"

                      <input

                        type="checkbox"      headers.filter(h => h.enabled && h.key.trim()).forEach(h => {                      value={header.value}

                        checked={param.enabled}

                        onChange={(e) => updateQueryParam(param.id, 'enabled', e.target.checked)}        requestHeaders[h.key] = h.value                      onChange={(e) => updateHeader(header.id, 'value', e.target.value)}

                        className="w-4 h-4"

                      />      })                      placeholder="Header value"

                      <input

                        type="text"                      className="flex-1 px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"

                        className="input-modern flex-1"

                        placeholder="Key"      // Add content type for body requests                    />

                        value={param.key}

                        onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}      if (['POST', 'PUT', 'PATCH'].includes(method) && body && !requestHeaders['Content-Type']) {                    <button

                      />

                      <input        if (bodyType === 'json') {                      onClick={() => removeHeader(header.id)}

                        type="text"

                        className="input-modern flex-1"          requestHeaders['Content-Type'] = 'application/json'                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition"

                        placeholder="Value"

                        value={param.value}        } else if (bodyType === 'urlencoded') {                    >

                        onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}

                      />          requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'                      <Trash2 className="w-5 h-5" />

                      <button

                        onClick={() => removeQueryParam(param.id)}        } else if (bodyType === 'raw') {                    </button>

                        className="text-red-400 hover:text-red-300"

                      >          requestHeaders['Content-Type'] = 'text/plain'                  </div>

                        <Trash2 className="w-4 h-4" />

                      </button>        }                ))}

                    </div>

                  ))      }                <button

                )}

              </div>                  onClick={addHeader}

            </div>

      const startTime = Date.now()                  className="flex items-center gap-2 px-4 py-2 text-brand-400 hover:bg-brand-600/20 rounded-lg transition"

            {/* Headers */}

            <div className="card-modern p-6">                >

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-semibold">Headers</h2>      const apiResponse = await fetch('/api/tools/api-tester', {                  <Plus className="w-4 h-4" />

                <button

                  onClick={addHeader}        method: 'POST',                  Add Header

                  className="btn-secondary text-sm flex items-center gap-2"

                >        headers: { 'Content-Type': 'application/json' },                </button>

                  <Plus className="w-4 h-4" />

                  Add        body: JSON.stringify({              </div>

                </button>

              </div>          method,            )}

              <div className="space-y-2">

                {headers.length === 0 ? (          url: finalUrl,

                  <p className="text-neural-400 text-sm">No custom headers</p>

                ) : (          headers: requestHeaders,            {/* Send Button */}

                  headers.map((header) => (

                    <div key={header.id} className="flex items-center gap-2">          body: body || undefined            <button

                      <input

                        type="checkbox"        })              onClick={sendRequest}

                        checked={header.enabled}

                        onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}      })              disabled={isLoading || !url.trim()}

                        className="w-4 h-4"

                      />              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg font-semibold transition"

                      <input

                        type="text"      const data = await apiResponse.json()            >

                        className="input-modern flex-1"

                        placeholder="Key"      const endTime = Date.now()              {isLoading ? (

                        value={header.key}

                        onChange={(e) => updateHeader(header.id, 'key', e.target.value)}                <>Processing...</>

                      />

                      <input      if (data.success) {              ) : (

                        type="text"

                        className="input-modern flex-1"        setResponse({                <>

                        placeholder="Value"

                        value={header.value}          status: data.data.status,                  <Send className="w-5 h-5" />

                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}

                      />          statusText: data.data.statusText,                  Send Request

                      <button

                        onClick={() => removeHeader(header.id)}          headers: data.data.headers,                </>

                        className="text-red-400 hover:text-red-300"

                      >          data: data.data.data,              )}

                        <Trash2 className="w-4 h-4" />

                      </button>          time: endTime - startTime            </button>

                    </div>

                  ))        })          </div>

                )}

              </div>      } else {

            </div>

        setError(data.error || 'Request failed')          {/* Response Section */}

            {/* Body */}

            {['POST', 'PUT', 'PATCH'].includes(method) && (      }          <div className="bg-neural-800/50 rounded-2xl p-6 border border-neural-700">

              <div className="card-modern p-6">

                <div className="flex items-center justify-between mb-4">    } catch (err: any) {            <div className="flex items-center justify-between mb-6">

                  <h2 className="text-xl font-semibold">Body</h2>

                  <div className="flex gap-2">      setError(err.message || 'Failed to send request')              <h2 className="text-2xl font-bold">Response</h2>

                    <select

                      className="input-modern text-sm"    } finally {              {response && (

                      value={bodyType}

                      onChange={(e) => setBodyType(e.target.value)}      setLoading(false)                <button

                    >

                      <option value="json">JSON</option>    }                  onClick={copyResponse}

                      <option value="text">Raw Text</option>

                      <option value="form">Form Data</option>  }                  className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400 hover:bg-brand-600/20 rounded-lg transition"

                      <option value="urlencoded">URL Encoded</option>

                    </select>                >

                    {bodyType === 'json' && (

                      <button  return (                  <Copy className="w-4 h-4" />

                        onClick={formatJson}

                        className="btn-secondary text-sm"    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">                  Copy

                      >

                        Format      <div className="container-custom py-12">                </button>

                      </button>

                    )}        <Link               )}

                  </div>

                </div>          href="/tools/network-tools"            </div>

                <textarea

                  className="input-modern w-full font-mono text-sm"          className="inline-flex items-center gap-2 text-neural-300 hover:text-white mb-8 transition-colors"

                  rows={10}

                  placeholder={        >            {!response && !isLoading && (

                    bodyType === 'json' 

                      ? '{\n  "key": "value"\n}'          <ArrowLeft className="w-4 h-4" />              <div className="h-full flex items-center justify-center text-center text-neural-400">

                      : 'Request body...'

                  }          Back to Network Tools                <div>

                  value={body}

                  onChange={(e) => setBody(e.target.value)}        </Link>                  <Send className="w-16 h-16 mx-auto mb-4 opacity-50" />

                />

              </div>                  <p>Send a request to see the response</p>

            )}

        <div className="text-center mb-12">                </div>

            {/* Send Button */}

            <button          <div className="flex items-center justify-center mb-6">              </div>

              onClick={handleSend}

              disabled={loading || !url.trim()}            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">            )}

              className="btn-primary w-full flex items-center justify-center gap-2"

            >              <Code className="w-10 h-10 text-white" />

              {loading ? (

                <>            </div>            {isLoading && (

                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />

                  Sending...          </div>              <div className="h-full flex items-center justify-center">

                </>

              ) : (          <h1 className="text-4xl md:text-5xl font-bold mb-4">                <div className="flex gap-2">

                <>

                  <Send className="w-5 h-5" />            API <span className="text-gradient bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Tester</span>                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" />

                  Send Request

                </>          </h1>                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />

              )}

            </button>          <p className="text-xl text-neural-300 max-w-2xl mx-auto">                  <div className="w-3 h-3 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />

          </div>

            Professional API testing tool with advanced features                </div>

          {/* Right Column - Response */}

          <div className="lg:sticky lg:top-6 lg:h-fit">          </p>              </div>

            <div className="card-modern p-6">

              <div className="flex items-center justify-between mb-4">        </div>            )}

                <h2 className="text-xl font-semibold">Response</h2>

                {response && (

                  <button

                    onClick={copyResponse}        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">            {response && (

                    className="btn-secondary text-sm flex items-center gap-2"

                  >          {/* Left Panel - Request Configuration */}              <div className="space-y-4">

                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}

                    {copied ? 'Copied!' : 'Copy'}          <div className="lg:col-span-2 space-y-6">                {/* Status */}

                  </button>

                )}            {/* Presets */}                {!response.error && (

              </div>

            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">                  <div className="flex items-center gap-4">

              {error && (

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">              <h3 className="text-lg font-semibold text-white mb-4">Quick Presets</h3>                    <div className={`px-3 py-1 rounded-lg font-semibold ${

                  <p className="text-red-400 text-sm">{error}</p>

                </div>              <div className="flex flex-wrap gap-2">                      response.status >= 200 && response.status < 300

              )}

                {PRESET_APIS.map((preset, idx) => (                        ? 'bg-green-600/20 text-green-400'

              {response ? (

                <div className="space-y-4">                  <button                        : response.status >= 400

                  {/* Status */}

                  <div className="flex items-center gap-4">                    key={idx}                        ? 'bg-red-600/20 text-red-400'

                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${

                      response.status >= 200 && response.status < 300                    onClick={() => loadPreset(preset)}                        : 'bg-yellow-600/20 text-yellow-400'

                        ? 'bg-green-500/20 text-green-400'

                        : response.status >= 400                    className="px-3 py-2 bg-neural-700 hover:bg-neural-600 rounded-lg text-sm transition-colors"                    }`}>

                        ? 'bg-red-500/20 text-red-400'

                        : 'bg-yellow-500/20 text-yellow-400'                  >                      {response.status} {response.statusText}

                    }`}>

                      {response.status} {response.statusText}                    {preset.name}                    </div>

                    </span>

                    {response.time !== undefined && (                  </button>                    {responseTime && (

                      <div className="flex items-center gap-1 text-sm text-neural-400">

                        <Clock className="w-4 h-4" />                ))}                      <div className="flex items-center gap-1 text-neural-400 text-sm">

                        {response.time}ms

                      </div>              </div>                        <Clock className="w-4 h-4" />

                    )}

                  </div>            </div>                        {responseTime}ms



                  {/* Response Body */}                      </div>

                  <div>

                    <h3 className="text-sm font-medium mb-2 text-neural-300">Body</h3>            {/* URL and Method */}                    )}

                    <pre className="bg-neural-800 rounded-lg p-4 overflow-auto max-h-96 text-sm">

                      <code>{JSON.stringify(response.data, null, 2)}</code>            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">                  </div>

                    </pre>

                  </div>              <h3 className="text-lg font-semibold text-white mb-4">Request</h3>                )}



                  {/* Response Headers */}              <div className="flex gap-3">

                  <div>

                    <h3 className="text-sm font-medium mb-2 text-neural-300">Headers</h3>                <select                {/* Error */}

                    <div className="bg-neural-800 rounded-lg p-4 space-y-1 text-sm max-h-48 overflow-auto">

                      {Object.entries(response.headers).map(([key, value]) => (                  value={method}                {response.error && (

                        <div key={key} className="flex gap-2">

                          <span className="text-violet-400 font-mono">{key}:</span>                  onChange={(e) => setMethod(e.target.value)}                  <div className="px-4 py-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">

                          <span className="text-neural-300 font-mono break-all">{value}</span>

                        </div>                  className="px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"                    <div className="font-semibold mb-1">Error</div>

                      ))}

                    </div>                >                    <div className="text-sm">{response.message}</div>

                  </div>

                </div>                  {REQUEST_METHODS.map(m => (                  </div>

              ) : (

                <div className="text-center py-12 text-neural-400">                    <option key={m} value={m}>{m}</option>                )}

                  <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />

                  <p>Send a request to see the response</p>                  ))}

                </div>

              )}                </select>                {/* Response Data */}

            </div>

          </div>                <input                <div className="bg-neural-900 rounded-lg p-4 max-h-96 overflow-auto">

        </div>

      </div>                  type="text"                  <pre className="text-sm text-neural-200 whitespace-pre-wrap break-words font-mono">

    </div>

  )                  value={url}                    {JSON.stringify(response.error ? response : response.data, null, 2)}

}

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
