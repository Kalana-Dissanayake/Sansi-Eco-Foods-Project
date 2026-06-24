import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/send-otp
 * 
 * Server-side API route to send OTP emails via EmailJS REST API.
 * Using server-side avoids CORS restrictions that block client-side 
 * EmailJS calls on Vercel (domain allowlist issues).
 * 
 * The private key (EMAILJS_PRIVATE_KEY) is kept server-side only (no NEXT_PUBLIC_ prefix).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, passcode } = body;

    if (!email || !passcode) {
      return NextResponse.json(
        { error: 'Missing required fields: email, passcode' },
        { status: 400 }
      );
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId =
      process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID ||
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS environment variables are not configured.');
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      );
    }

    const payload: Record<string, unknown> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        email: email.trim(),
        passcode: passcode,
        time: '15 minutes',
        logo_url:
          'https://res.cloudinary.com/df1601dip/image/upload/q_auto/f_auto/v1781681836/bqeawlmwhhd8eimjwsqn.png',
      },
    };

    // Include the private key if available for enhanced security
    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'https://api.emailjs.com', // Required for server-side calls
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS API error:', response.status, errorText);
      return NextResponse.json(
        { error: `EmailJS error: ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send OTP API route error:', message);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}
