/**
 * Authentication Context Provider
 * 
 * Manages Firebase Authentication state globally using React Context.
 * Provides Google Sign-In, Sign-Out, and persistent auth state across page reloads.
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { createUserProfile } from '../services/userProfile';

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  /** Current authenticated user or null if not authenticated */
  user: User | null;
  /** Loading state during initial auth check */
  loading: boolean;
  /** Error message if authentication fails */
  error: string | null;
  /** Sign in with Google OAuth popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
}

/**
 * Authentication Context
 * Provides auth state and methods to all child components
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and methods.
 * Automatically persists auth state across page reloads using Firebase's onAuthStateChanged.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Listen to Firebase auth state changes
   * Automatically syncs user state on login/logout and page reload
   * Auto-creates user profile in Firestore on first login
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // Auto-create user profile on first login
          // Uses merge: true to avoid overwriting existing profiles
          try {
            await createUserProfile(db, user);
          } catch (err) {
            console.error('Failed to create user profile:', err);
            // Don't block login if profile creation fails
          }
        }
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Erro ao verificar autenticação');
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Google using popup flow
   * 
   * @throws Error if sign-in fails
   */
  const signInWithGoogle = async (): Promise<void> => {
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User state will be updated automatically by onAuthStateChanged
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  /**
   * Sign out current user
   * 
   * @throws Error if sign-out fails
   */
  const signOut = async (): Promise<void> => {
    setError(null);

    try {
      await firebaseSignOut(auth);
      // User state will be updated automatically by onAuthStateChanged
    } catch (err) {
      const errorMessage = 'Erro ao fazer logout';
      setError(errorMessage);
      console.error('Sign-out error:', err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Convert Firebase auth errors to user-friendly Portuguese messages
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;

    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Login cancelado pelo usuário';
      case 'auth/cancelled-popup-request':
        return 'Solicitação de login cancelada';
      case 'auth/popup-blocked':
        return 'Popup bloqueado pelo navegador. Por favor, permita popups para este site.';
      case 'auth/account-exists-with-different-credential':
        return 'Já existe uma conta com este email usando outro método de login';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      default:
        return 'Erro ao fazer login com Google';
    }
  }

  return 'Erro ao fazer login com Google';
}
