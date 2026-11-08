import { localBoard } from './local.js'
import { dreamloBoard } from './dreamlo.js'
import { supabaseBoard } from './supabase.js'

/**
 * Picks the first configured remote board, else falls back to localStorage so
 * the feature always works with zero setup. Configure one by dropping keys into
 * .env.local — see README.
 */
export const board = [dreamloBoard, supabaseBoard].find((b) => b.available) ?? localBoard

export const isRemote = board !== localBoard
