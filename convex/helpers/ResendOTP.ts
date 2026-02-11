import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";

export const ResendOTP = Email({
  id: "resend-otp",
  maxAge: 60 * 20, // 20 minutes
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, token }) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      // In development without Resend configured, log the code
      console.log(`[DEV] Verification code for ${email}: ${token}`);
      return;
    }
    const resend = new ResendAPI(resendApiKey);
    const { error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL ?? "My App <onboarding@resend.dev>",
      to: [email],
      subject: "Your verification code",
      text: `Your verification code is: ${token}\n\nThis code expires in 20 minutes.`,
    });
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
