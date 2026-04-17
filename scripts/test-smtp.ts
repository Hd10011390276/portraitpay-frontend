/**
 * SMTP Test Script
 * Run: node scripts/test-smtp.ts
 * Make sure to set environment variables first or create a .env file
 */

import "dotenv/config";

async function testSmtp() {
  console.log("🧪 Testing SMTP Configuration...\n");

  // Check environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL;

  console.log("Environment Variables:");
  console.log(`  SMTP_HOST: ${smtpHost ? "✅ Set" : "❌ Missing"}`);
  console.log(`  SMTP_PORT: ${smtpPort ? "✅ Set" : "❌ Missing"}`);
  console.log(`  SMTP_USER: ${smtpUser ? "✅ Set" : "❌ Missing"}`);
  console.log(`  SMTP_PASS: ${smtpPass ? "✅ Set" : "❌ Missing"}`);
  console.log(`  TO_EMAIL: ${toEmail ? "✅ Set" : "❌ Missing (optional)"}`);

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("\n❌ SMTP not configured. Please set environment variables:");
    console.log("   SMTP_HOST=smtp.exmail.qq.com");
    console.log("   SMTP_PORT=465");
    console.log("   SMTP_USER=contact@portraitpayai.com");
    console.log("   SMTP_PASS=your-client-password");
    console.log("   CONTACT_TO_EMAIL=contact@portraitpayai.com");
    process.exit(1);
  }

  // Try to send test email
  console.log("\n📧 Attempting to send test email...");

  try {
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || "465", 10),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpUser,
      to: toEmail || smtpUser,
      subject: "PortraitPay AI - SMTP Test Email",
      text: "SMTP is working correctly!",
      html: "<h1>SMTP Test Successful!</h1><p>This email confirms your SMTP configuration is working.</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log(`   To: ${toEmail || smtpUser}`);
    process.exit(0);
  } catch (error: any) {
    console.log(`\n❌ Failed to send email:`);
    console.log(`   Error: ${error.message}`);

    if (error.message.includes("authentication")) {
      console.log("\n💡 Tip: Check your SMTP credentials. For QQ Enterprise Email:");
      console.log("   1. Go to: https://exmail.qq.com/");
      console.log("   2. Admin Panel → Settings → Client Password");
      console.log("   3. Generate a new client password and use it as SMTP_PASS");
    }
    process.exit(1);
  }
}

testSmtp();