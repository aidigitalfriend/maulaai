import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json()
    if (!ip || typeof ip !== 'string') {
      return NextResponse.json({ success: false, error: 'IP address is required' }, { status: 400 })
    }

    const cleanIP = ip.trim()
    const apiKey = process.env.WHOIS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
    }

    const apiUrl = `https://ip-netblocks.whoisxmlapi.com/api/v2?apiKey=${encodeURIComponent(apiKey)}&ip=${encodeURIComponent(cleanIP)}`
    const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })

    if (response.status === 429) {
      return NextResponse.json({ success: false, error: 'Service experiencing high demand. Please try again shortly. 🙏' }, { status: 429 })
    }

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later. 😊' }, { status: 503 })
    }

    const data = await response.json()
    const result = {
      range: data.inetnums?.[0]?.inetnum || 'N/A',
      organization: data.inetnums?.[0]?.org || data.inetnums?.[0]?.orgName || 'N/A'
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('IP Netblocks Error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred. 💫' }, { status: 500 })
  }
}
