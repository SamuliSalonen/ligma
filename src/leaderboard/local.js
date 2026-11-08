const KEY = 'ligma.leaderboard.v1'

/** Always-available fallback: the board lives in this browser only. */
export const localBoard = {
  id: 'local',
  label: 'this browser only',

  async list(limit = 20) {
    try {
      const rows = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      return rows.sort((a, b) => b.score - a.score).slice(0, limit)
    } catch {
      return []
    }
  },

  async submit({ name, score }) {
    const rows = await this.list(500)
    const existing = rows.find((r) => r.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      if (score <= existing.score) return { ok: true, improved: false }
      existing.score = score
      existing.at = Date.now()
    } else {
      rows.push({ name, score, at: Date.now() })
    }

    try {
      localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 500)))
    } catch {
      return { ok: false, error: 'could not save locally' }
    }

    return { ok: true, improved: true }
  },
}
