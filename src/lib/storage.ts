const STORAGE_PREFIX = 'mealsme_'

const buildKey = (key: string): string => `${STORAGE_PREFIX}${key}`

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
