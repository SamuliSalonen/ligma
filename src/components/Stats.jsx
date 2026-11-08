import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView.js'
import { fmt } from '../game/format.js'
import './stats.css'

function useCountUp(target, active, ms = 1200) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!active) return

    let raf
    const start = performance.now()

    const step = (now) => {
      const t = Math.min(1, (now - start) / ms)
      // ease-out-expo, so the number slams to a halt
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setN(target * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, active, ms])

  return n
}

function Stat({ value, suffix = '', label, index, active }) {
  const n = useCountUp(value, active)

  return (
    <li className="stat" style={{ '--i': index }} data-active={active || undefined}>
      <span className="stat-value">
        {fmt(n)}
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </li>
  )
}

export default function Stats({ game }) {
  const [ref, seen] = useInView(0.3)

  const buildings = Object.values(game.owned).reduce((a, b) => a + b, 0)

  const rows = [
    { value: game.total, label: 'licks, all time' },
    { value: game.clicks, label: 'tongue strikes' },
    { value: game.lps, suffix: '/s', label: 'passive licking' },
    { value: buildings, label: 'things that lick for you' },
  ]

  return (
    <section className="stats" ref={ref} data-formation="5">
      <h2 className="stats-title">the numbers don&apos;t lie</h2>
      <ul className="stats-grid">
        {rows.map((row, i) => (
          <Stat key={row.label} {...row} index={i} active={seen} />
        ))}
      </ul>
    </section>
  )
}
