import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Download, KeyRound, Printer, X } from 'lucide-react'
import type { EncodeHintType } from '@zxing/library'
import { boothNumber, exhibits, exhibitUrl, wings } from './data'
import { secretPoints } from './scoring'
import { secrets, secretUrl } from './secrets'

const booths = [...exhibits].sort((a, b) => a.booth - b.booth)
// Booth posters first, then the secret posters for hidden exhibits.
const items = [...booths.map((exhibit) => ({ key: exhibit.id, exhibit, secret: undefined })), ...secrets.map((secret) => ({ key: `secret-${secret.id}`, exhibit: undefined, secret }))]

// Printable booth poster with a QR code that deep-links to the booth.
export function QrStudio({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const posterRef = useRef<HTMLElement>(null)
  const [qr, setQr] = useState<{ url: string; rows: boolean[][] } | null>(null)
  const { exhibit, secret } = items[index]
  const wing = exhibit && wings.find((item) => item.id === exhibit.wingId)!
  const url = exhibit ? exhibitUrl(exhibit.id) : secretUrl(secret!)
  const rows = qr?.url === url ? qr.rows : null

  useEffect(() => {
    let current = true
    import('@zxing/library').then(({ BarcodeFormat, EncodeHintType, QRCodeWriter }) => {
      const hints = new Map<EncodeHintType, unknown>([[EncodeHintType.MARGIN, 0], [EncodeHintType.ERROR_CORRECTION, 'M']])
      const bits = new QRCodeWriter().encode(url, BarcodeFormat.QR_CODE, 0, 0, hints)
      const matrix = Array.from({ length: bits.getHeight() }, (_, y) => Array.from({ length: bits.getWidth() }, (_, x) => bits.get(x, y)))
      if (current) setQr({ url, rows: matrix })
    })
    return () => { current = false }
  }, [url])

  const step = (delta: number) => setIndex((index + delta + items.length) % items.length)

  // Save the poster exactly as rendered, at print-friendly resolution.
  const downloadPng = async () => {
    if (!posterRef.current) return
    const { toPng } = await import('html-to-image')
    const link = document.createElement('a')
    link.download = exhibit ? `techx26-booth-${boothNumber(exhibit)}-${exhibit.id}.png` : `techx26-hidden-${secret!.id}.png`
    link.href = await toPng(posterRef.current, { pixelRatio: 4, backgroundColor: '#ffffff', style: { boxShadow: 'none' } })
    link.click()
  }

  return (
    <div className="modal-backdrop qr-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="qr-studio" role="dialog" aria-modal="true" aria-labelledby="qr-studio-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close QR codes"><X /></button>
        <div className="qr-controls">
          <p className="kicker">Booth QR codes</p>
          <h2 id="qr-studio-title">Print a booth poster.</h2>
          <p>Choose a booth to generate its poster. Scanning the code opens the booth and collects its passport stamp. Hidden exhibit posters are at the end of the list.</p>
          <label htmlFor="qr-booth">Booth</label>
          <div className="qr-picker">
            <button onClick={() => step(-1)} aria-label="Previous booth"><ArrowLeft size={17} /></button>
            <select id="qr-booth" value={items[index].key} onChange={(event) => setIndex(items.findIndex((item) => item.key === event.target.value))}>
              {wings.map((group) => (
                <optgroup key={group.id} label={group.title}>
                  {booths.filter((item) => item.wingId === group.id).map((item) => <option key={item.id} value={item.id}>{boothNumber(item)} · {item.title}</option>)}
                </optgroup>
              ))}
              <optgroup label="Hidden exhibits">
                {secrets.map((item) => <option key={item.id} value={`secret-${item.id}`}>{item.title} · {item.place}</option>)}
              </optgroup>
            </select>
            <button onClick={() => step(1)} aria-label="Next booth"><ArrowRight size={17} /></button>
          </div>
          <div className="qr-actions">
            <button className="button button-primary" onClick={() => window.print()}><Printer size={17} /> Print or save PDF</button>
            <button className="button button-dark" onClick={downloadPng} disabled={!rows}><Download size={17} /> Download PNG</button>
          </div>
        </div>

        <article className={secret ? 'qr-poster qr-poster-secret' : 'qr-poster'} ref={posterRef} style={{ '--accent': wing?.colour ?? '#c31672' } as React.CSSProperties}>
          <div className="qr-poster-top">
            <span className="brand-mark">TECH<span>x</span>26</span>
            <span className="qr-poster-code"><small>{exhibit ? 'Booth code' : 'Hidden exhibit'}</small>{exhibit ? boothNumber(exhibit) : '???'}</span>
          </div>
          <div className="qr-poster-wing">
            <span className="qr-poster-icon" aria-hidden="true">{wing ? <span className={`wing-art art-${wing.id}`}><i /><i /><i /></span> : <KeyRound />}</span>
            <span>{wing ? wing.title : 'Museum of Technology'}</span>
          </div>
          <h3>{exhibit ? exhibit.title : 'Something is hidden here.'}</h3>
          <p className="qr-poster-partners">{exhibit ? (exhibit.partners.length ? `With ${exhibit.partners.join(' · ')}` : 'Westpac team') : 'You found a secret exhibit.'}</p>
          <div className="qr-code">
            {rows ? (
              <svg viewBox={`0 0 ${rows.length} ${rows.length}`} role="img" aria-label={`QR code for ${exhibit ? exhibit.title : 'a hidden exhibit'}`} shapeRendering="crispEdges">
                <path d={rows.flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : ''))).join('')} />
              </svg>
            ) : <span>Generating…</span>}
          </div>
          <p className="qr-poster-cta">{exhibit ? 'Scan to reveal the story and collect your passport stamp.' : `Scan to reveal it and earn ${secretPoints} bonus points.`}</p>
        </article>
      </section>
    </div>
  )
}
