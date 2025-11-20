import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Domain name is required' },
        { status: 400 }
      )
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const apiKey = process.env.WHOIS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Domain Reputation API key not configured' },
        { status: 500 }
      )
    }

    console.log(`Checking reputation for: ${cleanDomain}`)

    const apiUrl = `https://domain-reputation.whoisxmlapi.com/api/v2?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(cleanDomain)}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })

    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Domain reputation service is experiencing high demand. Please try again shortly. 🙏' },
        { status: 429 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Domain reputation service is temporarily unavailable. Please try again later. 😊' },
        { status: 503 }
      )
    }

    const data = await response.json()

    if (data.error || data.ErrorMessage) {
      return NextResponse.json(
        { success: false, error: 'Unable to check domain reputation. Please verify the domain and try again. 🌐' },
        { status: 400 }
      )
    }

    const reputationScore = data.reputationScore || data.score || 50
    let trustLevel = 'Unknown'
    let verdict = ''

    if (reputationScore >= 80) {
      trustLevel = 'Excellent'
      verdict = 'This domain has an excellent reputation and is highly trustworthy! ✓'
    } else if (reputationScore >= 60) {
      trustLevel = 'Good'
      verdict = 'This domain has a good reputation and appears to be safe.'
    } else if (reputationScore >= 40) {
      trustLevel = 'Fair'
      verdict = 'This domain has mixed signals. Exercise caution.'
    } else {
      trustLevel = 'Poor'
      verdict = 'This domain has a poor reputation. Be very careful! ⚠️'
    }

    const result = {
      domain: cleanDomain,
      reputationScore,
      trustLevel,
      verdict
    }

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    console.error('Domain Reputation Error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later. 💫' },
      { status: 500 }
    )
  }
}
