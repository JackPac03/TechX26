import { useEffect, useMemo, useRef, useState } from 'react'
import type { IScannerControls } from '@zxing/browser'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Camera,
  Check,
  CalendarDays,
  Compass,
  KeyRound,
  Map,
  MapPin,
  MessageCircle,
  Route,
  Share2,
  QrCode,
  Play,
  Search,
  Sparkles,
  Star,
  Ticket,
  TicketCheck,
  Trophy,
  X,
} from 'lucide-react'
import { boothGuides, boothNumber, exhibits, exhibitUrl, tours, wings, type Exhibit } from './data'
import { BoothArt } from './BoothArt'
import { ChallengeSheet } from './ChallengeSheet'
import { challengeKinds, challenges as boothChallenges } from './challenges'
import { Leaderboard } from './Leaderboard'
import { AdminPanel } from './Admin'
import { readResults, totalScore } from './scoring'
import { QrStudio } from './QrStudio'
import { Schedule } from './Schedule'
import { TourMap } from './Tours'
import { CelebrationOverlay, type Celebration } from './Celebration'
import { ShareKit } from './ShareKit'
import { nextStop } from './venue'
import { VenueMap } from './VenueMap'
import { ExplorerQuiz } from './ExplorerQuiz'
import { CuratorSecret, ExplorerAdventures, ExplorerPassport } from './ExplorerJourney'
import { advanceTrail, emptyTrail, explorerBadges, explorerTitle, mysteryStops, readTrail, trailKey, type ExplorerJourney } from './explorer'
import { SecretReveal, SecretShelf, WingBadge } from './Collectibles'
import { ExhibitReport } from './ExhibitReport'
import { TicketBooth } from './TicketBooth'
import { findSecret, readSecrets, recordStampTime, secretsKey, stampTimesKey, type Secret } from './secrets'

const readIds = (key: string) => {
  try {
    const ids = JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
    return ids.filter((id) => exhibits.some((exhibit) => exhibit.id === id))
  } catch {
    return []
  }
}

// Opening a booth's QR link (/exhibits/:id) reveals that booth and collects its stamp.
const linkedExhibit = exhibits.find((exhibit) => (window.location.origin + window.location.pathname).replace(/\/$/, '') === exhibitUrl(exhibit.id))
const linkedIsNew = Boolean(linkedExhibit && !readIds('techx26-visited').includes(linkedExhibit.id))
// Secret QR codes (/secret/:code) reveal a hidden exhibit.
const linkedSecret = window.location.pathname.startsWith(`${import.meta.env.BASE_URL}secret/`) ? findSecret(window.location.pathname) : undefined
const linkedSecretIsNew = Boolean(linkedSecret && !readSecrets().includes(linkedSecret.id))

const celebrate = (exhibit: Exhibit, visited: string[]): Celebration => {
  const wing = wings.find((item) => item.id === exhibit.wingId)!
  const wingDone = exhibits.filter((item) => item.wingId === wing.id).every((item) => visited.includes(item.id))
  return { exhibit, count: visited.length, wingDone: wingDone ? wing : undefined, passportDone: visited.length === exhibits.length }
}

const distanceLabel = (distance: number) => distance < 120 ? 'Right next door' : distance < 360 ? 'A short walk' : 'Across the venue'
const pageSize = 6

function ScannerModal({ onClose, onScan }: { onClose: () => void; onScan: (value: string) => boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [active, setActive] = useState(false)
  const [manual, setManual] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => () => controlsRef.current?.stop(), [])

  const startCamera = async () => {
    setError('')
    setActive(true)
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result && onScan(result.getText())) controlsRef.current?.stop()
      })
    } catch {
      setActive(false)
      setError('Camera access is unavailable. Enter the booth code instead.')
    }
  }

  const submitCode = () => {
    if (!onScan(code.trim())) setError('That booth code was not recognised. Enter the booth number, e.g. 13.')
  }

  return (
    <div className="scanner-backdrop" role="presentation">
      <section className="scanner-sheet" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
        <div className="scanner-header">
          <div><p>TECHx26 passport</p><h2 id="scanner-title">Scan an exhibit</h2></div>
          <button onClick={() => { controlsRef.current?.stop(); onClose() }} aria-label="Close scanner"><X /></button>
        </div>
        <div className={active ? 'scanner-viewport active' : 'scanner-viewport'}>
          <video ref={videoRef} muted playsInline aria-label="Camera preview" />
          <div className="scan-frame"><i /><i /><i /><i /><span /></div>
          {!active && <div className="camera-placeholder"><QrCode /><p>Point your camera at the QR code displayed at the booth.</p></div>}
        </div>
        {error && <p className="scanner-error" role="alert">{error}</p>}
        {!manual ? (
          <div className="scanner-actions">
            <button className="button button-primary scan-camera" onClick={startCamera}><Camera size={18} /> Open camera</button>
            <button className="text-button" onClick={() => setManual(true)}>Enter booth code instead</button>
          </div>
        ) : (
          <form className="booth-code-form" onSubmit={(event) => { event.preventDefault(); submitCode() }}>
            <label htmlFor="booth-code">Booth code</label>
            <div><input id="booth-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. 13" autoFocus /><button type="submit"><ArrowRight /></button></div>
          </form>
        )}
        <p className="scanner-privacy">Camera footage stays on your device and is never recorded.</p>
      </section>
    </div>
  )
}

function App() {
  const [selectedWing, setSelectedWing] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(linkedExhibit ?? null)
  const [surpriseRoll, setSurpriseRoll] = useState<Exhibit[] | null>(null)
  const [surpriseResult, setSurpriseResult] = useState(false)
  const surpriseRef = useRef<HTMLButtonElement>(null)
  const [visited, setVisited] = useState<string[]>(() => {
    const ids = readIds('techx26-visited')
    if (!linkedExhibit || ids.includes(linkedExhibit.id)) return ids
    const next = [...ids, linkedExhibit.id]
    localStorage.setItem('techx26-visited', JSON.stringify(next))
    recordStampTime(linkedExhibit.id)
    return next
  })
  const [saved, setSaved] = useState<string[]>(() => readIds('techx26-saved'))
  const [surprisePicks, setSurprisePicks] = useState<string[]>(() => readIds('techx26-surprise-picks'))
  const [trail, setTrail] = useState(() => {
    const saved = readTrail()
    const next = linkedExhibit ? advanceTrail(saved, linkedExhibit.id) : saved
    if (next !== saved) localStorage.setItem(trailKey, JSON.stringify(next))
    return next
  })
  const [secretFound, setSecretFound] = useState(() => localStorage.getItem('techx26-curator-secret') === '1')
  const [secretOpen, setSecretOpen] = useState(false)
  const logoTaps = useRef({ count: 0, last: 0 })
  const [quizOpen, setQuizOpen] = useState(false)
  const [mapRequest, setMapRequest] = useState<{ key: number; tourId?: string; hintId?: string }>({ key: 0 })
  const [discovery, setDiscovery] = useState<{ title: string; detail: string } | null>(null)
  const [found, setFound] = useState<string[]>(() => {
    const ids = readSecrets()
    if (!linkedSecret || ids.includes(linkedSecret.id)) return ids
    const next = [...ids, linkedSecret.id]
    localStorage.setItem(secretsKey, JSON.stringify(next))
    return next
  })
  const [secretShown, setSecretShown] = useState<{ secret: Secret; isNew: boolean } | null>(() => linkedSecret ? { secret: linkedSecret, isNew: linkedSecretIsNew } : null)
  const [xFound, setXFound] = useState(() => localStorage.getItem('techx26-x-found') === '1')
  const [xTaps, setXTaps] = useState({ count: 0, last: 0, spin: 0, burst: 0 })
  const [ticketOpen, setTicketOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const journey: ExplorerJourney = { visited, surprisePicks, trail, secretFound, xFound }
  const [results, setResults] = useState<Record<string, number>>(readResults)
  const challenges = Object.keys(results)
  const [playing, setPlaying] = useState<{ id: string; demo?: boolean } | null>(null)
  const [demoBoard, setDemoBoard] = useState(() => localStorage.getItem('techx26-demo-leaderboard') === '1')
  const [scanOpen, setScanOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [celebration, setCelebration] = useState<Celebration | null>(() => linkedExhibit && linkedIsNew ? celebrate(linkedExhibit, visited) : null)
  const [qrOpen, setQrOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // The foyer doors open on every page load, except for people who prefer reduced motion.
  const [foyerDoors] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (linkedExhibit || linkedSecret) window.history.replaceState(null, '', import.meta.env.BASE_URL)
  }, [])

  useEffect(() => {
    if (!discovery) return
    const timer = setTimeout(() => setDiscovery(null), 6000)
    return () => clearTimeout(timer)
  }, [discovery])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Highlight the tab for whichever section crosses the middle of the screen.
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id)
    }, { rootMargin: '-45% 0px -50% 0px' })
    document.querySelectorAll('main > section').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Reveal content as it scrolls into view.
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('in-view')
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const visibleExhibits = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return exhibits.filter((exhibit) => {
      if (selectedWing !== 'all' && exhibit.wingId !== selectedWing) return false
      const wing = wings.find((item) => item.id === exhibit.wingId)!
      const text = [exhibit.title, exhibit.description, wing.title, exhibit.area, String(exhibit.booth), boothNumber(exhibit), ...exhibit.hosts, ...exhibit.partners].join(' ').toLowerCase()
      return terms.every((term) => text.includes(term))
    })
  }, [selectedWing, query])

  const pageCount = Math.ceil(visibleExhibits.length / pageSize)
  const pagedExhibits = visibleExhibits.slice((page - 1) * pageSize, page * pageSize)
  const progress = Math.round((visited.length / exhibits.length) * 100)

  const selectWing = (id: string) => {
    setSelectedWing(id)
    setPage(1)
  }

  const goToPage = (next: number) => {
    setPage(next)
    requestAnimationFrame(() => {
      const results = document.getElementById('exhibit-results')
      results?.focus({ preventScroll: true })
      results?.scrollIntoView({ block: 'start' })
    })
  }

  const toggleSaved = (id: string) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem('techx26-saved', JSON.stringify(next))
  }

  const completeChallenge = (id: string, points: number) => {
    const next = { ...results, [id]: Math.max(results[id] ?? 0, points) }
    setResults(next)
    localStorage.setItem('techx26-results', JSON.stringify(next))
  }

  const showDemoBoard = (on: boolean) => {
    setDemoBoard(on)
    localStorage.setItem('techx26-demo-leaderboard', on ? '1' : '0')
  }

  const resetProgress = () => {
    for (const key of ['techx26-visited', 'techx26-challenges', 'techx26-results', 'techx26-player', 'techx26-surprise-picks', 'techx26-curator-secret', trailKey, secretsKey, stampTimesKey, 'techx26-x-found']) localStorage.removeItem(key)
    setVisited([])
    setFound([])
    setXFound(false)
    setResults({})
    setSurprisePicks([])
    setTrail(emptyTrail)
    setSecretFound(false)
    setDiscovery(null)
    logoTaps.current = { count: 0, last: 0 }
  }

  const announceDiscovery = (next: ExplorerJourney) => {
    const before = explorerBadges(journey).filter((badge) => badge.unlocked)
    const unlocked = explorerBadges(next).filter((badge) => badge.unlocked && !before.some((old) => old.id === badge.id))
    const title = explorerTitle(next.visited).label
    const levelledUp = title !== explorerTitle(visited).label
    if (unlocked.length || levelledUp) {
      setDiscovery({ title: levelledUp ? `New title: ${title}!` : 'A secret discovery!', detail: [levelledUp && 'Your explorer title has levelled up.', ...unlocked.map((badge) => `${badge.title} unlocked.`)].filter(Boolean).join(' ') })
    } else if (next.trail.step > trail.step) {
      setDiscovery({ title: `Clue ${trail.step + 1} solved!`, detail: 'Your next clue is ready under Follow your curiosity.' })
    }
  }

  const stampExhibit = (id: string) => {
    const nextTrail = advanceTrail(trail, id)
    const next = visited.includes(id) ? visited : [...visited, id]
    if (nextTrail === trail && next === visited) return
    if (nextTrail !== trail) {
      setTrail(nextTrail)
      localStorage.setItem(trailKey, JSON.stringify(nextTrail))
    }
    if (next !== visited) {
      setVisited(next)
      localStorage.setItem('techx26-visited', JSON.stringify(next))
      recordStampTime(id)
      setCelebration(celebrate(exhibits.find((exhibit) => exhibit.id === id)!, next))
    }
    announceDiscovery({ ...journey, visited: next, trail: nextTrail })
  }

  const setTrailStarted = (started: boolean) => {
    const next = { ...trail, started }
    setTrail(next)
    localStorage.setItem(trailKey, JSON.stringify(next))
  }

  const goToMap = (request: { tourId?: string; hintId?: string }) => {
    setMapRequest((current) => ({ ...request, key: current.key + 1 }))
    requestAnimationFrame(() => {
      const map = document.getElementById('map')
      map?.scrollIntoView({ block: 'start' })
      map?.querySelector<HTMLButtonElement>(request.tourId ? '.tour-option.active' : '.tour-mystery-hint button')?.focus({ preventScroll: true })
    })
  }

  const greetLogo = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now()
    logoTaps.current = { count: now - logoTaps.current.last < 1800 ? logoTaps.current.count + 1 : 1, last: now }
    if (logoTaps.current.count < 5) {
      // Keep keyboard users on the logo after the home anchor scrolls the page.
      const logo = event.currentTarget
      if (event.detail === 0) requestAnimationFrame(() => logo.focus({ preventScroll: true }))
      return
    }
    event.preventDefault()
    logoTaps.current.count = 0
    event.currentTarget.focus({ preventScroll: true })
    if (!secretFound) {
      setSecretFound(true)
      localStorage.setItem('techx26-curator-secret', '1')
    }
    setSecretOpen(true)
  }

  const openExhibit = (exhibit: Exhibit | null) => {
    setSelectedExhibit(exhibit)
    setSurpriseResult(false)
  }

  const revealSurprise = (exhibit: Exhibit) => {
    const next = surprisePicks.includes(exhibit.id) ? surprisePicks : [...surprisePicks, exhibit.id]
    setSurprisePicks(next)
    localStorage.setItem('techx26-surprise-picks', JSON.stringify(next))
    setSelectedExhibit(exhibit)
    setSurpriseResult(true)
    announceDiscovery({ ...journey, surprisePicks: next })
  }

  const surpriseMe = () => {
    const unseen = exhibits.filter((exhibit) => !visited.includes(exhibit.id))
    const pool = unseen.length ? unseen : exhibits
    const alternatives = pool.filter((exhibit) => exhibit.id !== selectedExhibit?.id)
    const choices = alternatives.length ? alternatives : pool
    const chosen = choices[Math.floor(Math.random() * choices.length)]
    openExhibit(null)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealSurprise(chosen)
      return
    }
    const start = Math.floor(Math.random() * exhibits.length)
    setSurpriseRoll([...Array.from({ length: 16 }, (_, index) => exhibits[(start + index) % exhibits.length]), chosen])
  }

  const cancelSurprise = () => {
    setSurpriseRoll(null)
    requestAnimationFrame(() => surpriseRef.current?.focus())
  }

  const finishSurprise = () => {
    if (!surpriseRoll) return
    revealSurprise(surpriseRoll[surpriseRoll.length - 1])
    setSurpriseRoll(null)
  }

  const collectSecret = (secret: Secret) => {
    const isNew = !found.includes(secret.id)
    if (isNew) {
      const next = [...found, secret.id]
      setFound(next)
      localStorage.setItem(secretsKey, JSON.stringify(next))
    }
    setSecretShown({ secret, isNew })
  }

  // Five quick taps on the floating X send it spinning and unlock a secret badge.
  const tapX = () => {
    const now = Date.now()
    const count = now - xTaps.last < 1800 ? xTaps.count + 1 : 1
    if (count < 5) {
      setXTaps({ ...xTaps, count, last: now })
      return
    }
    setXTaps({ count: 0, last: 0, spin: xTaps.spin + 1080, burst: xTaps.burst + 1 })
    navigator.vibrate?.([20, 40, 20, 40, 60])
    if (xFound) return
    setXFound(true)
    localStorage.setItem('techx26-x-found', '1')
    setTimeout(() => announceDiscovery({ ...journey, xFound: true }), 1400)
  }

  const revealScannedExhibit = (value: string) => {
    const secret = findSecret(value)
    if (secret) {
      setScanOpen(false)
      collectSecret(secret)
      return true
    }
    const code = value.trim().toLowerCase().split('/').filter(Boolean).pop() ?? ''
    const exhibit = exhibits.find((item) => item.id === code || Number(code) === item.booth)
    if (!exhibit) return false
    stampExhibit(exhibit.id)
    setScanOpen(false)
    openExhibit(exhibit)
    return true
  }

  const nextUp = selectedExhibit ? nextStop(selectedExhibit.id, visited) : undefined
  const mysteryMatch = trail.started && mysteryStops[trail.step]?.id === selectedExhibit?.id
  const challengeSheet = playing && <ChallengeSheet key={playing.id + playing.demo} demo={playing.demo} challenge={boothChallenges[playing.id]} accent={wings.find((wing) => wing.id === exhibits.find((exhibit) => exhibit.id === playing.id)!.wingId)!.colour} onClose={() => setPlaying(null)} onComplete={(points) => completeChallenge(playing.id, points)} />

  return (
    <div className="app-shell">
      <header className={['site-header', scrolled && 'scrolled', menuOpen && 'menu-open'].filter(Boolean).join(' ')}>
        <a className="brand" href="#top" aria-label="TECHx26 Museum home" onClick={greetLogo}>
          <span className="brand-mark">TECH<span>x</span>26</span>
          <span className="brand-subtitle">Museum of Technology</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#map"><b>Map</b></a>
          <a href="#schedule"><b>Schedule</b></a>
          <a href="#tours"><b>Tours</b></a>
          <a href="#passport"><b>Passport</b><span>{visited.length}</span></a>
          <a href="#leaderboard"><b>Leaderboard</b></a>
          <button className="nav-scan" onClick={() => setScanOpen(true)}><QrCode size={16} /> Scan QR</button>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu"><i /><i /></button>
      </header>

      <div className={menuOpen ? 'menu-scrim open' : 'menu-scrim'} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <nav id="mobile-menu" className={menuOpen ? 'mobile-menu open' : 'mobile-menu'} aria-label="Menu" inert={!menuOpen}>
        {[
          { href: '#wings', icon: <Compass />, label: 'Explore booths', detail: `${wings.length} wings · ${exhibits.length} booths`, active: activeSection === 'wings' || activeSection === 'exhibits' },
          { href: '#schedule', icon: <CalendarDays />, label: 'Schedule', detail: 'What’s on and when', active: activeSection === 'schedule' },
          { href: '#tours', icon: <Route />, label: 'Curated tours', detail: `${tours.length} routes to follow`, active: false },
          { href: '#map', icon: <Map />, label: 'Venue map', detail: 'Kogarah Front & Back', active: activeSection === 'map' },
          { href: '#passport', icon: <TicketCheck />, label: 'Passport', detail: `${visited.length} of ${exhibits.length} stamps`, active: activeSection === 'passport' },
          { href: '#leaderboard', icon: <Trophy />, label: 'Leaderboard', detail: 'Points and prizes', active: activeSection === 'leaderboard' },
        ].map((item, index) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={item.active ? 'true' : undefined} style={{ '--i': index } as React.CSSProperties}>
            {item.icon}<span><b>{item.label}</b><small>{item.detail}</small></span><ArrowRight />
          </a>
        ))}
        <button className="menu-surprise" onClick={() => { setMenuOpen(false); surpriseMe() }} style={{ '--i': 6 } as React.CSSProperties}><Sparkles /> Surprise me with a booth</button>
        <div className="menu-extras" style={{ '--i': 7 } as React.CSSProperties}>
          <button className="menu-surprise" onClick={() => { setMenuOpen(false); setReportOpen(true) }}><Play /> Exhibit report</button>
          <button className="menu-surprise" onClick={() => { setMenuOpen(false); setTicketOpen(true) }}><Ticket /> Museum ticket</button>
        </div>
      </nav>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-floor" aria-hidden="true" />
          <div className="orbital orbital-one" aria-hidden="true" />
          <div className="orbital orbital-two" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow"><span /> Sydney · 27 November 2026</p>
            <h1 id="hero-title" aria-label="Enter the possible.">
              <span className="hero-enter" aria-hidden="true">Enter the</span>
              <em aria-hidden="true">{Array.from('possible.').map((letter, index) => (
                <span className="hero-letter" key={index} style={{ '--letter': index } as React.CSSProperties}>{letter}</span>
              ))}</em>
            </h1>
            <p className="hero-intro">A living museum of the ideas, people and technology shaping the future of banking.</p>
            <div className="hero-actions">
              <button className="button button-primary hero-scan" onClick={() => setScanOpen(true)}><QrCode size={19} /> Scan booth QR</button>
              <a className="button button-ghost" href="#wings">Browse the museum <ArrowDown size={17} /></a>
            </div>
          </div>
          <div className="hero-installation" aria-hidden="true">
            <div className="foyer-spot" />
            <div className="foyer-glow" />
            <div className="foyer-shadow" />
            <div className={xTaps.burst && !xTaps.count ? 'foyer-x spin' : 'foyer-x'} onClick={tapX} style={{ transform: `rotateY(${xTaps.spin}deg) rotate(${xTaps.count % 2 ? 8 : xTaps.count ? -8 : 0}deg) scale(${1 + xTaps.count * 0.05})` }}>
              <div className="techx-ribbon ribbon-one" />
              <div className="techx-ribbon ribbon-two" />
              <div className="techx-ribbon ribbon-shine" />
            </div>
            {xTaps.burst > 0 && <div key={xTaps.burst} className="foyer-burst">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ '--a': `${index * 137.5}deg`, '--d': `${120 + ((index * 53) % 160)}px`, '--c': wings[index % wings.length].colour, '--t': `${(index % 5) * 40}ms` } as React.CSSProperties} />)}</div>}
            <svg className="foyer-rope" viewBox="0 0 400 90">
              <path className="rope" d="M32 26 Q200 78 368 26" />
              {[32, 368].map((x) => <g key={x} className="stanchion"><rect x={x - 3} y={24} width={6} height={58} rx={3} /><ellipse cx={x} cy={84} rx={16} ry={4} /><circle cx={x} cy={22} r={7} /></g>)}
            </svg>
            <div className="foyer-placard"><small>Exhibit 01</small><b>The Possible</b><span>TECHx26 · {exhibits.length} booths inside</span></div>
          </div>
          <div className="hero-arrows" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <svg key={index} className={`hero-arrow hero-arrow-${index + 1}`} viewBox="0 0 130 80" fill="none">
                <path className="arrow-trail" d="M8 68 C35 68 13 28 43 30 S83 48 114 12" />
                <path className="arrow-tip" d="m92 13 23-2-2 23" />
              </svg>
            ))}
          </div>
          <div className="hero-footnote"><span>01</span><p>Technology is not the exhibit.<br />What people do with it is.</p></div>
          <dl className="hero-stats">
            <div><dt>Booths</dt><dd>{exhibits.length}</dd></div>
            <div><dt>Wings</dt><dd>{wings.length}</dd></div>
            <div><dt>Tours</dt><dd>{tours.length}</dd></div>
          </dl>
          {foyerDoors && <div className="hero-doors" aria-hidden="true"><i><b>TECH</b></i><i><b>x26</b></i></div>}
        </section>

        <section className="scan-intro" aria-label="How exhibit scanning works" data-reveal>
          <div className="scan-intro-icon"><QrCode /></div>
          <div><p className="kicker">At a booth?</p><h2>Scan. Discover. Collect.</h2><span>Scan the exhibit QR to reveal its story and add a unique stamp to your passport.</span></div>
          <button className="button button-primary" onClick={() => setScanOpen(true)}>Scan now <Camera size={17} /></button>
          <div className="scan-progress"><strong>{visited.length}/{exhibits.length}</strong><span>stamps collected</span></div>
        </section>

        <Schedule onOpen={openExhibit} />

        <section className="section wings-section" id="wings">
          <div className="section-heading" data-reveal>
            <div><p className="kicker">The collection</p><h2>Choose your wing.</h2></div>
            <p>{exhibits.length} booths across six wings, from strategy and customer platforms to the people and communities behind them.</p>
          </div>
          <div className="wing-grid">
            {wings.map((wing, index) => (
              <button
                className="wing-card"
                key={wing.id}
                data-reveal
                style={{ '--accent': wing.colour, '--i': index } as React.CSSProperties}
                onClick={() => {
                  selectWing(wing.id)
                  document.getElementById('exhibits')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span className="wing-number">{wing.number}</span>
                <div className={`wing-art art-${wing.id}`}><i /><i /><i /></div>
                <div className="wing-content">
                  <h3>{wing.title}</h3>
                  <p>{wing.description}</p>
                  <span className="text-link">{exhibits.filter((exhibit) => exhibit.wingId === wing.id).length} booths <ArrowRight size={16} /></span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <ExplorerAdventures trail={trail} onStart={() => setTrailStarted(true)} onPause={() => setTrailStarted(false)} onHint={() => goToMap({ hintId: mysteryStops[trail.step].id })} onQuiz={() => setQuizOpen(true)} />

        <section className="section exhibit-section" id="exhibits">
          <div className="section-heading exhibit-heading" data-reveal>
            <div><p className="kicker">Now showing</p><h2>Stories worth stopping for.</h2></div>
            <button ref={surpriseRef} className="button button-dark" onClick={surpriseMe}><Sparkles size={17} /> Surprise me</button>
          </div>
          <div className="filter-bar">
            <div className="filters" role="group" aria-label="Filter exhibits by wing">
              <button className={selectedWing === 'all' ? 'active' : ''} onClick={() => selectWing('all')}>All booths <span>{exhibits.length}</span></button>
              {wings.map((wing) => <button className={selectedWing === wing.id ? 'active' : ''} key={wing.id} onClick={() => selectWing(wing.id)}>{wing.shortTitle} <span>{exhibits.filter((exhibit) => exhibit.wingId === wing.id).length}</span></button>)}
            </div>
            <div className={searchOpen ? 'exhibit-search open' : 'exhibit-search'}>
              <button className="search-icon" onClick={() => { setSearchOpen(true); searchRef.current?.focus() }} aria-label="Search exhibits" tabIndex={searchOpen ? -1 : 0}><Search size={16} /></button>
              <input ref={searchRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} onBlur={() => { if (!query.trim()) setSearchOpen(false) }} placeholder="Search booths, hosts, partners" aria-label="Search exhibits" tabIndex={searchOpen ? 0 : -1} />
              <button className="search-close" onMouseDown={(event) => event.preventDefault()} onClick={() => { setQuery(''); setPage(1); setSearchOpen(false); searchRef.current?.blur() }} aria-label="Close search" tabIndex={searchOpen ? 0 : -1}><X size={14} /></button>
            </div>
          </div>
          {visibleExhibits.length === 0 && (
            <p className="exhibit-empty" role="status">No booths match “{query.trim()}”{selectedWing !== 'all' && ' in this wing'}. <button className="text-button" onClick={() => { setQuery(''); setSearchOpen(false); selectWing('all') }}>Clear search</button></p>
          )}
          <div className="exhibit-grid" id="exhibit-results" key={selectedWing} role="group" aria-label="Booth results" tabIndex={-1}>
            {pagedExhibits.map((exhibit, index) => {
              const wing = wings.find((item) => item.id === exhibit.wingId)!
              return (
                <article className="exhibit-card" key={exhibit.id} style={{ '--accent': wing.colour, '--i': index } as React.CSSProperties}>
                  <div className="exhibit-top">
                    <BoothArt id={exhibit.id} className="exhibit-icon" />
                    <div className="exhibit-meta"><strong>Booth {boothNumber(exhibit)}</strong><span>{wing.title}</span>{exhibit.activity && <b>Activity</b>}</div>
                    <button className={saved.includes(exhibit.id) ? 'save-button saved' : 'save-button'} onClick={() => toggleSaved(exhibit.id)} aria-label={`${saved.includes(exhibit.id) ? 'Remove' : 'Save'} ${exhibit.title}`}>
                      <Bookmark size={17} fill={saved.includes(exhibit.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p className="exhibit-eyebrow">{exhibit.partners.length ? `With ${exhibit.partners.join(' · ')}` : 'Westpac team'}</p>
                  <h3>{exhibit.title}</h3>
                  <p className="exhibit-description">{exhibit.description}</p>
                  <div className="exhibit-footer">
                    <span className="exhibit-locate"><MapPin size={14} />{exhibit.area}</span>
                    <button className="exhibit-open" onClick={() => openExhibit(exhibit)} aria-label={`Open ${exhibit.title}`}><ArrowRight /></button>
                  </div>
                </article>
              )
            })}
          </div>
          {visibleExhibits.length > 0 && (
            <div className="exhibit-pagination">
              <p role="status">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, visibleExhibits.length)} of {visibleExhibits.length} booths</p>
              {pageCount > 1 && (
                <nav aria-label="Booth pages">
                  <button onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Previous page"><ArrowLeft size={15} />Previous</button>
                  <span>Page <strong>{page}</strong> of {pageCount}</span>
                  <button onClick={() => goToPage(page + 1)} disabled={page === pageCount} aria-label="Next page">Next<ArrowRight size={15} /></button>
                </nav>
              )}
            </div>
          )}
        </section>

        <section className="passport-section" id="passport">
          <div className="passport-copy" data-reveal>
            <p className="kicker light">Your digital passport</p>
            <h2>Collect moments.<br />Unlock perspectives.</h2>
            <p>Tap in at exhibits to collect stamps, complete collections and reveal a personalised record of your TECHx journey.</p>
            <div className="passport-stats">
              <div><strong>{visited.length}</strong><span>stamps collected</span></div>
              <div><strong>{challenges.length}</strong><span>challenges done</span></div>
              <div><strong>{totalScore({ name: '', visited, results, secrets: found }).toLocaleString()}</strong><span>points</span></div>
            </div>
            <button className="report-teaser" onClick={() => setReportOpen(true)}>
              <span className="report-teaser-play" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
              <span><b>Your exhibit report</b><small>A one-minute story of your day at the museum</small></span>
              <ArrowRight size={18} />
            </button>
            <div className="passport-actions">
              <a href="#exhibits" className="button button-light">Find your next stamp <ArrowRight size={17} /></a>
              <button className="button button-glass" onClick={() => setShareOpen(true)}><Share2 size={17} /> Share your journey</button>
              <button className="button button-glass" onClick={() => setTicketOpen(true)}><Ticket size={17} /> Museum ticket</button>
            </div>
          </div>
          <div className="passport-card-wrap" data-reveal>
            <div className="passport-card">
              <div className="passport-top"><span>TECH<span>x</span>26</span><small>EXPLORER PASS<br />NO. 026—841</small></div>
              <div className="passport-progress">
                <div className="progress-label"><span>Collection progress</span><strong>{progress}%</strong></div>
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="stamp-grid">
                {wings.map((wing) => {
                  const wingExhibits = exhibits.filter((item) => item.wingId === wing.id)
                  const count = wingExhibits.filter((item) => visited.includes(item.id)).length
                  const earned = count === wingExhibits.length
                  return <div key={wing.id} className={earned ? 'stamp-badge earned' : 'stamp-badge'} style={{ '--accent': wing.colour } as React.CSSProperties} title={earned ? `${wing.badge} badge earned` : `${wingExhibits.length - count} more ${wing.shortTitle} booths for the ${wing.badge} badge`}><WingBadge wing={wing} got={count} total={wingExhibits.length} /><small>{earned ? wing.badge : wing.shortTitle}</small><span>{count}/{wingExhibits.length}</span></div>
                })}
              </div>
              <SecretShelf found={found} />
              <ExplorerPassport journey={journey} />
            </div>
          </div>
        </section>

        <Leaderboard visited={visited} results={results} secrets={found} demo={demoBoard} />

        <section className="map-section" id="map">
          <TourMap key={mapRequest.key} initialTourId={mapRequest.tourId} initialHintId={mapRequest.hintId} visited={visited} saved={saved} onOpen={openExhibit} />
        </section>

        <section className="scan-cta" data-reveal>
          <div className="scan-cta-art" aria-hidden="true"><QrCode /><span /><span /></div>
          <div><p className="kicker light">Your passport is in your pocket</p><h2>Every booth holds<br />a new discovery.</h2></div>
          <div><p>Look for the TECHx QR at each exhibit. One scan opens the story and collects your stamp.</p><button className="button button-light" onClick={() => setScanOpen(true)}>Scan an exhibit <Camera size={17} /></button></div>
        </section>
      </main>

      <footer>
        <div className="footer-main">
          <div className="brand-mark">TECH<span>x</span>26</div>
          <p>Museum of Technology · Built to keep ideas in motion.</p>
          <div className="footer-links">
            <button className="footer-qr" onClick={() => setQrOpen(true)}><QrCode size={15} /> Booth QR codes</button>
            <button className="footer-admin" aria-haspopup="dialog" onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setAdminOpen(true) }}>Admin</button>
            <a href="#top">Accessibility</a><a href="#top">Privacy</a><a href="#top">Help</a>
          </div>
        </div>
        <p className="footer-credit">Created by Jack Hodges – 2026 Technology Graduate</p>
      </footer>

      <button className="scan-fab" onClick={() => setScanOpen(true)} aria-label="Scan exhibit QR"><QrCode size={18} /><span>Scan exhibit</span></button>

      {surpriseRoll && (
        <div className="modal-backdrop" role="presentation" onMouseDown={cancelSurprise}>
          <section className="surprise-dialog" role="dialog" aria-modal="true" aria-labelledby="surprise-title" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => {
            if (event.key === 'Escape') cancelSurprise()
            if (event.key === 'Tab') event.preventDefault()
          }}>
            <button className="modal-close" onClick={cancelSurprise} aria-label="Cancel surprise" autoFocus><X /></button>
            <Sparkles className="surprise-spark" size={32} aria-hidden="true" />
            <p className="kicker">A little serendipity</p>
            <h2 id="surprise-title">Where to next?</h2>
            <p className="surprise-status" role="status">{['Consulting the curiosity department…', 'Shuffling a few good ideas…', 'Finding your next rabbit hole…'][surpriseRoll[0].booth % 3]}</p>
            <div className="booth-reel" aria-hidden="true">
              <div className="booth-reel-track" style={{ '--roll-distance': `${(surpriseRoll.length - 1) * 96}px` } as React.CSSProperties} onAnimationEnd={finishSurprise}>
                {surpriseRoll.map((exhibit, index) => (
                  <div className="booth-reel-item" key={index}>
                    <strong>{boothNumber(exhibit)}</strong>
                    <div><small>{wings.find((wing) => wing.id === exhibit.wingId)!.title}</small><span>{exhibit.title}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="surprise-hint">Follow your curiosity. We’ll pick the first stop.</p>
          </section>
        </div>
      )}

      {selectedExhibit && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => openExhibit(null)}>
          <section className="exhibit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()} style={{ '--accent': wings.find((wing) => wing.id === selectedExhibit.wingId)!.colour } as React.CSSProperties}>
            <button className="modal-close" onClick={() => openExhibit(null)} aria-label="Close exhibit" autoFocus><X /></button>
            <div className="modal-body">
              {surpriseResult && <div className="confetti surprise-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => (
                <i key={index} style={{ '--a': `${index * 137.5}deg`, '--d': `${90 + ((index * 53) % 100)}px`, '--c': wings[index % wings.length].colour, '--t': `${(index % 4) * 20}ms` } as React.CSSProperties} />
              ))}</div>}
              <p className="modal-where"><MapPin size={13} />Booth {boothNumber(selectedExhibit)} · {selectedExhibit.area}</p>
              <BoothArt key={selectedExhibit.id} id={selectedExhibit.id} className="modal-icon draw" />
              {surpriseResult ? <div className="surprise-picked"><p className="kicker">Your lucky pick</p><button onClick={surpriseMe}><Sparkles size={14} /> Roll again</button></div> : <p className="kicker">{wings.find((wing) => wing.id === selectedExhibit.wingId)!.title}</p>}
              <h2 id="modal-title">{selectedExhibit.title}</h2>
              <p className="modal-lead">{selectedExhibit.description}</p>
              {mysteryMatch && <div className="mystery-match"><KeyRound size={19} /><div><strong>You found mystery stop {trail.step + 1}!</strong><p>{visited.includes(selectedExhibit.id) ? 'Already in your passport. Confirm this stop below to reveal your next clue.' : 'Collect this booth’s passport stamp to solve the clue.'}</p></div></div>}
              <div className={challenges.includes(selectedExhibit.id) ? 'booth-challenge done' : 'booth-challenge'}>
                <span className="booth-challenge-icon" aria-hidden="true">{challenges.includes(selectedExhibit.id) ? <Check /> : <Sparkles />}</span>
                <div><small>Booth challenge · {challengeKinds[boothChallenges[selectedExhibit.id].kind]}{results[selectedExhibit.id] ? ` · Best ${results[selectedExhibit.id]} pts` : ` · Up to 100 pts`}</small><p><b>{boothChallenges[selectedExhibit.id].title}.</b> {boothChallenges[selectedExhibit.id].intro}</p></div>
                <button onClick={() => setPlaying({ id: selectedExhibit.id })}>{challenges.includes(selectedExhibit.id) ? 'Play again' : boothChallenges[selectedExhibit.id].kind === 'code' ? 'Enter code' : 'Play'}</button>
              </div>
              {(selectedExhibit.hosts.length > 0 || selectedExhibit.partners.length > 0) && (
                <div className="modal-crew">
                  {selectedExhibit.hosts.length > 0 && <div className="modal-people"><small>Hosted by</small><p>{selectedExhibit.hosts.join(', ')}</p></div>}
                  {selectedExhibit.partners.length > 0 && <div className="modal-people"><small>Partners</small><div className="tag-list">{selectedExhibit.partners.map((partner) => <span key={partner}>{partner}</span>)}</div></div>}
                </div>
              )}
              <div className="booth-ask"><small><MessageCircle size={13} /> Ask the team</small><ul>{boothGuides[selectedExhibit.id].ask.map((question) => <li key={question}>{question}</li>)}</ul></div>
              <div className="modal-actions">
                <button className={visited.includes(selectedExhibit.id) ? 'stamp-button done' : 'stamp-button'} onClick={() => stampExhibit(selectedExhibit.id)} aria-pressed={visited.includes(selectedExhibit.id)}>
                  <span className="stamp-button-seal" aria-hidden="true">{visited.includes(selectedExhibit.id) ? <Check size={19} /> : <Star size={18} />}</span>
                  <span className="stamp-button-copy"><b>{mysteryMatch && visited.includes(selectedExhibit.id) ? 'Confirm this stop' : visited.includes(selectedExhibit.id) ? 'Stamp collected' : 'Collect passport stamp'}</b><small>{visited.includes(selectedExhibit.id) ? `${visited.length} of ${exhibits.length} in your passport` : 'Add this booth to your passport'}</small></span>
                </button>
                {nextUp && (
                  <button className="next-stop" onClick={() => openExhibit(nextUp.exhibit)} style={{ '--accent': wings.find((wing) => wing.id === nextUp.exhibit.wingId)!.colour } as React.CSSProperties}>
                    <BoothArt id={nextUp.exhibit.id} className="next-stop-icon" />
                    <span className="next-stop-copy"><small>Next stop · Booth {boothNumber(nextUp.exhibit)} · {distanceLabel(nextUp.distance)}</small><b>{nextUp.exhibit.title}</b></span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="modal-map">
              <VenueMap key={selectedExhibit.id} compact focus={selectedExhibit.id} visited={visited} saved={saved} onOpen={openExhibit} />
            </div>
          </section>
        </div>
      )}

      {adminOpen ? <AdminPanel demo={demoBoard} onDemo={showDemoBoard} onTry={(id) => setPlaying({ id, demo: true })} onReset={resetProgress} onClose={() => setAdminOpen(false)}>{challengeSheet}</AdminPanel> : challengeSheet}

      {qrOpen && <QrStudio onClose={() => setQrOpen(false)} />}

      {quizOpen && <ExplorerQuiz onClose={() => setQuizOpen(false)} onChoose={(tourId) => { setQuizOpen(false); goToMap({ tourId }) }} />}

      {secretOpen && <CuratorSecret onClose={() => setSecretOpen(false)} />}

      {discovery && <aside className="explorer-notice" role="status" aria-live="polite"><Sparkles size={21} aria-hidden="true" /><div><strong>{discovery.title}</strong><p>{discovery.detail}</p></div><button aria-label="Dismiss discovery" onClick={() => setDiscovery(null)}><X size={14} /></button></aside>}

      {shareOpen && <ShareKit visited={visited} onClose={() => setShareOpen(false)} />}

      {celebration && <CelebrationOverlay celebration={celebration} onDone={() => setCelebration(null)} onShare={() => { setCelebration(null); openExhibit(null); setShareOpen(true) }} />}

      {ticketOpen && <TicketBooth onClose={() => setTicketOpen(false)} />}

      {reportOpen && <ExhibitReport journey={journey} results={results} found={found} demo={demoBoard} onClose={() => setReportOpen(false)} onOpen={openExhibit} />}

      {secretShown && <SecretReveal secret={secretShown.secret} found={found} isNew={secretShown.isNew} onClose={() => setSecretShown(null)} />}

      {scanOpen && <ScannerModal onClose={() => setScanOpen(false)} onScan={revealScannedExhibit} />}
    </div>
  )
}

export default App
