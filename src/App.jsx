import { useState } from 'react'
import './App.css'

const WORD = 'ligma'

export default function App() {
  const [licks, setLicks] = useState(0)
  const [duration, setDuration] = useState(2.4)

  const handleLick = (e) => {
    if (e.animationName === 'lick') setLicks((n) => n + 1)
  }

  return (
    <main className="stage">
      <div className="word-wrap" style={{ '--lick-duration': `${duration}s` }}>
        <span className="tongue" aria-hidden="true" onAnimationIteration={handleLick}>
          👅
        </span>

        <h1 className="word">
          {WORD.split('').map((letter, i) => (
            <span className="letter" key={i} style={{ '--i': i, '--n': WORD.length }}>
              {letter}
            </span>
          ))}
          <span className="shine" aria-hidden="true">
            {WORD}
          </span>
        </h1>

        <span className="drip drip-1" aria-hidden="true" />
        <span className="drip drip-2" aria-hidden="true" />
        <span className="drip drip-3" aria-hidden="true" />
      </div>

      <p className="counter">licks: {licks}</p>

      <label className="speed">
        <span>slower</span>
        <input
          type="range"
          min="0.6"
          max="5"
          step="0.1"
          value={5.6 - duration}
          onChange={(e) => setDuration(5.6 - Number(e.target.value))}
        />
        <span>faster</span>
      </label>
    </main>
  )
}
