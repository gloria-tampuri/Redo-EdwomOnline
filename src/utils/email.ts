import { Resend } from 'resend';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendPasswordResetEmailParams {
  email: string;
  resetLink: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  email,
  resetLink,
  userName = 'there',
}: SendPasswordResetEmailParams) {
  try {
    // If no API key, just log to console
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn(
        '⚠️  RESEND_API_KEY not set. Email not sent. Reset link: ' + resetLink
      );
      return null;
    }

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',  // Resend test domain - works immediately without verification
      to: email,
      subject: 'Reset Your Edwom Online Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #f9fafb;
              }
              .email-content {
                background: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
              }
              .title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 20px 0;
              }
              .message {
                color: #555;
                margin-bottom: 20px;
                font-size: 16px;
              }
              .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                color: white;
                text-decoration: none;
                padding: 12px 32px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
              }
              .reset-button:hover {
                transform: translateY(-2px);
              }
              .link-section {
                background: #f3f4f6;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                word-break: break-all;
              }
              .link-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
              }
              .reset-link {
                color: #2563eb;
                text-decoration: none;
                font-size: 14px;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #999;
              }
              .warning {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
                padding: 12px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning-text {
                font-size: 14px;
                color: #991b1b;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-content">
                <div class="header">
                  <img src="https://edwom-online.vercel.app/logo.svg" alt="Edwom Online" style="height: 40px; width: auto;" />
                </div>

                <div class="title">Reset Your Password</div>

                <p class="message">
                  Hi ${userName},
                </p>

                <p class="message">
                  We received a request to reset your password for your Edwom Online account. 
                  If you didn't make this request, you can ignore this email.
                </p>

                <div style="text-align: center;">
                  <a href="${resetLink}" class="reset-button">Reset Password</a>
                </div>

                <p class="message" style="text-align: center; color: #999; font-size: 14px;">
                  Or copy and paste this link in your browser:
                </p>

                <div class="link-section">
                  <div class="link-label">Password Reset Link:</div>
                  <a href="${resetLink}" class="reset-link">${resetLink}</a>
                </div>

                <div class="warning">
                  <div class="warning-text">
                    ⚠️ <strong>This link expires in 15 minutes.</strong> 
                    If you don't reset your password within 15 minutes, you'll need to request a new link.
                  </div>
                </div>

                <p class="message">
                  <strong>Security Tips:</strong>
                </p>
                <ul style="color: #555; margin-left: 20px;">
                  <li>Never share your password with anyone</li>
                  <li>Edwom Online will never ask for your password via email</li>
                  <li>Always check that you're on the official Edwom Online website</li>
                </ul>

                <div class="footer">
                  <p>
                    Questions? Visit our <a href="https://edwom.com/help" style="color: #2563eb; text-decoration: none;">help center</a> 
                    or contact support at <a href="mailto:support@edwom.com" style="color: #2563eb; text-decoration: none;">support@edwom.com</a>
                  </p>
                  <p>
                    © ${new Date().getFullYear()} Edwom Online. All rights reserved.<br>
                    This is an automated email. Please do not reply directly.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
    console.log('📧 Email response:', data);
    return data;
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}`);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('Full error:', error);
    throw error;
  }
}
