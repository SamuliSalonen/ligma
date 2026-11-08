import { useEffect, useState } from 'react'
import { S } from '../store.js'
import { audio } from '../audio.js'
import { fmt } from '../game/format.js'

const LINES = [
  'LIGMA',
  'NOW WITH 40% MORE TONGUE',
  'NOT AFFILIATED WITH ANY REAL CONDITION',
  'TYPE "LIGMA" FOR A BAD TIME',
  'YOUR SCROLL IS BEING WATCHED',
  'BALLS: UNHARMED',
]

/** The scrolling banner every joke site is legally required to have. */
export function Ticker({ licks, lps }) {
  const text = `${LINES.join('  ✦  ')}  ✦  ${fmt(licks)} LICKS  ✦  ${fmt(lps)}/SEC  ✦  `

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        <span>{text.repeat(3)}</span>
        <span>{text.repeat(3)}</span>
      </div>
    </div>
  )
}

export function SoundButton() {
  const [muted, setMuted] = useState(audio.muted)

  useEffect(() => audio.subscribe(setMuted), [])

  return (
    <button
      className="sound-button"
      type="button"
      onClick={() => audio.setMuted(!audio.muted)}
      aria-pressed={!muted}
      aria-label={muted ? 'unmute' : 'mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

/** Scroll progress, as a tongue climbing the side of the screen. */
export function ProgressTongue() {
  const [p, setP] = useState(0)

  useEffect(() => {
    let raf
    const loop = () => {
      setP(S.progress)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="progress" style={{ '--p': p.toFixed(4) }} aria-hidden="true">
      <div className="progress-fill" />
      <span className="progress-head">👅</span>
    </div>
  )
}
