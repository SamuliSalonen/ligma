import { useCallback, useEffect, useState } from 'react'
import Game from './components/Game.jsx'
import Tunnel from './components/Tunnel.jsx'
import LetterStorm from './components/LetterStorm.jsx'
import Marquee from './components/Marquee.jsx'
import EmojiCube from './components/EmojiCube.jsx'
import Stats from './components/Stats.jsx'
import Outro from './components/Outro.jsx'
import { Splash } from './ui/Splash.jsx'
import { Cursor } from './ui/Cursor.jsx'
import { Confetti } from './ui/Confetti.jsx'
import { Ticker, SoundButton, ProgressTongue } from './ui/Chrome.jsx'
import { S, startTracking, confettiAt } from './store.js'
import { audio } from './audio.js'
import { useGame } from './game/useGame.js'
import './App.css'
import './ui/chrome.css'

const KONAMI = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a'

function useSecretCodes(onTrigger) {
  useEffect(() => {
    let keys = []

    const onKey = (e) => {
      keys = [...keys, e.key].slice(-10)
      const typed = keys.join('').toLowerCase()
      if (typed.endsWith('ligma') || keys.join(' ') === KONAMI) {
        keys = []
        onTrigger()
      }
    }

    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onTrigger])
}

function useTitleMarquee(mega) {
  useEffect(() => {
    let text = mega ? ' 👅 MEGA LIGMA 👅 MEGA LIGMA ' : ' 👅 LIGMA 👅 SUGMA 👅 CANDICE 👅 '
    const id = setInterval(() => {
      text = text.slice(1) + text[0]
      document.title = text
    }, 180)
    return () => clearInterval(id)
  }, [mega])
}

export default function App() {
  const game = useGame()

  const [entered, setEntered] = useState(false)
  const [calm, setCalm] = useState(false)
  const [mega, setMega] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => startTracking(), [])

  useEffect(() => {
    S.calm = calm
    document.body.classList.toggle('calm', calm)
  }, [calm])

  useEffect(() => {
    S.mega = mega
    document.body.classList.toggle('mega', mega)
  }, [mega])

  useEffect(() => {
    document.body.classList.toggle('locked', !entered)
  }, [entered])

  // the scene and the stylesheets read the combo straight off the store
  useEffect(() => {
    S.combo = game.combo
  }, [game.combo])

  const toggleMega = useCallback(() => {
    setMega((m) => !m)
    // S.mega still holds the pre-toggle value here
    const next = !S.mega
    setToast(next ? '👅 MEGA LIGMA ACTIVATED 👅' : 'mega ligma deactivated. coward.')
    confettiAt(innerWidth / 2, innerHeight / 2, 140)
    audio.boop(next ? 19 : -5)
  }, [])

  useSecretCodes(toggleMega)
  useTitleMarquee(mega)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])

  return (
    <>
      <ProgressTongue />
      <SoundButton />
      <Confetti />
      {!calm && <Cursor />}

      <main className="scroller">
        <Game game={game} calm={calm} mega={mega} />
        <Tunnel />
        <LetterStorm />
        <Marquee />
        <EmojiCube />
        <Stats game={game} />
        <Outro licks={game.total} onMega={toggleMega} mega={mega} />
      </main>

      <Ticker licks={game.licks} lps={game.lps} />

      {toast && <div className="toast">{toast}</div>}

      {!entered && (
        <Splash
          onEnter={({ sound, calm: wantsCalm }) => {
            setCalm(wantsCalm)
            audio.setMuted(!sound)
            setEntered(true)
          }}
        />
      )}
    </>
  )
}
