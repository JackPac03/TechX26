import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { checkNetwork, networkCheckEnabled } from './network'
import './EntranceCheck.css'

type Status = 'checking' | 'untrusted' | 'opening' | 'open'
const passedKey = 'techx26-network-ok'

// The whole site stays shut until the phone is on a trusted network. Once it passes, it stays open
// for the rest of the visit. Changing Wi-Fi in Settings and coming back checks again.
export function NetworkGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(() => !networkCheckEnabled || sessionStorage.getItem(passedKey) ? 'open' : 'checking')
  const [ip, setIp] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tries, setTries] = useState(0)

  // A failed lookup (null) lets people in, so a Cloudflare outage doesn't lock everyone out.
  const check = (wasUntrusted: boolean) => checkNetwork().then((result) => {
    setIp(result.ip)
    if (result.trusted === false) return setStatus('untrusted')
    sessionStorage.setItem(passedKey, '1')
    setStatus(wasUntrusted ? 'opening' : 'open')
  })
  const checkEvent = useEffectEvent(check)

  useEffect(() => {
    if (status === 'checking') checkEvent(false)
    if (status === 'opening') {
      const timer = setTimeout(() => setStatus('open'), 2400)
      return () => clearTimeout(timer)
    }
    if (status !== 'untrusted') return
    const onVisible = () => { if (document.visibilityState === 'visible') checkEvent(true) }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [status])

  if (status === 'open') return children
  const recheck = async () => {
    setBusy(true)
    await check(true)
    setBusy(false)
    setTries((count) => count + 1)
  }
  return <EntranceCheck status={status} busy={busy} ip={ip} tries={tries} onRecheck={recheck} />
}

function EntranceCheck({ status, busy, ip, tries, onRecheck }: { status: Exclude<Status, 'open'>; busy: boolean; ip: string | null; tries: number; onRecheck: () => void }) {
  const opening = status === 'opening'
  return (
    <main className={`entrance-gate${opening ? ' open' : ''}`}>
      <section className="entrance-check" aria-labelledby="entrance-title">
        <MuseumEntrance open={opening} />
        <div className="entrance-copy" aria-live="polite">
          {opening ? (
            <>
              <p className="kicker">Admission desk · Welcome</p>
              <h1 id="entrance-title">You’re in. The museum is open.</h1>
              <p className="entrance-lead">Your network checks out. Enjoy TECHx26.</p>
            </>
          ) : status === 'checking' ? (
            <>
              <p className="kicker">Admission desk</p>
              <h1 id="entrance-title">Checking your ticket…</h1>
              <p className="entrance-lead">TECHx26 opens on Westpac Wi-Fi. This only takes a moment.</p>
            </>
          ) : (
            <>
              <p className="kicker">Admission desk · Notice</p>
              <h1 id="entrance-title">The museum doesn’t open until you meet the entrance criteria.</h1>
              <p className="entrance-lead">Our doorman checked your network and it isn’t on the guest list. TECHx26 only opens on Westpac Wi-Fi.</p>
              <h2>Entrance criteria</h2>
              <ol className="entrance-criteria">
                <li><b>Join Westpac Wi-Fi.</b> Pick <code>Westpac_Free_WiFi</code>, or <code>mobile@wsmart</code> on a work phone.</li>
                <li><b>Turn off mobile data</b> so your phone doesn’t sneak out on 4G. Or turn off <span className="entrance-path">Wi-Fi Assist</span> at the bottom of Settings › Mobile.</li>
                <li><b>Turn off Private Relay or any VPN.</b> On iPhone: <span className="entrance-path">Settings › Wi-Fi › ⓘ</span> › Limit IP Address Tracking.</li>
              </ol>
              {tries > 0 && !busy && <p className="entrance-still" role="status">Still not on the list. Give the Wi-Fi a few seconds to connect, then try again.</p>}
              <div className="entrance-actions">
                <button className="button button-primary" onClick={onRecheck} disabled={busy}><RefreshCw size={16} className={busy ? 'spin' : ''} /> {busy ? 'Checking…' : 'Check again'}</button>
              </div>
              {ip && <p className="entrance-ip">Your network: {ip}</p>}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

// A museum front at night: a Wi-Fi sign flickers over shut doors, a velvet rope and a CLOSED sign.
function MuseumEntrance({ open }: { open: boolean }) {
  return (
    <div className="entrance-art" aria-hidden="true">
      <svg viewBox="0 0 320 340">
        <defs>
          <linearGradient id="entrance-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120814" /><stop offset="1" stopColor="#32123f" /></linearGradient>
          <linearGradient id="entrance-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3868" /><stop offset="1" stopColor="#3a2246" /></linearGradient>
          <radialGradient id="entrance-light" cx=".5" cy=".75" r=".8"><stop offset="0" stopColor="#ffe9b8" /><stop offset=".55" stopColor="#ffb6d9" /><stop offset="1" stopColor="#c31672" /></radialGradient>
          <linearGradient id="entrance-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a67a2c" /><stop offset=".5" stopColor="#f1d38a" /><stop offset="1" stopColor="#9c6f24" /></linearGradient>
        </defs>
        <rect width="320" height="340" fill="url(#entrance-sky)" />
        <g fill="#fff" className="entrance-stars">
          <circle cx="28" cy="30" r="1.2" /><circle cx="70" cy="58" r=".9" /><circle cx="262" cy="26" r="1.3" /><circle cx="292" cy="70" r=".9" /><circle cx="214" cy="44" r=".8" /><circle cx="118" cy="22" r=".8" />
        </g>
        {/* Pediment, frieze and columns */}
        <path d="M40 104 160 46l120 58Z" fill="url(#entrance-stone)" />
        <path d="M70 98 160 56l90 42Z" fill="#2c1836" />
        <rect x="34" y="104" width="252" height="16" rx="2" fill="#6b4679" />
        <text x="160" y="116" textAnchor="middle" className="entrance-frieze">MUSEUM OF TECHNOLOGY</text>
        {[52, 84, 214, 246].map((x) => <g key={x}><rect x={x} y="120" width="22" height="150" fill="url(#entrance-stone)" /><rect x={x - 3} y="120" width="28" height="7" fill="#6b4679" /><rect x={x - 3} y="263" width="28" height="7" fill="#6b4679" /><path d={`M${x + 6} 128v134M${x + 11} 128v134M${x + 16} 128v134`} stroke="#2c1836" strokeWidth="1.2" opacity=".55" /></g>)}
        {/* Doorway: warm light behind two doors */}
        <rect x="116" y="146" width="88" height="124" rx="44" ry="10" fill="#1a0c1f" />
        <path d="M116 270V160a44 14 0 0 1 88 0v110Z" fill="url(#entrance-light)" className="entrance-glow" />
        <g className="entrance-door left"><path d="M116 270V160a44 14 0 0 1 44-14v124Z" fill="#4a2a56" stroke="#24112b" strokeWidth="2" /><rect x="124" y="170" width="28" height="36" rx="3" fill="none" stroke="#2c1836" strokeWidth="2" /><rect x="124" y="214" width="28" height="44" rx="3" fill="none" stroke="#2c1836" strokeWidth="2" /><circle cx="154" cy="214" r="3" fill="url(#entrance-brass)" /></g>
        <g className="entrance-door right"><path d="M204 270V160a44 14 0 0 0-44-14v124Z" fill="#4a2a56" stroke="#24112b" strokeWidth="2" /><rect x="168" y="170" width="28" height="36" rx="3" fill="none" stroke="#2c1836" strokeWidth="2" /><rect x="168" y="214" width="28" height="44" rx="3" fill="none" stroke="#2c1836" strokeWidth="2" /><circle cx="166" cy="214" r="3" fill="url(#entrance-brass)" /></g>
        {/* Wi-Fi sign over the door */}
        <g className="entrance-wifi">
          <rect x="132" y="70" width="56" height="30" rx="6" fill="#12081a" stroke="#6b4679" strokeWidth="1.5" />
          <g fill="none" strokeLinecap="round" strokeWidth="3"><path d="M146 85a20 20 0 0 1 28 0" /><path d="M151 90a12 12 0 0 1 18 0" /></g>
          <circle cx="160" cy="95" r="2.4" />
        </g>
        {/* CLOSED / OPEN sign hanging on the doors */}
        <g className="entrance-sign">
          <path d="M148 168 160 156l12 12" fill="none" stroke="url(#entrance-brass)" strokeWidth="1.5" />
          <rect x="136" y="168" width="48" height="20" rx="4" fill="#f3f3ed" stroke="#c31672" strokeWidth="2" />
          <text x="160" y="182" textAnchor="middle" className="entrance-sign-text">{open ? 'OPEN' : 'CLOSED'}</text>
        </g>
        {/* Steps */}
        <rect x="24" y="270" width="272" height="10" fill="#6b4679" /><rect x="12" y="280" width="296" height="10" fill="#5a3868" /><rect x="0" y="290" width="320" height="50" fill="#2a1532" />
        {/* Stanchions and the velvet rope */}
        <g className="entrance-rope">
          <path d="M86 268q74 34 148 0" fill="none" stroke="#7d0d48" strokeWidth="7" strokeLinecap="round" />
          <path d="M86 266q74 34 148 0" fill="none" stroke="#c31672" strokeWidth="4" strokeLinecap="round" />
        </g>
        {[86, 234].map((x) => <g key={x}><rect x={x - 3} y="262" width="6" height="52" rx="2" fill="url(#entrance-brass)" /><circle cx={x} cy="261" r="6" fill="url(#entrance-brass)" /><ellipse cx={x} cy="316" rx="14" ry="4" fill="url(#entrance-brass)" /></g>)}
      </svg>
    </div>
  )
}
