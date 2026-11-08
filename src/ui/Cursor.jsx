import { useEffect, useRef } from 'react'

/** A tongue that chases the pointer, with a lagging trail behind it. */
export function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    let x = innerWidth / 2
    let y = innerHeight / 2
    let rx = x
    let ry = y
    let raf
    let down = false

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
    }
    const onDown = () => (down = true)
    const onUp = () => (down = false)

    const tick = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16

      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${down ? 0.6 : 1})`
      }

      raf = requestAnimationFrame(tick)
    }

    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerdown', onDown)
    addEventListener('pointerup', onUp)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onDown)
      removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <>
      <span className="cursor-ring" ref={ring} aria-hidden="true" />
      <span className="cursor-dot" ref={dot} aria-hidden="true">
        👅
      </span>
    </>
  )
}
