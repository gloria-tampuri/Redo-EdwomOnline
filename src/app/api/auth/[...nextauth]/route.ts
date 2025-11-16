import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePasswords as verifyPassword } from '@/app/utils/hash';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'your-email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).exec();
        if (!user) {
          throw new Error('No user found with the email');
        }

        if (!(user as any).passwordHash) {
          throw new Error('Account uses OAuth. Please sign in with OAuth provider.');
        }

        const isValid = await verifyPassword(credentials.password, (user as any).passwordHash);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: (user as any)._id.toString(),
          email: (user as any).email,
          name: (user as any).name,
          role: (user as any).role,
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign-in, attach user role
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'user';
      }
      // On Google OAuth, fetch/create user in DB
      if (account?.provider === 'google') {
        await dbConnect();
        let dbUser = await User.findOne({ email: token.email }).exec();
        if (!dbUser) {
          // Create new user from Google OAuth
          dbUser = await User.create({
            email: token.email,
            name: token.name,
            passwordHash: '', // OAuth users have no password
            role: 'user',
            isEmailVerified: true,
          });
        }
        token.id = (dbUser as any)._id.toString();
        token.role = (dbUser as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

