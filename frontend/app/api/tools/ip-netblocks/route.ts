import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json();
    if (!ip || typeof ip !== 'string') {
      return NextResponse.json(
        { success: false, error: 'IP address is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanIP = ip.trim();
    const apiKey = process.env.WHOIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Use WHOIS XML API IP Netblocks endpoint
    const apiUrl = `https://ip-netblocks.whoisxmlapi.com/api/v2?apiKey=${encodeURIComponent(apiKey)}&ip=${encodeURIComponent(cleanIP)}`;
    
    console.log('[IP Netblocks] Looking up:', cleanIP);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Service experiencing high demand. Please try again shortly. 🙏' },
        { status: 429, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      console.error('[IP Netblocks] API error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable. Please try again later. 😊' },
        { status: 503, headers: corsHeaders }
      );
    }

    const data = await response.json();
    console.log('[IP Netblocks] Raw response:', JSON.stringify(data, null, 2));

    // Parse the response - WHOIS XML API returns inetnums array
    const netblock = data.inetnums?.[0] || data.result?.inetnums?.[0] || {};
    
    // Extract all available fields
    const result = {
      // Basic info
      ip: cleanIP,
      range: netblock.inetnum || netblock.inetnumFirst && netblock.inetnumLast 
        ? `${netblock.inetnumFirst} - ${netblock.inetnumLast}` 
        : 'N/A',
      rangeStart: netblock.inetnumFirst || 'N/A',
      rangeEnd: netblock.inetnumLast || 'N/A',
      rangeSize: netblock.inetnumSize || netblock.size || 0,
      
      // Network info
      netname: netblock.netname || netblock.name || 'N/A',
      nethandle: netblock.netHandle || 'N/A',
      nettype: netblock.netType || netblock.type || 'N/A',
      cidr: netblock.cidr || 'N/A',
      
      // Organization info
      organization: netblock.org?.name || netblock.orgName || netblock.organization || 'N/A',
      orgId: netblock.org?.orgId || netblock.orgId || 'N/A',
      
      // Location
      country: netblock.country || netblock.org?.country || 'N/A',
      
      // Dates
      updated: netblock.updated || netblock.lastChanged || 'N/A',
      created: netblock.created || netblock.regDate || 'N/A',
      
      // Additional info
      description: netblock.description || netblock.remarks || 'N/A',
      source: netblock.source || 'N/A',
      status: netblock.status || 'N/A',
      
      // ASN info if available
      as: {
        asn: netblock.as?.asn || data.as?.asn || 'N/A',
        name: netblock.as?.name || data.as?.name || 'N/A',
        route: netblock.as?.route || data.as?.route || 'N/A',
        domain: netblock.as?.domain || data.as?.domain || 'N/A',
      },
      
      // All netblocks if multiple
      totalNetblocks: data.inetnums?.length || data.result?.inetnums?.length || 0,
      allNetblocks: (data.inetnums || data.result?.inetnums || []).slice(0, 5).map((nb: any) => ({
        range: nb.inetnum || `${nb.inetnumFirst || ''} - ${nb.inetnumLast || ''}`,
        netname: nb.netname || nb.name || 'N/A',
        organization: nb.org?.name || nb.orgName || 'N/A',
        cidr: nb.cidr || 'N/A',
        size: nb.inetnumSize || nb.size || 0,
      })),
    };

    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[IP Netblocks] Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. 💫' },
      { status: 500, headers: corsHeaders }
    );
  }
}
