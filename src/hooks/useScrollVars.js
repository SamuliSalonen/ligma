import { useEffect, useRef } from 'react'

/**
 * One rAF loop drives every scroll animation on the page. Elements register a
 * ref and get a `--p` custom property written straight onto their style, so the
 * actual animation stays in CSS and React never re-renders on scroll.
 *
 *   --p : for 'through', 0 when the element's top edge reaches the bottom of
 *         the viewport and 1 when its bottom edge reaches the top; for 'pin',
 *         progress while a sticky child is pinned; for 'leave', 0 while the
 *         element sits at the top of the viewport and 1 once it has scrolled off.
 */
const subscribers = new Set()
let running = false

function tick() {
  const vh = window.innerHeight

  for (const { el, mode } of subscribers) {
    if (!el) continue
    const r = el.getBoundingClientRect()

    let p
    if (mode === 'pin') {
      // progress through a tall section while its sticky child is pinned
      p = -r.top / Math.max(1, r.height - vh)
    } else if (mode === 'leave') {
      // 0 while the element's top is at the viewport top, 1 once it has fully
      // scrolled off — the right mapping for a section that starts on screen
      p = -r.top / Math.max(1, r.height)
    } else {
      p = (vh - r.top) / Math.max(1, vh + r.height)
    }

    p = Math.min(1, Math.max(0, p))
    el.style.setProperty('--p', p.toFixed(4))
    // handy derived values so CSS doesn't need calc() gymnastics
    el.style.setProperty('--p-in', Math.min(1, p * 2).toFixed(4))
    el.style.setProperty('--p-out', Math.max(0, p * 2 - 1).toFixed(4))
  }

  if (subscribers.size) {
    requestAnimationFrame(tick)
  } else {
    running = false
  }
}

export function useScrollVars(mode = 'through') {
  const ref = useRef(null)

  useEffect(() => {
    const entry = { el: ref.current, mode }
    subscribers.add(entry)

    if (!running) {
      running = true
      requestAnimationFrame(tick)
    }

    return () => subscribers.delete(entry)
  }, [mode])

  return ref
}
