import type { SupabaseClient } from '@supabase/supabase-js'

// The live leaderboard is stored in Supabase (see supabase/schema.sql). It's switched off, and the site
// stays device-only, until the build is given VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const syncEnabled = Boolean(url && key)

// Loaded only when first needed, so the device-only site never downloads the Supabase library.
let client: Promise<SupabaseClient> | null = null
const getClient = () => (client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(url!, key!)).catch((error) => {
  client = null
  throw error
}))

export type Progress = { nickname: string; code: string; stamps: string[]; secrets: string[]; results: Record<string, number>; explorer_type: string | null }

// Progress is saved as one row per phone, a moment after it last changed, one save at a time.
// Failed saves retry after 30 seconds or when the phone comes back online. The database refuses saves from
// networks it doesn't trust (supabase/schema.sql), so those retry every 5 minutes, in case the phone joins Westpac Wi-Fi.
let pending: Progress | null = null
let timer = 0
let saving = false
const save = async () => {
  timer = 0
  const progress = pending
  if (!progress || saving) return
  saving = true
  try {
    const supabase = await getClient()
    let { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      session = data.session
    }
    const { error } = await supabase.from('players').upsert({ id: session!.user.id, ...progress })
    if (error) throw error
    if (pending === progress) pending = null
    else if (!timer) timer = window.setTimeout(save, 1500)
  } catch (error) {
    const refused = (error as { code?: string }).code === '42501'
    if (!timer) timer = window.setTimeout(save, refused ? 300_000 : 30_000)
  } finally {
    saving = false
  }
}
export const queueProgress = (progress: Progress) => {
  pending = progress
  clearTimeout(timer)
  timer = window.setTimeout(save, 1500)
}
if (syncEnabled) window.addEventListener('online', () => { if (pending) queueProgress(pending) })

export type BoardRow = { nickname: string; code: string; points: number }
export const fetchLeaderboard = async (booth: string) => {
  const { data, error } = await (await getClient()).rpc('leaderboard', { booth: booth || null, max_rows: 10 })
  if (error) throw error
  return data as BoardRow[]
}
export const fetchRank = async (points: number, booth: string) => {
  const { data, error } = await (await getClient()).rpc('leaderboard_rank', { my_points: points, booth: booth || null })
  if (error) throw error
  return data as number
}
