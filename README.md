# ligma

A joke clicker game. Click the tongue, the number goes up, the screen loses its
mind. Scroll past the game for a 3D tunnel, a letter storm, a spinning emoji
cube and some made-up statistics.

Architecture follows [pen15](https://pen15.site): a mutable per-frame store
instead of React state, scroll choreography declared in the markup, a splash
gate, secret codes and a chiptune engine.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build
- `npm run ship` — build, then copy the result to the repo root

## The game

- **Click = a lick.** Every click fires a floating number, a shockwave ring,
  emoji confetti, a squash on the tongue, a screen kick and a chiptune note
  that climbs a pentatonic ladder with your combo.
- **Combo** builds while you keep clicking (+0.15× each, up to ×7) and decays
  after about a second of silence.
- **Upgrades** are the usual two kinds: tongue tiers multiply licks-per-click,
  buildings generate licks-per-second. Costs scale at the genre-standard
  `base × 1.15^owned`, and items stay hidden until you're near affording them.
- **Progress saves** to `localStorage` and the whole scene heats up — faster
  grid, brighter glow, hue shift — as the total climbs.
- **Secrets.** Type `ligma` anywhere, or enter the Konami code, for MEGA LIGMA.
- **Calm mode** is offered on the splash screen (and pre-checked if your OS asks
  for reduced motion): less shaking, no custom cursor, slower animation.

## Leaderboard

Out of the box the board is **local to the browser**, so it works with zero
setup. Point it at a real backend by copying `.env.example` to `.env.local` and
filling in one of:

**dreamlo** — no signup. Get two codes from https://dreamlo.com and set
`VITE_DREAMLO_PUBLIC` / `VITE_DREAMLO_PRIVATE`. The private code ships in the
client bundle, so anyone who reads the JS can write to the board. Fine here.

**Supabase** — free tier, needs an account. Set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`, then create the table:

```sql
create table scores (
  name text primary key,
  score bigint not null check (score >= 0),
  created_at timestamptz not null default now()
);

alter table scores enable row level security;
create policy "anyone can read"   on scores for select using (true);
create policy "anyone can insert" on scores for insert with check (true);
create policy "only beat yourself" on scores for update
  using (true) with check (score > (select s.score from scores s where s.name = scores.name));
```

Adding another backend means writing one more adapter in `src/leaderboard/`
with `list()` and `submit()` — see `local.js` for the shape.

### Name filtering

Submitted names go through `src/game/profanity.js`, which rejects: the
`leo-profanity` dictionary plus added slurs and self-harm terms; l33t-speak and
spaced-out spellings (`f*ck`, `b i t c h`, `a55hole`); consonant-skeleton
matches, which catch digit substitutions a character map misses (`f4ck` → `fck`
→ `fuck`); emails, phone numbers, links and ID-shaped numbers; and anything
outside letters, digits, spaces and `_ . - '`.

Two things worth knowing:

1. **It over-blocks on purpose.** Substring matching rejects "Scunthorpe" and
   the surname "Dickson" along with the words inside them — the Scunthorpe
   problem. For a public board that's the safer failure mode. Set `STRICT` to
   `false` in `profanity.js` for whole-word matching instead, which frees those
   names and also frees "fuckboy".
2. **It runs in the browser, so it is a courtesy filter, not a security
   boundary.** Anyone can POST straight at the backend. If the board is really
   public, mirror the check server-side — a Supabase edge function or a
   Postgres `check` constraint on insert.

## Shipping

`npm run ship` runs the build and copies `dist/index.html` and `dist/assets/`
up to the repo root, so the root `index.html` is a working, self-contained page.
Serve the repo root with anything static:

```bash
npx serve .
```

Assets are referenced relatively (`base: './'`), so the shipped page also works
from a subpath — a GitHub Pages project site, for instance.

Because the root `index.html` is build output, the app's dev entry lives at
`src/index.html` and Vite's `root` is `src/`. The two never collide, and
`npm run dev` still serves the source with HMR. Each ship clears the old
`assets/` first so stale hashed bundles don't pile up.

## Where things live

```
src/
  index.html            dev entry (Vite's root is src/)
  App.jsx               splash gate, secret codes, section order
  store.js              mutable per-frame state + the one rAF loop
  audio.js              chiptune engine (140 BPM) and one-shot sounds
  game/
    useGame.js          state, passive income, combo, save/load
    content.js          buildings, click tiers, milestones, cost curve
    profanity.js        username validation
    format.js           1234 -> "1.23K"
  leaderboard/
    index.js            picks the first configured backend
    local.js            localStorage fallback (default)
    dreamlo.js          remote, env-gated
    supabase.js         remote, env-gated
  ui/                   Splash, Cursor, Confetti, Chrome (ticker, sound,
                        progress), Fallback (WebGL check + error boundary)
  components/           Game, Leaderboard, Tunnel, LetterStorm, Marquee,
                        EmojiCube, Stats, Outro, ExtrudedWord
  hooks/
    useScrollVars.js    writes --p onto individual scrolling sections
    useInView.js        one-shot IntersectionObserver
scripts/ship.mjs        copies the build to the repo root
```

### The store, and why it isn't React state

`src/store.js` keeps a plain mutable object `S` updated by a single
`requestAnimationFrame` loop: scroll position, smoothed velocity, pointer,
progress, click kick, and the **formation float**. Nothing re-renders on
scroll — the loop writes `--skew`, `--speed`, `--kick`, `--progress`,
`--formation`, `--mx` and `--my` onto the root element, and the stylesheets
read those.

**Formations** are declared in the markup: each section carries a
`data-formation` number, and the loop returns a *float* that holds a section's
value for most of its height, then morphs into the next over the last 30%. So
`1.0 → 2.0` means "the tunnel is handing over to the letter storm", and any
animation can lerp between two states off that one number. Add a section, give
it a `data-formation`, and the choreography picks it up with no other wiring.

### Three things that will bite you if you edit the CSS

- **Nothing above a section may set `perspective`.** A perspective on an
  ancestor makes it the containing block for `position: fixed` descendants,
  which silently un-fixes the HUD and the click-burst layer — they end up
  pinned to the document instead of the viewport, and only look right at the
  very top and bottom of the page. Each section carries its own camera.
- **Scroll animations are CSS, not React.** `useScrollVars` writes a `--p`
  custom property (0→1) onto the section; the store writes the page-wide ones.
  Read those from CSS rather than wiring up scroll listeners.
- **Honour `body.calm`.** Calm mode is a promise made on the splash screen, so
  anything new that shakes, flashes or follows the cursor needs to check it.
