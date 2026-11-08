import ExtrudedWord from './ExtrudedWord.jsx'
import { useScrollVars } from '../hooks/useScrollVars.js'
import './outro.css'

export default function Outro({ licks, onMega, mega }) {
  const ref = useScrollVars('through')

  return (
    <section className="outro" ref={ref} data-formation="5">
      <div className="outro-stage">
        <span className="outro-tongue" aria-hidden="true">
          👅
        </span>

        <h2 className="outro-word">
          <ExtrudedWord word="ligma" depth={14} />
        </h2>

        <p className="outro-note">
          you scrolled all the way down for this. {licks.toLocaleString('en-US')} licks and counting.
        </p>

        <div className="outro-buttons">
          <button className="outro-top" type="button" onClick={() => window.scrollTo({ top: 0 })}>
            do it again ↑
          </button>
          <button className="outro-mega" type="button" onClick={onMega}>
            {mega ? 'turn it off' : 'do NOT press'}
          </button>
        </div>
      </div>

      <footer className="outro-footer">
        <span>no balls were harmed</span>
        <span>·</span>
        <span>type &quot;ligma&quot;</span>
      </footer>
    </section>
  )
}
