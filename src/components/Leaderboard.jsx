import { useCallback, useEffect, useState } from 'react'
import { board, isRemote } from '../leaderboard/index.js'
import { validateName, NAME_MAX } from '../game/profanity.js'
import { fmt } from '../game/format.js'
import './leaderboard.css'

const NAME_KEY = 'ligma.name'

export default function Leaderboard({ score }) {
  const [rows, setRows] = useState([])
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setRows(await board.list(10))
    } catch (err) {
      setStatus({ kind: 'error', text: `board unreachable (${err.message})` })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const submit = async (e) => {
    e.preventDefault()

    const check = validateName(name)
    if (!check.ok) {
      setStatus({ kind: 'error', text: check.reason })
      return
    }

    if (score < 1) {
      setStatus({ kind: 'error', text: 'lick something first' })
      return
    }

    setBusy(true)
    setStatus(null)

    try {
      const res = await board.submit({ name: check.name, score: Math.floor(score) })

      if (!res.ok) {
        setStatus({ kind: 'error', text: res.error ?? 'submit failed' })
      } else {
        try {
          localStorage.setItem(NAME_KEY, check.name)
        } catch {
          /* fine, they'll retype it */
        }
        setStatus({
          kind: 'ok',
          text: res.improved ? 'posted' : 'your best score still stands',
        })
        await refresh()
      }
    } catch (err) {
      setStatus({ kind: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="board">
      <h2 className="board-title">
        leaderboard
        <small>{board.label}</small>
      </h2>

      <ol className="board-list">
        {rows.length === 0 && <li className="board-empty">nobody has licked yet</li>}
        {rows.map((row, i) => (
          <li className="board-row" key={`${row.name}-${i}`}>
            <span className="board-rank">{i + 1}</span>
            <span className="board-name">{row.name}</span>
            <span className="board-score">{fmt(row.score)}</span>
          </li>
        ))}
      </ol>

      <form className="board-form" onSubmit={submit}>
        <input
          type="text"
          value={name}
          maxLength={NAME_MAX}
          placeholder="your name"
          onChange={(e) => {
            setName(e.target.value)
            setStatus(null)
          }}
          aria-label="leaderboard name"
        />
        <button type="submit" disabled={busy}>
          {busy ? '…' : `post ${fmt(score)}`}
        </button>
      </form>

      {status && <p className={`board-status board-status-${status.kind}`}>{status.text}</p>}

      {!isRemote && (
        <p className="board-note">
          scores stay in this browser — add a backend key to go global
        </p>
      )}
    </section>
  )
}
