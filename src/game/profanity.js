import filter from 'leo-profanity'

filter.loadDictionary('en')

// Slurs and harassment terms the base dictionary misses, plus the categories
// the user asked to keep out of a public list.
filter.add([
  'rape', 'rapist', 'nazi', 'hitler', 'holocaust', 'lynch', 'kkk',
  'kys', 'killyourself', 'suicide', 'heil',
])

export const NAME_MAX = 16
export const NAME_MIN = 2

/**
 * Substring matching over-blocks: it rejects "Scunthorpe" and the surname
 * "Dickson" along with the words they contain — the Scunthorpe problem.
 *
 * For a public leaderboard that's the safer failure mode (a rejected player
 * just picks another name; a slur on the board is everyone's problem), so it
 * is the default. Flip this to false to match whole words only, which lets
 * those names through and also lets "fuckboy" through.
 */
const STRICT = true

// l33t-speak and spacing are the two cheapest filter bypasses, so normalise
// both before checking the word list.
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', $: 's', '@': 'a', '!': 'i' }

function normalise(name) {
  return name
    .toLowerCase()
    .replace(/[01345789$@!]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z]/g, '') // drop separators: "b.a.d" -> "bad"
    .replace(/(.)\1{2,}/g, '$1$1') // "baaaad" -> "baad"
}

/**
 * A leet map alone can't catch a digit standing in for a *different* letter
 * ("f4ck" maps to "fack", not "fuck"). Comparing consonant skeletons does:
 * both sides collapse to "fck".
 *
 * Only words of 4+ letters take part — shorter ones produce skeletons so
 * generic they would swallow ordinary names.
 */
const skeleton = (word) => word.toLowerCase().replace(/[^a-z]/g, '').replace(/[aeiou]/g, '')

const BANNED_SKELETONS = [
  ...new Set(
    filter
      .list()
      .filter((w) => w.replace(/[^a-z]/gi, '').length >= 4)
      .map(skeleton)
      .filter((sk) => sk.length >= 3),
  ),
]

/** Whole-word matching, used when STRICT is off. */
function hasBannedWord(name) {
  const words = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  return words.some((w) => filter.check(w))
}

function hasBannedSkeleton(name) {
  // strip digits and symbols first, so "f4ck" and "f*ck" both reach "fck"
  const sk = skeleton(name.toLowerCase().replace(/[^a-z]/g, ''))
  return BANNED_SKELETONS.some((banned) => sk.includes(banned))
}

const CONTACT = [
  { re: /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, why: 'no email addresses' },
  { re: /\b(?:\+?\d[\s-]?){7,}\b/, why: 'no phone numbers' },
  { re: /\b(?:https?:\/\/|www\.)\S+/i, why: 'no links' },
  { re: /\b\d{3}-\d{2}-\d{4}\b/, why: 'no ID numbers' },
]

/**
 * Returns { ok: true, name } or { ok: false, reason }.
 *
 * This runs in the browser, so it is a courtesy filter, not a security
 * boundary — anyone can POST around it. Mirror it server-side before trusting
 * a public board (see README).
 */
export function validateName(raw) {
  const name = raw.trim().replace(/\s+/g, ' ')

  if (name.length < NAME_MIN) return { ok: false, reason: `at least ${NAME_MIN} characters` }
  if (name.length > NAME_MAX) return { ok: false, reason: `at most ${NAME_MAX} characters` }

  if (!/^[\p{L}\p{N} _.'-]+$/u.test(name)) {
    return { ok: false, reason: 'letters, numbers, spaces, _ . - only' }
  }

  for (const { re, why } of CONTACT) {
    if (re.test(name)) return { ok: false, reason: why }
  }

  const dirty = STRICT
    ? filter.check(name) || filter.check(normalise(name)) || hasBannedSkeleton(name)
    : hasBannedWord(name) || hasBannedWord(normalise(name))

  if (dirty) {
    return { ok: false, reason: 'that name trips the word filter — try another' }
  }

  return { ok: true, name }
}
