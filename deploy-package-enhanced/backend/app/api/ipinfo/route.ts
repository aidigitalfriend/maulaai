import { NextRequest, NextResponse } from 'next/server';

interface IPInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: {
    asn: string;
    name: string;
    domain: string;
    route: string;
    type: string;
  };
  company?: {
    name: string;
    domain: string;
    type: string;
  };
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
    hosting: boolean;
    service: string;
  };
  abuse?: {
    address: string;
    country: string;
    email: string;
    name: string;
    network: string;
    phone: string;
  };
  domains?: {
    ip: string;
    page: number;
    total: number;
    domains: string[];
  };
}

interface ProcessedIPInfo {
  ip: string;
  location: {
    city?: string;
    region?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    postal?: string;
    timezone?: string;
  };
  network: {
    isp?: string;
    organization?: string;
    asn?: string;
    asnName?: string;
    domain?: string;
    type?: string;
  };
  security: {
    isVPN: boolean;
    isProxy: boolean;
    isTor: boolean;
    isHosting: boolean;
    threat: 'low' | 'medium' | 'high';
    service?: string;
  };
  abuse?: {
    contact: string;
    network: string;
    name: string;
  };
  metadata: {
    hostname?: string;
    lastUpdated: string;
    source: string;
    userAgent?: string;
  };
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to connection remote address (may be proxy in production)
  return request.headers.get('x-forwarded-for') || '8.8.8.8'; // Fallback for development
}

function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function processIPInfoData(data: IPInfoResponse): ProcessedIPInfo {
  // Parse coordinates
  let coordinates;
  if (data.loc) {
    const [lat, lng] = data.loc.split(',').map(Number);
    coordinates = { lat, lng };
  }

  // Determine threat level
  let threat: 'low' | 'medium' | 'high' = 'low';
  if (data.privacy?.tor || data.privacy?.proxy) {
    threat = 'high';
  } else if (data.privacy?.vpn || data.privacy?.hosting) {
    threat = 'medium';
  }

  return {
    ip: data.ip,
    location: {
      city: data.city,
      region: data.region,
      country: data.country,
      coordinates,
      postal: data.postal,
      timezone: data.timezone,
    },
    network: {
      isp: data.org,
      organization: data.company?.name,
      asn: data.asn?.asn,
      asnName: data.asn?.name,
      domain: data.asn?.domain || data.company?.domain,
      type: data.asn?.type || data.company?.type,
    },
    security: {
      isVPN: data.privacy?.vpn || false,
      isProxy: data.privacy?.proxy || false,
      isTor: data.privacy?.tor || false,
      isHosting: data.privacy?.hosting || false,
      threat,
      service: data.privacy?.service,
    },
    abuse: data.abuse ? {
      contact: data.abuse.email,
      network: data.abuse.network,
      name: data.abuse.name,
    } : undefined,
    metadata: {
      hostname: data.hostname,
      lastUpdated: new Date().toISOString(),
      source: 'ipinfo.io',
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryIP = searchParams.get('ip');
    
    // Get IP to lookup - either from query param or client's real IP
    const targetIP = queryIP || getClientIP(request);
    
    // Validate IP format
    if (!isValidIP(targetIP)) {
      return NextResponse.json({
        error: 'Invalid IP address format',
        code: 'INVALID_IP'
      }, { status: 400 });
    }

    // Get IPInfo API token from environment
    const apiToken = process.env.IPINFO_API_TOKEN;
    if (!apiToken) {
      console.error('IPInfo API token not configured');
      return NextResponse.json({
        error: 'IP lookup service not configured',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    // Build API URL with all available details
    const apiUrl = `https://ipinfo.io/${targetIP}?token=${apiToken}`;
    
    // Make request to IPInfo API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-IPTool/1.0',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`IPInfo API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return NextResponse.json({
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT'
        }, { status: 429 });
      }
      
      if (response.status === 401) {
        return NextResponse.json({
          error: 'API authentication failed',
          code: 'AUTH_ERROR'
        }, { status: 401 });
      }

      return NextResponse.json({
        error: 'Failed to fetch IP information',
        code: 'API_ERROR'
      }, { status: 502 });
    }

    const rawData: IPInfoResponse = await response.json();
    
    // Process and structure the data
    const processedData = processIPInfoData(rawData);
    
    // Add user agent information if this is auto-detection
    if (!queryIP) {
      const userAgent = request.headers.get('user-agent') || '';
      processedData.metadata = {
        ...processedData.metadata,
        userAgent,
      };
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      raw: rawData, // Include raw data for developers
    });

  } catch (error) {
    console.error('IP Info API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        error: 'Request timeout. Please try again.',
        code: 'TIMEOUT'
      }, { status: 408 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip } = body;
    
    if (!ip) {
      return NextResponse.json({
        error: 'IP address is required',
        code: 'MISSING_IP'
      }, { status: 400 });
    }
    
    // Validate IP format
    if (!isValidIP(ip)) {
      return NextResponse.json({
        error: 'Invalid IP address format',
        code: 'INVALID_IP'
      }, { status: 400 });
    }
    
    // Redirect to GET with query param
    const url = new URL(request.url);
    url.searchParams.set('ip', ip);
    
    // Forward to GET handler
    const getRequest = new NextRequest(url, {
      method: 'GET',
      headers: request.headers,
    });
    
    return GET(getRequest);
    
  } catch (error) {
    console.error('IP Info POST error:', error);
    return NextResponse.json({
      error: 'Invalid request body',
      code: 'INVALID_BODY'
    }, { status: 400 });
  }
}