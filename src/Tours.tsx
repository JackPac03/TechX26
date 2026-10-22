import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, KeyRound, Pause, Play, X } from 'lucide-react'
import { boothNumber, exhibits, tours, type Exhibit } from './data'
import { VenueMap } from './VenueMap'

type Props = { visited: string[]; saved: string[]; onOpen: (exhibit: Exhibit) => void; initialTourId?: string; initialHintId?: string }

// The venue map with curated tours: picking one draws its route, then the map follows each stop.
export function TourMap({ visited, saved, onOpen, initialTourId, initialHintId }: Props) {
  const [tourId, setTourId] = useState<string | null>(initialTourId ?? null)
  const [hintId, setHintId] = useState<string | undefined>(initialHintId)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const stopsRef = useRef<HTMLOListElement>(null)
  const tour = tours.find((item) => item.id === tourId)
  const hint = exhibits.find((item) => item.id === hintId)
  const stops = tour ? tour.stops.map((id) => exhibits.find((exhibit) => exhibit.id === id)!) : []
  const stop = stops[step]
  const last = stops.length - 1

  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(() => {
      if (step < last) setStep(step + 1)
      else setPlaying(false)
    }, 2600)
    return () => clearTimeout(timer)
  }, [playing, step, last])

  // Keep the current stop visible in the stop strip.
  useEffect(() => {
    const strip = stopsRef.current
    const pill = strip?.querySelector<HTMLElement>('[aria-current]')
    if (strip && pill) strip.scrollTo({ left: pill.offsetLeft - strip.clientWidth / 2 + pill.offsetWidth / 2, behavior: 'smooth' })
  }, [step, tourId])

  // On phones the map sits below the tour panel, so bring the controls and map into view.
  useEffect(() => {
    const current = stopsRef.current?.closest('.tour-current')
    if (!tourId || !current || !matchMedia('(max-width: 900px)').matches) return
    window.scrollTo({ top: current.getBoundingClientRect().top + window.scrollY - 76, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [tourId])

  const choose = (id: string | null) => {
    setTourId(id)
    setHintId(undefined)
    setStep(0)
    setPlaying(Boolean(id))
  }

  const go = (index: number) => {
    setPlaying(false)
    setStep(index)
  }

  const play = () => {
    if (playing) return setPlaying(false)
    if (step === last) setStep(0)
    setPlaying(true)
  }

  const panel = (
    <div className="tour-panel" id="tours" style={tour ? { '--accent': tour.colour } as React.CSSProperties : undefined}>
      <div className="tour-panel-head">
        <p className="kicker light">Curated tours</p>
        {tour && <button className="tour-end" onClick={() => choose(null)}>End tour <X size={14} /></button>}
      </div>
      {hint && <div className="tour-mystery-hint"><KeyRound size={21} aria-hidden="true" /><div><small>Your mystery trail hint</small><strong>{hint.title}</strong><p>Booth {boothNumber(hint)} · {hint.area}. Follow the highlighted booth on the map.</p></div><button onClick={() => onOpen(hint)}>Open booth <ArrowRight size={14} /></button><button className="tour-hint-close" onClick={() => setHintId(undefined)} aria-label="Clear mystery hint"><X size={15} /></button></div>}
      <div className="tour-picker" role="group" aria-label="Choose a tour">
        {tours.map((item) => (
          <button key={item.id} className={item.id === tourId ? 'tour-option active' : 'tour-option'} style={{ '--accent': item.colour } as React.CSSProperties} aria-pressed={item.id === tourId} onClick={() => choose(item.id === tourId ? null : item.id)}>
            <small><i />{item.audience}</small>
            <strong>{item.title}</strong>
            <span>{item.stops.length} stops · {item.minutes} min</span>
          </button>
        ))}
      </div>
      {tour && stop && (
        <div className="tour-current">
          <p className="tour-description">{tour.description}</p>
          <div className="tour-now" aria-live="polite">
            <small>Stop {step + 1} of {stops.length} · {stops.filter((item) => visited.includes(item.id)).length} stamped</small>
            <strong>{stop.title}</strong>
          </div>
          <div className="tour-buttons">
            <button onClick={() => go(step - 1)} disabled={step === 0} aria-label="Previous stop"><ArrowLeft size={18} /></button>
            <button className="tour-play" onClick={play}>{playing ? <><Pause size={17} /> Pause</> : <><Play size={17} /> {step === last ? 'Replay' : 'Play'}</>}</button>
            <button onClick={() => go(step + 1)} disabled={step === last} aria-label="Next stop"><ArrowRight size={18} /></button>
            <button className="tour-open" onClick={() => onOpen(stop)}>Open booth</button>
          </div>
          <ol className="tour-stops" ref={stopsRef}>
            {stops.map((item, index) => (
              <li key={item.id}>
                <button className={[index === step && 'active', visited.includes(item.id) && 'done'].filter(Boolean).join(' ')} onClick={() => go(index)} aria-current={index === step ? 'step' : undefined}>
                  <span>{visited.includes(item.id) ? <Check size={13} /> : index + 1}</span>{item.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )

  return <VenueMap visited={visited} saved={saved} onOpen={onOpen} focus={stop?.id ?? hint?.id} route={tour?.stops} routeColour={tour?.colour} panel={panel} />
}
