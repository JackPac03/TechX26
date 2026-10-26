import { useId, useRef, type CSSProperties, type Ref } from 'react'
import { Download } from 'lucide-react'
import { explorerTypes, type ExplorerType } from './explorerTypes'
import './ExplorerSticker.css'

// A round die-cut sticker. It's all SVG with inline styling, so it stays crisp at any size and exports on its own.
export function ExplorerSticker({ type, className = '' }: { type: ExplorerType; className?: string }) {
  const id = useId()
  const [from, to] = type.colours
  const { Icon } = type
  return (
    <svg className={`explorer-sticker ${className}`} viewBox="0 0 240 240" role="img" aria-label={`${type.label} sticker`}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient>
        <radialGradient id={`${id}-shine`} cx=".3" cy=".22" r=".7"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <path id={`${id}-arc`} d="M30 120a90 90 0 0 1 180 0" />
      </defs>
      <circle cx="120" cy="120" r="119" fill="#fff" />
      <circle cx="120" cy="120" r="108" fill={`url(#${id}-bg)`} />
      <circle cx="120" cy="120" r="108" fill={`url(#${id}-shine)`} />
      <circle cx="120" cy="120" r="97" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.5" strokeDasharray="1 6" strokeLinecap="round" />
      <text fill="#fff" fillOpacity=".9" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" letterSpacing="4"><textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">TECHx26 · EXPLORER</textPath></text>
      <path d="M58 92l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM184 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff" fillOpacity=".75" />
      <Icon x={82} y={56} size={76} color={type.ink ?? '#fff'} strokeWidth={1.6} />
      <path d="M14 146h212l-11 15 11 15H14l11-15z" fill="#fff" />
      <text x="120" y="167" textAnchor="middle" fill={to} fontFamily="Manrope, sans-serif" fontWeight="700" fontSize={type.short.length > 12 ? 16 : 19} letterSpacing="1.5">{type.short.toUpperCase()}</text>
      <text x="120" y="194" textAnchor="middle" fill="#fff" fillOpacity=".85" fontFamily="'DM Mono', monospace" fontWeight="500" fontSize="7.5" letterSpacing="1.6">MUSEUM OF TECHNOLOGY</text>
    </svg>
  )
}

const statLabels = ['Curiosity', 'Chattiness', 'Pace']

// A trading card for each explorer type, with the sticker as its artwork.
export function ExplorerCard({ type, ref }: { type: ExplorerType; ref?: Ref<HTMLDivElement> }) {
  const number = String(explorerTypes.indexOf(type) + 1).padStart(2, '0')
  const partner = explorerTypes.find((item) => item.id === type.teamUp)!
  return (
    <div ref={ref} className="explorer-card" style={{ '--from': type.colours[0], '--to': type.colours[1] } as CSSProperties}>
      <div className="explorer-card-top"><span className="brand-mark">TECH<span>x</span>26</span><small>Explorer card<br />No. {number} / {explorerTypes.length}</small></div>
      <ExplorerSticker type={type} />
      <h3>{type.label}</h3>
      <p className="explorer-card-tagline">{type.tagline}</p>
      <dl className="explorer-card-stats">
        {statLabels.map((label, index) => (
          <div key={label}><dt>{label}</dt><dd aria-label={`${type.stats[index]} out of 5`}>{[0, 1, 2, 3, 4].map((dot) => <i key={dot} className={dot < type.stats[index] ? 'on' : undefined} />)}</dd></div>
        ))}
      </dl>
      <p className="explorer-card-fact"><small>Superpower</small>{type.superpower}</p>
      <p className="explorer-card-fact"><small>Team up with</small>{partner.label}</p>
      <p className="explorer-card-foot">Museum of Technology · 27 Nov 2026</p>
    </div>
  )
}

// Every sticker and card, with print-ready downloads for the organisers.
export function ExplorerPrintKit() {
  const cards = useRef(new Map<string, HTMLDivElement>())
  const download = async (type: ExplorerType, part: 'sticker' | 'card') => {
    const card = cards.current.get(type.id)
    const node = part === 'card' ? card : card?.querySelector<SVGSVGElement>('.explorer-sticker')
    if (!node) return
    const { toPng } = await import('html-to-image')
    const link = document.createElement('a')
    link.download = `techx26-${type.id}-${part}.png`
    // About 2000px across, enough for a 60mm sticker or a standard trading card at print quality.
    link.href = await toPng(node as HTMLElement, { pixelRatio: part === 'card' ? 7 : 12, style: { filter: 'none', margin: '0' } })
    link.click()
  }
  return (
    <div className="explorer-print-kit">
      {explorerTypes.map((type) => (
        <figure key={type.id}>
          <ExplorerCard type={type} ref={(node) => { if (node) cards.current.set(type.id, node) }} />
          <figcaption>
            <button onClick={() => download(type, 'sticker')}><Download size={14} /> Sticker PNG</button>
            <button onClick={() => download(type, 'card')}><Download size={14} /> Card PNG</button>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
