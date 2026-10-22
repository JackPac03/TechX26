import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Info, Minus, Plus } from 'lucide-react'
import { exhibits, wings, type Area, type Exhibit } from './data'
import { back, floors, front, link, routePath, spotFor, stopPoint, viewBox, type Box } from './venue'

type Hover = { kind: 'booth'; id: string } | { kind: 'place'; floor: Area; index: number }

const percent = (value: number, start: number, size: number) => `${((value - start) / size) * 100}%`

function wrap(text: string, width: number, height: number) {
  let result = { lines: [text], size: 9 }
  for (const size of [12, 11, 10, 9]) {
    const max = Math.max(1, Math.floor(width / (size * 0.6)))
    const lines: string[] = []
    for (const word of text.split(' ')) {
      const last = lines[lines.length - 1]
      if (last && `${last} ${word}`.length <= max) lines[lines.length - 1] = `${last} ${word}`
      else lines.push(word)
    }
    result = { lines, size }
    if (lines.length * size * 1.18 <= height && lines.every((line) => line.length <= max)) break
  }
  return result
}

function Label({ text, box, vertical }: { text: string; box: Box; vertical?: boolean }) {
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const { lines, size } = vertical ? wrap(text, box.h - 10, box.w - 4) : wrap(text, box.w - 12, box.h - 4)
  const lineHeight = size * 1.18
  return (
    <text x={cx} y={cy} fontSize={size} transform={vertical ? `rotate(90 ${cx} ${cy})` : undefined}>
      {lines.map((line, index) => <tspan key={index} x={cx} y={cy + (index - (lines.length - 1) / 2) * lineHeight} dy="0.35em">{line}</tspan>)}
    </text>
  )
}

const Stairs = ({ x, y, w, h }: Box) => (
  <g className="map-stairs">
    <rect x={x} y={y} width={w} height={h} />
    {Array.from({ length: 6 }, (_, index) => <line key={index} x1={x} x2={x + w} y1={y + ((index + 1) * h) / 7} y2={y + ((index + 1) * h) / 7} />)}
  </g>
)

const Room = ({ x, y, w, h }: Box) => (
  <g className="map-room">
    <rect x={x} y={y} width={w} height={h} />
  </g>
)

function FrontDetails() {
  return (
    <>
      <text className="map-room-label" x={148} y={442}>AT.03</text>
      <text className="map-room-label" x={148} y={582}>AT.02</text>
      <text className="map-room-label" x={148} y={644}>AT.01</text>
      <text className="map-room-label" x={499} y={221}>AT.04</text>
      <Room x={250} y={273} w={290} h={207} />
      <Room x={264} y={278} w={256} h={129} />
      <line className="map-wall-thin" x1={264} y1={350} x2={520} y2={350} />
      <Stairs x={395} y={278} w={46} h={15} />
      <Stairs x={297} y={334} w={60} h={32} />
      <Stairs x={297} y={390} w={60} h={33} />
      <Stairs x={297} y={453} w={60} h={32} />
      <Room x={341} y={612} w={232} h={292} />
      <Room x={359} y={618} w={195} h={121} />
      <Stairs x={335} y={662} w={30} h={32} />
      <g className="map-void">
        <rect x={366} y={774} width={193} height={103} />
        <line x1={366} y1={774} x2={559} y2={877} />
        <line x1={559} y1={774} x2={366} y2={877} />
      </g>
      <path className="map-bridge" d="M171 717 H341" />
      {[215, 232, 249, 266, 283, 300].map((x) => <rect key={x} className="map-bollard" x={x - 2.5} y={703} width={5} height={28} rx={2.5} />)}
      <text className="map-detail-label" x={257.5} y={694}>TURNSTILES</text>
      <g className="map-room">
        {[328, 382, 436].map((y) => <rect key={y} x={562} y={y} width={28} height={28} />)}
        <path className="map-room-shape" d="M123 910 148 935 V987 L123 1012 M58 1016 79 1037 99 1017" />
        {[495, 551, 607, 663, 719].map((y) => <path key={y} className="map-room-shape" d={`M720 ${y} h20 v51 h-20Z m0 0 20 25.5 -20 25.5`} />)}
      </g>
      <g className="map-doors">
        <path d="M720 456 H735 A15 15 0 0 1 720 471 M720 474 H735 A15 15 0 0 0 720 489 M720 750 H704 A16 16 0 0 1 720 734 M720 773 H704 A16 16 0 0 1 720 757 M720 796 H704 A16 16 0 0 1 720 780" />
      </g>
      <path className="map-door-concierge" d="M112 755 A34 34 0 1 1 112 817" />
      <text className="map-floor-title" x={25} y={47}>KOGARAH <tspan>FRONT</tspan></text>
    </>
  )
}

function BackDetails() {
  return (
    <>
      <rect className="map-lounge" x={62} y={118} width={172} height={455} />
      <Room x={72} y={423} w={64} h={139} />
      <Room x={151} y={423} w={64} h={139} />
      <Room x={656} y={131} w={196} h={99} />
      <Room x={656} y={264} w={196} h={98} />
      <path className="map-room-shape" d="M721 131 V230 M786 131 V230 M656 181 H852 M721 264 V362 M786 264 V362 M656 313 H852" />
      <Room x={453} y={128} w={54} h={73} />
      <Room x={525} y={128} w={54} h={73} />
      <path className="map-room-shape" d="M466 375 H490 V496 L521 551 501 573 466 510Z M520 331 H544 V470 H520Z" />
      <Room x={465} y={608} w={73} h={169} />
      <Room x={462} y={777} w={76} h={72} />
      <Room x={538} y={777} w={70} h={72} />
      {[
        ['G.04', 350, 122], ['CR G.04', 455, 122], ['CR G.03', 519, 122], ['CR G.05', 498, 303],
        ['G.07', 216, 384], ['G.08', 216, 489], ['G.09', 424, 656], ['G.10', 262, 765],
        ['G.11', 354, 765], ['CR G.06', 477, 600], ['G.12', 466, 817], ['G.13', 603, 817],
      ].map(([label, x, y]) => <text key={label} className="map-room-label" x={x} y={y}>{label}</text>)}
      <rect className="map-low-wall" x={253} y={925} width={416} height={30} />
      <text className="map-room-label centred" x={461} y={949}>LOW RAISED WALL</text>
      <text className="map-floor-title" x={20} y={42}>KOGARAH <tspan>BACK</tspan></text>
    </>
  )
}

// `compact` is the zoomed-in map inside a booth popup; `focus` highlights and centres one booth;
// `route` draws a tour through booths; `panel` sits under the map heading and wing filters.
type Props = { visited: string[]; saved: string[]; onOpen: (exhibit: Exhibit) => void; compact?: boolean; focus?: string; route?: string[]; routeColour?: string; panel?: ReactNode }

export function VenueMap({ visited, saved, onOpen, compact, focus, route, routeColour, panel }: Props) {
  const [hover, setHover] = useState<Hover | null>(null)
  const [pinnedWing, setPinnedWing] = useState<string | null>(null)
  const [hoverWing, setHoverWing] = useState<string | null>(null)
  const [zoom, setZoom] = useState(() => compact ? (window.innerWidth <= 900 ? 1.5 : 2) : 1)
  const viewportRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null)
  const wingFocus = hoverWing ?? pinnedWing

  // Centre the focused booth: instantly on open, then glide between tour stops.
  // Uses layout sizes so a popup's entrance transform doesn't skew it.
  const openedFocused = useRef(Boolean(focus))
  useEffect(() => {
    const viewport = viewportRef.current
    const canvas = viewport?.firstElementChild as HTMLElement | null
    const target = focus ? spotFor(focus) : undefined
    if (!viewport || !canvas || !target) return
    const { floor, spot } = target
    const glide = !openedFocused.current && !matchMedia('(prefers-reduced-motion: reduce)').matches
    openedFocused.current = false
    viewport.scrollTo({
      left: (floor.x + spot.x + spot.w / 2 - viewBox.x) / viewBox.w * canvas.offsetWidth - viewport.clientWidth / 2,
      top: (floor.y + spot.y + spot.h / 2 - viewBox.y) / viewBox.h * canvas.offsetHeight - viewport.clientHeight / 2,
      behavior: glide ? 'smooth' : 'auto',
    })
  }, [focus])

  const tourPath = route ? routePath(route) : ''

  let tooltip: { x: number; y: number; colour: string; meta: string; title: string; detail: string } | null = null
  if (hover?.kind === 'booth') {
    const exhibit = exhibits.find((item) => item.id === hover.id)!
    const wing = wings.find((item) => item.id === exhibit.wingId)!
    const { floor, spot } = spotFor(hover.id)!
    tooltip = {
      x: floor.x + spot.x + spot.w / 2,
      y: floor.y + spot.y - 8,
      colour: wing.colour,
      meta: `Booth ${String(exhibit.booth).padStart(2, '0')} · ${wing.title}`,
      title: exhibit.title,
      detail: exhibit.partners.length ? `With ${exhibit.partners.join(' · ')}` : 'Select to open the booth',
    }
  } else if (hover?.kind === 'place') {
    const floor = floors.find((item) => item.area === hover.floor)!
    const place = floor.places[hover.index]
    tooltip = { x: floor.x + place.x + place.w / 2, y: floor.y + place.y - 4, colour: '#ffffff', meta: floor.area, title: place.name, detail: place.zone ? 'Zone' : 'Venue space' }
  }

  const open = (exhibit: Exhibit) => {
    if (drag.current?.moved) return
    onOpen(exhibit)
  }

  const zoomTo = (next: number) => {
    const viewport = viewportRef.current
    const level = Math.min(3, Math.max(1, next))
    if (!viewport) return setZoom(level)
    const ratio = level / zoom
    const centreX = viewport.scrollLeft + viewport.clientWidth / 2
    const centreY = viewport.scrollTop + viewport.clientHeight / 2
    setZoom(level)
    requestAnimationFrame(() => {
      viewport.scrollLeft = centreX * ratio - viewport.clientWidth / 2
      viewport.scrollTop = centreY * ratio - viewport.clientHeight / 2
    })
  }

  // Start narrow, scrollable maps at Back's top-left, without claiming a location.
  useEffect(() => {
    const viewport = viewportRef.current
    if (viewport && !compact) viewport.scrollLeft = viewport.scrollWidth * back.x / viewBox.w
  }, [compact])

  return (
    <div className={`venue-map${zoom > 1 ? ' zoomed' : ''}${compact ? ' compact' : ''}`}>
      {!compact && <div className="map-head">
        <p className="kicker light">Venue map · Kogarah</p>
        <h2>Find your way<br />to wonder.</h2>
        <p>One level, two areas and {exhibits.length} booths. Select any booth to see its story.</p>
        <div className="map-wings" role="group" aria-label="Highlight a wing on the map">
          {wings.map((wing) => (
            <button
              key={wing.id}
              className={pinnedWing === wing.id ? 'active' : ''}
              style={{ '--accent': wing.colour } as React.CSSProperties}
              onMouseEnter={() => setHoverWing(wing.id)}
              onMouseLeave={() => setHoverWing(null)}
              onClick={() => setPinnedWing(pinnedWing === wing.id ? null : wing.id)}
              aria-pressed={pinnedWing === wing.id}
            >
              <i />{wing.title}<span>{exhibits.filter((exhibit) => exhibit.wingId === wing.id).length}</span>
            </button>
          ))}
        </div>
        {panel}
      </div>}

      <div className="map-zoom" role="group" aria-label="Map zoom">
        <button onClick={() => zoomTo(zoom - 0.5)} disabled={zoom <= 1} aria-label="Zoom out"><Minus size={16} /></button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => zoomTo(zoom + 0.5)} disabled={zoom >= 3} aria-label="Zoom in"><Plus size={16} /></button>
      </div>

      <div
        className="map-viewport"
        ref={viewportRef}
        onPointerDown={(event) => {
          if (event.pointerType !== 'mouse' || !viewportRef.current) return
          drag.current = { x: event.clientX, y: event.clientY, left: viewportRef.current.scrollLeft, top: viewportRef.current.scrollTop, moved: false }
        }}
        onPointerMove={(event) => {
          const start = drag.current
          const viewport = viewportRef.current
          if (!start || !viewport || event.buttons !== 1) return
          const dx = event.clientX - start.x
          const dy = event.clientY - start.y
          if (Math.abs(dx) + Math.abs(dy) > 5) start.moved = true
          viewport.scrollLeft = start.left - dx
          viewport.scrollTop = start.top - dy
        }}
        onPointerUp={() => setTimeout(() => { drag.current = null })}
        onPointerLeave={() => { drag.current = null; setHover(null) }}
      >
        <div className="map-canvas" style={{ '--zoom': zoom } as React.CSSProperties}>
          <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} className={wingFocus ? 'has-focus' : ''} role="group" aria-label="Interactive floor map of Kogarah Front and Kogarah Back">
            <defs>
              <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" /></pattern>
            </defs>
            {floors.map((floor) => <polygon key={floor.area} className="map-slab" points={floor.slab} transform={`translate(${floor.x} ${floor.y})`} />)}
            <rect className="map-grid" x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} />
            {floors.map((floor) => (
              <g key={floor.area} transform={`translate(${floor.x} ${floor.y})`}>
                {floor === front ? <FrontDetails /> : <BackDetails />}
                {floor.walls.map((points) => <polyline key={points} className="map-wall" points={points} />)}
                {floor.thick.map((points) => <polyline key={points} className="map-wall thick" points={points} />)}
              </g>
            ))}
            {link.walls.map((points) => <polyline key={points} className="map-wall" points={points} />)}
            {floors.map((floor) => (
              <g key={floor.area} transform={`translate(${floor.x} ${floor.y})`}>
                {floor.places.map((place, index) => (
                  <g key={`${place.name}-${index}`} className={place.zone ? 'map-place zone' : 'map-place'} onMouseEnter={() => setHover({ kind: 'place', floor: floor.area, index })} onMouseLeave={() => setHover(null)}>
                    {place.outline ? <path d={place.outline} /> : <rect x={place.x} y={place.y} width={place.w} height={place.h} rx={place.zone ? 0 : 6} />}
                    {place.zone ? <text className="zone-label" x={place.labelAt?.[0] ?? place.x + 10} y={place.labelAt?.[1] ?? place.y - 8}>{place.name.toUpperCase()}</text> : <Label text={place.name} box={place} />}
                  </g>
                ))}
                {floor.landmarks.map(({ x, y, icon: Icon, label, side }) => (
                  <g key={`${x}-${y}`} className="map-landmark">
                    <circle cx={x} cy={y} r={14} />
                    <Icon x={x - 8} y={y - 8} width={16} height={16} strokeWidth={2.2} />
                    {label && (
                      <text
                        x={side === 'left' ? x - 22 : x + 22}
                        y={y}
                        dy="0.35em"
                        textAnchor={side === 'left' ? 'end' : 'start'}
                      >{label.toUpperCase()}</text>
                    )}
                  </g>
                ))}
                {floor.booths.map((spot) => {
                  const exhibit = exhibits.find((item) => item.id === spot.id)!
                  const wing = wings.find((item) => item.id === exhibit.wingId)!
                  const isActive = hover?.kind === 'booth' && hover.id === exhibit.id
                  const classes = ['map-booth', isActive && 'active', focus === exhibit.id && 'focused', wingFocus && wingFocus !== wing.id && 'dim', wingFocus === wing.id && 'match', route && !route.includes(exhibit.id) && 'off-route'].filter(Boolean).join(' ')
                  return (
                    <g
                      key={spot.id}
                      data-booth={spot.id}
                      className={classes}
                      style={{ '--accent': wing.colour } as React.CSSProperties}
                      role="button"
                      tabIndex={0}
                      aria-label={`Booth ${exhibit.booth}, ${exhibit.title}`}
                      onMouseEnter={() => setHover({ kind: 'booth', id: exhibit.id })}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover({ kind: 'booth', id: exhibit.id })}
                      onBlur={() => setHover(null)}
                      onClick={() => open(exhibit)}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(exhibit) } }}
                    >
                      {focus === exhibit.id && <rect className="focus-ring" x={spot.x - 6} y={spot.y - 6} width={spot.w + 12} height={spot.h + 12} rx={10} />}
                      <rect className="tile" x={spot.x} y={spot.y} width={spot.w} height={spot.h} rx={6} />
                      <Label text={exhibit.title} box={spot} vertical={spot.vertical} />
                      <g className="booth-number">
                        <circle cx={spot.x} cy={spot.y} r={9} />
                        <text x={spot.x} y={spot.y} dy="0.35em">{exhibit.booth}</text>
                      </g>
                      {route?.includes(exhibit.id) ? null : visited.includes(exhibit.id) ? (
                        <g className="booth-visited"><circle cx={spot.x + spot.w} cy={spot.y} r={7} /><path d={`M${spot.x + spot.w - 3} ${spot.y} l2 2.4 4-4.6`} /></g>
                      ) : saved.includes(exhibit.id) && <circle className="booth-saved" cx={spot.x + spot.w} cy={spot.y} r={4.5} />}
                    </g>
                  )
                })}
              </g>
            ))}
            {route && (
              <g key={route.join()} className="map-route" style={{ '--route': routeColour } as React.CSSProperties}>
                <path className="map-route-line" d={tourPath} pathLength={1} />
                <path className="map-route-flow" d={tourPath} />
                {route.map((id, index) => {
                  const { x, y } = stopPoint(id)
                  return (
                    <g key={id} className={['map-stop', focus === id && 'current', visited.includes(id) && 'done'].filter(Boolean).join(' ')} style={{ '--n': index } as React.CSSProperties}>
                      <circle cx={x} cy={y} r={13} />
                      <text x={x} y={y} dy="0.35em">{visited.includes(id) ? '✓' : index + 1}</text>
                    </g>
                  )
                })}
              </g>
            )}
          </svg>
          {tooltip && (
            <div className="map-tooltip" style={{ left: percent(tooltip.x, viewBox.x, viewBox.w), top: percent(tooltip.y, viewBox.y, viewBox.h), '--accent': tooltip.colour } as React.CSSProperties}>
              <small>{tooltip.meta}</small>
              <strong>{tooltip.title}</strong>
              <span>{tooltip.detail}</span>
            </div>
          )}
        </div>
      </div>


      {!compact && <aside className="map-key" aria-label="Map key">
        <p className="kicker light">Map key</p>
        <ul>
          <li><span className="key-landmark"><Info size={12} /></span>Landmark</li>
          <li><span className="key-wall" />Wall</li>
          <li><span className="key-booth">13</span>Booth number</li>
          <li><span className="key-visited" />Visited ({visited.length})</li>
          <li><span className="key-saved" />Saved ({saved.length})</li>
        </ul>
      </aside>}
    </div>
  )
}
