import { useEffect, useId, useRef } from 'react'
import { ArrowRight, GraduationCap, Hammer, HeartHandshake, LockKeyhole, ShieldCheck, Telescope, Users, type LucideIcon } from 'lucide-react'
import type { Wing } from './data'
import { secretPoints } from './scoring'
import { secrets, type Secret } from './secrets'
import './Collectibles.css'

const wingIcons: Record<string, LucideIcon> = { strategy: Telescope, customer: HeartHandshake, cyber: ShieldCheck, engineering: Hammer, careers: GraduationCap, community: Users }

// A scalloped rosette: 28 points alternating between two radii.
const rosette = Array.from({ length: 56 }, (_, index) => {
  const angle = (index / 56) * Math.PI * 2
  const radius = index % 2 ? 41 : 46
  return `${index ? 'L' : 'M'}${(50 + Math.sin(angle) * radius).toFixed(1)} ${(46 - Math.cos(angle) * radius).toFixed(1)}`
}).join('') + 'Z'
const tails = 'M32 70 22 108l14-7 8 10 6-32zM68 70l10 38-14-7-8 10-6-32z'

// A wing's completion badge. Until it's earned it shows how close you are.
export function WingBadge({ wing, got, total, className = '' }: { wing: Wing; got: number; total: number; className?: string }) {
  const earned = got >= total
  const Icon = wingIcons[wing.id]
  // Colours are set as SVG attributes (not CSS) so the badge also survives PNG export.
  const id = `badge-shine-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const colour = wing.colour
  return (
    <span className={`wing-badge${earned ? ' earned' : ''} ${className}`} style={{ '--accent': colour } as React.CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 100 112">
        <defs>
          <radialGradient id={id} cx="35%" cy="22%" r="75%">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset=".6" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#160c19" stopOpacity=".35" />
          </radialGradient>
        </defs>
        {earned && <g className="wing-badge-tails"><path d={tails} fill={colour} /><path d={tails} fill="#160c19" fillOpacity=".32" /></g>}
        {earned
          ? <><path className="wing-badge-rosette" d={rosette} fill={colour} /><path d={rosette} fill={`url(#${id})`} /></>
          : <path className="wing-badge-rosette" d={rosette} fill={colour} fillOpacity=".12" stroke={colour} strokeOpacity=".45" strokeWidth="1.2" strokeDasharray="3 3" />}
        {earned
          ? <circle className="wing-badge-face" cx="50" cy="46" r="31" fill="#160c19" fillOpacity=".3" stroke="#ffffff" strokeOpacity=".6" strokeWidth="1.4" />
          : <circle className="wing-badge-face" cx="50" cy="46" r="31" fill="none" stroke={colour} strokeOpacity=".22" strokeWidth="1" />}
        {!earned && got > 0 && <circle className="wing-badge-progress" cx="50" cy="46" r="36" fill="none" stroke={colour} strokeWidth="3.2" strokeLinecap="round" pathLength="1" strokeDasharray={`${got / total} 1`} transform="rotate(-90 50 46)" />}
      </svg>
      <Icon className="wing-badge-icon" strokeWidth={1.8} />
    </span>
  )
}

const artMarkup = Object.fromEntries(secrets.map((secret) => [secret.id, secret.art.replace(/<(path|circle|rect|ellipse)/g, '<$1 pathLength="1"')]))
export const SecretArt = ({ id, className = '' }: { id: string; className?: string }) => (
  <svg className={`booth-art secret-art ${className}`} viewBox="0 0 64 64" aria-hidden="true" dangerouslySetInnerHTML={{ __html: artMarkup[id] }} />
)

// The "you found a hidden exhibit" moment: lights up, the artefact rises into its glass case.
export function SecretReveal({ secret, found, isNew, onClose }: { secret: Secret; found: string[]; isNew: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    // Focus the dialog itself so the spotlight moment opens without a focus ring on the button.
    dialog.focus()
    if (isNew) navigator.vibrate?.([30, 80, 30, 80, 120])
    return () => dialog.close()
  }, [isNew])
  return (
    <dialog ref={dialogRef} className="secret-reveal" tabIndex={-1} aria-labelledby="secret-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="secret-beam" aria-hidden="true" />
      <div className="secret-dust" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} style={{ '--x': `${8 + ((index * 37) % 84)}%`, '--t': `${(index * 0.43) % 4}s` } as React.CSSProperties} />)}</div>
      <div className="secret-stage">
        <p className="kicker">{isNew ? `Hidden exhibit · ${found.length} of ${secrets.length} found` : 'Already in your collection'}</p>
        <div className="secret-case" aria-hidden="true">
          <SecretArt id={secret.id} className="draw" />
          <span className="secret-glass" />
          <span className="secret-plinth" />
        </div>
        <h2 id="secret-title">{secret.title}</h2>
        <p className="secret-era">{secret.era}</p>
        <p className="secret-fact">{secret.fact}</p>
        {isNew && <p className="secret-points">+{secretPoints} points</p>}
        <button className="button button-primary" onClick={onClose}>{isNew ? 'Add to my collection' : 'Back to the museum'} <ArrowRight size={17} /></button>
      </div>
    </dialog>
  )
}

// A shelf of hidden exhibits for the passport: found ones on display, the rest with a hint.
export function SecretShelf({ found }: { found: string[] }) {
  return (
    <div className="secret-shelf">
      <div className="secret-shelf-head"><small>Hidden exhibits</small><b>{found.length}/{secrets.length}</b></div>
      <ul>
        {secrets.map((secret) => {
          const have = found.includes(secret.id)
          return (
            <li key={secret.id} className={have ? 'found' : ''} tabIndex={0} aria-label={have ? `${secret.title}, found` : `Undiscovered. Hint: ${secret.hint}`}>
              {have ? <SecretArt id={secret.id} /> : <LockKeyhole />}
              <span className="secret-tip" aria-hidden="true">{have ? secret.title : secret.hint}</span>
            </li>
          )
        })}
      </ul>
      <p>Secret QR codes are hidden around the venue. Each one is worth {secretPoints} points.</p>
    </div>
  )
}
