import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return Response.json({ error: 'Community stream temporarily disabled' }, { status: 503 })
}
