const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Timeout wrapper for email sending
async function sendEmailWithTimeout(to, subject, html, timeoutMs = 5000) {
  return Promise.race([
    sendNotificationEmail(to, subject, html),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), timeoutMs)
    )
  ]);
}

async function sendNotificationEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `Finance Tracker <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    // Don't throw the error - just log it so it doesn't block the main flow
    // You could also implement a retry mechanism or queue system here
  }
}

// Base email template with Finance Tracker theming
function getBaseTemplate(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Finance Tracker</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #181821;
          background-color: #FDFBF3;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #935F4C, #C2978A);
          color: #FFFFFF;
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo-container {
          margin-bottom: 15px;
        }
        
        .logo {
          background-color: #FFFFFF;
          color: #935F4C;
          padding: 12px 20px;
          border-radius: 8px;
          display: inline-block;
          font-weight: bold;
          font-size: 18px;
          text-decoration: none;
        }
        
        .logo .luka {
          color: #935F4C;
          font-weight: 900;
        }
        
        .logo .tech {
          color: #A86D59;
          font-weight: 600;
        }
        
        .app-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .content {
          padding: 40px 30px;
          background-color: #FFFFFF;
        }
        
        .content h2 {
          color: #181821;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .content p {
          color: #6B7280;
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        .content ul, .content ol {
          color: #6B7280;
          margin-left: 20px;
          margin-bottom: 16px;
        }
        
        .button {
          background: linear-gradient(135deg, #935F4C, #A86D59);
          color: #FFFFFF;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          margin: 20px 0;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(147, 95, 76, 0.3);
        }
        
        .button:hover {
          background: linear-gradient(135deg, #A86D59, #C2978A);
          box-shadow: 0 6px 8px rgba(147, 95, 76, 0.4);
          transform: translateY(-1px);
        }
        
        .alert {
          background-color: #FEE2E2;
          border: 1px solid #F87171;
          border-left: 4px solid #EF4444;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          color: #7F1D1D;
        }
        
        .alert strong {
          color: #EF4444;
        }
        
        .success {
          background-color: #D1FAE5;
          border: 1px solid #34D399;
          border-left: 4px solid #10B981;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          color: #064E3B;
        }
        
        .success strong {
          color: #10B981;
        }
        
        .info {
          background-color: #DBEAFE;
          border: 1px solid #60A5FA;
          border-left: 4px solid #3B82F6;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          color: #1E3A8A;
        }
        
        .info strong {
          color: #3B82F6;
        }
        
        .url-link {
          word-break: break-all;
          color: #935F4C;
          background-color: #F5E6D3;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 14px;
        }
        
        .footer {
          background-color: #F5E6D3;
          padding: 30px 20px;
          text-align: center;
          border-top: 1px solid #AF6A58;
        }
        
        .footer-content {
          color: #6B7280;
          font-size: 14px;
        }
        
        .footer .luka-tech {
          color: #935F4C;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .footer .luka {
          color: #935F4C;
          font-weight: 900;
        }
        
        .footer .tech {
          color: #A86D59;
          font-weight: 600;
        }
        
        .footer p {
          margin: 4px 0;
        }
        
        /* Responsive design */
        @media (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }
          
          .content {
            padding: 20px 15px;
          }
          
          .header {
            padding: 20px 15px;
          }
          
          .button {
            display: block;
            text-align: center;
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              <span class="luka">Luka</span><span class="tech">Tech</span>
            </div>
          </div>
          <h1 class="app-title">Finance Tracker</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="footer-content">
            <p class="luka-tech">
              <span class="luka">Luka</span><span class="tech">Tech</span>
            </p>
            <p>&copy; 2025 All rights reserved</p>
            <p>Professional Financial Management Solutions</p>
            <p style="margin-top: 12px; font-size: 12px; color: #9CA3AF;">
              This email was sent from Finance Tracker. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email verification template
function emailVerificationTemplate(user, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}verify-email/${token}`;
  const content = `
    <h2>Welcome ${user.fullName}!</h2>
    
    <div class="success">
      <strong>Thank you for joining Finance Tracker!</strong> We're excited to have you on board.
    </div>
    
    <p>To get started with managing your finances effectively, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" class="button">Verify My Email Address</a>
    </div>
    
    <div class="info">
      <strong>What's Next?</strong>
      <ul style="margin-top: 10px;">
        <li>Set up your personalized budget categories</li>
        <li>Add your income sources and financial goals</li>
        <li>Start tracking your daily expenses</li>
        <li>Discover powerful financial insights</li>
      </ul>
    </div>
    
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    
    <div class="url-link">
      ${verifyUrl}
    </div>
    
    <p><strong>⏰ This verification link will expire in 24 hours.</strong></p>
    
    <p>If you didn't create this account, please ignore this email.</p>
  `;
  
  return {
    subject: '🎉 Welcome to Finance Tracker - Please verify your email',
    html: getBaseTemplate('Email Verification', content)
  };
}

// Password reset request template
function passwordResetTemplate(user, token) {
  const resetUrl = `${process.env.FRONTEND_URL}reset-password/${token}`;
  const content = `
    <h2>Password Reset Request</h2>
    
    <p>Hello ${user.fullName},</p>
    
    <div class="info">
      <strong>Password Reset Requested</strong><br>
      We received a request to reset your password for your Finance Tracker account.
    </div>
    
    <p>To create a new password, click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">Reset My Password</a>
    </div>
    
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    
    <div class="url-link">
      ${resetUrl}
    </div>
    
    <div class="alert">
      <strong>⏰ Security Notice:</strong> This password reset link will expire in 1 hour for your security.
    </div>
    
    <div class="info">
      <strong>Password Security Tips:</strong>
      <ul style="margin-top: 10px;">
        <li>Use a strong, unique password</li>
        <li>Include uppercase, lowercase, numbers, and symbols</li>
        <li>Avoid using personal information</li>
        <li>Consider using a password manager</li>
      </ul>
    </div>
    
    <p><strong>If you didn't request this password reset,</strong> please ignore this email. Your password will remain unchanged and your account is secure.</p>
  `;
  
  return {
    subject: '🔒 Password Reset Request - Finance Tracker',
    html: getBaseTemplate('Password Reset', content)
  };
}

// Login notification template
function loginNotificationTemplate(user) {
  const content = `
    <h2>New Login Detected</h2>
    
    <p>Hello ${user.fullName},</p>
    
    <div class="alert">
      <strong>🔐 Security Alert:</strong> A new login to your Finance Tracker account was detected.
    </div>
    
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin-bottom: 8px; font-weight: 600; color: #374151;">Login Details:</p>
      <ul style="margin: 0; color: #6B7280;">
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Account:</strong> ${user.email}</li>
        <li><strong>Device:</strong> Web Browser</li>
      </ul>
    </div>
    
    <div class="success">
      <strong>✅ If this was you,</strong> you can safely ignore this email - your account is secure.
    </div>
    
    <div class="alert">
      <strong>⚠️ If this wasn't you, take immediate action:</strong>
      <ol style="margin-top: 10px;">
        <li>Change your password immediately</li>
        <li>Review your account for any unauthorized activity</li>
        <li>Check your recent transactions and settings</li>
        <li>Contact our support team if you notice anything suspicious</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}dashboard" class="button">Go to Dashboard</a>
    </div>
    
    <div class="info">
      <strong>💡 Security Best Practices:</strong>
      <ul style="margin-top: 10px;">
        <li>Always log out from shared devices</li>
        <li>Use strong, unique passwords</li>
        <li>Enable two-factor authentication when available</li>
        <li>Regularly review your account activity</li>
      </ul>
    </div>
  `;
  
  return {
    subject: '🔐 New login detected - Finance Tracker',
    html: getBaseTemplate('Login Notification', content)
  };
}

// Password change confirmation template
function passwordChangeTemplate(user) {
  const content = `
    <h2>Password Successfully Changed</h2>
    
    <p>Hello ${user.fullName},</p>
    
    <div class="success">
      <strong>✅ Confirmation:</strong> Your password was changed successfully.
    </div>
    
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin-bottom: 8px; font-weight: 600; color: #374151;">Change Details:</p>
      <ul style="margin: 0; color: #6B7280;">
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Account:</strong> ${user.email}</li>
        <li><strong>Changed via:</strong> Finance Tracker Web App</li>
      </ul>
    </div>
    
    <div class="info">
      <strong>🔐 Your account is now more secure!</strong> If you made this change, no further action is required.
    </div>
    
    <div class="alert">
      <strong>⚠️ If you didn't make this change:</strong>
      <ol style="margin-top: 10px;">
        <li>Contact our support team immediately</li>
        <li>Your account may have been compromised</li>
        <li>We'll help you secure your account</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}dashboard" class="button">Go to Dashboard</a>
    </div>
    
    <div class="info">
      <strong>💡 Keep Your Account Safe:</strong>
      <ul style="margin-top: 10px;">
        <li>Don't share your password with anyone</li>
        <li>Use unique passwords for different accounts</li>
        <li>Log out from shared or public devices</li>
        <li>Regularly review your account activity</li>
      </ul>
    </div>
  `;
  
  return {
    subject: '✅ Password changed successfully - Finance Tracker',
    html: getBaseTemplate('Password Changed', content)
  };
}

// Account suspension template
function accountSuspendedTemplate(user) {
  const content = `
    <h2>Account Temporarily Suspended</h2>
    
    <p>Hello ${user.fullName},</p>
    
    <div class="alert">
      <strong>🔒 Security Notice:</strong> Your account has been temporarily suspended due to multiple failed login attempts.
    </div>
    
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin-bottom: 8px; font-weight: 600; color: #374151;">What happened?</p>
      <p style="margin: 0; color: #6B7280;">We detected several unsuccessful login attempts to your account. As a security measure, your account has been temporarily locked to protect your financial data.</p>
    </div>
    
    <div class="info">
      <strong>🕐 What can you do?</strong>
      <ul style="margin-top: 10px;">
        <li>Wait for the suspension period to expire (usually 2-5 hours)</li>
        <li>Try logging in again after the suspension is lifted</li>
        <li>If you forgot your password, use the "Forgot Password" option</li>
        <li>Contact support if you need immediate assistance</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}forgot-password" class="button">Reset My Password</a>
    </div>
    
    <div class="info">
      <strong>🛡️ This is an automated security measure</strong> designed to protect your account and financial information from unauthorized access attempts.
    </div>
    
    <p>If you believe this suspension was triggered in error, please contact our support team and we'll help resolve the issue quickly.</p>
  `;
  
  return {
    subject: '🔒 Account temporarily suspended - Finance Tracker',
    html: getBaseTemplate('Account Suspended', content)
  };
}

// Welcome email after verification
function welcomeTemplate(user) {
  const content = `
    <h2>Welcome to Finance Tracker!</h2>
    
    <p>Hello ${user.fullName},</p>
    
    <div class="success">
      <strong>🎉 Email Verified Successfully!</strong> Your account is now active and ready to use.
    </div>
    
    <p>You now have access to powerful financial management tools that will help you take control of your money:</p>
    
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin-bottom: 8px; font-weight: 600; color: #374151;">What you can do with Finance Tracker:</p>
      <ul style="margin: 0; color: #6B7280;">
        <li><strong>Track Expenses:</strong> Monitor your spending patterns and categorize transactions</li>
        <li><strong>Manage Income:</strong> Add multiple income sources and track earnings</li>
        <li><strong>Budget Planning:</strong> Set budget goals and monitor your progress</li>
        <li><strong>Financial Insights:</strong> View detailed analytics and spending trends</li>
        <li><strong>Smart Reports:</strong> Generate comprehensive financial reports</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}dashboard" class="button">Go to My Dashboard</a>
    </div>
    
    <div class="info">
      <strong>💡 Getting Started Tips:</strong>
      <ul style="margin-top: 10px;">
        <li>Start by setting up your budget categories</li>
        <li>Add your income sources for accurate tracking</li>
        <li>Begin logging your daily expenses</li>
        <li>Explore the analytics section for insights</li>
      </ul>
    </div>
    
    <p>Need help getting started? Our support team is here to assist you every step of the way.</p>
    
    <p style="text-align: center; color: #6B7280; font-style: italic;">
      Thank you for choosing Finance Tracker to manage your financial journey! 💰
    </p>
  `;
  
  return {
    subject: '🎉 Welcome to Finance Tracker - Account verified!',
    html: getBaseTemplate('Welcome', content)
  };
}

module.exports = {
  sendNotificationEmail,
  sendEmailWithTimeout,
  emailVerificationTemplate,
  passwordResetTemplate,
  loginNotificationTemplate,
  passwordChangeTemplate,
  accountSuspendedTemplate,
  welcomeTemplate,
};
