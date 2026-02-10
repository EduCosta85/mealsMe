/**
 * SyncIndicator Component
 * 
 * Displays online/offline network status with a small, non-intrusive badge.
 * Uses navigator.onLine API to detect network connectivity changes.
 * 
 * Features:
 * - Real-time network status detection
 * - Visual indicator with icon and text
 * - Mobile-first responsive design
 * - Fixed position in top-right corner
 * - Orange theme (#f97316) for MealsMe branding
 */

import { useState, useEffect } from 'react';

interface SyncIndicatorProps {
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Custom hook to detect online/offline status
 * Listens to browser online/offline events
 */
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * SyncIndicator - Shows network connectivity status
 * 
 * @example
 * ```tsx
 * import SyncIndicator from '@/components/finance/SyncIndicator';
 * 
 * function Dashboard() {
 *   return (
 *     <div>
 *       <SyncIndicator />
 *       {/* rest of dashboard *\/}
 *     </div>
 *   );
 * }
 * ```
 */
export default function SyncIndicator({ className = '' }: SyncIndicatorProps) {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 shadow-md transition-all ${
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-rose-500 text-white'
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Conectado' : 'Offline'}
    >
      {/* Status Indicator Dot */}
      <div
        className={`h-2 w-2 rounded-full ${
          isOnline ? 'bg-white' : 'bg-white animate-pulse'
        }`}
        aria-hidden="true"
      />

      {/* Status Text */}
      <span className="text-xs font-semibold leading-none">
        {isOnline ? 'Conectado' : 'Offline'}
      </span>

      {/* Icon */}
      {isOnline ? (
        // Online Icon - Check/Cloud
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        // Offline Icon - X/Cloud Off
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
    </div>
  );
}
