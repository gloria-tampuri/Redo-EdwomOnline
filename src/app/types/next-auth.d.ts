// This file extends the NextAuth types to include custom user fields in the session and token.

import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: 'user' | 'admin';
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  }
}