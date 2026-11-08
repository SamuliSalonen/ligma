import './marquee.css'

const ROWS = [
  { text: 'LIGMA BALLS ✦ ', speed: 18, dir: 1, tone: 'hot' },
  { text: 'SUGMA 👀 CANDICE 👅 ', speed: 24, dir: -1, tone: 'cyan' },
  { text: 'DEEZ ✦ NUTS ✦ ', speed: 14, dir: 1, tone: 'lime' },
]

export default function Marquee() {
  return (
    <section className="marquee-stack" aria-hidden="true" data-formation="3">
      {ROWS.map((row, i) => (
        <div className={`marquee marquee-${row.tone}`} key={i} style={{ '--row': i }}>
          <div
            className="marquee-track"
            style={{
              animationDuration: `${row.speed}s`,
              animationDirection: row.dir > 0 ? 'normal' : 'reverse',
            }}
          >
            {/* duplicated so the loop is seamless */}
            <span>{row.text.repeat(8)}</span>
            <span>{row.text.repeat(8)}</span>
          </div>
        </div>
      ))}
    </section>
  )
}
