import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Signin endpoint - primarily used for checking existing sessions.
 * Actual authentication is handled by NextAuth providers.
 * Use POST to /api/auth/signin for NextAuth credentials flow.
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user already has an active session
    const session = await getServerSession(authOptions);

    if (session) {
      return NextResponse.json(
        {
          message: 'Already signed in',
          user: session.user,
          authenticated: true,
        },
        { status: 200 }
      );
    }

    // No active session
    return NextResponse.json(
      {
        message: 'Not authenticated',
        authenticated: false,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signin check error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user already has an active session
    const session = await getServerSession(authOptions);

    if (session) {
      return NextResponse.json(
        {
          message: 'Already signed in',
          user: session.user,
          authenticated: true,
        },
        { status: 200 }
      );
    }

    // No active session
    return NextResponse.json(
      {
        message: 'Not authenticated',
        authenticated: false,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signin check error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
