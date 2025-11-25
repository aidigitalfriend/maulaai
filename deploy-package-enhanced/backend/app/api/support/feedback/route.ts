import { NextRequest, NextResponse } from 'next/server'
import { SupportTools } from '../../../../lib/support-tools'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sessionId, feedback } = body

    if (!userId || !sessionId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId, feedback' },
        { status: 400 }
      )
    }

    // Validate feedback structure
    if (!feedback.messageId || !feedback.rating || !['helpful', 'not_helpful'].includes(feedback.rating)) {
      return NextResponse.json(
        { error: 'Invalid feedback format' },
        { status: 400 }
      )
    }

    // Store feedback (in production, save to database)
    const feedbackRecord = {
      id: uuidv4(),
      userId,
      sessionId,
      messageId: feedback.messageId,
      rating: feedback.rating,
      comment: feedback.comment || null,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    }

    console.log('Feedback received:', feedbackRecord)

    // Log analytics for feedback
    await SupportTools.logAnalytics({
      type: 'feedback_received',
      userId,
      sessionId,
      category: 'user_feedback',
      metadata: {
        rating: feedback.rating,
        hasComment: !!feedback.comment,
        commentLength: feedback.comment?.length || 0,
        messageId: feedback.messageId
      }
    })

    // Update session statistics (in production, update database)
    await updateSessionFeedback(sessionId, feedback.rating)

    // Send confirmation email if user provided negative feedback
    if (feedback.rating === 'not_helpful' && feedback.comment) {
      await sendFeedbackNotification(userId, sessionId, feedback)
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback received successfully',
      feedbackId: feedbackRecord.id
    })

  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}

/**
 * Update session with feedback information
 */
async function updateSessionFeedback(sessionId: string, rating: string) {
  try {
    // In production, update your session database
    console.log(`Session ${sessionId} feedback: ${rating}`)
    
    // Update session status to include feedback
    const sessionUpdate = {
      sessionId,
      feedbackRating: rating,
      feedbackTimestamp: new Date(),
      status: 'completed_with_feedback'
    }
    
    // This would be a database operation in production
    console.log('Session updated with feedback:', sessionUpdate)
    
  } catch (error) {
    console.error('Error updating session feedback:', error)
  }
}

/**
 * Send notification for negative feedback
 */
async function sendFeedbackNotification(userId: string, sessionId: string, feedback: any) {
  try {
    // Get user profile for email
    const userProfile = await SupportTools.getUserProfile(userId)
    if (!userProfile) return

    // In production, send email to support team
    const notificationData = {
      subject: `Negative Feedback Received - Session ${sessionId}`,
      userId,
      userEmail: userProfile.email,
      userName: userProfile.name,
      sessionId,
      rating: feedback.rating,
      comment: feedback.comment,
      timestamp: new Date()
    }

    console.log('Negative feedback notification:', notificationData)
    
    // Would send email via your email service here
    
  } catch (error) {
    console.error('Error sending feedback notification:', error)
  }
}

export async function GET(request: NextRequest) {
  // Get feedback statistics
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'sessionId or userId required' },
        { status: 400 }
      )
    }

    // In production, query your feedback database
    const mockStats = {
      totalFeedback: 150,
      positiveRating: 128,
      negativeRating: 22,
      satisfactionRate: 85.3,
      averageResponseTime: 3.2,
      recentFeedback: [
        {
          id: 'fb1',
          rating: 'helpful',
          comment: 'Great service, resolved my issue quickly!',
          timestamp: new Date('2024-10-09')
        },
        {
          id: 'fb2',
          rating: 'not_helpful',
          comment: 'Could not resolve my billing issue',
          timestamp: new Date('2024-10-08')
        }
      ]
    }

    return NextResponse.json(mockStats)

  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback statistics' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}