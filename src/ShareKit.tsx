import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Download, ImagePlus, RotateCcw, Share2, Trash2, X } from 'lucide-react'
import { WingBadge } from './Collectibles'
import { exhibits, wings } from './data'
import { explorerTitle } from './explorer'

const formats = {
  post: { label: 'LinkedIn post', size: '1080 × 1350', width: 1080, height: 1350, pixelRatio: 1, headline: 'I explored the', emphasis: 'Museum of Technology.' },
  certificate: { label: 'Certificate', size: 'A4 landscape', width: 1600, height: 1131, pixelRatio: 2, headline: 'Certificate of', emphasis: 'Exploration' },
  banner: { label: 'LinkedIn banner', size: '1584 × 396', width: 1584, height: 396, pixelRatio: 1, headline: 'Explorer of', emphasis: 'the possible.' },
}
type Format = keyof typeof formats

// Classic keeps each format's original look; the rest apply to every format.
const backgrounds = {
  classic: { label: 'Classic', swatch: 'linear-gradient(135deg, #1d0d28 50%, white 50%)' },
  midnight: { label: 'Midnight', css: 'radial-gradient(circle at 80% 18%, #4a1450 0, #1d0d28 45%, #100913 80%)', dark: true, accent: '#ff5a6e' },
  daylight: { label: 'Daylight', css: '#ffffff', dark: false, accent: '#c31672' },
  blush: { label: 'Blush', css: 'linear-gradient(160deg, #fff6f8, #fbdde9)', dark: false, accent: '#c31672' },
  sunset: { label: 'Sunset', css: 'linear-gradient(150deg, #ef1721, #c31672 50%, #6f2b91)', dark: true, accent: '#ffd1dc', em: 'linear-gradient(90deg, #ffffff, #ffd1dc)', brand: 'linear-gradient(180deg, #ffffff, #ffd1dc)' },
  ocean: { label: 'Ocean', css: 'linear-gradient(160deg, #081a33, #0f3b66 55%, #137f86)', dark: true, accent: '#7ff5e0', em: 'linear-gradient(90deg, #7ff5e0, #9fc8ff)' },
}
type Background = keyof typeof backgrounds
const accents = ['#ef1721', '#c31672', '#9619df', '#4f7cff', '#1fbfa6', '#ff7a3d', '#ffd166']

const parts = { date: 'Date', name: 'Name', explorer: 'Explorer title', photo: 'Photo', stats: 'Stats', favourite: 'Favourite', stamps: 'Wing badges', ribbons: 'Ribbons', footer: 'Footer' }
type Part = keyof typeof parts

type Design = {
  background: Background | string
  accent: string
  headline: string
  emphasis: string
  message: string
  hashtags: string
  featured: string
  photo: string
  hidden: Part[]
}
const blank: Design = { background: 'classic', accent: 'auto', headline: '', emphasis: '', message: '', hashtags: '', featured: '', photo: '', hidden: [] }
const storageKey = 'techx26-share'

const WingIcon = ({ id }: { id: string }) => <span className="share-icon" aria-hidden="true"><span className={`wing-art art-${id}`}><i /><i /><i /></span></span>

const isDark = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16))
  return r * 0.299 + g * 0.587 + b * 0.114 < 150
}

// Square-crops and shrinks an uploaded photo so it fits comfortably in localStorage.
const loadPhoto = (file: File) => new Promise<string>((resolve, reject) => {
  const image = new Image()
  image.onload = () => {
    const size = Math.min(image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 480
    canvas.getContext('2d')!.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 480, 480)
    URL.revokeObjectURL(image.src)
    resolve(canvas.toDataURL('image/jpeg', 0.86))
  }
  image.onerror = reject
  image.src = URL.createObjectURL(file)
})

function Section({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="share-section" open={open}>
      <summary>{title}</summary>
      <div className="share-section-body">{children}</div>
    </details>
  )
}

// Downloadable explorer cards for LinkedIn, built from the visitor's passport and their own design choices.
export function ShareKit({ visited, onClose }: { visited: string[]; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('post')
  const [name, setName] = useState(() => localStorage.getItem('techx26-name') ?? '')
  const [design, setDesign] = useState<Design>(() => {
    try {
      return { ...blank, ...JSON.parse(localStorage.getItem(storageKey) ?? '{}') }
    } catch {
      return blank
    }
  })
  const [frame, setFrame] = useState({ width: 0, maxHeight: Infinity })
  const [busy, setBusy] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const spec = formats[format]

  useEffect(() => {
    const element = frameRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setFrame({ width: entry.contentRect.width, maxHeight: matchMedia('(max-width: 760px)').matches ? innerHeight * 0.36 : Infinity }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(design))
    } catch {
      // Storage is full; the design still works for this visit.
    }
  }, [design])

  const update = (changes: Partial<Design>) => setDesign((current) => ({ ...current, ...changes }))
  const shows = (part: Part) => !design.hidden.includes(part) && (part !== 'photo' || Boolean(design.photo))
  const toggle = (part: Part) => update({ hidden: design.hidden.includes(part) ? design.hidden.filter((item) => item !== part) : [...design.hidden, part] })

  const progress = wings.map((wing) => {
    const booths = exhibits.filter((exhibit) => exhibit.wingId === wing.id)
    return { wing, total: booths.length, got: booths.filter((exhibit) => visited.includes(exhibit.id)).length }
  })
  const wingsDone = progress.filter((item) => item.got === item.total).length
  const favouriteWing = [...progress].sort((a, b) => b.got / b.total - a.got / a.total)[0]
  const featured = exhibits.find((exhibit) => exhibit.id === design.featured)
  const favourite = featured
    ? { label: 'Favourite booth', title: featured.title, wing: wings.find((wing) => wing.id === featured.wingId)! }
    : favouriteWing.got > 0 ? { label: 'Favourite wing', title: favouriteWing.wing.title, wing: favouriteWing.wing } : undefined
  const displayName = name.trim()
  const headline = design.headline.trim() || spec.headline
  const emphasis = design.emphasis.trim() || spec.emphasis
  const message = design.message.trim()
  const hashtags = design.hashtags.trim() || '#TECHx26'
  const fileName = `techx26-${format}${displayName ? `-${displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}.png`

  // Theme variables for the card.
  const preset = design.background in backgrounds ? backgrounds[design.background as Background] : undefined
  const dark = preset && 'dark' in preset ? preset.dark : preset ? format !== 'certificate' : isDark(design.background)
  const custom = design.accent !== 'auto'
  const theme = {
    '--card-ink': dark ? '#ffffff' : '#160c19',
    ...(preset && 'css' in preset ? { '--card-bg': preset.css } : !preset ? { '--card-bg': design.background } : {}),
    '--card-accent': custom ? design.accent : preset && 'accent' in preset ? preset.accent : dark ? '#ff5a6e' : '#c31672',
    ...(preset && 'brand' in preset ? { '--card-brand': preset.brand } : {}),
    ...(custom ? { '--card-em': `linear-gradient(90deg, ${design.accent}, color-mix(in srgb, ${design.accent} 55%, ${dark ? 'white' : '#160c19'}))` } : preset && 'em' in preset ? { '--card-em': preset.em } : {}),
  } as React.CSSProperties
  const scale = frame.width ? Math.min(frame.width / spec.width, frame.maxHeight / spec.height) : 0

  const updateName = (value: string) => {
    setName(value)
    localStorage.setItem('techx26-name', value)
  }

  const render = async () => {
    const { toBlob } = await import('html-to-image')
    return toBlob(cardRef.current!, { width: spec.width, height: spec.height, pixelRatio: spec.pixelRatio, style: { transform: 'none', left: '0', top: '0' } })
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
      if (blob) await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], text: `I explored the TECHx26 Museum of Technology. ${hashtags}` })
    } catch {
      // The visitor closed the share sheet.
    } finally {
      setBusy(false)
    }
  }

  const stamps = shows('stamps') && (
    <div className="share-wings">
      {progress.map(({ wing, total, got }) => (
        <div key={wing.id} className={got ? 'on' : ''} style={{ '--accent': wing.colour } as React.CSSProperties}>
          {got === total ? <WingBadge wing={wing} got={got} total={total} className="share-badge" /> : <WingIcon id={wing.id} />}
          <b>{got}/{total}</b>
          <small>{got === total ? wing.badge : wing.shortTitle}</small>
        </div>
      ))}
    </div>
  )
  const photo = shows('photo') && <img className="share-photo" src={design.photo} alt="" />
  const ribbons = shows('ribbons') && <div className="share-ribbons" aria-hidden="true"><i /><i /></div>
  const explorer = shows('explorer') && <p className="share-explorer">{explorerTitle(visited).label}</p>

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="share-kit" role="dialog" aria-modal="true" aria-labelledby="share-kit-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close share kit"><X /></button>
        <div className="share-intro">
          <p className="kicker">Share your journey</p>
          <h2 id="share-kit-title">Show off your explorer pass.</h2>
          <p>Make it yours, then download a card for LinkedIn or a certificate to keep. It updates with every stamp you collect.</p>
        </div>

        <div className="share-preview" ref={frameRef} style={{ height: spec.height * scale }}>
          <div ref={cardRef} className={`share-card share-${format}${headline.length + emphasis.length > 36 ? ' long' : ''}`} style={{ ...theme, width: spec.width, height: spec.height, left: (frame.width - spec.width * scale) / 2, transform: `scale(${scale})` }}>
            {format === 'post' && (
              <>
                {ribbons}
                <header><span className="brand-mark">TECH<span>x</span>26</span><small>Museum of Technology</small></header>
                {shows('date') && <p className="share-kicker">Explorer pass · 27 November 2026</p>}
                <h2>{headline}<br /><em>{emphasis}</em></h2>
                {(shows('name') || photo) && <div className="share-person">{photo}{shows('name') && <p className="share-name">{displayName || 'TECHx26 explorer'}</p>}</div>}
                {explorer}
                {message && <p className="share-message">{message}</p>}
                <div className="share-spacer" />
                {shows('stats') && (
                  <div className="share-stats">
                    <div><strong>{visited.length}</strong><span>of {exhibits.length} booths</span></div>
                    <div><strong>{wingsDone}</strong><span>of {wings.length} wings complete</span></div>
                  </div>
                )}
                {shows('favourite') && favourite && <p className="share-favourite" style={{ '--accent': favourite.wing.colour } as React.CSSProperties}><WingIcon id={favourite.wing.id} /><span><small>{favourite.label}</small>{favourite.title}</span></p>}
                {stamps}
                {shows('footer') && <footer><span>{hashtags}</span><span>Westpac Technology</span></footer>}
              </>
            )}
            {format === 'certificate' && (
              <>
                <span className="brand-mark">TECH<span>x</span>26</span>
                <p className="share-kicker">Museum of Technology</p>
                <h2>{headline} <em>{emphasis}</em></h2>
                <p className="share-lead">This certifies that</p>
                <div className="share-person">{photo}<p className="share-name">{(shows('name') && displayName) || 'Your name'}</p></div>
                {explorer}
                <p className="share-lead">
                  {shows('stats') ? <>explored {visited.length} of {exhibits.length} exhibits{wingsDone ? ` and completed ${wingsDone} of ${wings.length} wings` : ''} at</> : 'explored'} the TECHx26 Museum of Technology.
                  {shows('favourite') && favourite && <> {favourite.label}: <b>{favourite.title}</b>.</>}
                </p>
                {message && <p className="share-message">“{message}”</p>}
                {stamps}
                {shows('footer') && (
                  <footer>
                    <div><strong>{shows('date') ? '27 November 2026' : hashtags}</strong><small>{shows('date') ? 'Date' : 'Event'}</small></div>
                    <div><strong className="share-signature">TECHx26</strong><small>Curator, Museum of Technology</small></div>
                  </footer>
                )}
              </>
            )}
            {format === 'banner' && (
              <>
                {ribbons}
                <div className="share-banner-copy">
                  <span className="brand-mark">TECH<span>x</span>26</span>
                  <h2>{headline} <em>{emphasis}</em></h2>
                  {explorer}
                  {message && <p className="share-message">{message}</p>}
                  <p>{[shows('name') && displayName, shows('stats') && `${visited.length} booths`, shows('stats') && `${wingsDone} wings`, shows('favourite') && favourite?.title, shows('date') && '27 Nov 2026', shows('footer') && hashtags].filter(Boolean).join(' · ') || 'Museum of Technology'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="share-controls">
          <div className="share-formats" role="group" aria-label="Format">
            {(Object.keys(formats) as Format[]).map((key) => (
              <button key={key} className={key === format ? 'active' : ''} aria-pressed={key === format} onClick={() => setFormat(key)}>{formats[key].label}<small>{formats[key].size}</small></button>
            ))}
          </div>
          <label className="share-field">
            <span>Your name</span>
            <input value={name} onChange={(event) => updateName(event.target.value)} placeholder="e.g. Jack Hodges" maxLength={40} autoComplete="name" />
          </label>

          <Section title="Colours" open>
            <span className="share-label">Background</span>
            <div className="share-swatches" role="group" aria-label="Background">
              {(Object.entries(backgrounds) as [Background, (typeof backgrounds)[Background]][]).map(([key, option]) => (
                <button key={key} className={design.background === key ? 'active' : ''} aria-pressed={design.background === key} aria-label={option.label} title={option.label} style={{ background: 'swatch' in option ? option.swatch : option.css }} onClick={() => update({ background: key })} />
              ))}
              <label className={`share-picker${design.background in backgrounds ? '' : ' active'}`} title="Custom background">
                <input type="color" aria-label="Custom background colour" value={design.background in backgrounds ? '#2a1236' : design.background} onChange={(event) => update({ background: event.target.value })} />
              </label>
            </div>
            <span className="share-label">Accent</span>
            <div className="share-swatches" role="group" aria-label="Accent">
              <button className={`share-auto${custom ? '' : ' active'}`} aria-pressed={!custom} onClick={() => update({ accent: 'auto' })}>Auto</button>
              {accents.map((colour) => (
                <button key={colour} className={design.accent === colour ? 'active' : ''} aria-pressed={design.accent === colour} aria-label={`Accent ${colour}`} style={{ background: colour }} onClick={() => update({ accent: colour })} />
              ))}
              <label className={`share-picker${custom && !accents.includes(design.accent) ? ' active' : ''}`} title="Custom accent">
                <input type="color" aria-label="Custom accent colour" value={custom ? design.accent : '#ef1721'} onChange={(event) => update({ accent: event.target.value })} />
              </label>
            </div>
          </Section>

          <Section title="Show or hide">
            <div className="share-toggles" role="group" aria-label="Show or hide">
              {(Object.keys(parts) as Part[]).filter((part) => part !== 'photo' || design.photo).map((part) => (
                <button key={part} className={design.hidden.includes(part) ? '' : 'on'} aria-pressed={!design.hidden.includes(part)} onClick={() => toggle(part)}>{parts[part]}</button>
              ))}
            </div>
          </Section>

          <Section title="Add your own">
            <div className="share-photo-field">
              {design.photo ? <img src={design.photo} alt="Your photo" /> : <span><ImagePlus size={20} /></span>}
              <label className="button button-dark">
                <ImagePlus size={16} /> {design.photo ? 'Change photo' : 'Add a photo'}
                <input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) update({ photo: await loadPhoto(file), hidden: design.hidden.filter((item) => item !== 'photo') }); event.target.value = '' }} />
              </label>
              {design.photo && <button className="share-remove" onClick={() => update({ photo: '' })} aria-label="Remove photo"><Trash2 size={16} /></button>}
            </div>
            <label className="share-field"><span>Headline</span><input value={design.headline} onChange={(event) => update({ headline: event.target.value })} placeholder={spec.headline} maxLength={40} /></label>
            <label className="share-field"><span>Highlighted words</span><input value={design.emphasis} onChange={(event) => update({ emphasis: event.target.value })} placeholder={spec.emphasis} maxLength={40} /></label>
            <label className="share-field"><span>Your message</span><input value={design.message} onChange={(event) => update({ message: event.target.value })} placeholder="e.g. Loved the AI booths!" maxLength={90} /></label>
            <label className="share-field"><span>Hashtags</span><input value={design.hashtags} onChange={(event) => update({ hashtags: event.target.value })} placeholder="#TECHx26" maxLength={60} /></label>
            <label className="share-field">
              <span>Favourite booth</span>
              <select value={design.featured} onChange={(event) => update({ featured: event.target.value })}>
                <option value="">Automatic (your top wing)</option>
                {exhibits.map((exhibit) => <option key={exhibit.id} value={exhibit.id}>{exhibit.title}</option>)}
              </select>
            </label>
          </Section>

          <button className="share-reset" onClick={() => setDesign({ ...blank, photo: design.photo })}><RotateCcw size={14} /> Reset design</button>
          <div className="share-actions">
            <button className="button button-primary" onClick={download} disabled={busy}><Download size={17} /> Download PNG</button>
            {canShare && <button className="button button-dark" onClick={share} disabled={busy}><Share2 size={17} /> Share</button>}
          </div>
        </div>
      </section>
    </div>
  )
}
