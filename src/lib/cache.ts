import { useCallback, useEffect, useRef, useState } from 'react'

const PREFIX = 'cache:'

export function readCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full or blocked: run without cache
  }
}

// stale-while-revalidate: show cached data at once, then refresh from the server
export function useQuery<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(() => readCache<T>(key))
  const [error, setError] = useState('')
  const fetcherRef = useRef(fetcher)
  const keyRef = useRef(key)
  fetcherRef.current = fetcher
  keyRef.current = key

  const reload = useCallback(async () => {
    const forKey = key
    try {
      const value = await fetcherRef.current()
      writeCache(forKey, value)
      if (keyRef.current === forKey) {
        setData(value)
        setError('')
      }
    } catch (e) {
      if (keyRef.current === forKey) setError((e as Error).message)
    }
  }, [key])

  useEffect(() => {
    setData(readCache<T>(key))
    reload()
  }, [key, reload])

  return { data, error, reload }
}
