import { useState } from 'react'
import './splash.css'

/**
 * Entry gate. Nothing starts until you pick — which also gives WebAudio the
 * user gesture it needs, and lets people opt out of the shaking up front.
 */
export function Splash({ onEnter }) {
  const [calm, setCalm] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  return (
    <div className="splash">
      <div className="splash-card">
        <p className="splash-kicker">you have arrived at</p>
        <h1 className="splash-title">LIGMA</h1>
        <p className="splash-sub">a clicker game about licking. that is the entire joke.</p>

        <label className="splash-toggle">
          <input type="checkbox" checked={calm} onChange={(e) => setCalm(e.target.checked)} />
          <span>calm mode — less shaking, fewer flashes</span>
        </label>

        <div className="splash-buttons">
          <button type="button" onClick={() => onEnter({ sound: true, calm })}>
            enter with sound 🔊
          </button>
          <button type="button" className="splash-quiet" onClick={() => onEnter({ sound: false, calm })}>
            enter quietly
          </button>
        </div>
      </div>
    </div>
  )
}
