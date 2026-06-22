import { useState, useEffect, useRef } from 'react'

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* storage full */
      }
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [key, value])

  return [value, setValue]
}

export function getStored(key, fallback = null) {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}
