import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Download } from 'lucide-react'
import { SecretArt } from './Collectibles'
import { siteUrl, wings } from './data'
import { ExplorerSticker } from './ExplorerSticker'
import { explorerTypes } from './explorerTypes'
import { useQrRows } from './qr'
import { secretPoints } from './scoring'
import { secrets } from './secrets'
import './Posters.css'

// Posters are laid out at A4 (210 × 297 mm at 96 px per inch) and exported at three times that size.
const width = 794
const height = 1123

// Extruded 3D lettering: a stack of hard shadows that shifts from the first colour to the second, then a soft one.
const extrude = (depth: number, from: string, to: string, soft = 'rgba(0,0,0,.45)') => ({
  textShadow: [...Array.from({ length: depth }, (_, step) => `${step + 1}px ${step + 1}px 0 color-mix(in srgb, ${to} ${Math.round((step / (depth - 1)) * 100)}%, ${from})`), `${depth + 6}px ${depth + 14}px 26px ${soft}`].join(', '),
})

function QrMark({ url }: { url: string }) {
  const rows = useQrRows(url)
  return rows ? (
    <svg className="poster-qr" viewBox={`-2 -2 ${rows.length + 4} ${rows.length + 4}`} role="img" aria-label="QR code to the TECHx26 museum guide" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={rows.length + 4} height={rows.length + 4} fill="#fff" />
      <path d={rows.flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : ''))).join('')} />
    </svg>
  ) : <span className="poster-qr" />
}

// A spotlit gallery: back-wall panels and a floor grid running to one vanishing point.
function Gallery({ horizon, glow }: { horizon: number; glow: string }) {
  const id = useId()
  const floor = height - horizon
  return (
    <svg className="poster-stage" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".3" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${id}-pool`}><stop offset="0" stopColor={glow} stopOpacity=".55" /><stop offset="1" stopColor={glow} stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={glow} stopOpacity="0" /><stop offset="1" stopColor={glow} stopOpacity=".5" /></linearGradient>
      </defs>
      {Array.from({ length: 9 }, (_, index) => <rect key={index} x={index * 100 - 3} y="0" width="1.5" height={horizon} fill="#fff" opacity=".05" />)}
      <g stroke={`url(#${id}-fade)`} strokeWidth="1.4">
        {Array.from({ length: 23 }, (_, index) => <line key={index} x1={width / 2} y1={horizon} x2={(index - 11) * 150 + width / 2} y2={height} />)}
        {Array.from({ length: 11 }, (_, index) => <line key={index} x1="0" x2={width} y1={horizon + floor * ((index + 1) / 11) ** 2} y2={horizon + floor * ((index + 1) / 11) ** 2} />)}
      </g>
      <polygon points={`210,0 250,0 470,${horizon + 230} 150,${horizon + 230}`} fill={`url(#${id}-beam)`} />
      <polygon points={`544,0 584,0 644,${horizon + 230} 324,${horizon + 230}`} fill={`url(#${id}-beam)`} />
      <ellipse cx={width / 2} cy={horizon + 250} rx="330" ry="70" fill={`url(#${id}-pool)`} />
    </svg>
  )
}

function WelcomePoster({ url }: { url: string }) {
  return (
    <div className="poster poster-welcome">
      <Gallery horizon={640} glow="#ff3d8b" />
      <div className="poster-x" aria-hidden="true"><i /><i /></div>
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>27 November 2026 · Kogarah</span></header>
      <div className="poster-title">
        <p className="poster-script">Welcome to the</p>
        <h2 className="poster-3d" style={extrude(16, '#ef1721', '#5b1aa0')}>MUSEUM</h2>
        <p className="poster-script poster-script-glow">of Technology</p>
      </div>
      <div className="poster-pedestal" aria-hidden="true"><i /></div>
      <div className="poster-plinth">
        <QrMark url={url} />
        <p><b>Scan to start your passport</b>The exhibit is you.</p>
      </div>
    </div>
  )
}

function ExplorerPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-explorer">
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Museum of Technology</span></header>
      <div className="poster-title">
        <p className="poster-script">What kind of</p>
        <h2 className="poster-3d" style={extrude(14, '#c31672', '#3b0d6b', 'rgba(60,10,70,.3)')}>EXPLORER</h2>
        <p className="poster-script">are you?</p>
      </div>
      <ul className="poster-stickers">
        {explorerTypes.map((type, index) => (
          <li key={type.id} style={{ '--tilt': `${[-7, 4, -3, 6, 5, -6, 3, -4, -5, 7, -2, 4][index % 12]}deg` } as CSSProperties}><ExplorerSticker type={type} /></li>
        ))}
      </ul>
      <div className="poster-band">
        <div className="poster-plinth poster-plinth-small"><QrMark url={url} /></div>
        <p><b>Take the quiz in the museum guide</b>Answer a few quick questions to meet your explorer type, then collect your sticker at the welcome desk.</p>
      </div>
    </div>
  )
}

function SecretPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-secret">
      <div className="poster-torch" aria-hidden="true" />
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Night shift at the museum</span></header>
      <div className="poster-secret-title">
        <span className="poster-3d poster-numeral" style={extrude(18, '#c6ff7a', '#1e5b2a', 'rgba(0,0,0,.7)')}>{secrets.length}</span>
        <h2>hidden exhibits are tucked around the museum.<em>Can you find them all?</em></h2>
      </div>
      <ul className="poster-cases">
        {secrets.map((secret, index) => (
          <li key={secret.id} className={index === 2 ? 'lit' : ''}>
            <span className="poster-case-glass"><SecretArt id={secret.id} /></span>
            <span className="poster-case-label">{index === 2 ? secret.era : '???'}</span>
          </li>
        ))}
      </ul>
      <p className="poster-secret-hint">Look high · Look low · Look closer</p>
      <div className="poster-band">
        <div className="poster-plinth poster-plinth-small"><QrMark url={url} /></div>
        <p><b>Find a secret QR code. Scan it. +{secretPoints} points.</b>Open the guide here to start your passport. Psst: switch the museum lights off for even more secrets.</p>
      </div>
    </div>
  )
}

const ticketPath = 'M22 0H588A22 22 0 0 1 610 22V610A30 30 0 0 0 610 670V858A22 22 0 0 1 588 880H22A22 22 0 0 1 0 858V670A30 30 0 0 0 0 610V22A22 22 0 0 1 22 0Z'

function TicketPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-ticket">
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Museum of Technology</span></header>
      <div className="admit admit-behind" aria-hidden="true"><svg className="admit-paper" viewBox="0 0 610 880"><path d={ticketPath} /></svg></div>
      <div className="admit">
        <svg className="admit-paper" viewBox="0 0 610 880" aria-hidden="true"><path d={ticketPath} /></svg>
        <div className="admit-main">
          <p className="admit-presents">TECHx26 presents</p>
          <h2 className="poster-3d" style={extrude(10, '#8a0a26', '#3b0618', 'rgba(60,10,30,.25)')}>ADMIT<br />ONE</h2>
          <p className="poster-script">to the Museum of Technology</p>
          <dl className="admit-details">
            <div><dt>Date</dt><dd>27 Nov 2026</dd></div>
            <div><dt>Venue</dt><dd>Kogarah</dd></div>
            <div><dt>Admission</dt><dd>Free</dd></div>
          </dl>
        </div>
        <div className="admit-stub">
          <div className="admit-qr"><QrMark url={url} /></div>
          <p><b>Scan to collect your passport</b>Keep this ticket. Every booth you visit adds a stamp.</p>
          <span className="admit-serial">No. 2026·1127</span>
        </div>
      </div>
    </div>
  )
}

function TouchPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-touch">
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Gallery rules</span></header>
      <div className="touch-sign">
        <div className="touch-plate">
          <s>Do not</s>
          <h2>Please touch the exhibits.</h2>
          <p>Ask questions. Press the buttons. Have a go.</p>
        </div>
      </div>
      <svg className="touch-rope" viewBox="0 0 794 330" aria-hidden="true">
        <defs>
          <linearGradient id="touch-brass" x1="0" x2="1"><stop offset="0" stopColor="#7a5a1c" /><stop offset=".35" stopColor="#f5d78a" /><stop offset=".6" stopColor="#c99a3b" /><stop offset="1" stopColor="#6d4f17" /></linearGradient>
          <linearGradient id="touch-velvet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0245e" /><stop offset=".5" stopColor="#9c0f3f" /><stop offset="1" stopColor="#5e0826" /></linearGradient>
        </defs>
        <ellipse cx="397" cy="312" rx="380" ry="14" fill="rgba(60,40,20,.18)" />
        {[96, 698].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="304" rx="54" ry="12" fill="url(#touch-brass)" />
            <rect x={x - 54} y="288" width="108" height="16" rx="8" fill="url(#touch-brass)" />
            <rect x={x - 9} y="70" width="18" height="222" fill="url(#touch-brass)" />
            <circle cx={x} cy="60" r="22" fill="url(#touch-brass)" />
          </g>
        ))}
        <path d="M108 86 C 260 250, 534 250, 686 86" fill="none" stroke="#3e0518" strokeWidth="30" strokeLinecap="round" opacity=".35" transform="translate(6 14)" />
        <path d="M108 86 C 260 250, 534 250, 686 86" fill="none" stroke="url(#touch-velvet)" strokeWidth="28" strokeLinecap="round" />
        <path d="M118 84 C 266 236, 528 236, 676 84" fill="none" stroke="#ff7aa5" strokeWidth="4" strokeLinecap="round" opacity=".45" />
      </svg>
      <div className="touch-label">
        <div className="touch-label-qr"><QrMark url={url} /></div>
        <div>
          <p className="touch-label-title"><b>You</b>, 2026</p>
          <p>Curiosity, coffee and a phone</p>
          <p className="touch-label-loan">On loan from your team</p>
          <p className="touch-label-cta">Scan to start your passport</p>
        </div>
      </div>
    </div>
  )
}

function FacadePoster({ url }: { url: string }) {
  const columns = [150, 236, 322, 432, 518, 604]
  return (
    <div className="poster poster-facade">
      <svg className="poster-stage" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          <linearGradient id="facade-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a0f45" /><stop offset=".45" stopColor="#8a1f73" /><stop offset=".8" stopColor="#ff6a5c" /></linearGradient>
          <linearGradient id="facade-column" x1="0" x2="1"><stop offset="0" stopColor="#d9cfd6" /><stop offset=".4" stopColor="#fff" /><stop offset="1" stopColor="#b9aab5" /></linearGradient>
          <linearGradient id="facade-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf6f8" /><stop offset="1" stopColor="#d8ccd3" /></linearGradient>
          <radialGradient id="facade-door"><stop offset="0" stopColor="#ffd98a" /><stop offset=".6" stopColor="#ff8a4c" /><stop offset="1" stopColor="#c31672" /></radialGradient>
          <radialGradient id="facade-sun"><stop offset="0" stopColor="#fff3c4" /><stop offset=".5" stopColor="#ffb36b" stopOpacity=".9" /><stop offset="1" stopColor="#ff6a5c" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#facade-sky)" />
        <circle cx="397" cy="560" r="300" fill="url(#facade-sun)" />
        {Array.from({ length: 40 }, (_, index) => <circle key={index} cx={(index * 197) % width} cy={(index * 71) % 330 + 20} r={index % 3 ? 1.2 : 2} fill="#fff" opacity={index % 4 ? .5 : .9} />)}
        <rect x="0" y="880" width={width} height="243" fill="#1d0b26" />
        <polygon points="96,480 397,352 698,480" fill="url(#facade-stone)" />
        <polygon points="132,468 397,368 662,468" fill="none" stroke="#c9b9c3" strokeWidth="3" />
        <text x="397" y="452" textAnchor="middle" fill="#7a2a64" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="22" letterSpacing="2">TECHx26</text>
        <rect x="86" y="480" width="622" height="58" fill="url(#facade-stone)" />
        <text x="397" y="519" textAnchor="middle" fill="#2a1430" fontFamily="'DM Mono', monospace" fontWeight="500" fontSize="21" letterSpacing="7">MUSEUM OF TECHNOLOGY</text>
        <rect x="100" y="538" width="594" height="14" fill="#c9b9c3" />
        <path d="M369 836V680a28 28 0 0 1 56 0V836z" fill="url(#facade-door)" />
        {columns.map((x) => (
          <g key={x}>
            <rect x={x - 6} y="552" width="52" height="14" fill="#efe7ec" />
            <rect x={x} y="566" width="40" height="258" fill="url(#facade-column)" />
            {[10, 20, 30].map((dx) => <line key={dx} x1={x + dx} x2={x + dx} y1="572" y2="818" stroke="#b9aab5" strokeWidth="1.4" opacity=".6" />)}
            <rect x={x - 6} y="824" width="52" height="12" fill="#efe7ec" />
          </g>
        ))}
        {[[279, '#c31672'], [561, '#9619df']].map(([x, colour]) => (
          <g key={x}>
            <path d={`M${Number(x) - 26} 566 h52 v150 l-26 -18 l-26 18 z`} fill={String(colour)} />
            <text x={Number(x)} y="640" textAnchor="middle" fill="#fff" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="40">×</text>
          </g>
        ))}
        <rect x="80" y="836" width="634" height="16" fill="#efe7ec" />
        <rect x="60" y="852" width="674" height="16" fill="#ddd2d8" />
        <rect x="40" y="868" width="714" height="16" fill="#c9bcc4" />
      </svg>
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>27 November 2026 · Kogarah</span></header>
      <div className="poster-title facade-title">
        <p className="poster-script">The doors open</p>
        <h2 className="poster-3d" style={extrude(14, '#ffd0a8', '#5b1aa0', 'rgba(20,0,30,.5)')}>27·11·26</h2>
      </div>
      <div className="poster-band">
        <div className="poster-plinth poster-plinth-small"><QrMark url={url} /></div>
        <p><b>Now open: the Museum of Technology</b>Scan to get your passport, then explore the booths and collect a stamp at each one.</p>
      </div>
    </div>
  )
}

function WayfindingPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-way">
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Museum of Technology</span></header>
      <div className="poster-title way-title">
        <p className="poster-script">Which way to</p>
        <h2 className="poster-3d" style={extrude(12, '#3b2a40', '#160c19', 'rgba(22,12,25,.25)')}>THE FUTURE?</h2>
      </div>
      <div className="way-post" aria-hidden="true" />
      <ul className="way-signs">
        {wings.map((wing, index) => (
          <li key={wing.id} className={index % 2 ? 'right' : 'left'} style={{ '--wing': wing.colour, '--tilt': `${[-2, 3, -3, 2, -1.5, 2.5][index]}deg` } as CSSProperties}>
            <span>{wing.number}</span>{wing.title}
          </li>
        ))}
      </ul>
      <div className="poster-band">
        <div className="poster-plinth poster-plinth-small"><QrMark url={url} /></div>
        <p><b>Every way. Pick a wing and start exploring.</b>Scan for the map, your passport and a stamp at every booth.</p>
      </div>
    </div>
  )
}

function TerminalPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-terminal">
      <div className="terminal-floor" aria-hidden="true" />
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Museum of Technology</span></header>
      <div className="poster-title terminal-title">
        <h2 className="poster-3d" style={extrude(12, '#ff4fa3', '#3b0d6b', 'rgba(0,0,0,.5)')}>PRESS<br />START</h2>
      </div>
      <div className="terminal">
        <div className="terminal-screen">
          <p>TECHx26 BIOS v27.11</p>
          <p>&gt; LOAD MUSEUM.EXE</p>
          <p>LOADING <span className="terminal-bar">██████████░</span> 99%</p>
          <p>&gt; EXHIBITS FOUND: ALL OF THEM</p>
          <p>&gt; VISITOR DETECTED: YOU</p>
          <p className="terminal-blink">&gt; SCAN TO BEGIN<i /></p>
        </div>
        <span className="terminal-badge">TECHx 2600</span>
      </div>
      <div className="terminal-stand" aria-hidden="true"><i /></div>
      <div className="terminal-note">
        <QrMark url={url} />
        <p>Scan me!</p>
      </div>
      <p className="terminal-caption">Scan to start your passport</p>
    </div>
  )
}

function ExhibitXPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-exhibit">
      <Gallery horizon={760} glow="#9619df" />
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Now showing</span></header>
      <div className="exhibit-title">
        <p>Museum of Technology · 2026</p>
        <h2>Exhibit <span>X</span></h2>
      </div>
      <div className="exhibit-x" aria-hidden="true"><i /><i /></div>
      <div className="exhibit-plinth">
        <div className="exhibit-plaque">
          <div className="exhibit-plaque-qr"><QrMark url={url} /></div>
          <p><b>The Future</b><i>2026 · Mixed media</i>Scan to start your passport</p>
        </div>
      </div>
    </div>
  )
}

function LanyardPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-lanyard">
      <svg className="poster-stage" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          <linearGradient id="lanyard-strap" x1="0" x2="1"><stop offset="0" stopColor="#8a0f5a" /><stop offset=".5" stopColor="#d4147a" /><stop offset="1" stopColor="#8a0f5a" /></linearGradient>
          <path id="lanyard-left" d="M250 -20 L380 330" />
          <path id="lanyard-right" d="M544 -20 L414 330" />
        </defs>
        <path d="M250 -20 L380 330" stroke="url(#lanyard-strap)" strokeWidth="44" />
        <path d="M544 -20 L414 330" stroke="url(#lanyard-strap)" strokeWidth="44" />
        {['left', 'right'].map((side) => (
          <text key={side} fill="#ffd0e6" fontFamily="'DM Mono', monospace" fontSize="15" fontWeight="500" letterSpacing="4" dy="5"><textPath href={`#lanyard-${side}`}>TECHx26 · TECHx26 · TECHx26 ·</textPath></text>
        ))}
        <rect x="372" y="318" width="50" height="34" rx="6" fill="#c9c2cf" />
        <rect x="384" y="350" width="26" height="40" rx="4" fill="#9a93a0" />
      </svg>
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>27 November 2026</span></header>
      <div className="lanyard-badge">
        <div className="lanyard-head"><span>All access</span><b>MUSEUM OF TECHNOLOGY</b></div>
        <div className="lanyard-body">
          <div className="lanyard-photo" aria-hidden="true"><i /></div>
          <dl>
            <div><dt>Name</dt><dd>You</dd></div>
            <div><dt>Role</dt><dd>Explorer</dd></div>
            <div><dt>Access</dt><dd>Every wing</dd></div>
          </dl>
        </div>
        <div className="lanyard-scan">
          <div className="lanyard-qr"><QrMark url={url} /></div>
          <p><b>Scan to activate your pass</b>Your passport, the map and every booth challenge.</p>
        </div>
        <span className="lanyard-holo" aria-hidden="true" />
      </div>
    </div>
  )
}

function NeonPoster({ url }: { url: string }) {
  return (
    <div className="poster poster-neon">
      <svg className="poster-stage" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          <pattern id="neon-bricks" width="96" height="64" patternUnits="userSpaceOnUse">
            <rect width="96" height="64" fill="#1c0b14" />
            <rect x="2" y="2" width="92" height="28" rx="2" fill="#4a1a26" />
            <rect x="-46" y="34" width="92" height="28" rx="2" fill="#43172a" />
            <rect x="50" y="34" width="92" height="28" rx="2" fill="#4d1c2a" />
          </pattern>
          <radialGradient id="neon-glow" cx="50%" cy="38%" r="60%"><stop offset="0" stopColor="#ff4fa3" stopOpacity=".28" /><stop offset=".5" stopColor="#5a2bd6" stopOpacity=".12" /><stop offset="1" stopColor="#000" stopOpacity=".7" /></radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#neon-bricks)" />
        <rect width={width} height={height} fill="url(#neon-glow)" />
      </svg>
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Kogarah · 27.11.26</span></header>
      <div className="neon-sign">
        <p className="neon-script">Welcome to the</p>
        <h2 className="neon-pink">MUSEUM</h2>
        <p className="neon-open">OPEN</p>
      </div>
      <div className="neon-chains" aria-hidden="true"><i /><i /></div>
      <div className="neon-hanger">
        <div className="neon-qr"><QrMark url={url} /></div>
        <p><b>Come on in</b>Scan to start your passport</p>
      </div>
    </div>
  )
}

const timeline = [
  { year: '1971', text: 'The first email is sent' },
  { year: '1983', text: 'The first handheld mobile phone goes on sale' },
  { year: '1991', text: 'The World Wide Web goes public' },
  { year: '2007', text: 'Smartphones go mainstream' },
]

function TimelinePoster({ url }: { url: string }) {
  return (
    <div className="poster poster-timeline">
      <header className="poster-top"><span className="poster-mark">TECH<span>x</span>26</span><span>Museum of Technology</span></header>
      <div className="poster-title timeline-title">
        <p className="poster-script">A very short history of</p>
        <h2 className="poster-3d" style={extrude(14, '#2fd2c8', '#0b3a5a', 'rgba(0,0,0,.6)')}>TECH</h2>
      </div>
      <ol className="timeline-rail">
        {timeline.map((item, index) => (
          <li key={item.year} className={index % 2 ? 'right' : 'left'}><b>{item.year}</b>{item.text}</li>
        ))}
        <li className="timeline-now"><b>2026</b>You, at TECHx26</li>
      </ol>
      <div className="poster-band">
        <div className="poster-plinth poster-plinth-small"><QrMark url={url} /></div>
        <p><b>The next chapter starts here.</b>Scan for your passport and explore what’s next at every booth.</p>
      </div>
    </div>
  )
}

const posters = [
  { id: 'welcome', name: 'Welcome to the Museum', note: 'For the entrance and lifts', Poster: WelcomePoster },
  { id: 'explorer', name: 'What kind of explorer?', note: 'Next to the welcome desk', Poster: ExplorerPoster },
  { id: 'secrets', name: 'Hidden exhibits', note: 'Around the venue', Poster: SecretPoster },
  { id: 'ticket', name: 'Admit one', note: 'For the lifts and noticeboards', Poster: TicketPoster },
  { id: 'touch', name: 'Please touch', note: 'For booths and doorways', Poster: TouchPoster },
  { id: 'facade', name: 'Now open', note: 'For the run-up to the day', Poster: FacadePoster },
  { id: 'wayfinding', name: 'Which way?', note: 'For corridors and junctions', Poster: WayfindingPoster },
  { id: 'terminal', name: 'Press start', note: 'For the tech-loving crowd', Poster: TerminalPoster },
  { id: 'exhibit-x', name: 'Exhibit X', note: 'For the main hall', Poster: ExhibitXPoster },
  { id: 'lanyard', name: 'All access', note: 'For desks and kitchens', Poster: LanyardPoster },
  { id: 'neon', name: 'Neon open', note: 'For doors and entrances', Poster: NeonPoster },
  { id: 'timeline', name: 'Tech timeline', note: 'For corridors', Poster: TimelinePoster },
]

// A poster drawn at full A4 size and scaled to fit its frame.
function PosterFrame({ id, scale, posterRef }: { id: string; scale: number; posterRef?: React.Ref<HTMLDivElement> }) {
  const { Poster } = posters.find((poster) => poster.id === id)!
  return (
    <div className="poster-frame" style={{ width: width * scale, height: height * scale }}>
      <div className="poster-scale" ref={posterRef} style={{ transform: `scale(${scale})` }}><Poster url={siteUrl()} /></div>
    </div>
  )
}

// Admin → Print shop: posters for around the venue, each with a QR code to the guide.
export function PosterStudio() {
  const [selected, setSelected] = useState(posters[0].id)
  const [busy, setBusy] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)
  const [previewWidth, setPreviewWidth] = useState(420)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setPreviewWidth(Math.min(entry.contentRect.width, 520, Math.max(280, ((window.innerHeight - 300) * width) / height))))
    observer.observe(previewRef.current!)
    return () => observer.disconnect()
  }, [])

  const download = async () => {
    const node = posterRef.current?.firstElementChild as HTMLElement | null
    if (!node) return
    setBusy(true)
    try {
      await document.fonts.ready
      const { toPng } = await import('html-to-image')
      const link = document.createElement('a')
      link.download = `techx26-poster-${selected}.png`
      link.href = await toPng(node, { width, height, pixelRatio: 3 })
      link.click()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="poster-studio">
      <div className="poster-picker" role="radiogroup" aria-label="Poster">
        {posters.map((poster) => (
          <button key={poster.id} role="radio" aria-checked={selected === poster.id} className={selected === poster.id ? 'active' : ''} onClick={() => setSelected(poster.id)}>
            <PosterFrame id={poster.id} scale={0.14} />
            <span><b>{poster.name}</b><small>{poster.note}</small></span>
          </button>
        ))}
      </div>
      <div className="poster-preview" ref={previewRef}>
        <PosterFrame id={selected} scale={previewWidth / width} posterRef={posterRef} />
        <div className="poster-actions">
          <button className="admin-reset poster-download" onClick={download} disabled={busy}><Download size={15} /> {busy ? 'Preparing…' : 'Download PNG'}</button>
          <small>A4, print quality (2382 × 3369 px). The QR code opens the museum guide.</small>
        </div>
      </div>
    </div>
  )
}
