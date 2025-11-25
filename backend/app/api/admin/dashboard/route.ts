import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import JobApplication from '@/models/JobApplication'
import ContactMessage from '@/models/ContactMessage'
import { Visitor, PageView, ChatInteraction, ToolUsage } from '@/models/Analytics'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    if (type === 'overview') {
      // Get overview stats
      const [
        totalApplications,
        pendingApplications,
        totalContacts,
        newContacts,
        totalVisitors,
        totalPageViews,
        totalChatInteractions,
        totalToolUsages,
        recentApplications,
        recentContacts
      ] = await Promise.all([
        JobApplication.countDocuments(),
        JobApplication.countDocuments({ status: 'pending' }),
        ContactMessage.countDocuments(),
        ContactMessage.countDocuments({ status: 'new' }),
        Visitor.countDocuments(),
        PageView.countDocuments(),
        ChatInteraction.countDocuments(),
        ToolUsage.countDocuments(),
        JobApplication.find().sort({ submittedAt: -1 }).limit(5).select('fullName position submittedAt status'),
        ContactMessage.find().sort({ createdAt: -1 }).limit(5).select('name subject createdAt status category')
      ])

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            applications: {
              total: totalApplications,
              pending: pendingApplications
            },
            contacts: {
              total: totalContacts,
              new: newContacts
            },
            analytics: {
              totalVisitors,
              totalPageViews,
              totalChatInteractions,
              totalToolUsages
            }
          },
          recent: {
            applications: recentApplications,
            contacts: recentContacts
          }
        }
      })
    }

    if (type === 'applications') {
      const applications = await JobApplication.find()
        .sort({ submittedAt: -1 })
        .limit(50)
        .select('-__v')

      return NextResponse.json({
        success: true,
        data: applications
      })
    }

    if (type === 'contacts') {
      const contacts = await ContactMessage.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .select('-__v')

      return NextResponse.json({
        success: true,
        data: contacts
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type parameter'
    }, { status: 400 })

  } catch (error) {
    console.error('Admin Dashboard Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data'
      },
      { status: 500 }
    )
  }
}