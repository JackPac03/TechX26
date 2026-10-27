import { exhibits } from './data'
import { secrets } from './secrets'

// Points: every stamp is worth 10 and every hidden exhibit 25. A completed challenge is worth 50, plus up to 50 for how well you did.
export const stampPoints = 10
export const secretPoints = 25
export const challengeBase = 50
export const challengeBonus = 50
export const challengePoints = (performance: number) => challengeBase + Math.round(challengeBonus * Math.min(1, Math.max(0, performance)))

// Players pick a nickname, and a random id gives them a short code to prove the nickname is theirs.
export type Player = { id: string; nickname: string }
export const playerKey = 'techx26-player'
export const readPlayer = (): Player | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(playerKey) ?? 'null')
    if (!saved) return null
    if (saved.id && saved.nickname) return saved
    // Early test saves kept a name and email. Keep the name as the nickname and drop the email.
    const player = { id: crypto.randomUUID(), nickname: String(saved.name ?? '').slice(0, 20) }
    localStorage.setItem(playerKey, JSON.stringify(player))
    return player
  } catch {
    return null
  }
}

// Four easy-to-read characters, for example K7Q2. Staff match it against the leaderboard to hand out prizes.
const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const playerCode = (id: string) => {
  const value = parseInt(id.replace(/-/g, '').slice(0, 5), 16)
  return Array.from({ length: 4 }, (_, index) => codeAlphabet[(value >> (index * 5)) & 31]).join('')
}

// Nicknames show on a shared leaderboard, so keep them short and not an email address or link.
export const nicknameProblem = (nickname: string) => {
  const value = nickname.trim()
  if (value.length < 2) return 'Pick a nickname with at least 2 characters.'
  if (value.length > 20) return 'Keep your nickname to 20 characters or fewer.'
  if (/@|https?:|www\.|\.com/i.test(value)) return 'Use a nickname, not an email address or link.'
  return ''
}

// Best challenge points per booth. Older saves only kept booth ids, so they count as a base completion.
export const readResults = (): Record<string, number> => {
  try {
    const results = JSON.parse(localStorage.getItem('techx26-results') ?? '{}')
    for (const id of JSON.parse(localStorage.getItem('techx26-challenges') ?? '[]')) results[id] ??= challengeBase
    return results
  } catch {
    return {}
  }
}

// When each booth's best challenge score was set, so organisers can check how a winner's score built up.
export const resultTimesKey = 'techx26-result-times'
export const readResultTimes = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(resultTimesKey) ?? '{}')
  } catch {
    return {}
  }
}
export const recordResultTime = (id: string) => {
  localStorage.setItem(resultTimesKey, JSON.stringify({ ...readResultTimes(), [id]: Date.now() }))
}

// Live leaderboard rows arrive with their points already worked out.
export type Entry = { name: string; code?: string; points?: number; you?: boolean; visited: string[]; results: Record<string, number>; secrets?: string[] }
export const boothScore = (entry: Entry, id: string) => (entry.visited.includes(id) ? stampPoints : 0) + (entry.results[id] ?? 0)
export const totalScore = (entry: Entry) => entry.visited.length * stampPoints + (entry.secrets?.length ?? 0) * secretPoints + Object.values(entry.results).reduce((sum, points) => sum + points, 0)

// Clearly labelled sample players so the leaderboard can be demonstrated before the event server exists.
const demoNames = ['Ava', 'Noah', 'Mia', 'Leo', 'Isla', 'Oliver', 'Zara', 'Ethan', 'Chloe', 'Arjun', 'Grace', 'Lucas', 'Priya', 'Mason', 'Sofia', 'Kai', 'Ruby', 'Hamish', 'Mei', 'Jack', 'Amelia', 'Liam', 'Nina', 'Theo']
export function demoEntries(): Entry[] {
  let seed = 26
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return demoNames.map((name, index) => {
    const share = 0.15 + random() * 0.75
    const visited = exhibits.filter(() => random() < share).map((exhibit) => exhibit.id)
    const results = Object.fromEntries(visited.filter(() => random() < 0.7).map((id) => [id, challengePoints(random())]))
    return { name: `${name} ${String.fromCharCode(65 + ((index * 7) % 26))}.`, visited, results, secrets: secrets.filter(() => random() < 0.3).map((secret) => secret.id) }
  })
}
