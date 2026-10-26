import { useEffect, useRef, useState } from 'react'
import { Download, Printer, Share2, X } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { exhibits, schedule, tours, wings } from './data'
import { readPlayer } from './scoring'
import './TicketBooth.css'

const width = 1200
const height = 520
const styles = { midnight: 'Midnight', paper: 'Vintage paper', holo: 'Holographic' }
type Style = keyof typeof styles

// Same name always prints the same ticket number and barcode.
const hash = (text: string) => [...text.toLowerCase()].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 2026)
const doors = (() => {
  const [hours, mins] = schedule[0].start.split(':').map(Number)
  return `${((hours + 11) % 12) + 1}:${String(mins).padStart(2, '0')}${hours < 12 ? 'am' : 'pm'}`
})()

// A collectible admission ticket for the museum, with the visitor's name and chosen tour.
export function TicketBooth({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(() => localStorage.getItem('techx26-name') || readPlayer()?.nickname || '')
  const [tourId, setTourId] = useState(() => localStorage.getItem('techx26-ticket-tour') ?? '')
  const [style, setStyle] = useState<Style>(() => (localStorage.getItem('techx26-ticket-style') as Style) in styles ? localStorage.getItem('techx26-ticket-style') as Style : 'midnight')
  const [printKey, setPrintKey] = useState(0)
  const [frameWidth, setFrameWidth] = useState(0)
  const [busy, setBusy] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)
  const tour = tours.find((item) => item.id === tourId)
  const stops = tour ? tour.stops.map((id) => exhibits.find((exhibit) => exhibit.id === id)!) : []
  const displayName = name.trim()
  const seed = hash(displayName || 'explorer')
  const number = `026-${String(seed % 10000).padStart(4, '0')}`
  const bars = Array.from({ length: 46 }, (_, index) => 1 + ((seed >> (index % 24)) + index * 7) % 4)
  const scale = frameWidth / width
  const fileName = `techx26-ticket${displayName ? `-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}.png`

  useEffect(() => {
    const element = frameRef.current!
    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const updateName = (value: string) => {
    setName(value)
    localStorage.setItem('techx26-name', value)
  }
  const chooseTour = (id: string) => {
    setTourId(id)
    setPrintKey((key) => key + 1)
    localStorage.setItem('techx26-ticket-tour', id)
  }
  const chooseStyle = (next: Style) => {
    setStyle(next)
    setPrintKey((key) => key + 1)
    localStorage.setItem('techx26-ticket-style', next)
  }

  const render = async () => {
    const { toBlob } = await import('html-to-image')
    return toBlob(ticketRef.current!, { width, height, pixelRatio: 2, style: { transform: 'none', animation: 'none' } })
  }
  const download = async () => {
    setBusy(true)
    try {
      const blob = await render()
      if (!blob) return
      const link = document.createElement('a')
      link.download = fileName
      link.href = URL.createObjectURL(blob)
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    } finally {
      setBusy(false)
    }
  }
  const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] })
  const share = async () => {
    setBusy(true)
    try {
      const blob = await render()
      if (blob) await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], text: 'Ticket booked for the TECHx26 Museum of Technology. #TECHx26' })
    } catch {
      // The visitor closed the share sheet.
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="ticket-booth" role="dialog" aria-modal="true" aria-labelledby="ticket-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close ticket booth" autoFocus><X /></button>
        <div className="ticket-intro">
          <p className="kicker">Box office</p>
          <h2 id="ticket-title">Print your museum ticket.</h2>
          <p>Add your name, pick a tour and download a ticket to share before the big day.</p>
        </div>

        <div className="ticket-machine" ref={frameRef}>
          <div className="ticket-slot" aria-hidden="true"><i /><span>TECHx26 · Admissions</span></div>
          <div className="ticket-feed" style={{ height: height * scale + 44 }}>
            <div key={printKey} className="ticket-print" style={{ width: width * scale, height: height * scale }}>
              <div ref={ticketRef} className={`ticket ticket-${style}`} style={{ '--accent': tour?.colour ?? '#c31672', width, height, transform: `scale(${scale})` } as React.CSSProperties} role="img" aria-label={`Ticket for ${displayName || 'you'}: ${tour?.title ?? 'Free roam'}, 27 November 2026`}>
                <div className="ticket-main">
                  <header>
                    <span className="brand-mark">TECH<span>x</span>26</span>
                    <span className="ticket-museum">Museum of Technology</span>
                    <span className="ticket-admit">Admit one</span>
                  </header>
                  <p className="ticket-label">Explorer</p>
                  <p className={`ticket-name${displayName.length > 18 ? ' long' : ''}`}>{displayName || 'Your name here'}</p>
                  <div className="ticket-tour">
                    <small>{tour ? 'Booked tour' : 'Self-guided'}</small>
                    <b>{tour?.title ?? 'Free roam'}</b>
                    <span>{tour ? `${tour.stops.length} stops · ${tour.minutes} min · ${tour.audience}` : `${exhibits.length} booths · ${wings.length} wings · No rules`}</span>
                  </div>
                  <ol className="ticket-route" aria-hidden="true">
                    {tour
                      ? stops.map((exhibit) => <li key={exhibit.id}><BoothArt id={exhibit.id} /></li>)
                      : wings.map((wing) => <li key={wing.id} style={{ '--accent': wing.colour } as React.CSSProperties}><i /></li>)}
                  </ol>
                  <dl className="ticket-facts">
                    <div><dt>Date</dt><dd>Fri 27 Nov 2026</dd></div>
                    <div><dt>Doors</dt><dd>{doors}</dd></div>
                    <div><dt>Entry</dt><dd>Main entrance</dd></div>
                    <div><dt>Venue</dt><dd>Kogarah, Sydney</dd></div>
                  </dl>
                </div>
                <div className="ticket-stub">
                  <span className="ticket-stub-admit">Admit one</span>
                  <div className="ticket-x" aria-hidden="true"><i /><i /></div>
                  <svg className="ticket-barcode" viewBox={`0 0 ${bars.reduce((sum, bar) => sum + bar + 1.5, 0)} 40`} preserveAspectRatio="none" aria-hidden="true">
                    {bars.map((bar, index) => <rect key={index} x={bars.slice(0, index).reduce((sum, item) => sum + item + 1.5, 0)} width={bar} height="40" />)}
                  </svg>
                  <small>No. {number}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-controls">
          <label className="share-field">
            <span>Name on ticket</span>
            <input value={name} onChange={(event) => updateName(event.target.value)} placeholder="e.g. Jack Hodges" maxLength={32} autoComplete="name" />
          </label>
          <span className="share-label">Your tour</span>
          <div className="ticket-tours" role="group" aria-label="Your tour">
            <button className={!tour ? 'active' : ''} aria-pressed={!tour} onClick={() => chooseTour('')}><i style={{ background: 'conic-gradient(#ef1721, #ff7a3d, #9b3cf0, #4f7cff, #1fbfa6, #ef1721)' }} />Free roam</button>
            {tours.map((item) => <button key={item.id} className={item.id === tourId ? 'active' : ''} aria-pressed={item.id === tourId} onClick={() => chooseTour(item.id)}><i style={{ background: item.colour }} />{item.title}</button>)}
          </div>
          <span className="share-label">Ticket style</span>
          <div className="ticket-styles" role="group" aria-label="Ticket style">
            {(Object.keys(styles) as Style[]).map((key) => <button key={key} className={`ticket-style-${key}${key === style ? ' active' : ''}`} aria-pressed={key === style} onClick={() => chooseStyle(key)}><i />{styles[key]}</button>)}
          </div>
          <div className="share-actions">
            <button className="button button-primary" onClick={download} disabled={busy}><Download size={17} /> Download PNG</button>
            {canShare ? <button className="button button-dark" onClick={share} disabled={busy}><Share2 size={17} /> Share</button> : <button className="button button-dark" onClick={() => setPrintKey((key) => key + 1)}><Printer size={17} /> Print again</button>}
          </div>
        </div>
      </section>
    </div>
  )
}
