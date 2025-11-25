import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  messageId: string;
  agentId: string;
  feedbackType: 'positive' | 'negative';
  timestamp: string;
  userId?: string;
  sessionId?: string;
  messageContent?: string;
}

interface FeedbackResponse {
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    feedbackId: string;
    processed: boolean;
  };
}

// In-memory storage for feedback (in production, use database)
const feedbackStorage = new Map<string, {
  messageId: string;
  agentId: string;
  feedbackType: 'positive' | 'negative';
  timestamp: string;
  userId: string;
  sessionId?: string;
  messageContent?: string;
}>();

// Feedback analytics storage
const feedbackAnalytics = new Map<string, {
  agentId: string;
  totalPositive: number;
  totalNegative: number;
  totalFeedback: number;
  lastUpdated: string;
}>();

function updateAnalytics(agentId: string, feedbackType: 'positive' | 'negative') {
  const analytics = feedbackAnalytics.get(agentId) || {
    agentId,
    totalPositive: 0,
    totalNegative: 0,
    totalFeedback: 0,
    lastUpdated: new Date().toISOString()
  };

  if (feedbackType === 'positive') {
    analytics.totalPositive++;
  } else {
    analytics.totalNegative++;
  }
  
  analytics.totalFeedback++;
  analytics.lastUpdated = new Date().toISOString();
  
  feedbackAnalytics.set(agentId, analytics);
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { messageId, agentId, feedbackType, timestamp, userId = 'anonymous', sessionId, messageContent } = body;

    // Validate required fields
    if (!messageId || !agentId || !feedbackType || !timestamp) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: messageId, agentId, feedbackType, timestamp'
      } as FeedbackResponse, { status: 400 });
    }

    // Validate feedbackType
    if (!['positive', 'negative'].includes(feedbackType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid feedbackType. Must be "positive" or "negative"'
      } as FeedbackResponse, { status: 400 });
    }

    // Generate feedback ID
    const feedbackId = `feedback-${agentId}-${messageId}-${Date.now()}`;

    // Store feedback
    feedbackStorage.set(feedbackId, {
      messageId,
      agentId,
      feedbackType,
      timestamp,
      userId,
      sessionId,
      messageContent
    });

    // Update analytics
    updateAnalytics(agentId, feedbackType);

    console.log(`Feedback received: ${feedbackType} for agent ${agentId}, message ${messageId}`);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      metadata: {
        feedbackId,
        processed: true
      }
    } as FeedbackResponse);

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error while processing feedback'
    } as FeedbackResponse, { status: 500 });
  }
}

// GET: Retrieve feedback analytics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const stats = url.searchParams.get('stats') === 'true';

    if (agentId) {
      // Get specific agent analytics
      const analytics = feedbackAnalytics.get(agentId);
      
      if (!analytics) {
        return NextResponse.json({
          success: false,
          error: 'No feedback data found for this agent'
        } as FeedbackResponse, { status: 404 });
      }

      const satisfactionRate = analytics.totalFeedback > 0 
        ? Math.round((analytics.totalPositive / analytics.totalFeedback) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          ...analytics,
          satisfactionRate: `${satisfactionRate}%`
        }
      });
    }

    if (stats) {
      // Get overall statistics
      const allAnalytics = Array.from(feedbackAnalytics.values());
      const totalFeedback = allAnalytics.reduce((sum, a) => sum + a.totalFeedback, 0);
      const totalPositive = allAnalytics.reduce((sum, a) => sum + a.totalPositive, 0);
      const totalNegative = allAnalytics.reduce((sum, a) => sum + a.totalNegative, 0);
      const overallSatisfactionRate = totalFeedback > 0 
        ? Math.round((totalPositive / totalFeedback) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          totalAgents: allAnalytics.length,
          totalFeedback,
          totalPositive,
          totalNegative,
          overallSatisfactionRate: `${overallSatisfactionRate}%`,
          agentAnalytics: allAnalytics.map(a => ({
            ...a,
            satisfactionRate: `${a.totalFeedback > 0 ? Math.round((a.totalPositive / a.totalFeedback) * 100) : 0}%`
          }))
        }
      });
    }

    // Get all feedback entries
    const allFeedback = Array.from(feedbackStorage.values());
    
    return NextResponse.json({
      success: true,
      data: allFeedback,
      metadata: {
        totalEntries: allFeedback.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Feedback GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error while retrieving feedback'
    } as FeedbackResponse, { status: 500 });
  }
}

// DELETE: Clear feedback data (admin function)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');

    if (agentId) {
      // Clear feedback for specific agent
      const feedbackEntries = Array.from(feedbackStorage.entries());
      const agentFeedbackKeys = feedbackEntries
        .filter(([_, feedback]) => feedback.agentId === agentId)
        .map(([key, _]) => key);

      agentFeedbackKeys.forEach(key => feedbackStorage.delete(key));
      feedbackAnalytics.delete(agentId);

      return NextResponse.json({
        success: true,
        message: `Cleared ${agentFeedbackKeys.length} feedback entries for agent ${agentId}`
      });
    }

    // Clear all feedback
    const totalEntries = feedbackStorage.size + feedbackAnalytics.size;
    feedbackStorage.clear();
    feedbackAnalytics.clear();

    return NextResponse.json({
      success: true,
      message: `Cleared ${totalEntries} total feedback entries and analytics`
    });

  } catch (error) {
    console.error('Feedback DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error while clearing feedback'
    } as FeedbackResponse, { status: 500 });
  }
}