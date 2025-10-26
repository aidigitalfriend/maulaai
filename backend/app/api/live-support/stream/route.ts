import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({ 
      error: 'Live support streaming temporarily unavailable', 
      code: 'TEMPORARILY_DISABLED' 
    }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function POST(request: NextRequest) {
  return new Response(
    JSON.stringify({ 
      error: 'Live support streaming temporarily unavailable', 
      code: 'TEMPORARILY_DISABLED' 
    }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}