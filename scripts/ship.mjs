// Copies the finished build from dist/ up to the repo root, so the root
// index.html can be served directly (GitHub Pages, any static host, or a plain
// `npx serve .`). Run it through `npm run ship`, which builds first.
import { cp, readdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

if (!existsSync(dist)) {
  console.error('ship: no dist/ to ship — run `npm run build` first.')
  process.exit(1)
}

// Drop the previous hashed bundles, otherwise every ship leaves its old
// assets/index-*.js behind at the root forever.
await rm(join(root, 'assets'), { recursive: true, force: true })

const shipped = []
for (const entry of await readdir(dist)) {
  const from = join(dist, entry)
  const to = join(root, entry)

  // Paranoia: dist should only ever hold index.html, assets/ and whatever
  // public/ contributed. Never let it overwrite the sources it was built from.
  if (['src', 'scripts', 'node_modules', '.git', 'package.json'].includes(entry)) {
    console.warn(`ship: refusing to overwrite ${entry}/ at the root — skipped.`)
    continue
  }

  await cp(from, to, { recursive: true, force: true })
  const size = (await stat(from)).isDirectory() ? 'dir' : `${(await stat(from)).size} B`
  shipped.push(`${entry} (${size})`)
}

console.log(`ship: copied to ${root}`)
for (const line of shipped) console.log(`  ${line}`)
console.log('\nServe the repo root and index.html works, e.g.:\n  npx serve .')
