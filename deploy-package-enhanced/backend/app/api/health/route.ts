import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint for API monitoring
export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      service: 'AI App Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      
      // Check service dependencies
      services: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          status: !!process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
        },
        anthropic: {
          configured: !!process.env.ANTHROPIC_API_KEY,
          status: !!process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured'
        },
        gemini: {
          configured: !!process.env.GEMINI_API_KEY,
          status: !!process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
        }
      },
      
      // System info
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      
      // API endpoints status
      endpoints: {
        health: 'active',
        ai: 'active',
        openai: 'active',
        anthropic: 'active',
        gemini: 'active'
      }
    };

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      service: 'AI App Backend API',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}