import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Allow local/dev without MongoDB by short-circuiting when no URI
    const hasMongo = !!process.env.MONGODB_URI
    if (!hasMongo) {
      // Best-effort: pretend success so the UI works in demo mode
      return NextResponse.json({ success: true, demo: true })
    }
    // Dynamically import DB and model only when needed to avoid bundling optional deps
    const [{ default: dbConnect }, { default: Presence }] = await Promise.all([
      import('../../../../../backend/lib/mongodb'),
      import('../../../../../backend/models/Presence'),
    ])
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const { userId = null, userName = 'Guest' } = body || {}

    await Presence.updateOne(
      { userId },
      { $set: { userId, userName, lastSeen: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('App-Community presence ping error:', error)
    // Fallback to success in dev to avoid blocking the UI
    return NextResponse.json({ success: true, demo: true })
  }
}
