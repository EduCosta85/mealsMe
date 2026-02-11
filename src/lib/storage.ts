/**
 * Storage Layer
 * 
 * This module provides two types of storage:
 * 
 * 1. **localStorage** (via `storage` object):
 *    - For app-level settings (theme, preferences, etc.)
 *    - Non-user-specific data
 *    - Works offline
 * 
 * 2. **Firestore** (via exported functions):
 *    - For user-specific data (daily progress, meals, etc.)
 *    - Synced across devices
 *    - Requires authentication
 * 
 * Usage:
 * ```typescript
 * // App settings (localStorage)
 * storage.set('theme', 'dark')
 * const theme = storage.get<string>('theme')
 * 
 * // User data (Firestore)
 * await saveDailyProgress(userId, date, data)
 * const progress = await getDailyProgress(userId, date)
 * ```
 */

// ============================================================================
// localStorage for App-Level Settings (Non-User Data)
// ============================================================================

const STORAGE_PREFIX = 'mealsme_'

const buildKey = (key: string): string => `${STORAGE_PREFIX}${key}`

/**
 * localStorage storage for app-level settings
 * Use this for non-user-specific data like theme, preferences, etc.
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(buildKey(key))
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(buildKey(key), JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove(key: string): void {
    localStorage.removeItem(buildKey(key))
  },

  clear(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  },

  keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(STORAGE_PREFIX)) {
        result.push(k.slice(STORAGE_PREFIX.length))
      }
    }
    return result
  },
}

// ============================================================================
// Firestore for User Data
// ============================================================================

/**
 * Firestore storage functions for user-specific data
 * Re-exported from firestore-storage.ts for convenience
 * 
 * These functions require:
 * - User to be authenticated
 * - Valid userId parameter
 * - Network connection (for initial load)
 */
export { 
  getDailyProgress, 
  saveDailyProgress, 
  deleteDailyProgress 
} from './firestore-storage'
