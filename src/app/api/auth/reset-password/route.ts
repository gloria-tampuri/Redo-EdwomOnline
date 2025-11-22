import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { hashPassword } from '@/app/utils/hash';

const SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return NextResponse.json(
          { error: 'Reset link has expired' },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 401 }
      );
    }

    // Find user and verify token matches
    const user = await User.findById(decoded.userId);

    if (!user || user.resetPasswordToken !== token) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { error: 'Reset link has expired' },
        { status: 410 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetPasswordAttempts = 0;
    await user.save();

    console.log(`✅ Password reset successful for ${user.email}`);

    return NextResponse.json(
      { success: true, message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in reset-password:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
