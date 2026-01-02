i
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

mport { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Domain or IP address is required' },
        { status: 400 }
      , {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const apiKey = process.env.WHOIS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Threat Intelligence API key not configured' },
        { status: 500 }
      , {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    }

    console.log(`Scanning for threats: ${cleanDomain}`)

    const apiUrl = `https://threat-intelligence.whoisxmlapi.com/api/v1?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(cleanDomain)}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })

    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Threat intelligence service is experiencing high demand. Please try again shortly. 🙏' },
        { status: 429 }
      , {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Threat intelligence service is temporarily unavailable. Please try again later. 😊' },
        { status: 503 }
      , {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    }

    const data = await response.json()

    if (data.error || data.ErrorMessage) {
      return NextResponse.json(
        { success: false, error: 'Unable to scan for threats. Please verify the domain and try again. 🌐' },
        { status: 400 }
      , {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    }

    const riskScore = data.riskScore || 0
    const threats = data.threats || []
    
    const result = {
      domain: cleanDomain,
      riskScore,
      isMalicious: riskScore >= 70,
      threatTypes: threats.map((t: any) => t.type || t).filter(Boolean),
      details: {
        phishing: threats.some((t: any) => (t.type || t).toLowerCase().includes('phish')),
        malware: threats.some((t: any) => (t.type || t).toLowerCase().includes('malware')),
        spam: threats.some((t: any) => (t.type || t).toLowerCase().includes('spam')),
        suspicious: riskScore >= 40 && riskScore < 70
      }
    }

    return NextResponse.json({ success: true, data: result }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error: any) {
    console.error('Threat Intelligence Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later. 💫' },
      { status: 500 }
    , {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}
