/**
 * useAuth Hook
 * 
 * Custom hook for consuming the AuthContext.
 * Provides access to authentication state and methods throughout the application.
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 * @returns Authentication state and methods
 * 
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { user, signInWithGoogle, signOut, loading } = useAuth();
 *   
 *   if (loading) return <div>Carregando...</div>;
 *   
 *   return user ? (
 *     <button onClick={signOut}>Sair</button>
 *   ) : (
 *     <button onClick={signInWithGoogle}>Entrar com Google</button>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
