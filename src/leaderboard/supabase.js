const URL = import.meta.env.VITE_SUPABASE_URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase REST, no client library needed. Requires a `scores` table and RLS
 * policies allowing anonymous select + insert — the SQL is in the README.
 */
export const supabaseBoard = {
  id: 'supabase',
  label: 'global (supabase)',
  available: Boolean(URL && ANON),

  headers() {
    return { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' }
  },

  async list(limit = 20) {
    const res = await fetch(
      `${URL}/rest/v1/scores?select=name,score,created_at&order=score.desc&limit=${limit}`,
      { headers: this.headers() },
    )
    if (!res.ok) throw new Error(`supabase ${res.status}`)

    const rows = await res.json()
    return rows.map((r) => ({ name: r.name, score: r.score, at: Date.parse(r.created_at) || 0 }))
  },

  async submit({ name, score }) {
    const res = await fetch(`${URL}/rest/v1/scores`, {
      method: 'POST',
      headers: { ...this.headers(), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ name, score: Math.floor(score) }),
    })

    if (!res.ok) return { ok: false, error: `supabase ${res.status}` }
    return { ok: true, improved: true }
  },
}
