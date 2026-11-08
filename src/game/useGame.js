import { useCallback, useEffect, useRef, useState } from 'react'
import { BUILDINGS, CLICK_TIERS, MILESTONES, buildingCost } from './content.js'

const SAVE_KEY = 'ligma.save.v1'
const TICK_MS = 100
const COMBO_WINDOW = 1100
const COMBO_MAX = 40

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null')
    if (!raw || typeof raw !== 'object') return null
    return raw
  } catch {
    return null
  }
}

const EMPTY = { licks: 0, total: 0, clicks: 0, owned: {}, clickTier: 0 }

export function useGame() {
  const [state, setState] = useState(() => ({ ...EMPTY, ...loadSave() }))
  const [combo, setCombo] = useState(0)
  const lastClick = useRef(0)

  // derived rates
  const lps = BUILDINGS.reduce((sum, b) => sum + b.lps * (state.owned[b.id] ?? 0), 0)
  const baseLpc = CLICK_TIERS.slice(0, state.clickTier).reduce((m, t) => m * t.mult, 1)
  const comboMult = 1 + combo * 0.15
  const lpc = baseLpc * comboMult

  // ---- passive income ----
  const lpsRef = useRef(lps)
  lpsRef.current = lps

  useEffect(() => {
    const id = setInterval(() => {
      const gain = lpsRef.current * (TICK_MS / 1000)
      if (gain <= 0) return
      setState((s) => ({ ...s, licks: s.licks + gain, total: s.total + gain }))
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])

  // ---- combo decay ----
  useEffect(() => {
    if (combo === 0) return
    const id = setTimeout(() => setCombo(0), COMBO_WINDOW)
    return () => clearTimeout(id)
  }, [combo])

  // ---- persistence ----
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state))
      } catch {
        /* private mode — the run just won't persist */
      }
    }, 400)

    return () => clearTimeout(id)
  }, [state])

  const lpcRef = useRef(lpc)
  lpcRef.current = lpc

  const lick = useCallback(() => {
    const now = performance.now()
    const chaining = now - lastClick.current < COMBO_WINDOW
    lastClick.current = now

    setCombo((c) => (chaining ? Math.min(COMBO_MAX, c + 1) : 1))

    const gain = lpcRef.current
    setState((s) => ({ ...s, licks: s.licks + gain, total: s.total + gain, clicks: s.clicks + 1 }))

    return gain
  }, [])

  const buy = useCallback((id) => {
    setState((s) => {
      const building = BUILDINGS.find((b) => b.id === id)
      if (!building) return s

      const cost = buildingCost(building, s.owned[id] ?? 0)
      if (s.licks < cost) return s

      return { ...s, licks: s.licks - cost, owned: { ...s.owned, [id]: (s.owned[id] ?? 0) + 1 } }
    })
  }, [])

  const buyClickTier = useCallback(() => {
    setState((s) => {
      const tier = CLICK_TIERS[s.clickTier]
      if (!tier || s.licks < tier.cost) return s
      return { ...s, licks: s.licks - tier.cost, clickTier: s.clickTier + 1 }
    })
  }, [])

  const reset = useCallback(() => {
    setState({ ...EMPTY })
    setCombo(0)
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      /* nothing to clear */
    }
  }, [])

  const milestone = [...MILESTONES].reverse().find((m) => state.total >= m.at)

  return { ...state, lps, lpc, baseLpc, combo, comboMult, milestone, lick, buy, buyClickTier, reset }
}
