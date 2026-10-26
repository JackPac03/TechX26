import { Cat, Coffee, Ghost, Glasses, KeyRound, Umbrella } from 'lucide-react'
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

// Things hiding in the dark. Each sits in the top margin of a section:
// x is a fraction of the section's width, y is pixels down from its top.
export const nightFinds = [
  { id: 'ghost', Icon: Ghost, at: '.hero', x: 0.47, y: 150, caption: 'A ghost! The night guard swears it’s friendly.' },
  { id: 'glasses', Icon: Glasses, at: '#schedule', x: 0.9, y: 40, caption: 'Someone squinted at the schedule a bit too hard.' },
  { id: 'umbrella', Icon: Umbrella, at: '#wings', x: 0.08, y: 40, caption: 'An umbrella. It never rains in here, but still.' },
  { id: 'key', Icon: KeyRound, at: '#exhibits', x: 0.9, y: 40, caption: 'A key to the curator’s office? Best hand it in.' },
  { id: 'coffee', Icon: Coffee, at: '#passport', x: 0.92, y: 40, caption: 'Still warm. Someone’s working late.' },
  { id: 'cat', Icon: Cat, at: '#map', x: 0.1, y: 40, caption: 'The museum cat. Please don’t tell facilities.' },
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

export type ExplorerJourney = { visited: string[]; surprisePicks: string[]; trail: MysteryTrail; secretFound: boolean; xFound: boolean; nightFound: boolean; guardFound: boolean; findsDone: boolean }

export function explorerBadges({ visited, surprisePicks, trail, secretFound, xFound, nightFound, guardFound, findsDone }: ExplorerJourney) {
  return [
    { id: 'chance', title: 'Off the beaten path', hint: 'Let chance choose a stop.', detail: 'Collected a stamp at a Surprise Me pick.', unlocked: surprisePicks.some((id) => visited.includes(id)) },
    { id: 'spectrum', title: 'Across the spectrum', hint: 'A little of every colour.', detail: 'Visited at least one booth in all six wings.', unlocked: wings.every((wing) => exhibits.some((exhibit) => exhibit.wingId === wing.id && visited.includes(exhibit.id))) },
    { id: 'trail', title: 'Trailblazer', hint: 'Three clues. One curious mind.', detail: 'Solved all three stops on the mystery trail.', unlocked: trail.step === mysteryStops.length },
    { id: 'secret', title: 'Curator’s secret', hint: 'Greet the TECHx logo five times.', detail: 'Found the curator’s hidden nook.', unlocked: secretFound },
    { id: 'x', title: 'X marks the spot', hint: 'The exhibit in the foyer loves attention.', detail: 'Sent the floating X into a spin.', unlocked: xFound },
    { id: 'night', title: 'After hours', hint: 'Every museum has a light switch somewhere.', detail: 'Explored the museum by torchlight.', unlocked: nightFound },
    { id: 'guard', title: 'Do not touch', hint: 'Some exhibits don’t like being poked.', detail: 'Got a stern word from museum security.', unlocked: guardFound },
    { id: 'finds', title: 'Lost and found', hint: 'Some things only show up in the dark.', detail: 'Found everything hiding after hours.', unlocked: findsDone },
  ]
}
