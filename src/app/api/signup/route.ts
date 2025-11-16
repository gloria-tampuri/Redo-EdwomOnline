import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/app/utils/hash';

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  }

  const body = await request.json();
  const { email, password, name } = body;

  // Validation
  if (!email || !password || !name) {
    return NextResponse.json(
      { message: 'Email, password, and name are required' },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { message: 'Invalid email format' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: 'Password must be at least 6 characters long' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const newUser = new User({
      email,
      passwordHash,
      name,
      role: 'user',
      isEmailVerified: false,
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: (newUser as any)._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
