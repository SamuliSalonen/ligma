// Mutable per-frame state shared between the DOM and the scene.
// Deliberately not React state: this is read 60 times a second.
export const S = {
  y: 0,
  progress: 0,
  vel: 0, // smoothed scroll velocity, px/s
  speed: 0, // |vel|
  formation: 0, // float, which arrangement we're in (see scene/formations.js)
  mouse: { x: 0, y: 0 },
  lickKick: 0, // 1 on click, decays — drives glow, shake and bloom
  combo: 0,
  calm: false,
  mega: false,
}

export const now = () => performance.now() / 1000

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
export const hash = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Formation float: holds a section's formation for most of the section, then
 * morphs into the next one over the section's last 30%. Sections declare theirs
 * with a data-formation attribute, so the choreography lives in the markup.
 */
function computeFormation(y) {
  const secs = document.querySelectorAll('[data-formation]')
  if (!secs.length) return 0

  const c = y + innerHeight / 2
  let f = +secs[0].dataset.formation

  for (let i = 0; i < secs.length; i++) {
    const r = secs[i].getBoundingClientRect()
    const top = r.top + y
    if (c < top) break

    const k = +secs[i].dataset.formation
    const next = secs[i + 1] ? +secs[i + 1].dataset.formation : k
    f = k + smoothstep(0.7, 1, (c - top) / r.height) * (next - k)
  }

  return f
}

/**
 * One rAF loop for the whole page. Writes the handful of values CSS cares about
 * onto the root element as custom properties, so stylesheets can react to
 * scroll velocity without a single React render.
 */
export function startTracking() {
  const root = document.documentElement
  let lastY = scrollY
  let lastT = performance.now()
  let raf

  const onMove = (e) => {
    S.mouse.x = (e.clientX / innerWidth) * 2 - 1
    S.mouse.y = -((e.clientY / innerHeight) * 2 - 1)
  }

  const tick = () => {
    const t = performance.now()
    const dt = Math.max(1, t - lastT) / 1000
    const y = scrollY

    S.vel += ((y - lastY) / dt - S.vel) * Math.min(1, dt * 10)
    S.speed = Math.abs(S.vel)
    lastY = y
    lastT = t
    S.y = y

    const max = document.documentElement.scrollHeight - innerHeight
    S.progress = max > 0 ? y / max : 0
    S.formation = computeFormation(y)
    S.lickKick *= Math.exp(-dt * 2.6)

    const damp = S.calm ? 0.15 : 1
    // skew the page against the scroll, the way pen15 does with motion values
    root.style.setProperty('--skew', (clamp(-S.vel / 420, -9, 9) * damp).toFixed(2))
    root.style.setProperty('--speed', Math.min(S.speed / 3000, 1).toFixed(3))
    root.style.setProperty('--kick', (S.lickKick * damp).toFixed(3))
    root.style.setProperty('--progress', S.progress.toFixed(4))
    root.style.setProperty('--formation', S.formation.toFixed(3))
    root.style.setProperty('--mx', S.mouse.x.toFixed(3))
    root.style.setProperty('--my', S.mouse.y.toFixed(3))

    raf = requestAnimationFrame(tick)
  }

  addEventListener('pointermove', onMove, { passive: true })
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    removeEventListener('pointermove', onMove)
  }
}

export function confettiAt(x, y, amount = 28) {
  dispatchEvent(new CustomEvent('ligma-confetti', { detail: { x, y, amount } }))
}
