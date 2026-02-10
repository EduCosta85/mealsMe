/**
 * ProtectedRoute Component
 * 
 * Route protection wrapper that redirects unauthenticated users to login.
 * Handles loading states and preserves the attempted route for redirect after login.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  /** Child components to render if authenticated */
  children: ReactNode;
}

/**
 * Wrapper component for protected routes
 * 
 * @example
 * ```tsx
 * <Route path="/finance" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          {/* Loading spinner */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[oklch(0.6489_0.2370_26.9728)]" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Save current location to redirect back after login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
