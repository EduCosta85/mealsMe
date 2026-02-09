import { useState, useCallback } from 'react'
import { storage } from '../lib/storage'

type UseStorageReturn<T> = readonly [T, (value: T | ((prev: T) => T)) => void, () => void]

export function useStorage<T>(key: string, initialValue: T): UseStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const existing = storage.get<T>(key)
    if (existing !== null) return existing
    storage.set(key, initialValue)
    return initialValue
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        storage.set(key, nextValue)
        return nextValue
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    storage.remove(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}
