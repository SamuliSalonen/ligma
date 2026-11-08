import { useScrollVars } from '../hooks/useScrollVars.js'
import './emoji-cube.css'

const FACES = [
  { face: 'front', emoji: '👅', label: 'lick' },
  { face: 'back', emoji: '👀', label: 'look' },
  { face: 'right', emoji: '🫦', label: 'bite' },
  { face: 'left', emoji: '🧠', label: 'think' },
  { face: 'top', emoji: '🔥', label: 'burn' },
  { face: 'bottom', emoji: '💀', label: 'rip' },
]

export default function EmojiCube() {
  const ref = useScrollVars('pin')

  return (
    <section className="cube-section" ref={ref} data-formation="4">
      <div className="cube-pin">
        <h2 className="cube-title">six sides. one joke.</h2>

        <div className="cube-space">
          <div className="cube">
            {FACES.map(({ face, emoji, label }) => (
              <div className={`cube-face cube-${face}`} key={face}>
                <span className="cube-emoji" aria-hidden="true">
                  {emoji}
                </span>
                <span className="cube-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
