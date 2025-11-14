/**
 * Email Template Definitions
 * Centralized email templates for consistent branding and easy maintenance
 */

export interface EmailTemplateData {
  [key: string]: string | number | Date;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Base HTML structure for all emails
 */
const getBaseEmailTemplate = (
  title: string,
  content: string,
  options?: {
    showHeader?: boolean;
    headerTitle?: string;
    primaryColor?: string;
  }
): string => {
  const {
    showHeader = true,
    headerTitle = "Neustream",
    primaryColor = "#007a4e",
  } = options || {};

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>${title}</title>
      <style>
        /* CSS Reset for Email Clients */
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          -webkit-text-size-adjust: 100% !important;
          -ms-text-size-adjust: 100% !important;
        }
        * {
          box-sizing: border-box !important;
        }

        /* Container Styles */
        .email-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333333;
        }

        /* Header Styles */
        .email-header {
          background: linear-gradient(135deg, ${primaryColor} 0%, #009460 50%, #00ae72 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }

        /* Content Styles */
        .email-content {
          padding: 40px 30px;
          background-color: #f9f9f9;
        }
        .email-body {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .email-body h2 {
          margin: 0 0 20px 0;
          font-size: 24px;
          font-weight: 600;
          color: #222222;
          line-height: 1.3;
        }
        .email-body p {
          margin: 0 0 20px 0;
          font-size: 16px;
          line-height: 1.6;
          color: #555555;
        }

        /* Button Styles */
        .button {
          display: inline-block;
          padding: 14px 32px;
          background-color: ${primaryColor};
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
          transition: background-color 0.2s ease;
        }
        .button:hover {
          background-color: #005a39;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }

        /* Link Styles */
        .link {
          color: ${primaryColor};
          text-decoration: underline;
          word-break: break-all;
        }

        /* Alert Box */
        .alert-box {
          background-color: #fff3cd;
          border-left: 4px solid ${primaryColor};
          padding: 15px 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .alert-box p {
          margin: 0;
          font-weight: 500;
          color: #856404;
        }

        /* Footer Styles */
        .email-footer {
          text-align: center;
          padding: 30px;
          background-color: #f0f0f0;
          font-size: 13px;
          color: #666666;
        }
        .email-footer p {
          margin: 5px 0;
          font-size: 13px;
        }

        /* Responsive Styles */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }
          .email-header {
            padding: 30px 20px !important;
          }
          .email-header h1 {
            font-size: 24px !important;
          }
          .email-content {
            padding: 20px 15px !important;
          }
          .email-body {
            padding: 20px 15px !important;
          }
          .email-body h2 {
            font-size: 20px !important;
          }
          .button {
            width: 100% !important;
            display: block !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        ${showHeader ? `
        <div class="email-header">
          <h1>${headerTitle}</h1>
        </div>
        ` : ''}
        <div class="email-content">
          <div class="email-body">
            ${content}
          </div>
        </div>
        <div class="email-footer">
          <p>&copy; ${new Date().getFullYear()} Neustream. All rights reserved.</p>
          <p>This email was sent automatically. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Email Verification Template
 */
export const emailVerificationTemplate = (data: {
  verificationUrl: string;
}): EmailTemplate => {
  const { verificationUrl } = data;

  const content = `
    <h2>Welcome to Neustream! 🎥</h2>
    <p>Thank you for registering with Neustream! To complete your account setup, please verify your email address by clicking the button below.</p>
    <div class="button-container">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
    <div class="alert-box">
      <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
    </div>
    <p>If you didn't create a Neustream account, you can safely ignore this email.</p>
  `;

  const html = getBaseEmailTemplate(
    "Verify Your Email - Neustream",
    content,
    { primaryColor: "#007a4e" }
  );

  const text = `
    Welcome to Neustream!

    Thank you for registering with Neustream! To complete your account setup, please verify your email address by visiting this link:

    ${verificationUrl}

    Important: This verification link will expire in 24 hours.

    If you didn't create a Neustream account, you can safely ignore this email.

    © ${new Date().getFullYear()} Neustream. All rights reserved.
  `;

  return {
    subject: "Verify Your Email Address - Neustream",
    html,
    text,
  };
};

/**
 * Password Reset Template
 */
export const passwordResetTemplate = (data: {
  resetUrl: string;
}): EmailTemplate => {
  const { resetUrl } = data;

  const content = `
    <h2>Password Reset Request 🔐</h2>
    <p>We received a request to reset the password for your Neustream account. Click the button below to set a new password:</p>
    <div class="button-container">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
    <div class="alert-box">
      <p><strong>Security Notice:</strong> This reset link will expire in 1 hour for your security.</p>
    </div>
    <p>If you didn't request a password reset, your password will remain unchanged and you can safely ignore this email.</p>
  `;

  const html = getBaseEmailTemplate(
    "Password Reset - Neustream",
    content,
    { primaryColor: "#f5576c" }
  );

  const text = `
    Password Reset Request

    We received a request to reset the password for your Neustream account. Visit this link to set a new password:

    ${resetUrl}

    Security Notice: This reset link will expire in 1 hour.

    If you didn't request a password reset, your password will remain unchanged.

    © ${new Date().getFullYear()} Neustream. All rights reserved.
  `;

  return {
    subject: "Password Reset - Neustream",
    html,
    text,
  };
};

/**
 * Welcome Email Template (for future use)
 */
export const welcomeEmailTemplate = (data: {
  userName?: string;
  loginUrl: string;
}): EmailTemplate => {
  const { userName, loginUrl } = data;

  const content = `
    <h2>Welcome to Neustream! 🎉</h2>
    <p>${userName ? `Hello ${userName},` : 'Hello,'}</p>
    <p>Your Neustream account has been successfully verified and is ready to use!</p>
    <p>You can now start multistreaming to all your favorite platforms from one convenient location.</p>
    <div class="button-container">
      <a href="${loginUrl}" class="button">Access Your Dashboard</a>
    </div>
    <p>If you have any questions or need help getting started, our support team is here to assist you.</p>
  `;

  const html = getBaseEmailTemplate(
    "Welcome to Neustream!",
    content,
    { primaryColor: "#007a4e" }
  );

  const text = `
    Welcome to Neustream!

    ${userName ? `Hello ${userName},` : 'Hello,'}
    Your Neustream account has been successfully verified and is ready to use!

    You can now start multistreaming to all your favorite platforms from one convenient location.

    Access your dashboard: ${loginUrl}

    If you have any questions, our support team is here to assist you.

    © ${new Date().getFullYear()} Neustream. All rights reserved.
  `;

  return {
    subject: "Welcome to Neustream!",
    html,
    text,
  };
};
