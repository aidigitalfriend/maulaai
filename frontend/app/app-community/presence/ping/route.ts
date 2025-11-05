import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import dbConnect from '../../../../../backend/lib/mongodb'
import Presence from '../../../../../backend/models/Presence'

export async function POST(req: NextRequest) {
  try {
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
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
