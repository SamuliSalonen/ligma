import { useEffect, useRef, useState } from 'react'

/** Adds a boolean the first time an element scrolls into view, and keeps it. */
export function useInView(threshold = 0.35) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return [ref, seen]
}
