import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, Download, Pause, Play, RotateCcw, Share2, Trophy, X } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { challenges as boothChallenges, challengeKinds } from './challenges'
import { SecretArt, WingBadge } from './Collectibles'
import { boothNumber, exhibits, wings, type Exhibit } from './data'
import { explorerBadges, explorerTitle, type ExplorerJourney } from './explorer'
import { demoEntries, readPlayer, totalScore } from './scoring'
import { readStampTimes, secrets } from './secrets'
import { entrance, floors, nextStop, routePath, stopPoint, viewBox, walkLength } from './venue'
import './ExhibitReport.css'

type Props = { journey: ExplorerJourney; results: Record<string, number>; found: string[]; demo: boolean; onClose: () => void; onOpen: (exhibit: Exhibit) => void }

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const metresPerUnit = 1 / 22 // The plan is roughly 22 map units to a metre.

const personas: Record<string, { title: string; line: string }> = {
  strategy: { title: 'The Futurist', line: 'You came for what’s next, and you found it.' },
  customer: { title: 'The Customer Whisperer', line: 'Every exhibit, seen through a customer’s eyes.' },
  cyber: { title: 'The Guardian', line: 'You checked the locks before you looked at the art.' },
  engineering: { title: 'The Builder', line: 'You read the plaque, then asked how it was made.' },
  careers: { title: 'The Lifelong Learner', line: 'Every gallery was a chance to level up.' },
  community: { title: 'The Connector', line: 'You came for the people behind the exhibits.' },
}

const countLine = (count: number) =>
  count === exhibits.length ? 'Every. Single. Booth. The curators are slightly concerned.'
    : count >= 30 ? 'Practically part of the permanent collection.'
      : count >= 15 ? 'Serious museum energy.'
        : count >= 5 ? 'A proper wander. The curators approve.'
          : 'A tasteful sampler. Quality over quantity.'

const compare = (metres: number) =>
  metres < 150 ? { count: metres / 30, thing: 'blue whales, nose to tail' }
    : metres < 900 ? { count: metres / 50, thing: 'Olympic pools' }
      : { count: metres / 1149, thing: 'Sydney Harbour Bridges' }

const clock = (time: number) => new Date(time).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()

// Counts up to a number when a slide appears.
function useCount(target: number, delay = 350, duration = 1500) {
  const [value, setValue] = useState(() => (reduced() ? target : 0))
  useEffect(() => {
    if (reduced()) return
    let frame = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration))
      setValue(Math.round(target * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, delay, duration])
  return value
}

const Count = ({ value, delay }: { value: number; delay?: number }) => <>{useCount(value, delay).toLocaleString()}</>

// A Wrapped-style story of the visitor's day: tap through, hold to pause, download the summary at the end.
export function ExhibitReport({ journey, results, found, demo, onClose, onOpen }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hold = useRef<{ timer: number; held: boolean }>({ timer: 0, held: false })
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [busy, setBusy] = useState(false)
  const [autoplay] = useState(() => !reduced())

  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])

  // Everything the story needs, worked out once.
  const [report] = useState(() => {
    const visited = journey.visited.filter((id) => exhibits.some((exhibit) => exhibit.id === id))
    const name = (readPlayer()?.nickname || localStorage.getItem('techx26-name') || '').trim()
    const metres = Math.round(walkLength([entrance, ...visited]) * metresPerUnit / 5) * 5
    const byWing = wings.map((wing) => {
      const booths = exhibits.filter((exhibit) => exhibit.wingId === wing.id)
      return { wing, total: booths.length, got: booths.filter((exhibit) => visited.includes(exhibit.id)).length }
    })
    const top = [...byWing].sort((a, b) => b.got - a.got || b.got / b.total - a.got / a.total)[0]
    const times = readStampTimes()
    const stamped = visited.filter((id) => times[id]).map((id) => ({ id, time: times[id] })).sort((a, b) => a.time - b.time)
    const streak = stamped.reduce((best, { time }, start) => Math.max(best, stamped.slice(start).filter((item) => item.time - time <= 15 * 60000).length), 0)
    const played = Object.entries(results).filter(([id]) => boothChallenges[id])
    const best = [...played].sort((a, b) => b[1] - a[1])[0]
    const you = { name: name || 'You', you: true, visited, results, secrets: found }
    const points = totalScore(you)
    const field = demo ? [you, ...demoEntries()].sort((a, b) => totalScore(b) - totalScore(a)) : []
    const last = visited[visited.length - 1]
    return {
      visited, name, metres, byWing, top, stamped, streak, played, best, points,
      rank: field.length ? { place: field.indexOf(you) + 1, of: field.length } : undefined,
      perfect: played.filter(([, score]) => score >= 100).length,
      discoveries: explorerBadges(journey).filter((badge) => badge.unlocked).length,
      next: last ? nextStop(last, visited) : undefined,
      title: explorerTitle(visited).label,
    }
  })
  const { visited, name, metres, byWing, top, stamped, streak, played, best, points, rank, perfect, discoveries, next, title } = report
  const persona = personas[top.wing.id]
  const badgesEarned = byWing.filter((item) => item.got === item.total).length
  const compared = compare(metres)
  const firstStamp = stamped[0] && exhibits.find((exhibit) => exhibit.id === stamped[0].id)!
  const firstHour = stamped[0] ? new Date(stamped[0].time).getHours() : 0
  const bestExhibit = best && exhibits.find((exhibit) => exhibit.id === best[0])!

  const share = async (download: boolean) => {
    setBusy(true)
    dialogRef.current?.classList.add('capturing')
    try {
      const { toBlob } = await import('html-to-image')
      const blob = await toBlob(cardRef.current!, { pixelRatio: 3 })
      if (!blob) return
      const fileName = `techx26-exhibit-report${name ? `-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}.png`
      if (download) {
        const link = document.createElement('a')
        link.download = fileName
        link.href = URL.createObjectURL(blob)
        link.click()
        setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      } else {
        await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], text: `My TECHx26 exhibit report: ${visited.length} booths, ${points} points. #TECHx26` })
      }
    } catch {
      // The visitor closed the share sheet.
    } finally {
      dialogRef.current?.classList.remove('capturing')
      setBusy(false)
    }
  }
  const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] })

  const slides: { id: string; theme: string; duration?: number; body: ReactNode }[] = [
    {
      id: 'cover', theme: 'velvet', duration: 5000,
      body: <>
        <div className="report-curtains" aria-hidden="true"><i /><i /></div>
        <div className="report-spot" aria-hidden="true" />
        <p className="report-kicker">TECHx26 · Museum of Technology</p>
        <h2 className="report-cover-title">Your<br /><em>exhibit report</em></h2>
        <p className="report-hint">Tap to continue · Hold to pause</p>
      </>,
    },
  ]

  if (!visited.length) {
    slides.push({
      id: 'blank', theme: 'paper',
      body: <>
        <div className="report-frame" aria-hidden="true"><span>?</span></div>
        <h2>A blank canvas.</h2>
        <p className="report-line">No stamps yet. Every great museum started with an empty wall.</p>
        <button className="report-cta" onClick={() => { onClose(); document.getElementById('exhibits')?.scrollIntoView({ behavior: 'smooth' }) }}>Find my first booth <ArrowRight size={16} /></button>
      </>,
    })
  } else {
    slides.push(
      {
        id: 'count', theme: 'sunset',
        body: <>
          <div className="report-orbit" aria-hidden="true">
            {visited.slice(0, 16).map((id, order, list) => {
              const exhibit = exhibits.find((item) => item.id === id)!
              return <span key={id} style={{ '--a': `${(order / list.length) * 360}deg`, '--i': order, '--accent': wings.find((wing) => wing.id === exhibit.wingId)!.colour } as React.CSSProperties}><BoothArt id={id} /></span>
            })}
          </div>
          <p className="report-kicker">You stopped at</p>
          <p className="report-big"><Count value={visited.length} /></p>
          <p className="report-unit">booths <small>of {exhibits.length}</small></p>
          <p className="report-line">{countLine(visited.length)}</p>
        </>,
      },
      {
        id: 'walk', theme: 'night', duration: 7500,
        body: <>
          <p className="report-kicker">You walked about</p>
          <p className="report-big report-big-sm"><Count value={metres} /><small>m</small></p>
          <svg className="report-route" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} aria-hidden="true">
            {floors.map((floor) => (
              <g key={floor.area} transform={`translate(${floor.x} ${floor.y})`}>
                <polygon className="report-slab" points={floor.slab} />
                {floor.booths.map((spot) => <rect key={spot.id} className="report-booth" x={spot.x} y={spot.y} width={spot.w} height={spot.h} rx={6} style={{ '--booth': visited.includes(spot.id) ? wings.find((wing) => wing.id === exhibits.find((exhibit) => exhibit.id === spot.id)!.wingId)!.colour : undefined } as React.CSSProperties} />)}
              </g>
            ))}
            <path className="report-path" d={routePath([entrance, ...visited])} pathLength={1} />
            {visited.map((id, order) => <circle key={id} className="report-stop" cx={stopPoint(id).x} cy={stopPoint(id).y} r={16} style={{ '--t': `${0.9 + (order / visited.length) * 2.6}s` } as React.CSSProperties} />)}
          </svg>
          <p className="report-line">That’s roughly {Math.round(metres / 0.75).toLocaleString()} steps, or {compared.count < 1 ? compared.count.toFixed(1) : Math.round(compared.count * 10) / 10} {compared.thing}.</p>
        </>,
      },
      {
        id: 'persona', theme: 'wing',
        body: <>
          <p className="report-kicker">Your museum personality</p>
          <div className="report-persona-badge"><WingBadge wing={top.wing} got={top.got} total={top.total} /></div>
          <h2 className="report-persona">{persona.title}</h2>
          <p className="report-line">{persona.line}</p>
          <p className="report-chip">{top.got} of {top.total} booths in {top.wing.title}{top.got === top.total ? ' · Badge earned' : ` · ${top.total - top.got} more for the ${top.wing.badge} badge`}</p>
        </>,
      },
    )
    if (stamped.length > 1) {
      const span = stamped[stamped.length - 1].time - stamped[0].time
      slides.push({
        id: 'clock', theme: 'dawn',
        body: <>
          <div className="report-clock" aria-hidden="true"><i /><i /><span /></div>
          <p className="report-kicker">Your day by the clock</p>
          <h2>{firstHour < 11 ? 'Early bird.' : firstHour < 13 ? 'Right on time.' : 'Fashionably late.'}</h2>
          <p className="report-line">First stamp at <b>{clock(stamped[0].time)}</b> at {firstStamp.title}.</p>
          <div className="report-tiles">
            {streak >= 3 ? <div><b>{streak}</b><span>booths in 15 minutes. Speedrun energy.</span></div> : <div><b>{Math.max(1, Math.round(span / 60000 / (stamped.length - 1)))}</b><span>minutes per booth. You took your time.</span></div>}
            <div><b>{clock(stamped[stamped.length - 1].time)}</b><span>your latest stamp</span></div>
          </div>
        </>,
      })
    }
    slides.push(
      played.length ? {
        id: 'challenge', theme: 'gold',
        body: <>
          <p className="report-kicker">You took on</p>
          <p className="report-big"><Count value={played.length} /></p>
          <p className="report-unit">challenge{played.length === 1 ? '' : 's'}</p>
          <div className="report-best" style={{ '--accent': wings.find((wing) => wing.id === bestExhibit!.wingId)!.colour, '--score': best![1] / 100 } as React.CSSProperties}>
            <span className="report-meter"><b><Count value={best![1]} delay={900} /></b><small>pts</small></span>
            <span><small>Your finest moment</small><b>{boothChallenges[best![0]].title}</b><em>{challengeKinds[boothChallenges[best![0]].kind]} · {bestExhibit!.title}</em></span>
          </div>
          {perfect > 0 && <p className="report-chip">{perfect} perfect score{perfect === 1 ? '' : 's'}. Show-off.</p>}
        </>,
      } : {
        id: 'challenge', theme: 'gold',
        body: <>
          <p className="report-big report-big-sm">0</p>
          <p className="report-unit">challenges</p>
          <p className="report-line">The mini-games are waiting patiently in the corner. They’re very patient.</p>
        </>,
      },
      {
        id: 'cabinet', theme: 'cabinet',
        body: <>
          <p className="report-kicker">Your trophy cabinet</p>
          <div className="report-badges">{byWing.map(({ wing, got, total }, order) => <span key={wing.id} className={got === total ? 'earned' : ''} style={{ '--i': order } as React.CSSProperties}><WingBadge wing={wing} got={got} total={total} /><small>{got === total ? wing.badge : `${got}/${total}`}</small></span>)}</div>
          <div className="report-shelf">{secrets.map((secret, order) => <span key={secret.id} className={found.includes(secret.id) ? 'found' : ''} style={{ '--i': order } as React.CSSProperties}>{found.includes(secret.id) ? <SecretArt id={secret.id} /> : '?'}</span>)}</div>
          <p className="report-line">{[`${badgesEarned} of ${wings.length} wing badges`, `${found.length} of ${secrets.length} hidden exhibits`, discoveries && `${discoveries} secret discover${discoveries === 1 ? 'y' : 'ies'}`].filter(Boolean).join(' · ')}</p>
        </>,
      },
      {
        id: 'score', theme: 'sunset',
        body: <>
          <div className="report-confetti" aria-hidden="true">{Array.from({ length: 30 }, (_, order) => <i key={order} style={{ '--x': `${(order * 37) % 100}%`, '--t': `${(order % 10) * 0.12}s`, '--c': ['#ffd166', '#ffffff', '#ff9ac8', '#9fc8ff'][order % 4] } as React.CSSProperties} />)}</div>
          <Trophy className="report-trophy" aria-hidden="true" />
          <p className="report-kicker">Your final score</p>
          <p className="report-big"><Count value={points} /></p>
          <p className="report-unit">points</p>
          <p className="report-chip">{rank ? `#${rank.place} of ${rank.of} explorers` : `Explorer title: ${title}`}</p>
        </>,
      },
    )
  }

  slides.push({
    id: 'finale', theme: 'finale',
    body: <>
      <p className="report-kicker">That’s a wrap</p>
      <div className="report-card" ref={cardRef}>
        <header><span className="brand-mark">TECH<span>x</span>26</span><small>Exhibit report · 27 Nov 2026</small></header>
        <p className="report-card-name">{name || 'TECHx26 explorer'}</p>
        <p className="report-card-persona" style={{ '--accent': top.wing.colour } as React.CSSProperties}>{visited.length ? persona.title : 'Ready to explore'}</p>
        <dl>
          <div><dt>Booths</dt><dd>{visited.length}</dd></div>
          <div><dt>Metres</dt><dd>{metres.toLocaleString()}</dd></div>
          <div><dt>Challenges</dt><dd>{played.length}</dd></div>
          <div><dt>Points</dt><dd>{points.toLocaleString()}</dd></div>
        </dl>
        <div className="report-card-badges">{byWing.map(({ wing, got, total }) => <WingBadge key={wing.id} wing={wing} got={got} total={total} />)}</div>
        <div className="report-card-foot"><span>#TECHx26</span><span>Museum of Technology</span></div>
      </div>
      <div className="report-actions">
        <button className="report-cta" onClick={() => share(true)} disabled={busy}><Download size={16} /> Download</button>
        {canShare && <button className="report-cta ghost" onClick={() => share(false)} disabled={busy}><Share2 size={16} /> Share</button>}
        <button className="report-cta ghost" onClick={() => setIndex(0)} aria-label="Replay report"><RotateCcw size={16} /></button>
      </div>
      {next && <button className="report-next" onClick={() => { onClose(); onOpen(next.exhibit) }}><small>Still on your list</small><b>Booth {boothNumber(next.exhibit)} · {next.exhibit.title}</b><ArrowRight size={16} /></button>}
    </>,
  })

  const slide = slides[Math.min(index, slides.length - 1)]
  const go = (delta: number) => setIndex((current) => Math.min(slides.length - 1, Math.max(0, current + delta)))

  // Taps on the left go back, anywhere else goes forward, and holding pauses. Buttons keep their own clicks.
  const pointerDown = (event: React.PointerEvent) => {
    if ((event.target as Element).closest('button')) return
    hold.current.held = false
    hold.current.timer = window.setTimeout(() => { hold.current.held = true; setPaused(true) }, 220)
  }
  const pointerUp = (event: React.PointerEvent) => {
    if ((event.target as Element).closest('button')) return
    clearTimeout(hold.current.timer)
    if (hold.current.held) { setPaused(false); return }
    const box = event.currentTarget.getBoundingClientRect()
    go(event.clientX - box.left < box.width * 0.3 ? -1 : 1)
  }

  return (
    <dialog ref={dialogRef} className="exhibit-report" aria-label="Your exhibit report" onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }}>
      <div className="report-phone">
        <div className="report-progress" aria-hidden="true">
          {slides.map((item, order) => (
            <span key={item.id} className={order < index ? 'done' : ''}>
              {order === index && <i key={index} className={autoplay && order < slides.length - 1 ? (paused ? 'run paused' : 'run') : 'full'} style={{ animationDuration: `${slide.duration ?? 6500}ms` }} onAnimationEnd={() => go(1)} />}
            </span>
          ))}
        </div>
        <div className="report-top">
          <button onClick={() => setPaused(!paused)} aria-label={paused ? 'Play' : 'Pause'} hidden={!autoplay}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
          <button onClick={onClose} aria-label="Close report" autoFocus><X size={18} /></button>
        </div>
        <div key={slide.id} className={`report-slide theme-${slide.theme}`} style={{ '--accent': top.wing.colour } as React.CSSProperties} onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => clearTimeout(hold.current.timer)} onContextMenu={(event) => event.preventDefault()} aria-live="polite">
          {slide.body}
        </div>
        <div className="report-keys">
          <button onClick={() => go(-1)} disabled={index === 0} aria-label="Previous">‹</button>
          <span>{index + 1} / {slides.length}</span>
          <button onClick={() => go(1)} disabled={index === slides.length - 1} aria-label="Next">›</button>
        </div>
      </div>
    </dialog>
  )
}
