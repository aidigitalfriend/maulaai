import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  let cleanDomain = '' // Declare outside try block for fallback access
  
  try {
    const { domain } = await request.json()

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Domain name is required' },
        { status: 400 }
      )
    }

    // Clean domain name
    cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

    const whoisApiKey = process.env.WHOIS_API_KEY
    
    if (!whoisApiKey) {
      return NextResponse.json(
        { success: false, error: 'WHOIS API key not configured' },
        { status: 500 }
      )
    }

    // Use WHOIS API with GET method and URL parameters (standard approach)
    console.log(`Attempting WHOIS lookup for domain: ${cleanDomain}`)
    
    // Build URL with query parameters
    const apiUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${encodeURIComponent(whoisApiKey)}&domainName=${encodeURIComponent(cleanDomain)}&outputFormat=JSON`
    
    console.log('WHOIS API Request URL:', apiUrl.replace(whoisApiKey, whoisApiKey.substring(0, 10) + '...'))
    console.log('API Key prefix:', whoisApiKey.substring(0, 10) + '...')
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    console.log('WHOIS API Response Status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('WHOIS API Error Response:', errorText)
      throw new Error(`WHOIS API request failed: ${response.status} ${response.statusText}`)
    }

    const responseText = await response.text()
    let data: any
    
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('WHOIS API Response (not JSON):', responseText.substring(0, 500))
      throw new Error('WHOIS API returned invalid JSON response')
    }

    if (data.ErrorMessage) {
      const errorMsg = data.ErrorMessage.msg || 'WHOIS lookup failed'
      const errorCode = data.ErrorMessage.errorCode || ''
      
      // Check if it's an API key authentication error
      if (errorCode.includes('API_KEY') || errorMsg.includes('authenticate failed')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'WHOIS API service is currently unavailable. The API key may be invalid or has exceeded its quota. Please try again later or contact support.' 
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      )
    }

    const whoisRecord = data.WhoisRecord || {}
    const registryData = whoisRecord.registryData || {}
    const registrarData = whoisRecord.registrarData || {}

    // Ensure status is always an array
    let statusValue = registryData.status || whoisRecord.status || []
    if (!Array.isArray(statusValue)) {
      statusValue = statusValue ? [statusValue] : []
    }

    const result = {
      domain: cleanDomain,
      registrar: registryData.registrarName || whoisRecord.registrarName || 'N/A',
      createdDate: registryData.createdDate || whoisRecord.createdDate,
      expiryDate: registryData.expiresDate || whoisRecord.expiresDate,
      updatedDate: registryData.updatedDate || whoisRecord.updatedDate,
      nameServers: registryData.nameServers?.hostNames || whoisRecord.nameServers?.hostNames || [],
      status: statusValue,
      registrantOrg: registryData.registrant?.organization || whoisRecord.registrant?.organization,
      registrantCountry: registryData.registrant?.country || whoisRecord.registrant?.country,
      raw: whoisRecord.strippedText || whoisRecord.rawText || ''
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('WHOIS Lookup Error (trying fallback):', error)
    
    // Fallback: Try using system whois command
    try {
      const { stdout } = await execAsync(`whois ${cleanDomain}`, { timeout: 30000 })
      
      // Parse basic information from raw whois output
      const lines = stdout.split('\n')
      const result: any = {
        domain: cleanDomain,
        registrar: 'N/A',
        createdDate: undefined,
        expiryDate: undefined,
        updatedDate: undefined,
        nameServers: [],
        status: [],
        registrantOrg: undefined,
        registrantCountry: undefined,
        raw: stdout
      }
      
      // Extract basic info
      for (const line of lines) {
        const lower = line.toLowerCase()
        if (lower.includes('registrar:') && result.registrar === 'N/A') {
          result.registrar = line.split(':')[1]?.trim() || 'N/A'
        }
        if (lower.includes('creation date:') || lower.includes('created:')) {
          result.createdDate = line.split(':').slice(1).join(':').trim()
        }
        if (lower.includes('expiry date:') || lower.includes('expiration date:') || lower.includes('expires:')) {
          result.expiryDate = line.split(':').slice(1).join(':').trim()
        }
        if (lower.includes('updated date:') || lower.includes('last updated:')) {
          result.updatedDate = line.split(':').slice(1).join(':').trim()
        }
        if (lower.includes('name server:') || lower.includes('nserver:')) {
          result.nameServers.push(line.split(':').slice(1).join(':').trim())
        }
      }
      
      return NextResponse.json({
        success: true,
        data: result,
        fallback: true
      })
    } catch (fallbackError: any) {
      console.error('Fallback WHOIS Error:', fallbackError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'WHOIS service is currently unavailable. The API key may be invalid or the whois command is not installed on the server.' 
        },
        { status: 503 }
      )
    }
  }
}
