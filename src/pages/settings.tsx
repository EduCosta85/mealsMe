/**
 * Settings Page
 * 
 * User settings page with account information and logout functionality.
 * Displays user profile data from Firebase Auth and provides secure logout.
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { clearIndexedDbPersistence } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Settings page component
 * 
 * Features:
 * - Display user profile (avatar, name, email)
 * - Account information section
 * - App version information
 * - Logout button with cache clearing
 * - Mobile-first responsive design
 * - Loading states during logout
 */
export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle logout with Firestore cache clearing
   * 
   * Flow:
   * 1. Sign out from Firebase Auth
   * 2. Clear Firestore IndexedDB cache
   * 3. Redirect to login page
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      // Sign out from Firebase Auth
      await signOut();

      // Clear Firestore cache
      try {
        await clearIndexedDbPersistence(db);
        console.log('✅ Firestore cache cleared');
      } catch (cacheError) {
        // Cache clearing is best-effort, don't block logout
        console.warn('Failed to clear Firestore cache:', cacheError);
      }

      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      setError('Erro ao fazer logout. Tente novamente.');
      setIsLoggingOut(false);
    }
  };

  // Fallback values if user data is missing
  const displayName = user?.displayName || 'Usuário';
  const email = user?.email || 'email@example.com';
  const photoURL = user?.photoURL || null;
  const uid = user?.uid || 'N/A';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="mt-2 text-base text-gray-600">
            Gerencie sua conta e preferências
          </p>
        </div>

        {/* User Profile Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="h-24 w-24 rounded-full ring-4 ring-gray-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.6489_0.2370_26.9728)] to-[oklch(0.5489_0.2370_26.9728)] text-4xl text-white ring-4 ring-gray-100">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">
                {displayName}
              </h2>
              <p className="mt-1 text-base text-gray-600">{email}</p>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Informações da Conta
          </h3>
          <div className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-600">Nome</span>
              <span className="text-base text-gray-900">{displayName}</span>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-600">Email</span>
              <span className="text-base text-gray-900">{email}</span>
            </div>

            {/* Account ID */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-600">ID da Conta</span>
              <span className="text-base font-mono text-gray-900 break-all text-xs sm:text-sm">
                {uid}
              </span>
            </div>
          </div>
        </div>

        {/* App Information Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Informações do App
          </h3>
          <div className="space-y-4">
            {/* Version */}
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-600">Versão</span>
              <span className="text-base text-gray-900">1.0.0</span>
            </div>

            {/* Build */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-600">Build</span>
              <span className="text-base text-gray-900">Production</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-red-600 px-6 font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-600 disabled:hover:shadow-md"
            aria-label="Sair da conta"
          >
            {isLoggingOut ? (
              <>
                {/* Loading Spinner */}
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-base">Saindo...</span>
              </>
            ) : (
              <>
                {/* Logout Icon */}
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="text-base">Sair da Conta</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
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
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
