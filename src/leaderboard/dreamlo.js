const PUBLIC = import.meta.env.VITE_DREAMLO_PUBLIC
const PRIVATE = import.meta.env.VITE_DREAMLO_PRIVATE
const BASE = 'https://dreamlo.com/lb'

/**
 * dreamlo.com — free, no signup, no SQL. You get a public and a private code
 * from their front page and paste them into .env.local.
 *
 * Caveat worth knowing: the private (write) code ships in the bundle, so the
 * board is public-write. Fine for a joke game, not for anything that matters.
 */
export const dreamloBoard = {
  id: 'dreamlo',
  label: 'global (dreamlo)',
  available: Boolean(PUBLIC && PRIVATE),

  async list(limit = 20) {
    const res = await fetch(`${BASE}/${PUBLIC}/json/0/${limit}`)
    if (!res.ok) throw new Error(`dreamlo ${res.status}`)

    const data = await res.json()
    const raw = data?.dreamlo?.leaderboard?.entry
    if (!raw) return []

    return (Array.isArray(raw) ? raw : [raw]).map((e) => ({
      name: e.name,
      score: Number(e.score) || 0,
      at: Date.parse(e.date) || 0,
    }))
  },

  async submit({ name, score }) {
    // dreamlo keys are path segments, so a name with a slash would break the URL
    const safe = encodeURIComponent(name.replace(/[/\\]/g, ''))
    const res = await fetch(`${BASE}/${PRIVATE}/add/${safe}/${Math.floor(score)}`)

    if (!res.ok) return { ok: false, error: `dreamlo ${res.status}` }
    return { ok: true, improved: true }
  },
}
