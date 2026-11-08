import { useScrollVars } from '../hooks/useScrollVars.js'
import './tunnel.css'

const RINGS = 14
const RING_EMOJI = ['👅', '🧠', '🍑', '👀', '🔥', '💀', '🫦', '✦']
const PER_RING = 10

export default function Tunnel() {
  const ref = useScrollVars('pin')

  return (
    <section className="tunnel" ref={ref} data-formation="1">
      <div className="tunnel-pin">
        <div className="tunnel-camera">
          {Array.from({ length: RINGS }, (_, r) => (
            <div className="tunnel-ring" key={r} style={{ '--r': r }}>
              {Array.from({ length: PER_RING }, (_, i) => (
                <span
                  className="tunnel-emoji"
                  key={i}
                  style={{ '--i': i, '--n': PER_RING }}
                  aria-hidden="true"
                >
                  {RING_EMOJI[(r * PER_RING + i) % RING_EMOJI.length]}
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="tunnel-caption">
          <span>you are now entering</span>
          <strong>the ligma zone</strong>
        </p>
      </div>
    </section>
  )
}
