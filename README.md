# ligma

A React + Vite page where a 👅 licks its way across the top of the word **ligma**,
dragging a wet gloss over the letters and leaving a few drips behind.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build
- `npm run ship` — build, then copy the result to the repo root

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

- `src/index.html` — the dev entry (Vite's root is `src/`)
- `src/App.jsx` — the word, the tongue, the lick counter and the speed slider
- `src/App.css` — the `lick` / `gloss` / `nudge` / `drip` keyframes
- `src/index.css` — page background and reset
- `scripts/ship.mjs` — copies the build to the repo root

The lick cycle length is driven by the `--lick-duration` custom property set on
`.word-wrap`; the tongue, the gloss sweep and the per-letter nudge all read from
it, so the slider keeps them in sync. Animations are disabled under
`prefers-reduced-motion`.
