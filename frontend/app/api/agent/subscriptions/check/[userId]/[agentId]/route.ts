import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; agentId: string }> }
) {
  try {
    const { userId, agentId } = await params;

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'User ID and Agent ID are required' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/agent/subscriptions/check/${userId}/${agentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to check subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
