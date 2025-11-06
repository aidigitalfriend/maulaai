import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json()

    if (!ip || typeof ip !== 'string') {
      return NextResponse.json(
        { success: false, error: 'IP address is required' },
        { status: 400 }
      )
    }

    // Clean IP address
    const cleanIP = ip.trim()
    const apiKey = process.env.IP_GEOLOCATION_API_KEY || process.env.WHOIS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'IP Geolocation API key not configured' },
        { status: 500 }
      )
    }

    console.log(`Attempting IP Geolocation lookup for: ${cleanIP}`)

    // Call WHOIS XML API IP Geolocation service
    const apiUrl = `https://ip-geolocation.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&ipAddress=${encodeURIComponent(cleanIP)}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    console.log('IP Geolocation API Response Status:', response.status, response.statusText)

    if (!response.ok) {
      // Check if it's a rate limit error
      if (response.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: 'IP Geolocation service is currently experiencing high demand. Please try again in a few moments. 🙏'
          },
          { status: 429 }
        )
      }

      const errorText = await response.text()
      console.error('IP Geolocation API Error:', errorText)
      
      return NextResponse.json(
        {
          success: false,
          error: 'IP Geolocation service is temporarily unavailable. Please try again later. 😊'
        },
        { status: 503 }
      )
    }

    const responseText = await response.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('IP Geolocation API returned invalid JSON')
      return NextResponse.json(
        {
          success: false,
          error: 'Received invalid response from geolocation service. Please try again. 🔄'
        },
        { status: 500 }
      )
    }

    // Check for API errors
    if (data.error) {
      console.error('IP Geolocation API Error:', data.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to retrieve geolocation data at this time. Please verify the IP address and try again. 🌐'
        },
        { status: 400 }
      )
    }

    // Format the response data
    const result = {
      ip: data.ip || cleanIP,
      location: {
        country: data.location?.country || 'Unknown',
        region: data.location?.region || '',
        city: data.location?.city || '',
        lat: data.location?.lat || 0,
        lng: data.location?.lng || 0,
        postalCode: data.location?.postalCode || '',
        timezone: data.location?.timezone || ''
      },
      isp: data.isp || 'Unknown',
      connectionType: data.connection_type || data.connectionType || 'Unknown',
      organization: data.organization || data.org || '',
      asn: {
        asn: data.asn || '',
        name: data.as_name || data.asName || '',
        route: data.as_route || data.asRoute || ''
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('IP Geolocation Lookup Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while looking up the IP address. Please try again later. 💫'
      },
      { status: 500 }
    )
  }
}
