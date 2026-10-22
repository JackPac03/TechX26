import { exhibits } from './data'
import { secrets } from './secrets'

// Points: every stamp is worth 10 and every hidden exhibit 25. A completed challenge is worth 50, plus up to 50 for how well you did.
export const stampPoints = 10
export const secretPoints = 25
export const challengeBase = 50
export const challengeBonus = 50
export const challengePoints = (performance: number) => challengeBase + Math.round(challengeBonus * Math.min(1, Math.max(0, performance)))

export type Player = { name: string; email: string }
export const readPlayer = (): Player | null => {
  try {
    return JSON.parse(localStorage.getItem('techx26-player') ?? 'null')
  } catch {
    return null
  }
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

export type Entry = { name: string; you?: boolean; visited: string[]; results: Record<string, number>; secrets?: string[] }
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
