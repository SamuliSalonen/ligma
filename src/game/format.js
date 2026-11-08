const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc']

/** 1234 -> "1.23K". Clicker games live and die by this function. */
export function fmt(n) {
  if (!Number.isFinite(n)) return '∞'
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toLocaleString('en-US')

  const tier = Math.min(UNITS.length - 1, Math.floor(Math.log10(n) / 3))
  const scaled = n / 1000 ** tier

  return `${scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0)}${UNITS[tier]}`
}
