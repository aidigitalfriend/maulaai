import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../../../backend/lib/mongodb'
import Presence from '../../../../../../backend/models/Presence'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const sessionId = req.headers.get('x-session-id') || ''
    const userId = req.headers.get('x-user-id') || null
    const userAgent = req.headers.get('user-agent') || ''
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing session id' }, { status: 400 })
    }

    await Presence.updateOne(
      { sessionId },
      { $set: { lastSeen: new Date(), userAgent }, $setOnInsert: { userId } },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Presence ping error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update presence' }, { status: 500 })
  }
}
