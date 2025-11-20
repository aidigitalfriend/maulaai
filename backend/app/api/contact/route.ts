import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, subject, agentName } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    // Determine email subject
    let emailSubject = subject || 'Contact Form Submission'
    if (agentName) {
      emailSubject = `${agentName} Agent - Contact from ${name}`
    }

    // Mail options
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.MAIL_TO || 'onelastai2.0@gmail.com',
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            AI Agent Platform - Contact Form
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${agentName ? `<p><strong>Related Agent:</strong> ${agentName}</p>` : ''}
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #6c757d;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; font-size: 12px; color: #666;">
            <p style="margin: 0;">This email was sent from the AI Agent Platform contact form.</p>
            <p style="margin: 5px 0 0 0;">Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
Contact Form Submission

Name: ${name}
Email: ${email}
${agentName ? `Related Agent: ${agentName}` : ''}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
Sent from AI Agent Platform
Time: ${new Date().toLocaleString()}
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    })

  } catch (error) {
    console.error('❌ Mail send failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send message. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// Handle CORS for frontend requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}