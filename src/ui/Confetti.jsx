import { useEffect, useRef } from 'react'

const BITS = ['👅', '🫦', '💦', '✦', '💀', '🧠', '🔥', '👀']

/**
 * Canvas confetti driven by the `ligma-confetti` event, so anything on the page
 * can throw emoji without being wired to this component.
 */
export function Confetti() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let bits = []
    let raf
    let dpr = 1

    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1)
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (e) => {
      const { x, y, amount } = e.detail
      for (let i = 0; i < amount; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 3 + Math.random() * 9
        bits.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 4,
          life: 1,
          size: 14 + Math.random() * 20,
          spin: (Math.random() - 0.5) * 0.4,
          rot: Math.random() * Math.PI,
          char: BITS[(Math.random() * BITS.length) | 0],
        })
      }
      // hard cap: mashing the tongue must never turn into a memory leak
      if (bits.length > 600) bits = bits.slice(-600)
    }

    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight)

      for (const b of bits) {
        b.vy += 0.38
        b.vx *= 0.99
        b.x += b.vx
        b.y += b.vy
        b.rot += b.spin
        b.life -= 0.012

        if (b.life > 0) {
          ctx.save()
          ctx.globalAlpha = Math.max(0, Math.min(1, b.life * 1.6))
          ctx.translate(b.x, b.y)
          ctx.rotate(b.rot)
          ctx.font = `${b.size}px serif`
          ctx.textAlign = 'center'
          ctx.fillText(b.char, 0, 0)
          ctx.restore()
        }
      }

      bits = bits.filter((b) => b.life > 0 && b.y < innerHeight + 80)
      raf = requestAnimationFrame(tick)
    }

    resize()
    addEventListener('resize', resize)
    addEventListener('ligma-confetti', spawn)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('ligma-confetti', spawn)
    }
  }, [])

  return <canvas className="confetti" ref={ref} aria-hidden="true" />
}
