import nodemailer from 'nodemailer'

// Admin notification email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@onelastai.com'

// Namecheap Private Email SMTP Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'mail.privateemail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER || 'noreply@onelastai.com',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.SMTP_FROM || 'One Last AI <noreply@onelastai.com>',
}

// Create SMTP transporter
let smtpTransporter = null
function getSmtpTransporter() {
  if (!smtpTransporter && SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
    smtpTransporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: SMTP_CONFIG.auth,
    })
  }
  return smtpTransporter
}

/**
 * Send email to admin via SMTP (for notifications)
 */
async function sendAdminEmail(subject, html, text) {
  const transporter = getSmtpTransporter()
  
  if (!transporter) {
    console.log('[ADMIN EMAIL] SMTP not configured. Would send:', subject)
    console.log('[ADMIN EMAIL] To:', ADMIN_EMAIL)
    return
  }
  
  try {
    await transporter.sendMail({
      from: SMTP_CONFIG.from,
      to: ADMIN_EMAIL,
      subject,
      html,
      text,
    })
    console.log(`[ADMIN EMAIL] Sent: ${subject}`)
  } catch (error) {
    console.error('[ADMIN EMAIL] Failed:', error.message)
  }
}

/**
 * Welcome Email Template
 * Sent to new users after signup
 */
export function getWelcomeEmailTemplate(userName) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to One Last AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 32px;
      margin: 0;
      font-weight: 700;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 10px 0 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .greeting {
      font-size: 24px;
      color: #667eea;
      font-weight: 600;
      margin: 0 0 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 30px;
    }
    .features {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
    }
    .features h2 {
      color: #667eea;
      font-size: 20px;
      margin: 0 0 20px;
      text-align: center;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    .feature {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #e0e7ff;
      transition: all 0.3s ease;
    }
    .feature-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .feature-title {
      font-weight: 600;
      color: #667eea;
      font-size: 16px;
      margin: 10px 0 5px;
    }
    .feature-desc {
      font-size: 13px;
      color: #666666;
      line-height: 1.4;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .support {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .support-title {
      font-weight: 600;
      color: #856404;
      margin: 0 0 10px;
      font-size: 16px;
    }
    .support-text {
      color: #856404;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-link {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
      font-size: 24px;
    }
    .footer-text {
      font-size: 13px;
      color: #6c757d;
      line-height: 1.6;
      margin: 10px 0;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }
    .signature-team {
      font-weight: 600;
      color: #667eea;
      font-size: 16px;
      margin: 5px 0;
    }
    .signature-company {
      color: #6c757d;
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .feature-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🤖</div>
      <h1>Welcome to One Last AI!</h1>
      <p>Your journey into the future of AI begins now</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello ${userName}! 👋</p>
      
      <p class="message">
        We're thrilled to have you join the One Last AI community! You've just unlocked access to the most advanced AI platform designed to transform the way you work, create, and innovate.
      </p>

      <p class="message">
        Your account is now active and ready to go. Here's what you can explore:
      </p>

      <!-- Features Section -->
      <div class="features">
        <h2>✨ What You Can Do</h2>
        <div class="feature-grid">
          <div class="feature">
            <div class="feature-icon">🎨</div>
            <div class="feature-title">AI Studio</div>
            <div class="feature-desc">Chat with multiple AI models including GPT-4, Claude, Gemini, and more</div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🧪</div>
            <div class="feature-title">AI Lab</div>
            <div class="feature-desc">Experiment with cutting-edge AI: Battle Arena, Image Generation, Voice Cloning & more</div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🛠️</div>
            <div class="feature-title">Toolbox</div>
            <div class="feature-desc">Network tools, developer utilities, and productivity enhancers</div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🤖</div>
            <div class="feature-title">AI Agents</div>
            <div class="feature-desc">Specialized AI personalities for entertainment, education, and assistance</div>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="cta-container">
        <a href="https://onelastai.com/dashboard" class="cta-button">
          🚀 Start Exploring Now
        </a>
      </div>

      <!-- Support Section -->
      <div class="support">
        <div class="support-title">💡 Need Help?</div>
        <p class="support-text">
          Our support team is here 24/7! Visit our <strong>Help Center</strong> at 
          <a href="https://onelastai.com/support" style="color: #667eea;">onelastai.com/support</a> 
          or email us at <strong>support@onelastai.com</strong>
        </p>
      </div>

      <p class="message">
        We can't wait to see what you'll create with One Last AI. Welcome aboard! 🎉
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-links">
        <a href="https://twitter.com/onelastai" class="social-link" title="Twitter">🐦</a>
        <a href="https://linkedin.com/company/onelastai" class="social-link" title="LinkedIn">💼</a>
        <a href="https://github.com/onelastai" class="social-link" title="GitHub">💻</a>
        <a href="https://discord.gg/EXH6w9CH" class="social-link" title="Discord">💬</a>
      </div>

      <div class="signature">
        <div class="signature-team">The One Last AI Team</div>
        <div class="signature-company">One Last AI - Empowering Innovation with AI</div>
      </div>

      <p class="footer-text">
        © 2025 One Last AI. All rights reserved.<br>
        Mansion 24 Ramkhamhaeng, HuaMak, 10240 THA
      </p>
      
      <p class="footer-text" style="margin-top: 15px;">
        You received this email because you created an account at One Last AI.<br>
        <a href="https://onelastai.com/legal/privacy-policy" style="color: #667eea;">Privacy Policy</a> | 
        <a href="https://onelastai.com/legal/terms-of-service" style="color: #667eea;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Password Reset Email Template
 * Sent when user requests password reset
 */
export function getPasswordResetEmailTemplate(userName, resetUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - One Last AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      margin: 0;
      font-weight: 700;
    }
    .header p {
      color: rgba(255, 255, 255, 0.95);
      font-size: 15px;
      margin: 10px 0 0;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
    }
    .greeting {
      font-size: 22px;
      color: #f5576c;
      font-weight: 600;
      margin: 0 0 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
      margin-bottom: 20px;
    }
    .security-notice {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .security-notice-title {
      font-weight: 600;
      color: #856404;
      margin: 0 0 10px;
      font-size: 16px;
      display: flex;
      align-items: center;
    }
    .security-notice-text {
      color: #856404;
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      text-decoration: none;
      padding: 18px 45px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 17px;
      margin: 25px 0;
      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
      text-align: center;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .expiry-notice {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }
    .expiry-text {
      color: #6c757d;
      font-size: 14px;
      margin: 0;
    }
    .expiry-time {
      color: #f5576c;
      font-weight: 600;
      font-size: 18px;
      margin: 10px 0 5px;
    }
    .instructions {
      background: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .instructions-title {
      font-weight: 600;
      color: #0d47a1;
      margin: 0 0 15px;
      font-size: 16px;
    }
    .instructions ol {
      margin: 0;
      padding-left: 20px;
      color: #0d47a1;
    }
    .instructions li {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.5;
    }
    .not-you {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 15px;
      margin: 25px 0;
      text-align: center;
    }
    .not-you-text {
      color: #c33;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-link {
      display: inline-block;
      margin: 0 10px;
      color: #f5576c;
      text-decoration: none;
      font-size: 24px;
    }
    .footer-text {
      font-size: 13px;
      color: #6c757d;
      line-height: 1.6;
      margin: 10px 0;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }
    .signature-team {
      font-weight: 600;
      color: #f5576c;
      font-size: 16px;
      margin: 5px 0;
    }
    .signature-company {
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🔐</div>
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hello ${userName}! 👋</p>
      
      <p class="message">
        We received a request to reset the password for your One Last AI account. If you made this request, click the button below to create a new password.
      </p>

      <!-- Reset Button -->
      <div class="cta-container">
        <a href="${resetUrl}" class="reset-button">
          🔑 Reset My Password
        </a>
      </div>

      <!-- Expiry Notice -->
      <div class="expiry-notice">
        <p class="expiry-text">⏰ This link will expire in</p>
        <p class="expiry-time">1 Hour</p>
        <p class="expiry-text">For your security, you'll need to request a new link after this time.</p>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <div class="instructions-title">📋 What to do next:</div>
        <ol>
          <li>Click the "Reset My Password" button above</li>
          <li>You'll be taken to a secure page on our website</li>
          <li>Enter your new password (minimum 8 characters)</li>
          <li>Confirm your new password</li>
          <li>Click "Update Password" to save your changes</li>
        </ol>
      </div>

      <!-- Security Notice -->
      <div class="security-notice">
        <div class="security-notice-title">
          🛡️ Security Reminder
        </div>
        <p class="security-notice-text">
          <strong>Choose a strong password:</strong> Use a combination of uppercase and lowercase letters, numbers, and special characters. Avoid using common words or personal information.
        </p>
      </div>

      <!-- Not You Section -->
      <div class="not-you">
        <p class="not-you-text">
          ❌ If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.
        </p>
      </div>

      <p class="message" style="margin-top: 30px;">
        If you're having trouble clicking the button, copy and paste this URL into your browser:
      </p>
      <p class="message" style="word-break: break-all; color: #667eea; font-size: 13px;">
        ${resetUrl}
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-links">
        <a href="https://twitter.com/onelastai" class="social-link" title="Twitter">🐦</a>
        <a href="https://linkedin.com/company/onelastai" class="social-link" title="LinkedIn">💼</a>
        <a href="https://github.com/onelastai" class="social-link" title="GitHub">💻</a>
        <a href="https://discord.gg/EXH6w9CH" class="social-link" title="Discord">💬</a>
      </div>

      <div class="signature">
        <div class="signature-team">The One Last AI Security Team</div>
        <div class="signature-company">One Last AI - Your Security is Our Priority</div>
      </div>

      <p class="footer-text">
        © 2025 One Last AI. All rights reserved.<br>
        Mansion 24 Ramkhamhaeng, HuaMak, 10240 THA
      </p>
      
      <p class="footer-text" style="margin-top: 15px;">
        Need help? Contact us at <strong>support@onelastai.com</strong><br>
        <a href="https://onelastai.com/legal/privacy-policy" style="color: #f5576c;">Privacy Policy</a> | 
        <a href="https://onelastai.com/legal/terms-of-service" style="color: #f5576c;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Send Welcome Email
 * Called after successful user signup
 */
export async function sendWelcomeEmail(email, name) {
  const transporter = getSmtpTransporter()
  
  if (!transporter) {
    console.log('[WELCOME EMAIL] SMTP not configured. Would send to:', email)
    return
  }

  try {
    await transporter.sendMail({
      from: 'One Last AI <noreply@onelastai.com>',
      to: email,
      subject: '🎉 Welcome to One Last AI - Let\'s Get Started!',
      html: getWelcomeEmailTemplate(name),
    })
    console.log(`✅ Welcome email sent to ${email}`)
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message)
  }
}

/**
 * Send Password Reset Email
 * Called when user requests password reset
 */
export async function sendPasswordResetEmail(
  email,
  name,
  resetUrl
) {
  const transporter = getSmtpTransporter()
  
  if (!transporter) {
    console.log('[PASSWORD RESET EMAIL] SMTP not configured. Would send to:', email)
    return
  }

  try {
    await transporter.sendMail({
      from: 'One Last AI Security <noreply@onelastai.com>',
      to: email,
      subject: '🔐 Reset Your Password - One Last AI',
      html: getPasswordResetEmailTemplate(name, resetUrl),
    })
    console.log(`✅ Password reset email sent to ${email}`)
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message)
  }
}

// =====================================================
// ADMIN NOTIFICATION FUNCTIONS
// =====================================================

/**
 * Notify admin of new contact form submission
 */
export async function notifyAdminContactForm(data) {
  const subject = `📬 New Contact Form: ${data.subject}`
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
    .value { font-size: 16px; color: #333; margin-bottom: 20px; }
    .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #11998e; white-space: pre-wrap; }
    .btn { display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Contact Message</h1>
    </div>
    <div class="content">
      <div class="label">From</div>
      <div class="value">${data.name}</div>
      
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
      
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      
      ${data.ticketId ? `<div class="label">Ticket ID</div><div class="value">${data.ticketId}</div>` : ''}
      
      <div class="label">Message</div>
      <div class="message-box">${data.message}</div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" class="btn">Reply to ${data.name}</a>
      </div>
    </div>
  </div>
</body>
</html>`
  const text = `New Contact Form\n\nFrom: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`
  
  await sendAdminEmail(subject, html, text)
}

/**
 * Notify admin of new job application
 */
export async function notifyAdminJobApplication(data) {
  const subject = `💼 New Job Application: ${data.position} - ${data.applicantName}`
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
    .value { font-size: 16px; color: #333; margin-bottom: 20px; }
    .position { font-size: 20px; font-weight: 600; color: #f5576c; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💼 New Job Application</h1>
    </div>
    <div class="content">
      <div class="label">Position</div>
      <div class="value position">${data.position}</div>
      
      <div class="label">Application #</div>
      <div class="value">${data.applicationNumber}</div>
      
      <div class="label">Applicant</div>
      <div class="value">${data.applicantName}</div>
      
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${data.applicantEmail}">${data.applicantEmail}</a></div>
      
      ${data.phone ? `<div class="label">Phone</div><div class="value">${data.phone}</div>` : ''}
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${data.applicantEmail}?subject=Re: Your Application for ${encodeURIComponent(data.position)}" class="btn">Contact Applicant</a>
      </div>
    </div>
  </div>
</body>
</html>`
  const text = `New Job Application\n\nPosition: ${data.position}\nApplication #: ${data.applicationNumber}\nName: ${data.applicantName}\nEmail: ${data.applicantEmail}${data.phone ? `\nPhone: ${data.phone}` : ''}`
  
  await sendAdminEmail(subject, html, text)
}

/**
 * Notify admin of new support ticket
 */
export async function notifyAdminSupportTicket(data) {
  const priorityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    urgent: '#dc3545',
  }
  const color = priorityColors[data.priority] || '#667eea'
  
  const subject = `🎫 New Support Ticket #${data.ticketNumber}: ${data.subject}`
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
    .value { font-size: 16px; color: #333; margin-bottom: 20px; }
    .priority { display: inline-block; padding: 4px 12px; border-radius: 4px; background: ${color}; color: white; font-weight: 600; text-transform: uppercase; }
    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 New Support Ticket</h1>
    </div>
    <div class="content">
      <div class="label">Ticket Number</div>
      <div class="value">#${data.ticketNumber}</div>
      
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      
      <div class="label">Customer</div>
      <div class="value">${data.userName} (<a href="mailto:${data.userEmail}">${data.userEmail}</a>)</div>
      
      <div class="label">Category</div>
      <div class="value">${data.category}</div>
      
      <div class="label">Priority</div>
      <div class="value"><span class="priority">${data.priority}</span></div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://onelastai.com/admin/support" class="btn">View in Admin Panel</a>
      </div>
    </div>
  </div>
</body>
</html>`
  const text = `New Support Ticket\n\nTicket #: ${data.ticketNumber}\nSubject: ${data.subject}\nCustomer: ${data.userName} (${data.userEmail})\nCategory: ${data.category}\nPriority: ${data.priority}\n\nView: https://onelastai.com/admin/support`
  
  await sendAdminEmail(subject, html, text)
}

/**
 * Notify admin of new consultation request
 */
export async function notifyAdminConsultation(data) {
  const subject = `📅 New Consultation Request: ${data.consultationType} - ${data.userName}`
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
    .value { font-size: 16px; color: #333; margin-bottom: 20px; }
    .project { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4facfe; white-space: pre-wrap; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Consultation Request</h1>
    </div>
    <div class="content">
      <div class="label">Consultation Type</div>
      <div class="value" style="font-size: 20px; font-weight: 600; color: #4facfe;">${data.consultationType}</div>
      
      <div class="label">Reference #</div>
      <div class="value">${data.consultationNumber}</div>
      
      <div class="label">Name</div>
      <div class="value">${data.userName}</div>
      
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${data.userEmail}">${data.userEmail}</a></div>
      
      ${data.userPhone ? `<div class="label">Phone</div><div class="value">${data.userPhone}</div>` : ''}
      
      <div class="label">Project Description</div>
      <div class="project">${data.projectDescription}</div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${data.userEmail}?subject=Re: ${encodeURIComponent(data.consultationType)} Consultation Request" class="btn">Schedule Call</a>
      </div>
    </div>
  </div>
</body>
</html>`
  const text = `New Consultation Request\n\nType: ${data.consultationType}\nRef #: ${data.consultationNumber}\nName: ${data.userName}\nEmail: ${data.userEmail}${data.userPhone ? `\nPhone: ${data.userPhone}` : ''}\n\nProject:\n${data.projectDescription}`
  
  await sendAdminEmail(subject, html, text)
}

/**
 * Notify admin of new user registration
 */
export async function notifyAdminNewUser(data) {
  const subject = `👋 New User Registered: ${data.name}`
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; text-align: center; }
    .name { font-size: 24px; color: #667eea; font-weight: 600; }
    .email { color: #666; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👋 New User Registered!</h1>
    </div>
    <div class="content">
      <div class="name">${data.name}</div>
      <div class="email">${data.email}</div>
      <p style="color: #888; margin-top: 20px; font-size: 14px;">A new user just joined One Last AI!</p>
    </div>
  </div>
</body>
</html>`
  const text = `New User Registered!\n\nName: ${data.name}\nEmail: ${data.email}`
  
  await sendAdminEmail(subject, html, text)
}
