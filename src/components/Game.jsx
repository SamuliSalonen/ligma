import { useCallback, useRef, useState } from 'react'
import { BUILDINGS, CLICK_TIERS, buildingCost } from '../game/content.js'
import { fmt } from '../game/format.js'
import { audio } from '../audio.js'
import { S, confettiAt } from '../store.js'
import ExtrudedWord from './ExtrudedWord.jsx'
import Leaderboard from './Leaderboard.jsx'
import './game.css'

const POP_WORDS = ['LICK', 'SLURP', 'MWAH', 'SCHLORP', 'YUM', 'BLEH']
let popId = 0

export default function Game({ game, calm, mega }) {
  const { licks, total, lps, lpc, combo, comboMult, milestone } = game

  const [pops, setPops] = useState([])
  const [rings, setRings] = useState([])
  const stageRef = useRef(null)
  const targetRef = useRef(null)

  const handleLick = useCallback(
    (e) => {
      const gain = game.lick()

      // hand the click to the shared store: glow, shake and bloom all read it
      S.lickKick = 1
      audio.lick(combo)
      confettiAt(e.clientX, e.clientY, mega ? 40 : 14)

      const rect = targetRef.current?.getBoundingClientRect()
      const x = e.clientX - (rect?.left ?? 0)
      const y = e.clientY - (rect?.top ?? 0)

      const id = ++popId
      const pop = {
        id,
        x,
        y,
        gain,
        word: combo > 6 ? POP_WORDS[id % POP_WORDS.length] : null,
        drift: Math.random() * 80 - 40,
        tilt: Math.random() * 26 - 13,
      }

      setPops((p) => [...p.slice(-24), pop])
      setRings((r) => [...r.slice(-6), { id }])
      setTimeout(() => {
        setPops((p) => p.filter((x) => x.id !== id))
        setRings((r) => r.filter((x) => x.id !== id))
      }, 900)

      // squash the target and kick the whole stage — the two bits of juice that
      // make a click feel like it landed
      targetRef.current?.animate(
        [
          { transform: 'translateZ(90px) scale3d(1, 1, 1)' },
          { transform: 'translateZ(90px) scale3d(1.22, 0.78, 1) rotate(-4deg)', offset: 0.25 },
          { transform: 'translateZ(90px) scale3d(0.92, 1.12, 1) rotate(3deg)', offset: 0.55 },
          { transform: 'translateZ(90px) scale3d(1, 1, 1)' },
        ],
        { duration: 320, easing: 'cubic-bezier(.2,1.4,.4,1)' },
      )

      const shake = Math.min(14, 3 + combo * 0.5) * (calm ? 0.15 : 1)
      stageRef.current?.animate(
        [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${(Math.random() - 0.5) * shake}px, ${(Math.random() - 0.5) * shake}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: 130, easing: 'ease-out' },
      )
    },
    [game, combo, mega],
  )

  const nextTier = CLICK_TIERS[game.clickTier]

  return (
    <section
      className="game"
      data-formation="0"
      style={{
        '--combo': combo,
        '--heat': Math.min(1, combo / 20).toFixed(3),
        // capped low: a full hue rotation turns the pink brand colour green
        '--hue': Math.min(45, Math.log10(Math.max(10, total)) * 6).toFixed(1),
      }}
    >
      <div className="game-grid" aria-hidden="true" />

      <div className="game-stage" ref={stageRef}>
        <h1 className="wordmark">
          <ExtrudedWord word="ligma" depth={12} />
        </h1>

        <header className="score">
          <span className="score-value">{fmt(licks)}</span>
          <span className="score-unit">licks</span>
          <span className="score-rate">{fmt(lps)} / sec · {fmt(lpc)} per lick</span>
        </header>

        {/* ---- the platform ---- */}
        <div className="platform">
          <div className="platform-rays" aria-hidden="true" />
          <div className="platform-disc" aria-hidden="true">
            <span className="platform-ring platform-ring-1" />
            <span className="platform-ring platform-ring-2" />
            <span className="platform-ring platform-ring-3" />
          </div>

          <div className="platform-shadow" aria-hidden="true" />

          <button
            className="target"
            type="button"
            ref={targetRef}
            onPointerDown={handleLick}
            aria-label="lick"
          >
            <span className="target-emoji">👅</span>
          </button>

          {rings.map((ring) => (
            <span className="shockwave" key={ring.id} aria-hidden="true" />
          ))}

          {pops.map((pop) => (
            <span
              className="pop"
              key={pop.id}
              style={{
                left: pop.x,
                top: pop.y,
                '--drift': `${pop.drift}px`,
                '--tilt': `${pop.tilt}deg`,
              }}
              aria-hidden="true"
            >
              +{fmt(pop.gain)}
              {pop.word && <em>{pop.word}</em>}
            </span>
          ))}
        </div>

        <div className="combo" data-hot={combo > 6 || undefined}>
          <div className="combo-bar" />
          <span className="combo-text">
            {combo > 1 ? `combo ×${comboMult.toFixed(2)}` : 'click the tongue'}
          </span>
        </div>

        {milestone && <p className="milestone">{milestone.text}</p>}
      </div>

      {/* ---- shop ---- */}
      <aside className="shop">
        <div className="shop-head">
          <h2>upgrades</h2>
        </div>

        {nextTier ? (
          <button
            className="shop-item shop-item-click"
            type="button"
            onClick={game.buyClickTier}
            disabled={licks < nextTier.cost}
          >
            <span className="shop-emoji">✨</span>
            <span className="shop-body">
              <strong>{nextTier.label}</strong>
              <small>×{nextTier.mult} per lick</small>
            </span>
            <span className="shop-cost">{fmt(nextTier.cost)}</span>
          </button>
        ) : (
          <p className="shop-maxed">tongue fully upgraded. incredible.</p>
        )}

        {BUILDINGS.filter(
          // keep the shop from spoiling everything at once
          (b) => total >= b.base * 0.4 || (game.owned[b.id] ?? 0) > 0,
        ).map((b) => {
          const owned = game.owned[b.id] ?? 0
          const cost = buildingCost(b, owned)

          return (
            <button
              className="shop-item"
              type="button"
              key={b.id}
              onClick={() => game.buy(b.id)}
              disabled={licks < cost}
            >
              <span className="shop-emoji">{b.emoji}</span>
              <span className="shop-body">
                <strong>{b.name}</strong>
                <small>
                  +{b.lps}/sec · {b.blurb}
                </small>
              </span>
              <span className="shop-cost">
                {fmt(cost)}
                {owned > 0 && <em>{owned}</em>}
              </span>
            </button>
          )
        })}

        <Leaderboard score={total} />

        <button className="shop-reset" type="button" onClick={game.reset}>
          wipe save
        </button>
      </aside>
    </section>
  )
}
