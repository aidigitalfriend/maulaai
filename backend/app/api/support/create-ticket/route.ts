import { NextRequest, NextResponse } from 'next/server'
import { SupportTools } from '../../../../lib/support-tools'
import { v4 as uuidv4 } from 'uuid'

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return request.headers.get('x-forwarded-for') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, sessionId, conversationId, messages } = body

    if (!userId || !sessionId || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId, messages' },
        { status: 400 }
      )
    }

    // Get user profile for ticket creation
    const userProfile = await SupportTools.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get subscription details
    const subscription = await SupportTools.getSubscriptionStatus(userId)

    // Analyze conversation to create intelligent summary
    const conversationSummary = await createConversationSummary(messages)
    
    // Classify the overall issue from conversation
    const lastUserMessage = messages.filter((m: any) => m.type === 'user').pop()
    const classification = lastUserMessage 
      ? await SupportTools.classifyIssue(lastUserMessage.content, {
          userPlan: userProfile.plan,
          subscriptionStatus: subscription?.status
        })
      : {
          category: 'General' as any,
          severity: 'P3' as any,
          suggestedSLA: '48 hours',
          assigneeQueue: 'general-support'
        }

    // Create comprehensive ticket payload
    const ticketPayload = {
      userId,
      conversationId: conversationId || sessionId,
      summary: conversationSummary.title,
      category: classification.category,
      severity: classification.severity,
      description: conversationSummary.description,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: getClientIP(request),
      environment: {
        timestamp: new Date(),
        sessionId,
        conversationLength: messages.length,
        userPlan: userProfile.plan,
        subscriptionStatus: subscription?.status,
        browserInfo: request.headers.get('user-agent') || undefined
      }
    }

    // Create the ticket
    const ticket = await SupportTools.createTicket(ticketPayload)

    // Send detailed notification email to support team
    await sendSupportTeamNotification(ticket, userProfile, subscription, conversationSummary, messages)

    // Send confirmation email to user
    await sendUserConfirmationEmail(ticket, userProfile, conversationSummary)

    // Log ticket creation analytics
    await SupportTools.logAnalytics({
      type: 'support_ticket_created',
      userId,
      sessionId,
      category: classification.category,
      metadata: {
        ticketId: ticket.id,
        severity: classification.severity,
        category: classification.category,
        conversationLength: messages.length,
        escalationReason: 'user_request',
        userPlan: userProfile.plan
      }
    })

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      sla: ticket.severity === 'P1' ? '4 hours' : ticket.severity === 'P2' ? '24 hours' : '48 hours',
      category: ticket.category,
      severity: ticket.severity,
      assignedQueue: classification.assigneeQueue,
      expectedResponse: classification.suggestedSLA,
      message: `Ticket ${ticket.id} created successfully. Our ${classification.assigneeQueue} will contact you within ${classification.suggestedSLA}.`
    })

  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}

/**
 * Create intelligent conversation summary for ticket
 */
async function createConversationSummary(messages: any[]) {
  try {
    const userMessages = messages.filter(m => m.type === 'user')
    const assistantMessages = messages.filter(m => m.type === 'assistant')
    
    const firstUserMessage = userMessages[0]?.content || 'User started support conversation'
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || ''
    
    // Extract key issues and attempted solutions
    const issueKeywords = extractIssueKeywords(userMessages.map(m => m.content).join(' '))
    const attemptedSolutions = extractAttemptedSolutions(assistantMessages.map(m => m.content).join(' '))

    const title = generateTicketTitle(firstUserMessage, issueKeywords)
    
    const description = `
**User Issue Summary:**
${firstUserMessage}

${lastUserMessage && lastUserMessage !== firstUserMessage ? `\n**Latest User Message:**\n${lastUserMessage}\n` : ''}

**Issue Keywords:** ${issueKeywords.join(', ')}

**Solutions Already Attempted:**
${attemptedSolutions.length > 0 ? attemptedSolutions.map(s => `• ${s}`).join('\n') : '• Initial AI troubleshooting provided'}

**Conversation Context:**
• Total messages: ${messages.length}
• User messages: ${userMessages.length}
• AI responses: ${assistantMessages.length}
• Duration: Started ${new Date(messages[0]?.timestamp).toLocaleString()}

**Full Conversation Log:**
---
${messages.map(m => `[${m.type.toUpperCase()}] ${new Date(m.timestamp).toLocaleTimeString()}: ${m.content}`).join('\n\n')}
---

**Next Steps Required:**
Human agent should review the full conversation above and continue where AI assistance left off.
    `.trim()

    return {
      title,
      description,
      keywords: issueKeywords,
      attemptedSolutions
    }

  } catch (error) {
    console.error('Error creating conversation summary:', error)
    return {
      title: 'Support Request - Manual Review Required',
      description: `Error generating automatic summary. Please review full conversation manually.\n\nMessages: ${JSON.stringify(messages, null, 2)}`,
      keywords: ['manual_review'],
      attemptedSolutions: ['AI assistance attempted']
    }
  }
}

/**
 * Extract key issue keywords from user messages
 */
function extractIssueKeywords(text: string): string[] {
  const keywords = []
  const lowerText = text.toLowerCase()
  
  // Auth-related
  if (lowerText.includes('login') || lowerText.includes('password') || lowerText.includes('auth')) {
    keywords.push('authentication')
  }
  
  // Billing-related
  if (lowerText.includes('bill') || lowerText.includes('payment') || lowerText.includes('charge')) {
    keywords.push('billing')
  }
  
  // Technical issues
  if (lowerText.includes('error') || lowerText.includes('bug') || lowerText.includes('broken')) {
    keywords.push('technical_issue')
  }
  
  // Account issues
  if (lowerText.includes('account') || lowerText.includes('subscription') || lowerText.includes('plan')) {
    keywords.push('account_management')
  }
  
  // Agent-related
  if (lowerText.includes('agent') || lowerText.includes('ai') || lowerText.includes('chess')) {
    keywords.push('ai_agents')
  }
  
  return keywords.length > 0 ? keywords : ['general_inquiry']
}

/**
 * Extract attempted solutions from assistant messages
 */
function extractAttemptedSolutions(text: string): string[] {
  const solutions = []
  
  if (text.includes('reset')) solutions.push('Password/account reset suggested')
  if (text.includes('clear cache') || text.includes('browser')) solutions.push('Browser troubleshooting suggested')
  if (text.includes('help article') || text.includes('documentation')) solutions.push('Documentation provided')
  if (text.includes('contact') || text.includes('email')) solutions.push('Alternative contact methods provided')
  
  return solutions
}

/**
 * Generate intelligent ticket title
 */
function generateTicketTitle(firstMessage: string, keywords: string[]): string {
  const maxLength = 80
  
  // Create base title from first message
  let title = firstMessage.length > 50 
    ? firstMessage.substring(0, 47) + '...' 
    : firstMessage
  
  // Add category prefix based on keywords
  if (keywords.includes('authentication')) {
    title = `[AUTH] ${title}`
  } else if (keywords.includes('billing')) {
    title = `[BILLING] ${title}`
  } else if (keywords.includes('technical_issue')) {
    title = `[TECH] ${title}`
  } else if (keywords.includes('ai_agents')) {
    title = `[AGENTS] ${title}`
  } else {
    title = `[SUPPORT] ${title}`
  }
  
  return title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title
}

/**
 * Send notification to support team
 */
async function sendSupportTeamNotification(ticket: any, userProfile: any, subscription: any, summary: any, messages: any[]) {
  try {
    const emailContent = {
      to: 'support@yourdomain.com', // Your support team email
      subject: `New Support Ticket: ${ticket.id} - ${ticket.severity} - ${ticket.category}`,
      html: `
        <h2>🎫 New Support Ticket Created</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Severity:</strong> <span style="color: ${ticket.severity === 'P1' ? 'red' : ticket.severity === 'P2' ? 'orange' : 'blue'}">${ticket.severity}</span></p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>SLA Target:</strong> ${ticket.severity === 'P1' ? '4 hours' : ticket.severity === 'P2' ? '24 hours' : '48 hours'}</p>
          <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>👤 Customer Information</h3>
          <p><strong>Name:</strong> ${userProfile.name}</p>
          <p><strong>Email:</strong> ${userProfile.email}</p>
          <p><strong>Plan:</strong> ${userProfile.plan.toUpperCase()}</p>
          <p><strong>Status:</strong> ${userProfile.subscriptionStatus}</p>
          ${subscription ? `<p><strong>Usage:</strong> ${subscription.limits.usedRequests}/${subscription.limits.monthlyRequests} requests</p>` : ''}
        </div>

        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📋 Issue Summary</h3>
          <p><strong>Title:</strong> ${summary.title}</p>
          <p><strong>Keywords:</strong> ${summary.keywords.join(', ')}</p>
          <p><strong>Solutions Attempted:</strong></p>
          <ul>
            ${summary.attemptedSolutions.map((s: string) => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>💬 Full Description</h3>
          <pre style="white-space: pre-wrap; font-size: 12px;">${ticket.description}</pre>
        </div>

        <p><strong>⚡ Action Required:</strong> Please respond within <strong>${ticket.severity === 'P1' ? '4 hours' : ticket.severity === 'P2' ? '24 hours' : '48 hours'}</strong></p>
      `
    }
    
    console.log('Support team notification prepared:', emailContent)
    // In production, send via your email service
    
  } catch (error) {
    console.error('Error sending support team notification:', error)
  }
}

/**
 * Send confirmation email to user
 */
async function sendUserConfirmationEmail(ticket: any, userProfile: any, summary: any) {
  try {
    const emailContent = {
      to: userProfile.email,
      subject: `Support Ticket Created: ${ticket.id}`,
      html: `
        <h2>🎫 Your Support Ticket Has Been Created</h2>
        
        <p>Hi ${userProfile.name},</p>
        
        <p>We've received your support request and created ticket <strong>${ticket.id}</strong> for you.</p>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📋 Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.severity}</p>
          <p><strong>Summary:</strong> ${summary.title}</p>
        </div>

        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>⏰ What Happens Next?</h3>
          <p>Our support team will review your ticket and contact you within <strong>${ticket.severity === 'P1' ? '4 hours' : ticket.severity === 'P2' ? '24 hours' : '48 hours'}</strong>.</p>
          <p>We'll send updates to this email address: <strong>${userProfile.email}</strong></p>
        </div>

        <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>📝 Need to Add More Information?</h3>
          <p>Reply to this email with additional details, screenshots, or files. Your response will be automatically added to ticket ${ticket.id}.</p>
        </div>

        <p>Thank you for using our support service!</p>
        
        <p>Best regards,<br>
        The Support Team</p>
      `
    }
    
    console.log('User confirmation email prepared:', emailContent)
    // In production, send via your email service
    
  } catch (error) {
    console.error('Error sending user confirmation email:', error)
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}