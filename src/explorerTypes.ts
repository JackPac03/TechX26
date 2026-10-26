import { BookOpen, Binary, ConciergeBell, Gem, Handshake, Hourglass, Map as MapIcon, MoonStar, Sprout, Vault, Wrench, Zap, type LucideIcon } from 'lucide-react'

export type ExplorerType = {
  id: string
  label: string
  // The name printed on the sticker's ribbon.
  short: string
  tagline: string
  superpower: string
  // Every type has a partner type, and the pairing goes both ways.
  teamUp: string
  tour: string
  colours: [string, string]
  // Icon colour on the sticker, for backgrounds where white is hard to see.
  ink?: string
  Icon: LucideIcon
  // Curiosity, chattiness and pace, out of 5, for the trading card.
  stats: [number, number, number]
}

export const explorerTypes: ExplorerType[] = [
  { id: 'time-traveller', label: 'The Time Traveller', short: 'Time Traveller', tagline: 'You skip the past and head straight for tomorrow.', superpower: 'Spotting the next big thing before it has a name.', teamUp: 'cartographer', tour: 'ai-edit', colours: ['#ef1721', '#ff7a3d'], Icon: Hourglass, stats: [5, 3, 3] },
  { id: 'tinkerer', label: 'The Tinkerer', short: 'Tinkerer', tagline: 'You read the plaque, then ask how the exhibit was built.', superpower: 'Taking things apart and putting them back better.', teamUp: 'codebreaker', tour: 'under-the-hood', colours: ['#9b3cf0', '#4f2bd6'], Icon: Wrench, stats: [4, 2, 3] },
  { id: 'concierge', label: 'The Concierge', short: 'Concierge', tagline: 'You see every exhibit through a customer’s eyes.', superpower: 'Knowing what people need before they ask.', teamUp: 'connector', tour: 'front-of-house', colours: ['#ff7a3d', '#e2560f'], Icon: ConciergeBell, stats: [3, 5, 3] },
  { id: 'vault-keeper', label: 'The Vault Keeper', short: 'Vault Keeper', tagline: 'You notice the alarms before the artwork.', superpower: 'Finding the weak spot, then fixing it.', teamUp: 'night-owl', tour: 'safe-and-sound', colours: ['#d4147a', '#7a0e52'], Icon: Vault, stats: [3, 2, 4] },
  { id: 'apprentice', label: 'The Apprentice Adventurer', short: 'Adventurer', tagline: 'Every gallery is a chance to level up.', superpower: 'Learning something new at every single stop.', teamUp: 'storyteller', tour: 'grow-your-career', colours: ['#4f7cff', '#1f9bd8'], Icon: Sprout, stats: [5, 4, 3] },
  { id: 'storyteller', label: 'The Storyteller', short: 'Storyteller', tagline: 'You come for the people behind the exhibits.', superpower: 'Turning a booth visit into a story worth retelling.', teamUp: 'apprentice', tour: 'heart-of-westpac', colours: ['#1fbfa6', '#0c7f70'], Icon: BookOpen, stats: [3, 5, 2] },
  { id: 'speed-sightseer', label: 'The Speed Sightseer', short: 'Speed Sightseer', tagline: 'Highlights in, jargon out, back before your coffee cools.', superpower: 'Seeing the best of everything in 20 minutes flat.', teamUp: 'treasure-hunter', tour: 'first-look', colours: ['#b31789', '#ef1721'], Icon: Zap, stats: [2, 3, 5] },
  { id: 'codebreaker', label: 'The Codebreaker', short: 'Codebreaker', tagline: 'Every locked door is a puzzle you haven’t solved yet.', superpower: 'Cracking the challenge at every booth.', teamUp: 'tinkerer', tour: 'safe-and-sound', colours: ['#3a3fd8', '#141a63'], Icon: Binary, stats: [5, 1, 4] },
  { id: 'cartographer', label: 'The Cartographer', short: 'Cartographer', tagline: 'You map the whole museum before you take a single step.', superpower: 'Seeing how all the pieces fit together.', teamUp: 'time-traveller', tour: 'ai-edit', colours: ['#2bb673', '#12795a'], Icon: MapIcon, stats: [4, 2, 2] },
  { id: 'connector', label: 'The Connector', short: 'Connector', tagline: 'You leave every gallery with three new friends.', superpower: 'Introducing the right people at the right time.', teamUp: 'concierge', tour: 'grow-your-career', colours: ['#ff4d8d', '#c31672'], Icon: Handshake, stats: [3, 5, 3] },
  { id: 'treasure-hunter', label: 'The Treasure Hunter', short: 'Treasure Hunter', tagline: 'You won’t leave until every stamp is in the passport.', superpower: 'Finding the one thing everyone else walked past.', teamUp: 'speed-sightseer', tour: 'front-of-house', colours: ['#ffd166', '#ef8a17'], ink: '#5c2a00', Icon: Gem, stats: [4, 3, 4] },
  { id: 'night-owl', label: 'The Night Owl', short: 'Night Owl', tagline: 'You stay until closing and find what everyone else missed.', superpower: 'Seeing in the dark. Try turning the lights off.', teamUp: 'vault-keeper', tour: 'under-the-hood', colours: ['#3b2380', '#0d0820'], ink: '#c6ff7a', Icon: MoonStar, stats: [5, 1, 3] },
]

type Option = { label: string; detail: string; points: Record<string, number>; rulesOut?: string[] }
// Each answer mainly points to one type (2 points), and a few also suit a second type (1 point).
// rulesOut removes types an answer contradicts, so staying until closing can never make you a Speed Sightseer.
export const explorerQuestions: { prompt: string; options: Option[] }[] = [
  {
    prompt: 'Which gallery do you wander into first?',
    options: [
      { label: 'The future wing', detail: 'Robots, quantum and whatever comes next', points: { 'time-traveller': 2, cartographer: 1 } },
      { label: 'The workshop', detail: 'I want to see how it’s built', points: { tinkerer: 2, codebreaker: 1 } },
      { label: 'The shopfront', detail: 'What our customers actually see and use', points: { concierge: 2 } },
      { label: 'The vault', detail: 'Locks, alarms and keeping things running', points: { 'vault-keeper': 2, codebreaker: 1 } },
      { label: 'The study hall', detail: 'New skills and my next career move', points: { apprentice: 2 } },
      { label: 'The people’s gallery', detail: 'Stories, communities and causes', points: { storyteller: 2, connector: 1 } },
    ],
  },
  {
    prompt: 'You find a door marked STAFF ONLY. You…',
    options: [
      { label: 'Try the handle', detail: 'It’s probably a puzzle. I like puzzles.', points: { codebreaker: 2 } },
      { label: 'Knock and make a friend', detail: 'Whoever answers is about to get a chat', points: { connector: 2 } },
      { label: 'Check the map', detail: 'What’s behind it, and where does it lead?', points: { cartographer: 2 } },
      { label: 'Come back after hours', detail: 'Quietly. With a torch.', points: { 'night-owl': 2, 'treasure-hunter': 1 }, rulesOut: ['speed-sightseer'] },
      { label: 'Keep walking', detail: 'So many doors, so little time', points: { 'speed-sightseer': 2 }, rulesOut: ['night-owl'] },
    ],
  },
  {
    prompt: 'Pick your explorer style.',
    options: [
      { label: 'Skim the highlights', detail: 'Best bits only, no jargon please', points: { 'speed-sightseer': 2 }, rulesOut: ['night-owl', 'treasure-hunter'] },
      { label: 'Chat with the guides', detail: 'I’ll ask the hosts a hundred questions', points: { apprentice: 2, connector: 1 } },
      { label: 'Open the display case', detail: 'Give me the technical detail', points: { tinkerer: 2, 'time-traveller': 1 } },
      { label: 'Plan the perfect route', detail: 'Every stop, in walking order', points: { cartographer: 2 } },
      { label: 'Collect every stamp', detail: 'The passport isn’t going to fill itself', points: { 'treasure-hunter': 2 }, rulesOut: ['speed-sightseer'] },
    ],
  },
  {
    prompt: 'What’s in your backpack?',
    options: [
      { label: 'A notebook full of questions', detail: 'For the people behind every booth', points: { storyteller: 2, apprentice: 1 } },
      { label: 'A multitool', detail: 'You never know what needs fixing', points: { tinkerer: 2 } },
      { label: 'A torch, obviously', detail: 'The good stuff is in the shadows', points: { 'night-owl': 2 } },
      { label: 'A map with my route highlighted', detail: 'Colour-coded, naturally', points: { cartographer: 2 } },
      { label: 'A stack of business cards', detail: 'And a LinkedIn QR, just in case', points: { connector: 2, concierge: 1 } },
      { label: 'An empty bag for souvenirs', detail: 'It won’t be empty for long', points: { 'treasure-hunter': 2 } },
    ],
  },
  {
    prompt: 'The gift shop is calling. You buy…',
    options: [
      { label: 'A puzzle box', detail: 'Solved before I reach the till', points: { codebreaker: 2 } },
      { label: 'A snow globe of the city in 2050', detail: 'Flying cars included', points: { 'time-traveller': 2 } },
      { label: 'A tote bag for a good cause', detail: 'It comes with a great story', points: { storyteller: 2 } },
      { label: 'A gift for someone back at my desk', detail: 'They’d love this place', points: { concierge: 2 } },
      { label: 'A very sturdy padlock', detail: 'For my other souvenirs', points: { 'vault-keeper': 2 } },
      { label: 'Nothing. I’m at the coffee cart.', detail: 'Already ordered, actually', points: { 'speed-sightseer': 2 }, rulesOut: ['treasure-hunter'] },
    ],
  },
  {
    prompt: 'How long is your expedition?',
    options: [
      { label: 'A quick 20-minute loop', detail: 'I’ve got a meeting soon', points: { 'speed-sightseer': 1 }, rulesOut: ['night-owl', 'treasure-hunter'] },
      { label: 'About half an hour', detail: 'Time for a proper look', points: {} },
      { label: 'Until they turn the lights off', detail: 'Pack my snacks, I’m here a while', points: { 'night-owl': 2, 'treasure-hunter': 1 }, rulesOut: ['speed-sightseer'] },
    ],
  },
]

// Add up every answer's points among the types no answer ruled out. Ties go to the type more of
// your answers pointed to, then to the type you picked in question one, then to list order.
export function scoreExplorer(answers: number[]): ExplorerType {
  const scores = new Map(explorerTypes.map((type) => [type.id, 0]))
  const picks = new Map(explorerTypes.map((type) => [type.id, 0]))
  const ruledOut = new Set<string>()
  answers.forEach((answer, index) => {
    const option = explorerQuestions[index].options[answer]
    for (const [id, points] of Object.entries(option.points)) {
      scores.set(id, scores.get(id)! + points)
      picks.set(id, picks.get(id)! + 1)
    }
    option.rulesOut?.forEach((id) => ruledOut.add(id))
  })
  const firstPick = Object.keys(explorerQuestions[0].options[answers[0]].points)[0]
  const rank = (id: string) => [scores.get(id)!, picks.get(id)!, id === firstPick ? 1 : 0]
  return explorerTypes.filter((type) => !ruledOut.has(type.id)).reduce((best, type) => {
    const [a, b] = [rank(type.id), rank(best.id)]
    const i = a.findIndex((value, index) => value !== b[index])
    return i >= 0 && a[i] > b[i] ? type : best
  })
}

export const explorerTypeKey = 'techx26-explorer-type'
export const readExplorerType = () => explorerTypes.find((type) => type.id === localStorage.getItem(explorerTypeKey))
