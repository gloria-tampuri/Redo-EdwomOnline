import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '@/utils/email';

const SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Simple in-memory rate limiter (use Redis in production)
const requestLimiter = new Map<string, { count: number; timestamp: number }>();

const checkRateLimit = (email: string, maxAttempts: number = 3, windowMs: number = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = requestLimiter.get(email);

  if (record && now - record.timestamp < windowMs) {
    record.count++;
    if (record.count > maxAttempts) {
      return false;
    }
  } else {
    requestLimiter.set(email, { count: 1, timestamp: now });
  }

  return true;
};

// Clean up old rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of requestLimiter.entries()) {
    if (now - record.timestamp > 30 * 60 * 1000) {
      requestLimiter.delete(email);
    }
  }
}, 10 * 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    // Always return success for security (don't reveal if user exists)
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account exists for this email, a reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token (15 minute expiry)
    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      SECRET,
      { expiresIn: '15m' }
    );

    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save token to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    user.resetPasswordAttempts = 0;
    await user.save();

    // Generate reset link
    const resetLink = `${BASE_URL}/auth/reset-password?token=${resetToken}`;

    // Send email with reset link
    try {
      const emailResult = await sendPasswordResetEmail({
        email: user.email,
        resetLink,
        userName: user.name,
      });
      if (emailResult) {
        console.log(`✅ Password reset email successfully sent to ${user.email}`);
      }
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      console.error(`❌ Failed to send email to ${user.email}:`, errorMessage);
      console.error('Full error:', emailError);
      // Still return success since token is valid even if email fails
      // (user can see link in console or request new one)
    }

    // Log for development (helpful for local testing)
    console.log(`\n📧 Password Reset Link (for testing):\n${resetLink}\n`);

    return NextResponse.json(
      { success: true, message: 'If an account exists for this email, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
