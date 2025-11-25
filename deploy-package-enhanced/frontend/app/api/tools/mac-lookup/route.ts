import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { mac } = await request.json()
    if (!mac || typeof mac !== 'string') {
      return NextResponse.json({ success: false, error: 'MAC address is required' }, { status: 400 })
    }

    const cleanMAC = mac.trim().replace(/[:-]/g, '')
    const apiKey = process.env.WHOIS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
    }

    const apiUrl = `https://mac-address.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&macAddress=${encodeURIComponent(cleanMAC)}`
    const response = await fetch(apiUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })

    if (response.status === 429) {
      return NextResponse.json({ success: false, error: 'Service experiencing high demand. Please try again shortly. 🙏' }, { status: 429 })
    }

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again later. 😊' }, { status: 503 })
    }

    const data = await response.json()
    const result = {
      mac: mac.trim(),
      vendor: data.vendorDetails?.companyName || data.manufacturerName || 'Unknown'
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('MAC Lookup Error:', error)
    return NextResponse.json({ success: false, error: 'An unexpected error occurred. 💫' }, { status: 500 })
  }
}
