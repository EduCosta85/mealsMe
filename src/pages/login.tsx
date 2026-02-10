/**
 * Login Page
 * 
 * Authentication page with Google Sign-In for the MealsMe finance system.
 * Redirects authenticated users to the finance dashboard.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Login page component with Google OAuth
 * 
 * Features:
 * - Google Sign-In button
 * - Loading states during authentication
 * - Error handling with Portuguese messages
 * - Auto-redirect for authenticated users
 * - Mobile-first responsive design
 */
export default function LoginPage() {
  const { user, signInWithGoogle, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Get the page they were trying to access, default to /finance
  const from = location.state?.from?.pathname || '/finance';

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // Navigation will happen automatically via useEffect
    } catch (err) {
      // Error is already handled in AuthContext
      console.error('Sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const isLoading = authLoading || isSigningIn;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* App Branding */}
        <div className="space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.6489_0.2370_26.9728)] to-[oklch(0.5489_0.2370_26.9728)] shadow-lg">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
          <p className="text-base text-gray-600">
            Gerencie suas finanças pessoais
          </p>
        </div>

        {/* Sign-In Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Bem-vindo de volta
              </h2>
              <p className="text-sm text-gray-600">
                Entre com sua conta Google para continuar
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-white px-6 font-medium text-gray-700 shadow-md ring-1 ring-gray-300 transition-all hover:shadow-lg hover:ring-gray-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-md sm:h-14"
              aria-label="Entrar com Google"
            >
              {isLoading ? (
                <>
                  {/* Loading Spinner */}
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[oklch(0.6489_0.2370_26.9728)]" />
                  <span className="text-sm sm:text-base">Carregando...</span>
                </>
              ) : (
                <>
                  {/* Google Icon */}
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Entrar com Google</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {authError && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>{authError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500">
          Ao entrar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  );
}
