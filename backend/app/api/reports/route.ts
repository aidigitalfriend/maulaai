import { NextRequest, NextResponse } from 'next/server'

interface ReportData {
  name: string
  email: string
  reportType: string
  severity: string
  description: string
  evidence: string
  agentName: string
  timestamp: string
  actions: string
  contactPreference: string
  agreeToTerms: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportData = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.description || !body.agreeToTerms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate description length
    if (body.description.trim().length < 50) {
      return NextResponse.json(
        { error: 'Description must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Validate that user agrees to terms
    if (!body.agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the legal disclaimer' },
        { status: 400 }
      )
    }

    // Create report object with metadata
    const report = {
      id: Date.now().toString(),
      ...body,
      submittedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
      userAgent: request.headers.get('user-agent') || 'Unknown',
      status: 'pending_review'
    }

    // TODO: Here you would typically:
    // 1. Save to database
    // 2. Send email notification to trust and safety team
    // 3. Log the report for auditing
    // 4. Implement rate limiting to prevent spam

    // For now, we'll just log it
    console.log('New Report Submitted:', {
      reportId: report.id,
      reportType: report.reportType,
      severity: report.severity,
      submittedAt: report.submittedAt,
      submitterEmail: report.email
    })

    // Simulate sending email to trust and safety team
    // In production, integrate with your email service (SendGrid, AWS SES, etc.)
    
    return NextResponse.json(
      {
        success: true,
        message: 'Your report has been submitted successfully. Our team will review it within 24-48 hours.',
        reportId: report.id,
        nextSteps: 'You will be contacted via your preferred method if we need additional information.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing report:', error)

    return NextResponse.json(
      { error: 'An error occurred while processing your report. Please try again later.' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint for checking report status (requires authentication)
export async function GET(request: NextRequest) {
  // This could be used to check report status with a report ID and verification code
  return NextResponse.json(
    { error: 'Invalid request method. Use POST to submit a report.' },
    { status: 405 }
  )
}
