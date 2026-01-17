/**
 * Email Notification Service for Support Tickets
 * 
 * Uses Nodemailer with SMTP or can be configured for:
 * - SendGrid
 * - AWS SES
 * - Resend
 * - Mailgun
 */

import nodemailer from 'nodemailer';

// Email configuration from environment
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.SMTP_FROM || 'One Last AI Support <support@onelastai.co>',
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
    transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: EMAIL_CONFIG.auth,
    });
  }
  return transporter;
}

// =====================================================
// Email Templates
// =====================================================

interface TicketEmailData {
  ticketNumber: number;
  ticketId: string;
  subject: string;
  userName: string;
  userEmail: string;
  status?: string;
  message?: string;
  priority?: string;
}

export function getTicketCreatedEmail(data: TicketEmailData): { subject: string; html: string; text: string } {
  return {
    subject: `[Ticket #${data.ticketNumber}] We received your request: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1; }
          .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Support Ticket Created</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName || 'there'} 💕</p>
            <p>Thank you for reaching out! We've received your support request and our team is on it.</p>
            
            <div class="ticket-info">
              <strong>Ticket #${data.ticketNumber}</strong><br>
              <strong>Subject:</strong> ${data.subject}<br>
              <strong>Priority:</strong> ${data.priority || 'Medium'}
            </div>
            
            <p>We typically respond within 24 hours, but often much sooner! 🚀</p>
            
            <a href="https://onelastai.co/dashboard/support-tickets" class="btn">View Your Ticket</a>
            
            <div class="footer">
              <p>With love,<br>One Last AI Support Team 🌙</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.userName || 'there'},

Thank you for reaching out! We've received your support request.

Ticket #${data.ticketNumber}
Subject: ${data.subject}
Priority: ${data.priority || 'Medium'}

We typically respond within 24 hours, but often much sooner!

View your ticket: https://onelastai.co/dashboard/support-tickets

With love,
One Last AI Support Team`
  };
}

export function getNewReplyEmail(data: TicketEmailData): { subject: string; html: string; text: string } {
  return {
    subject: `[Ticket #${data.ticketNumber}] New Reply: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Reply on Your Ticket</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName || 'there'} 💕</p>
            <p>You have a new reply on Ticket #${data.ticketNumber}!</p>
            
            <div class="message-box">
              ${data.message?.substring(0, 500)}${(data.message?.length || 0) > 500 ? '...' : ''}
            </div>
            
            <a href="https://onelastai.co/dashboard/support-tickets" class="btn">View Full Conversation</a>
            
            <div class="footer">
              <p>With love,<br>One Last AI Support Team 🌙</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.userName || 'there'},

You have a new reply on Ticket #${data.ticketNumber}!

---
${data.message?.substring(0, 500)}${(data.message?.length || 0) > 500 ? '...' : ''}
---

View full conversation: https://onelastai.co/dashboard/support-tickets

With love,
One Last AI Support Team`
  };
}

export function getStatusChangeEmail(data: TicketEmailData): { subject: string; html: string; text: string } {
  const statusEmoji: Record<string, string> = {
    'open': '📬',
    'in-progress': '⚙️',
    'waiting-customer': '⏳',
    'resolved': '✅',
    'closed': '📁'
  };
  
  const emoji = statusEmoji[data.status || ''] || '📋';
  
  return {
    subject: `[Ticket #${data.ticketNumber}] Status Update: ${data.status?.replace('-', ' ')}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 10px 20px; background: #10b981; color: white; border-radius: 20px; font-size: 18px; margin: 20px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Ticket Status Updated</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName || 'there'} 💕</p>
            <p>Your ticket #${data.ticketNumber} status has been updated:</p>
            
            <div style="text-align: center;">
              <span class="status-badge">${data.status?.replace('-', ' ').toUpperCase()}</span>
            </div>
            
            <p><strong>Subject:</strong> ${data.subject}</p>
            
            ${data.status === 'resolved' ? `
              <p>🎉 Great news! Your issue has been resolved. If you're satisfied, we'd love to hear your feedback!</p>
            ` : ''}
            
            ${data.status === 'waiting-customer' ? `
              <p>⏳ We need your response to continue. Please check your ticket and reply when you can!</p>
            ` : ''}
            
            <a href="https://onelastai.co/dashboard/support-tickets" class="btn">View Ticket Details</a>
            
            <div class="footer">
              <p>With love,<br>One Last AI Support Team 🌙</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${data.userName || 'there'},

Your ticket #${data.ticketNumber} status has been updated to: ${data.status?.replace('-', ' ').toUpperCase()}

Subject: ${data.subject}

${data.status === 'resolved' ? 'Great news! Your issue has been resolved. If you\'re satisfied, we\'d love to hear your feedback!' : ''}
${data.status === 'waiting-customer' ? 'We need your response to continue. Please check your ticket and reply when you can!' : ''}

View ticket: https://onelastai.co/dashboard/support-tickets

With love,
One Last AI Support Team`
  };
}

export function getSlaBreachEmail(data: TicketEmailData): { subject: string; html: string; text: string } {
  return {
    subject: `🚨 SLA BREACHED: Ticket #${data.ticketNumber} requires immediate attention`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #fef2f2; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .btn { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 SLA BREACHED</h1>
          </div>
          <div class="content">
            <p><strong>URGENT: This ticket requires immediate attention!</strong></p>
            
            <div class="alert-box">
              <strong>Ticket #${data.ticketNumber}</strong><br>
              <strong>Subject:</strong> ${data.subject}<br>
              <strong>Customer:</strong> ${data.userEmail}<br>
              <strong>Priority:</strong> ESCALATED TO URGENT
            </div>
            
            <p>The SLA for this ticket has been breached. Please respond immediately.</p>
            
            <a href="https://onelastai.co/admin/support" class="btn">Handle Ticket Now</a>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `🚨 SLA BREACHED - URGENT

Ticket #${data.ticketNumber} requires immediate attention!

Subject: ${data.subject}
Customer: ${data.userEmail}
Priority: ESCALATED TO URGENT

Please respond immediately: https://onelastai.co/admin/support`
  };
}

// =====================================================
// Send Email Function
// =====================================================

export async function sendSupportEmail(
  to: string,
  template: { subject: string; html: string; text: string }
): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log('[EMAIL] SMTP not configured. Would send to:', to);
    console.log('[EMAIL] Subject:', template.subject);
    return { success: true }; // Return success even without SMTP for dev
  }

  try {
    await transport.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    
    console.log(`[EMAIL] Sent to ${to}: ${template.subject}`);
    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL] Failed to send:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// Convenience Functions
// =====================================================

export async function notifyTicketCreated(data: TicketEmailData) {
  const template = getTicketCreatedEmail(data);
  return sendSupportEmail(data.userEmail, template);
}

export async function notifyNewReply(data: TicketEmailData) {
  const template = getNewReplyEmail(data);
  return sendSupportEmail(data.userEmail, template);
}

export async function notifyStatusChange(data: TicketEmailData) {
  const template = getStatusChangeEmail(data);
  return sendSupportEmail(data.userEmail, template);
}

export async function notifySlaBreach(data: TicketEmailData, adminEmail: string = 'support@onelastai.co') {
  const template = getSlaBreachEmail(data);
  return sendSupportEmail(adminEmail, template);
}
