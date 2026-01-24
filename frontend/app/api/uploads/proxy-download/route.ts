import { NextRequest, NextResponse } from 'next/server';

// Proxy endpoint to download images that have CORS restrictions (like DALL-E images)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'image.png';

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 }
    );
  }

  // Validate URL - only allow certain domains for security
  const allowedDomains = [
    'oaidalleapiprodscus.blob.core.windows.net', // DALL-E images
    'dalleproduse.blob.core.windows.net', // DALL-E alternate
    'maulaai-bucket.s3.ap-southeast-1.amazonaws.com', // Maula AI S3 bucket
    's3.ap-southeast-1.amazonaws.com', // S3 alternate
  ];

  try {
    const urlObj = new URL(imageUrl);
    const isAllowed = allowedDomains.some((domain) =>
      urlObj.hostname.includes(domain)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // Fetch the image from the original source
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OnelastAI/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const imageBuffer = await response.arrayBuffer();

    // Return the image with download headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy download error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image download' },
      { status: 500 }
    );
  }
}
