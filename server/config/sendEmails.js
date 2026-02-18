// utils/sendEmail.js
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// ✅ DO NOT crash server if key is missing
let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("⚠️ RESEND_API_KEY not found. Email feature disabled.");
}

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    if (!resend) {
      console.warn("Email skipped: Resend not configured");
      return null;
    }

    const { data, error } = await resend.emails.send({
      from: 'Shopping <onboarding@resend.dev>',
      to: sendTo,
      replyTo: 'bhanupavan8583@gmail.com',
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return null;
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (err) {
    console.error("Send email failed:", err);
    return null;
  }
};

export default sendEmail;
