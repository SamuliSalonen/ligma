/** Auto-lickers. Cost scales 1.15^owned, the genre-standard curve. */
export const BUILDINGS = [
  { id: 'spare', emoji: '👅', name: 'Spare Tongue', base: 15, lps: 0.3, blurb: 'it licks while you sleep' },
  { id: 'lips', emoji: '🫦', name: 'Lip Service', base: 110, lps: 2, blurb: 'outsourced enthusiasm' },
  { id: 'brain', emoji: '🧠', name: 'Brain Worm', base: 1300, lps: 12, blurb: 'thinks only of licking' },
  { id: 'flame', emoji: '🔥', name: 'Flame Lick', base: 14000, lps: 68, blurb: 'technically arson' },
  { id: 'skull', emoji: '💀', name: 'Eternal Licker', base: 200000, lps: 420, blurb: 'death could not stop it' },
  { id: 'hole', emoji: '🌀', name: 'Lick Singularity', base: 3300000, lps: 2600, blurb: 'physics has left' },
]

/** Click upgrades. Each tier multiplies licks-per-click. */
export const CLICK_TIERS = [
  { cost: 100, mult: 2, label: 'Wet Tongue' },
  { cost: 2500, mult: 3, label: 'Forked Tongue' },
  { cost: 40000, mult: 5, label: 'Industrial Tongue' },
  { cost: 750000, mult: 8, label: 'Quantum Tongue' },
  { cost: 12000000, mult: 15, label: 'Tongue of Babel' },
]

export const MILESTONES = [
  { at: 1, text: 'first lick. no going back.' },
  { at: 100, text: '100 licks. people are talking.' },
  { at: 1000, text: '1K licks. this is a lifestyle now.' },
  { at: 50000, text: '50K licks. seek help. then keep licking.' },
  { at: 1000000, text: 'ONE MILLION LICKS. absolutely deranged.' },
  { at: 100000000, text: '100M. the tongue has become god.' },
]

export function buildingCost(building, owned) {
  return Math.ceil(building.base * 1.15 ** owned)
}
