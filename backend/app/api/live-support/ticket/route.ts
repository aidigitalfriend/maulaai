import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface SupportTicket {
  id: string
  userId: string
  userEmail: string
  userName: string
  subscription?: string
  issue: string
  status: 'open' | 'in-progress' | 'escalated' | 'resolved'
  createdAt: Date
  messages: any[]
}

interface EmailPayload {
  to: string
  subject: string
  html: string
  ticketId: string
  userName: string
  userEmail: string
}

/**
 * Send email via email service (mock implementation)
 * In production, integrate with SendGrid, AWS SES, or similar
 */
async function sendEmailToSupport(payload: EmailPayload): Promise<boolean> {
  try {
    // Mock email sending - in production use a real email service
    console.log('Sending support ticket email:', {
      to: 'support@agenthub.ai',
      subject: `New Support Ticket: ${payload.ticketId}`,
      from: payload.userEmail,
      userName: payload.userName,
    })

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In production, uncomment and use real service:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'support@agenthub.ai' }],
            subject: `New Support Ticket: ${payload.ticketId} from ${payload.userName}`,
          },
        ],
        from: {
          email: 'noreply@agenthub.ai',
          name: 'AgentHub Support',
        },
        content: [
          {
            type: 'text/html',
            value: payload.html,
          },
        ],
        replyTo: {
          email: payload.userEmail,
        },
      }),
    })
    return response.ok
    */

    return true
  } catch (error) {
    console.error('Error sending support email:', error)
    return false
  }
}

/**
 * Generate HTML email template for support ticket
 */
function generateTicketEmailHTML(ticket: SupportTicket): string {
  const conversationPreview = ticket.messages
    .slice(-5)
    .map(
      (msg: any) =>
        `<div style="margin: 10px 0; padding: 10px; background: ${msg.role === 'user' ? '#f0f0f0' : '#e3f2fd'}; border-radius: 4px;">
      <strong>${msg.role.toUpperCase()}:</strong> ${msg.content.substring(0, 200)}...
    </div>`
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .content { margin: 20px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #667eea; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .ticket-id { font-family: monospace; background: #e3f2fd; padding: 10px; border-radius: 4px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Support Ticket Created</h2>
        </div>

        <div class="content">
          <h3>Ticket Details</h3>
          <div class="field">
            <span class="label">Ticket ID:</span>
            <div class="ticket-id">${ticket.id}</div>
          </div>
          <div class="field">
            <span class="label">Status:</span> ${ticket.status}
          </div>
          <div class="field">
            <span class="label">Created:</span> ${new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>

        <div class="content">
          <h3>User Information</h3>
          <div class="field">
            <span class="label">Name:</span> ${ticket.userName}
          </div>
          <div class="field">
            <span class="label">Email:</span> ${ticket.userEmail}
          </div>
          <div class="field">
            <span class="label">Subscription:</span> ${ticket.subscription || 'Free'}
          </div>
          <div class="field">
            <span class="label">User ID:</span> <code>${ticket.userId}</code>
          </div>
        </div>

        <div class="content">
          <h3>Issue Summary</h3>
          <p>${ticket.issue}</p>
        </div>

        <div class="content">
          <h3>Conversation History</h3>
          ${conversationPreview}
        </div>

        <div class="content">
          <h3>Next Steps</h3>
          <ul>
            <li>Review the ticket details above</li>
            <li>Check the conversation history for context</li>
            <li>Respond to the user at ${ticket.userEmail}</li>
            <li>Target response time: within 2 hours for Pro subscribers, 4 hours for Free tier</li>
          </ul>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>This is an automated email from AgentHub Live Support System</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * POST handler - Create support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const ticket = (await request.json()) as SupportTicket

    // Validate ticket data
    if (!ticket.userId || !ticket.userEmail || !ticket.userName) {
      return NextResponse.json(
        { error: 'Missing required ticket information' },
        { status: 400 }
      )
    }

    // Generate ticket ID if not provided
    if (!ticket.id) {
      ticket.id = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }

    // Set status to escalated
    ticket.status = 'escalated'
    ticket.createdAt = new Date()

    // Prepare email payload
    const emailPayload: EmailPayload = {
      to: 'support@agenthub.ai',
      subject: `Support Ticket: ${ticket.id} - ${ticket.userName}`,
      html: generateTicketEmailHTML(ticket),
      ticketId: ticket.id,
      userName: ticket.userName,
      userEmail: ticket.userEmail,
    }

    // Send email to support team
    const emailSent = await sendEmailToSupport(emailPayload)

    // Send confirmation email to user
    const userConfirmationEmail: EmailPayload = {
      to: ticket.userEmail,
      subject: `Support Ticket Created: ${ticket.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { margin: 20px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #667eea; }
            .ticket-id { font-family: monospace; background: #e3f2fd; padding: 10px; border-radius: 4px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Support Ticket Received</h2>
            </div>

            <div class="content">
              <p>Hello ${ticket.userName},</p>
              <p>Thank you for reaching out! We've received your support request and have created a ticket for our team.</p>
              
              <h3>Your Ticket ID:</h3>
              <div class="ticket-id">${ticket.id}</div>
              
              <h3>What to expect:</h3>
              <ul>
                <li>Our support team will review your ticket shortly</li>
                <li>Response time: Within 2 hours for Pro subscribers, 4 hours for Free tier, 24/7 for Enterprise</li>
                <li>We'll respond via email to ${ticket.userEmail}</li>
                <li>Keep your ticket ID for future reference</li>
              </ul>

              <p>Thank you for your patience!</p>
              <p>Best regards,<br/>AgentHub Support Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      ticketId: ticket.id,
      userName: ticket.userName,
      userEmail: ticket.userEmail,
    }

    // Send confirmation to user
    await sendEmailToSupport(userConfirmationEmail)

    return NextResponse.json(
      {
        success: true,
        ticket: {
          id: ticket.id,
          status: ticket.status,
          createdAt: ticket.createdAt,
          userEmail: ticket.userEmail,
          userName: ticket.userName,
        },
        message: `Ticket ${ticket.id} created successfully. Support team will contact you within the next 2-4 hours.`,
        emailSent,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Ticket creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create support ticket',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler - Retrieve ticket status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('id')

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    // Mock ticket retrieval - in production, query database
    const mockTicket = {
      id: ticketId,
      status: 'in-progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: 'Support Team',
      estimatedResolutionTime: '2 hours',
    }

    return NextResponse.json({ ticket: mockTicket })
  } catch (error) {
    console.error('Ticket retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve ticket' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler - CORS support
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
