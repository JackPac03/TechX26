import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { nightFinds } from './explorer'
import './Mischief.css'

// Lights out: the page goes dark and a torch follows your finger, cursor or keyboard focus.
// Things hidden around the page glow when the torch finds them.
export function AfterHours({ found, onFind, onExit }: { found: string[]; onFind: (id: string) => void; onExit: () => void }) {
  const darkRef = useRef<HTMLDivElement>(null)
  const exit = useEffectEvent(onExit)
  // Things found on an earlier visit stay found; ones found now stay mounted to play their exit.
  const [hidden] = useState(() => nightFinds.filter((find) => !found.includes(find.id)))
  const [spots, setSpots] = useState<{ left: number; top: number }[]>([])
  const [latest, setLatest] = useState('')

  // Place each find in page coordinates, and again whenever the page changes size.
  useEffect(() => {
    const place = () => setSpots(hidden.map((find) => {
      const box = document.querySelector(find.at)?.getBoundingClientRect()
      return box ? { left: box.left + scrollX + box.width * find.x, top: box.top + scrollY + find.y } : { left: -999, top: 0 }
    }))
    place()
    const observer = new ResizeObserver(place)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [hidden])

  useEffect(() => {
    const shine = (x: number, y: number) => {
      darkRef.current?.style.setProperty('--tx', `${x}px`)
      darkRef.current?.style.setProperty('--ty', `${y}px`)
    }
    const onPointer = (event: PointerEvent) => shine(event.clientX, event.clientY)
    const onTouch = (event: TouchEvent) => shine(event.touches[0].clientX, event.touches[0].clientY)
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return
      const box = event.target.getBoundingClientRect()
      shine(box.left + box.width / 2, box.top + box.height / 2)
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') exit() }
    addEventListener('pointermove', onPointer, { passive: true })
    addEventListener('pointerdown', onPointer, { passive: true })
    addEventListener('touchmove', onTouch, { passive: true })
    addEventListener('focusin', onFocus)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('pointermove', onPointer)
      removeEventListener('pointerdown', onPointer)
      removeEventListener('touchmove', onTouch)
      removeEventListener('focusin', onFocus)
      removeEventListener('keydown', onKey)
    }
  }, [])

  const allFound = found.length === nightFinds.length
  return (
    <>
      {hidden.map(({ id, Icon }, index) => spots[index] && (
        <button key={id} className={found.includes(id) ? 'night-find found' : 'night-find'} style={spots[index]} aria-label="Something glowing in the dark" disabled={found.includes(id)} onClick={() => { setLatest(id); onFind(id) }}>
          <Icon size={26} strokeWidth={1.75} />
        </button>
      ))}
      <div ref={darkRef} className="after-hours" aria-hidden="true" />
      <div className="after-hours-bar" role="status">
        <span>{allFound && latest ? 'That’s everything. The night shift salutes you.' : latest ? nightFinds.find((find) => find.id === latest)!.caption : allFound ? <><b>After hours.</b> You found everything here.</> : <><b>After hours.</b> {nightFinds.length} things are hiding in the dark.</>}</span>
        <em>{found.length}/{nightFinds.length}</em>
        <button onClick={onExit}><Lightbulb size={15} /> Lights on</button>
      </div>
    </>
  )
}

const guardLines = ['Ahem. Please don’t touch the exhibits.', 'Step away from the exhibit, please.', 'That exhibit is priceless. Hands off!']

// Museum security pops in when someone keeps poking the foyer exhibit.
export function GuardNotice({ visit, onClose }: { visit: number; onClose: () => void }) {
  const close = useEffectEvent(onClose)
  useEffect(() => {
    const timer = setTimeout(close, 5000)
    return () => clearTimeout(timer)
  }, [visit])

  return (
    <aside className="guard-notice" role="alert" onClick={onClose}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="14" cy="40" r="3.5" fill="#e8b48c" />
        <circle cx="50" cy="40" r="3.5" fill="#e8b48c" />
        <circle cx="32" cy="39" r="18" fill="#f2c6a0" />
        <path d="M10 25C14 9 50 9 54 25Z" fill="#1d2440" />
        <rect x="14" y="23" width="36" height="7" rx="2" fill="#11162b" />
        <path d="M15 30q17 8 34 0l-2 4q-15 6-30 0Z" fill="#070a16" />
        <circle cx="32" cy="17" r="3.5" fill="#e6c98f" />
        <path d="M22 37.5l7 2.2M42 37.5l-7 2.2" stroke="#3a2418" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="26.5" cy="43" r="1.9" fill="#2a1a12" />
        <circle cx="37.5" cy="43" r="1.9" fill="#2a1a12" />
        <path d="M23 51q4-5 9-2 5-3 9 2-4 2.5-9 0.5-5 2-9-0.5Z" fill="#5a3a26" />
      </svg>
      <div>
        <small>Museum security</small>
        <strong>{guardLines[(visit - 1) % guardLines.length]}</strong>
        <p>{visit > 1 ? 'We’ve talked about this.' : 'This is going on your permanent record.'}</p>
      </div>
    </aside>
  )
}
