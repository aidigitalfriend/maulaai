import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Notification from '@/models/Notification'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const { userId, type, title, message, category = 'system', priority = 'medium', data } = await request.json()

    // Validation
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create notification
    const notification = new Notification({
      userId,
      type,
      category,
      title,
      message,
      priority,
      data,
      channels: [type], // Default to same as type
    })

    const savedNotification = await notification.save()

    return NextResponse.json({
      success: true,
      data: savedNotification
    })

  } catch (error) {
    console.error('Notification Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const read = searchParams.get('read')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (userId) query.userId = userId
    if (type) query.type = type
    if (read !== null) query.read = read === 'true'

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Notification.countDocuments(query)
    const unreadCount = userId ? await Notification.countDocuments({ userId, read: false }) : 0

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        unreadCount
      }
    })

  } catch (error) {
    console.error('Notifications GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}