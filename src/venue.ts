import { Armchair, Coffee, Info, type LucideIcon } from 'lucide-react'
import { exhibits, type Area, type Exhibit } from './data'

export type Box = { x: number; y: number; w: number; h: number }
export type Spot = Box & { id: string; vertical?: boolean }
export type Place = Box & { name: string; zone?: boolean; outline?: string; labelAt?: [number, number] }
export type Landmark = { x: number; y: number; icon: LucideIcon; label?: string; side?: 'left' | 'right' }
export type Floor = { area: Area; x: number; y: number; slab: string; walls: string[]; thick: string[]; booths: Spot[]; places: Place[]; landmarks: Landmark[] }

// Both areas are on one level. Each uses the original 1,114px-high plan's image
// coordinates; only the offsets join Front's top-right corridor to Back's bottom-left opening.
export const front: Floor = {
  area: 'Kogarah Front',
  x: 0,
  y: 1012,
  slab: '120,306 120,214 222,110 533,110 533,86 656,86 656,457 720,457 740,495 740,856 718,856 718,885 583,885 583,957 554,957 554,1027 613,1027 637,1050 637,1090 23,1090 23,873 66,836 66,365',
  walls: [
    '105,321 120,306 120,214 222,110 533,110 533,86',
    '455,110 455,233 538,233',
    '171,321 105,321 66,365 66,452 171,452',
    '171,486 68,486 68,592 171,592',
    '171,625 68,625 68,718 171,718',
    '718,856 718,885 583,885 583,957 554,957 554,1038 304,1038 304,1059',
    '554,1027 613,1027 637,1050 637,1059',
    '23,873 171,873 171,1059',
    '87,1059 114,1033 163,1033',
  ],
  thick: ['141,205 214,130', '455,110 533,110', '656,86 656,457 708,457', '68,718 68,835', '250,273 540,273', '383,607 471,607'],
  booths: [
    { id: 'engineering-collaboration-tools', x: 219, y: 157, w: 204, h: 26 },
    { id: 'sns', x: 471, y: 155, w: 104, h: 28 },
    { id: 'digital-strategy', x: 262, y: 282, w: 125, h: 32 },
    { id: 'technology-strategy', x: 262, y: 324, w: 125, h: 32 },
    { id: 'emerging-technology', x: 405, y: 282, w: 120, h: 44 },
    { id: 'book-a-banker', x: 205, y: 300, w: 36, h: 72, vertical: true },
    { id: 'loan-builder', x: 205, y: 382, w: 36, h: 72, vertical: true },
    { id: 'merchant-banking', x: 205, y: 464, w: 90, h: 38 },
    { id: 'ecm-customer', x: 465, y: 452, w: 110, h: 40 },
    { id: 'cloud-contact-centres', x: 82, y: 352, w: 80, h: 60 },
    { id: 'everyday-banking', x: 82, y: 508, w: 80, h: 58 },
    { id: 'westpac-one', x: 82, y: 646, w: 80, h: 58 },
    { id: 'ecm-perform', x: 465, y: 566, w: 110, h: 32 },
    { id: 'cyber', x: 365, y: 622, w: 195, h: 105 },
    { id: 'asset-management', x: 582, y: 610, w: 32, h: 84, vertical: true },
    { id: 'bcm', x: 582, y: 702, w: 32, h: 62, vertical: true },
    { id: 'cyber-mate', x: 582, y: 772, w: 32, h: 72, vertical: true },
    { id: 'testing', x: 582, y: 850, w: 128, h: 30 },
    { id: 'employee-benefits', x: 340, y: 906, w: 138, h: 46 },
    { id: 'ethan-indigenous', x: 352, y: 986, w: 96, h: 38 },
    { id: 'tour-de-cure', x: 456, y: 986, w: 96, h: 38 },
    { id: 'family-feud', x: 28, y: 958, w: 128, h: 58 },
  ],
  places: [
    { name: 'Tech Bar & Laptop Hotel', x: 141, y: 110, w: 314, h: 97, zone: true, outline: 'M141 205 222 110 H455 V207Z', labelAt: [250, 131] },
    { name: 'Auditorium', x: 23, y: 873, w: 148, h: 186, zone: true, labelAt: [26, 859] },
    { name: 'Showbag Pick-Up Area', x: 28, y: 892, w: 128, h: 52 },
    { name: 'EAG', x: 488, y: 906, w: 76, h: 46 },
  ],
  landmarks: [
    { x: 132, y: 786, icon: Info, label: 'Concierge desk', side: 'right' },
  ],
}

export const back: Floor = {
  area: 'Kogarah Back',
  x: 400,
  y: 0,
  slab: '52,72 611,72 611,382 801,620 835,620 835,920 669,955 633,1073 255,1073 255,1098 117,1098 117,1074 205,1074 205,608 123,608 123,638 40,638 40,549 46,549 46,438 40,438 40,400 52,400',
  walls: [
    '117,1098 117,1074 205,1074 205,608 123,608 123,638 40,638',
    '40,549 46,549 46,438 40,438',
    '40,400 52,400 52,72',
    '40,72 611,72 611,382 678,474',
    '710,523 728,546',
    '801,871 801,920 835,920',
    '255,1098 255,1073 633,1073',
    '253,140 253,128 349,128',
    '376,128 432,128 432,286 253,286 253,267',
    '253,177 253,203',
    '253,231 253,245',
    '253,178 330,178',
    '253,231 330,231',
    '330,128 330,286',
    '461,201 461,286 574,286 574,201',
    '515,128 515,201',
    '253,369 253,331 432,331 432,572 253,572 253,492',
    '253,402 253,460',
    '345,331 345,431',
    '253,431 432,431',
    '253,608 432,608 432,647',
    '432,675 432,848 253,848 253,608',
    '253,728 432,728',
    '345,728 345,848',
    '538,608 605,608',
    '538,608 538,777 466,777',
    '538,777 605,777',
    '466,854 605,854',
    '538,777 538,854',
  ],
  thick: ['652,608 652,704 692,704', '652,724 652,791 691,791', '652,815 652,885 692,885'],
  booths: [
    { id: 'udemy', x: 88, y: 150, w: 115, h: 50 },
    { id: 'linkedin-learning', x: 88, y: 278, w: 115, h: 50 },
    { id: 'motivate-plus', x: 88, y: 440, w: 115, h: 36 },
    { id: 'people-tools', x: 88, y: 496, w: 115, h: 38 },
    { id: 'head-shot-photo-booth', x: 342, y: 170, w: 80, h: 56 },
    { id: 'emerging-talent', x: 462, y: 170, w: 112, h: 46 },
    { id: 'service-operations', x: 280, y: 486, w: 110, h: 46 },
    { id: 'women-in-technology', x: 285, y: 646, w: 112, h: 42 },
    { id: 'dei-rising-women', x: 474, y: 640, w: 54, h: 104, vertical: true },
    { id: 'snowflake-adapt', x: 550, y: 632, w: 42, h: 118, vertical: true },
    { id: 'ai-sdlc', x: 545, y: 798, w: 56, h: 32 },
    { id: 'github', x: 262, y: 886, w: 74, h: 30 },
    { id: 'jira-confluence', x: 362, y: 886, w: 160, h: 30 },
    { id: 'wdlc', x: 540, y: 886, w: 90, h: 30 },
    { id: 'engineering-practice', x: 668, y: 470, w: 84, h: 48 },
    { id: 'architecture-practice', x: 704, y: 538, w: 84, h: 48 },
    { id: 'design-practice', x: 744, y: 604, w: 84, h: 48 },
    { id: 'data-ai-practice', x: 744, y: 672, w: 84, h: 48 },
    { id: 'product-ownership-practice', x: 744, y: 740, w: 84, h: 48 },
    { id: 'delivery-practice', x: 744, y: 808, w: 84, h: 48 },
  ],
  places: [
    { name: 'Kitchen', x: 437, y: 328, w: 118, h: 263, zone: true, outline: 'M440 328 H553 V384 L550 437 555 482 553 588 514 586 476 592 439 588 436 504 439 440 437 386Z', labelAt: [453, 354] },
    { name: 'Practices', x: 636, y: 459, w: 188, h: 426, zone: true, outline: 'M666 459 790 460 Q824 460 824 495 V841 Q824 881 790 881 L679 885 Q636 885 636 851 V551 L638 495 Q638 459 666 459Z', labelAt: [691, 451] },
    { name: 'Engineering tools', x: 253, y: 862, w: 380, h: 58, zone: true, labelAt: [374, 878] },
    { name: 'People 1:1', x: 269, y: 136, w: 52, h: 42 },
    { name: 'People 1:1', x: 269, y: 186, w: 52, h: 42 },
    { name: 'People 1:1', x: 269, y: 241, w: 52, h: 42 },
    { name: 'People 1:1', x: 269, y: 358, w: 52, h: 42 },
  ],
  landmarks: [
    { x: 496, y: 470, icon: Coffee },
    { x: 420, y: 1000, icon: Armchair, label: 'Benches', side: 'right' },
  ],
}

export const floors = [front, back]
export const viewBox = { x: 0, y: 20, w: 1260, h: 2110 }
// Front's top-right corridor (between SNS and the right-hand wall) opens into
// Back's bottom-left strip. Map coordinates.
export const link = {
  walls: ['517,1098 533,1098'],
}

export const spotFor = (id: string) => {
  for (const floor of floors) {
    const spot = floor.booths.find((item) => item.id === id)
    if (spot) return { floor, spot }
  }
}

// Walkways through the aisles, in map coordinates. Booth ids are their stop points:
// a spot in the aisle just outside each booth, so routes never cross booth names.
const nodes: Record<string, [number, number]> = {
  // Kogarah Back
  'b-top': [629, 100], 'b-top-photo': [762, 100], 'b-top-talent': [966, 100],
  'head-shot-photo-booth': [762, 140], 'emerging-talent': [966, 152],
  udemy: [629, 175], 'linkedin-learning': [629, 303], 'motivate-plus': [629, 452], 'b-service': [629, 470], 'people-tools': [629, 515],
  'service-operations': [664, 470],
  'b-mid': [629, 600], 'b-low': [629, 862], 'b-bottom': [629, 1085],
  'b-wit': [850, 600], 'women-in-technology': [850, 661], 'b-dei': [901, 600], 'dei-rising-women': [901, 620], 'b-east': [1022, 600],
  'snowflake-adapt': [1022, 690], 'ai-sdlc': [1022, 814], wdlc: [1022, 862],
  github: [700, 862], 'jira-confluence': [905, 862],
  'engineering-practice': [1048, 494], 'architecture-practice': [1086, 560], 'b-practices': [1118, 600],
  'design-practice': [1118, 628], 'data-ai-practice': [1118, 696], 'product-ownership-practice': [1118, 764], 'delivery-practice': [1118, 832],
  // Kogarah Front
  'f-top': [642, 1110], sns: [642, 1181], 'f-aisle-east': [642, 1262],
  'ecm-customer': [642, 1484], 'f-cross-east': [642, 1545], 'ecm-perform': [642, 1594],
  'asset-management': [642, 1664], bcm: [642, 1745], 'cyber-mate': [642, 1820], testing: [684, 1846],
  'f-aisle-tech': [552, 1262], 'emerging-technology': [552, 1314],
  'f-aisle-tools': [321, 1262], 'engineering-collaboration-tools': [321, 1210],
  'f-aisle-strategy': [250, 1262], 'digital-strategy': [250, 1316], 'technology-strategy': [250, 1360],
  'f-aisle-west': [188, 1262], 'book-a-banker': [188, 1340], 'cloud-contact-centres': [188, 1374], 'loan-builder': [188, 1436],
  'merchant-banking': [188, 1495], 'everyday-banking': [188, 1545], 'westpac-one': [188, 1687],
  'f-cross-mid': [322, 1545], 'f-cyber': [322, 1770], cyber: [462, 1770],
  'employee-benefits': [322, 1941], 'f-row': [322, 1981], 'ethan-indigenous': [400, 1981], 'tour-de-cure': [504, 1981], 'family-feud': [190, 1999],
}
// Each chain is a walkable line through the nodes in order.
const chains = [
  ['b-top', 'udemy', 'linkedin-learning', 'motivate-plus', 'b-service', 'people-tools', 'b-mid', 'b-low', 'b-bottom', 'f-top', 'sns', 'f-aisle-east', 'ecm-customer', 'f-cross-east', 'ecm-perform', 'asset-management', 'bcm', 'cyber-mate', 'testing'],
  ['b-top', 'b-top-photo', 'b-top-talent', 'emerging-talent'], ['b-top-photo', 'head-shot-photo-booth'], ['b-service', 'service-operations'],
  ['b-mid', 'b-wit', 'b-dei', 'b-east', 'snowflake-adapt', 'ai-sdlc', 'wdlc'], ['b-wit', 'women-in-technology'], ['b-dei', 'dei-rising-women'],
  ['b-low', 'github', 'jira-confluence', 'wdlc'],
  ['b-east', 'engineering-practice', 'architecture-practice', 'b-practices'], ['b-east', 'architecture-practice'], ['b-east', 'b-practices', 'design-practice', 'data-ai-practice', 'product-ownership-practice', 'delivery-practice'],
  ['f-aisle-east', 'f-aisle-tech', 'f-aisle-tools', 'f-aisle-strategy', 'f-aisle-west', 'book-a-banker', 'cloud-contact-centres', 'loan-builder', 'merchant-banking', 'everyday-banking', 'westpac-one'],
  ['f-aisle-tech', 'emerging-technology'], ['f-aisle-tools', 'engineering-collaboration-tools'], ['f-aisle-strategy', 'digital-strategy', 'technology-strategy'],
  ['everyday-banking', 'f-cross-mid', 'f-cross-east'], ['f-cross-mid', 'f-cyber', 'employee-benefits', 'f-row', 'ethan-indigenous', 'tour-de-cure'], ['f-cyber', 'cyber'], ['f-row', 'family-feud'],
]
const edges = new Map<string, [string, number][]>()
for (const chain of chains) chain.slice(1).forEach((to, index) => {
  const from = chain[index]
  const length = Math.hypot(nodes[from][0] - nodes[to][0], nodes[from][1] - nodes[to][1])
  edges.set(from, [...edges.get(from) ?? [], [to, length]])
  edges.set(to, [...edges.get(to) ?? [], [from, length]])
})

// Shortest walking distances from one node to every other (Dijkstra; the graph is tiny).
function walkFrom(start: string) {
  const distance = new Map([[start, 0]])
  const previous = new Map<string, string>()
  const open = new Set([start])
  while (open.size) {
    const here = [...open].reduce((a, b) => distance.get(a)! <= distance.get(b)! ? a : b)
    open.delete(here)
    for (const [next, length] of edges.get(here)!) {
      const total = distance.get(here)! + length
      if (total < (distance.get(next) ?? Infinity)) { distance.set(next, total); previous.set(next, here); open.add(next) }
    }
  }
  return { distance, previous }
}

// Nearest booth the visitor hasn't stamped yet, by walking distance.
export function nextStop(fromId: string, visited: string[]) {
  const { distance } = walkFrom(fromId)
  let best: { exhibit: Exhibit; distance: number } | undefined
  for (const exhibit of exhibits) {
    if (exhibit.id === fromId || visited.includes(exhibit.id)) continue
    const walk = distance.get(exhibit.id)!
    if (!best || walk < best.distance) best = { exhibit, distance: walk }
  }
  return best
}

// Walking distance in map units along a list of stops, starting from the main entrance.
export const entrance = 'f-row'
export const walkLength = (ids: string[]) => ids.reduce((sum, id, index) => sum + (index ? walkFrom(ids[index - 1]).distance.get(id)! : 0), 0)

// Where a booth's stop marker sits on the walkway.
export const stopPoint = (id: string) => ({ x: nodes[id][0], y: nodes[id][1] })

// Smooth SVG path that walks the aisles from stop to stop.
export function routePath(ids: string[]) {
  const points: [number, number][] = [nodes[ids[0]]]
  ids.slice(1).forEach((id, index) => {
    const { previous } = walkFrom(ids[index])
    const leg: [number, number][] = []
    for (let node: string | undefined = id; node && node !== ids[index]; node = previous.get(node)) leg.unshift(nodes[node])
    points.push(...leg)
  })
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let index = 1; index < points.length - 1; index++) {
    const [px, py] = points[index - 1]
    const [x, y] = points[index]
    const [nx, ny] = points[index + 1]
    const inLength = Math.hypot(x - px, y - py)
    const outLength = Math.hypot(nx - x, ny - y)
    const turn = ((x - px) * (nx - x) + (y - py) * (ny - y)) / (inLength * outLength)
    // Round corners; doubling back to a booth just outside the aisle stays a sharp turn.
    if (turn < -0.7 || turn > 0.999) { d += ` L${x} ${y}`; continue }
    const radius = Math.min(36, inLength / 2, outLength / 2)
    d += ` L${x - (x - px) / inLength * radius} ${y - (y - py) / inLength * radius} Q${x} ${y} ${x + (nx - x) / outLength * radius} ${y + (ny - y) / outLength * radius}`
  }
  const last = points[points.length - 1]
  return `${d} L${last[0]} ${last[1]}`
}
