import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/waitlist/send-invite
 * Sends an invitation email to an approved waitlist user (AC5).
 * Called by the admin after approving a waitlist entry.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[Waitlist] RESEND_API_KEY not configured — skipping invitation email",
      );
      return NextResponse.json({ success: true, emailSkipped: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    await resend.emails.send({
      from: "SaaS Starter <noreply@resend.dev>",
      to: [email],
      subject: "You're in! Your spot is ready",
      text: `Congratulations! You've been approved to join SaaS Starter.\n\nClick the link below to create your account:\n${siteUrl}/auth/sign-up\n\nWelcome aboard!`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send invitation email. Please try again later." },
      { status: 500 },
    );
  }
}
