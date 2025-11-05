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

    // Clean domain name
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

    const whoisApiKey = process.env.WHOIS_API_KEY
    
    if (!whoisApiKey) {
      return NextResponse.json(
        { success: false, error: 'WHOIS API key not configured' },
        { status: 500 }
      )
    }

    // Use WHOIS API
    const response = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${whoisApiKey}&domainName=${cleanDomain}&outputFormat=JSON`)
    
    if (!response.ok) {
      throw new Error('WHOIS API request failed')
    }

    const data = await response.json()

    if (data.ErrorMessage) {
      return NextResponse.json(
        { success: false, error: data.ErrorMessage.msg || 'WHOIS lookup failed' },
        { status: 400 }
      )
    }

    const whoisRecord = data.WhoisRecord || {}
    const registryData = whoisRecord.registryData || {}
    const registrarData = whoisRecord.registrarData || {}

    const result = {
      domain: cleanDomain,
      registrar: registryData.registrarName || whoisRecord.registrarName || 'N/A',
      createdDate: registryData.createdDate || whoisRecord.createdDate,
      expiryDate: registryData.expiresDate || whoisRecord.expiresDate,
      updatedDate: registryData.updatedDate || whoisRecord.updatedDate,
      nameServers: registryData.nameServers?.hostNames || whoisRecord.nameServers?.hostNames || [],
      status: registryData.status || whoisRecord.status || [],
      registrantOrg: registryData.registrant?.organization || whoisRecord.registrant?.organization,
      registrantCountry: registryData.registrant?.country || whoisRecord.registrant?.country,
      raw: whoisRecord.strippedText || whoisRecord.rawText || ''
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('WHOIS Lookup Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to perform WHOIS lookup' 
      },
      { status: 500 }
    )
  }
}
