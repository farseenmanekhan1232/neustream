import nodemailer, { Transporter } from "nodemailer";
import crypto from "crypto";
import {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate,
  EmailTemplate,
} from "./emailTemplates";

/**
 * Email Service for sending verification and password reset emails
 * Handles token generation and email templating with improved structure
 */
class EmailService {
  private transporter: Transporter;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    // Initialize SMTP transporter with environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });

    this.fromEmail = process.env.FROM_EMAIL || "noreply@neustream.app";
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  }

  /**
   * Generate a cryptographically secure random token
   * @returns Random token as hexadecimal string
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generate a secure verification token with 24-hour expiration
   * @returns Object containing token and expiration date
   */
  generateVerificationToken(): { token: string; expires: Date } {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours expiration
    return { token, expires };
  }

  /**
   * Generate a secure password reset token with 1-hour expiration
   * @returns Object containing token and expiration date
   */
  generatePasswordResetToken(): { token: string; expires: Date } {
    const token = this.generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration
    return { token, expires };
  }

  /**
   * Send an email using a predefined template
   * @param to Recipient email address
   * @param template Email template to use
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.fromEmail,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send email verification email
   * @param email Recipient email address
   * @param token Verification token
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const template = emailVerificationTemplate({ verificationUrl });
    await this.sendEmail(email, template);
  }

  /**
   * Send password reset email
   * @param email Recipient email address
   * @param token Password reset token
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const template = passwordResetTemplate({ resetUrl });
    await this.sendEmail(email, template);
  }

  /**
   * Send welcome email (optional, for post-verification)
   * @param email Recipient email address
   * @param userName Optional user name
   */
  async sendWelcomeEmail(email: string, userName?: string): Promise<void> {
    const loginUrl = `${this.frontendUrl}/auth`;
    const template = welcomeEmailTemplate({ userName, loginUrl });
    await this.sendEmail(email, template);
  }

  /**
   * Verify email configuration (useful for debugging)
   */
  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (error) {
      console.error("SMTP connection verification failed:", error);
      throw error;
    }
  }
}

export default EmailService;
