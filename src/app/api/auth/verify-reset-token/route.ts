import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
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
          { error: 'Reset link has expired. Please request a new one.' },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 401 }
      );
    }

    // Verify user exists and token matches
    const user = await User.findById(decoded.userId);

    if (!user || user.resetPasswordToken !== token) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { success: true, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in verify-reset-token:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
