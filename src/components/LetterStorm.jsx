import { useScrollVars } from '../hooks/useScrollVars.js'
import './letter-storm.css'

const WORD = 'LIGMA'

// where each letter starts before it slams into place
const ENTRY = [
  { x: -140, y: -90, z: -900, rx: 60, ry: -120 },
  { x: 120, y: 110, z: -1400, rx: -70, ry: 160 },
  { x: -90, y: 130, z: -700, rx: 40, ry: 200 },
  { x: 150, y: -120, z: -1100, rx: -50, ry: -180 },
  { x: 40, y: -160, z: -1600, rx: 80, ry: 140 },
]

export default function LetterStorm() {
  const ref = useScrollVars('pin')

  return (
    <section className="storm" ref={ref} data-formation="2">
      <div className="storm-pin">
        <h2 className="storm-word">
          {WORD.split('').map((letter, i) => {
            const e = ENTRY[i % ENTRY.length]
            return (
              <span
                className="storm-letter"
                key={i}
                style={{
                  '--i': i,
                  '--x': e.x,
                  '--y': e.y,
                  '--z': e.z,
                  '--rx': e.rx,
                  '--ry': e.ry,
                }}
              >
                {letter}
              </span>
            )
          })}
        </h2>

        <p className="storm-sub">assembled at great expense</p>
      </div>
    </section>
  )
}
