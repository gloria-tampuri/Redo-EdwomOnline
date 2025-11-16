import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  image?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Custom hook for authentication management
 * Provides session state, user info, and auth methods
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const user = session?.user
    ? ({
        id: (session.user as any).id || '',
        email: session.user.email || '',
        name: session.user.name,
        role: (session.user as any).role || 'user',
        image: session.user.image,
      } as AuthUser)
    : null;

  const isAdmin = user?.role === 'admin';

  // Sign in with email and password
  const handleSignIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          console.error('Sign in failed:', result?.error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    []
  );

  // Sign in with Google
  const handleSignInWithGoogle = useCallback(async () => {
    try {
      const result = await signIn('google', {
        redirect: false,
      });

      if (!result?.ok) {
        console.error('Google sign in failed:', result?.error);
        throw new Error('Google sign in failed');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }, []);

  // Sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  };
}
