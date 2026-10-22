import { exhibits, wings } from './data'

const titles = [
  { label: 'Curious Visitor', stamps: 0 },
  { label: 'Idea Collector', stamps: 5 },
  { label: 'Museum Insider', stamps: 15 },
]

export function explorerTitle(visited: string[]) {
  const count = exhibits.filter((exhibit) => visited.includes(exhibit.id)).length
  const index = titles.filter((title) => count >= title.stamps).length - 1
  return { ...titles[index], next: titles[index + 1], count }
}

export const mysteryStops = [
  { id: 'cyber-threats-247', clue: 'Every good museum needs a guardian. Find the team keeping the bank safe from digital threats.' },
  { id: 'github', clue: 'Pull requests, shared code and a rather famous octocat. Where do the builders keep their work?' },
  { id: 'tour-de-cure', clue: 'Two wheels. One cause. Find the team riding towards a cure.' },
]

export type MysteryTrail = { started: boolean; step: number }
export const emptyTrail: MysteryTrail = { started: false, step: 0 }
export const trailKey = 'techx26-mystery-trail'

export function readTrail(): MysteryTrail {
  try {
    const value = JSON.parse(localStorage.getItem(trailKey) ?? 'null')
    if (typeof value?.started === 'boolean' && Number.isInteger(value.step) && value.step >= 0 && value.step <= mysteryStops.length) return value
  } catch { /* A fresh trail is ready if an old save cannot be read. */ }
  return emptyTrail
}

export function advanceTrail(trail: MysteryTrail, id: string): MysteryTrail {
  return trail.started && mysteryStops[trail.step]?.id === id ? { ...trail, step: trail.step + 1 } : trail
}

export type ExplorerJourney = { visited: string[]; surprisePicks: string[]; trail: MysteryTrail; secretFound: boolean; xFound: boolean }

export function explorerBadges({ visited, surprisePicks, trail, secretFound, xFound }: ExplorerJourney) {
  return [
    { id: 'chance', title: 'Off the beaten path', hint: 'Let chance choose a stop.', detail: 'Collected a stamp at a Surprise Me pick.', unlocked: surprisePicks.some((id) => visited.includes(id)) },
    { id: 'spectrum', title: 'Across the spectrum', hint: 'A little of every colour.', detail: 'Visited at least one booth in all six wings.', unlocked: wings.every((wing) => exhibits.some((exhibit) => exhibit.wingId === wing.id && visited.includes(exhibit.id))) },
    { id: 'trail', title: 'Trailblazer', hint: 'Three clues. One curious mind.', detail: 'Solved all three stops on the mystery trail.', unlocked: trail.step === mysteryStops.length },
    { id: 'secret', title: 'Curator’s secret', hint: 'Greet the TECHx logo five times.', detail: 'Found the curator’s hidden nook.', unlocked: secretFound },
    { id: 'x', title: 'X marks the spot', hint: 'The exhibit in the foyer loves attention.', detail: 'Sent the floating X into a spin.', unlocked: xFound },
  ]
}
