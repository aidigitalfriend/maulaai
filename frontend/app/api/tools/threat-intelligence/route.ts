import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Domain or IP address is required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const apiKey = process.env.VIRUSTOTAL_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'VirusTotal API key not configured' },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    console.log(`Scanning for threats: ${cleanDomain}`)

    // Use VirusTotal API for domain analysis
    const apiUrl = `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(cleanDomain)}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      }
    })

    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Threat intelligence service is experiencing high demand. Please try again shortly. 🙏' },
        {
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Threat intelligence service is temporarily unavailable. Please try again later. 😊' },
        {
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    const data = await response.json()

    if (!data.data || !data.data.attributes) {
      return NextResponse.json(
        { success: false, error: 'Unable to scan for threats. Please verify the domain and try again. 🌐' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    const attributes = data.data.attributes
    const lastAnalysisStats = attributes.last_analysis_stats || {}
    const totalScans = lastAnalysisStats.harmless + lastAnalysisStats.malicious + lastAnalysisStats.suspicious + lastAnalysisStats.timeout + lastAnalysisStats.undetected

    // Calculate risk score based on VirusTotal analysis
    const maliciousCount = lastAnalysisStats.malicious || 0
    const suspiciousCount = lastAnalysisStats.suspicious || 0
    const riskScore = totalScans > 0 ? Math.round(((maliciousCount + suspiciousCount) / totalScans) * 100) : 0

    const result = {
      domain: cleanDomain,
      riskScore,
      isMalicious: maliciousCount > 0,
      threatTypes: [],
      details: {
        phishing: false,
        malware: maliciousCount > 0,
        spam: false,
        suspicious: suspiciousCount > 0
      },
      analysis: {
        totalScans,
        malicious: maliciousCount,
        suspicious: suspiciousCount,
        harmless: lastAnalysisStats.harmless || 0,
        undetected: lastAnalysisStats.undetected || 0
