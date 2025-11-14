// Test email service with Gmail SMTP
import * as dotenv from "dotenv";
import EmailService from "./services/emailService";

dotenv.config();

async function testEmail(): Promise<void> {
  console.log("🧪 Testing Email Service...");
  console.log("SMTP Config:");
  console.log("  Host:", process.env.SMTP_HOST);
  console.log("  Port:", process.env.SMTP_PORT);
  console.log("  Secure:", process.env.SMTP_SECURE);
  console.log("  User:", process.env.SMTP_USER);
  console.log("  From:", process.env.FROM_EMAIL);
  console.log();

  try {
    const emailService = new EmailService();

    console.log("📧 Sending test email...");
    console.log("  To: farseen172@gmail.com");
    console.log("  From:", process.env.FROM_EMAIL);

    // Generate a test verification token
    const { token, expires } = emailService.generateVerificationToken();
    console.log("  Generated token:", token);
    console.log("  Expires:", expires);

    await emailService.sendVerificationEmail("farseen172@gmail.com", token);

    console.log("✅ Email sent successfully!");
    console.log("📬 Check farseen172@gmail.com for the test email");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Email sending failed:");
    console.error("  Error code:", error.code);
    console.error("  Error message:", error.message);
    console.error("  Full error:", error);
    process.exit(1);
  }
}

testEmail();
