import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CalendarDays, Check, Gamepad2, LayoutDashboard, Play, Printer, QrCode, RotateCcw, Trophy, X } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { challenges, type Challenge } from './challenges'
import { boothNumber, eventDate, exhibits, wings } from './data'
import { SecretArt } from './Collectibles'
import { ExplorerPrintKit } from './ExplorerSticker'
import { explorerTypes } from './explorerTypes'
import { PosterStudio } from './PosterStudio'
import { secrets, secretUrl } from './secrets'
import { syncEnabled } from './sync'

const kinds: Record<Challenge['kind'], { name: string; detail: string }> = {
  quiz: { name: 'Quiz', detail: 'Three multiple-choice questions. Pass with two right.' },
  code: { name: 'Find out', detail: 'After a chat, the host shares a code word to enter.' },
  order: { name: 'Put it in order', detail: 'Tap the steps of a process in the right sequence.' },
  match: { name: 'Match pairs', detail: 'Pair each term with its meaning.' },
  scramble: { name: 'Word scramble', detail: 'Unscramble three words with hints.' },
  memory: { name: 'Memory flip', detail: 'Flip cards to find every matching pair.' },
  packets: { name: 'Packet patrol', detail: 'Tap the threats before they hit the network, against the clock.' },
  phish: { name: 'Spot the phish', detail: 'Decide whether each message is safe or a scam.' },
  simon: { name: 'Sequence drill', detail: 'Watch a growing sequence and repeat it.' },
  bugs: { name: 'Bug hunt', detail: 'Tap the line with the bug in each code snippet.' },
  password: { name: 'Passphrase builder', detail: 'Build a passphrase that passes every check.' },
  contrast: { name: 'Contrast check', detail: 'Pick the more readable colour combination.' },
  roadmap: { name: 'Roadmap on a budget', detail: 'Choose features that deliver enough value within capacity.' },
  pedal: { name: 'Pedal power', detail: 'Tap as fast as you can before time runs out.' },
}

// Open questions for the organisers. Ticks are kept on this device.
const noHosts = exhibits.filter((exhibit) => !exhibit.hosts.length && !exhibit.activity && exhibit.id !== 'eag')
const todos = [
  { id: 'eag', text: 'EAG content is a placeholder. Confirm its description, hosts, conversation starters and challenge (code word VOICE).' },
  { id: 'hosts', text: `Find hosts for ${noHosts.map((exhibit) => exhibit.title).join(', ')}.` },
  { id: 'cyber-hosts', text: 'All five cyber booths list Ashley Nicol as host. Confirm who runs each one.' },
  { id: 'numbers', text: 'Confirm official booth numbers. We assigned 44–50 to the new booths.' },
  { id: 'digital-strategy', text: 'Digital Strategy appears twice on the floor plan (G.07 and the G.08 pod). The map only shows the G.08 pod.' },
  { id: 'tree', text: 'Confirm the green tree on the floor plan is the Christmas tree.' },
  { id: 'removed', text: 'Udemy and Employee Benefits aren’t on the new floor plan, so they were removed. Confirm they aren’t coming.' },
  { id: 'codes', text: `Brief hosts on their code words. ${exhibits.filter((exhibit) => challenges[exhibit.id].kind === 'code').length} booths use a Find out challenge.` },
  { id: 'qr', text: 'Reprint every booth QR poster: they now use random stamp codes, so earlier posters won’t work. The cyber booths split, Testing and Cyber Mate merged, and EAG is new.' },
  { id: 'stickers', text: `Print the ${explorerTypes.length} explorer stickers from Print shop, and staff the welcome desk. The quiz tells people to collect their sticker there.` },
  { id: 'info-pages', text: 'Help, Accessibility and Privacy in the footer are draft text. Confirm the welcome desk, venue access help and privacy wording, including the live leaderboard line in Privacy.' },
  { id: 'networks', text: 'Confirm the venue’s Wi-Fi addresses with the network team before 27 November and update the TRUSTED_NETWORKS secret in GitHub, then re-deploy.' },
  { id: 'leaderboard', text: 'The live leaderboard is built but off, so points stay on each device. Get Supabase approved (TPSA), then follow “Live leaderboard” in the README to switch it on.' },
]
const todoKey = 'techx26-admin-todo'

const tabs = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'challenges', label: 'Challenges', Icon: Gamepad2 },
  { id: 'print', label: 'Print shop', Icon: Printer },
  { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
] as const
type Tab = (typeof tabs)[number]['id']

const daysToGo = () => Math.round((new Date(`${eventDate}T00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000)

function PaneHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return <div className="admin-pane-head"><p className="kicker">{kicker}</p><h3>{title}</h3>{children && <p>{children}</p>}</div>
}

// The organiser console, opened from Admin in the footer.
export function AdminPanel({ lockdown, lockdownSet, onLockdown, demo, onDemo, onTry, onReset, onBoothPosters, onClose, children }: { lockdown: boolean; lockdownSet: boolean; onLockdown: (on: boolean | null) => void; demo: boolean; onDemo: (on: boolean) => void; onTry: (id: string) => void; onReset: () => void; onBoothPosters: () => void; onClose: () => void; children?: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [done, setDone] = useState<string[]>(() => JSON.parse(localStorage.getItem(todoKey) ?? '[]'))
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((item) => item !== id) : [...done, id]
    setDone(next)
    localStorage.setItem(todoKey, JSON.stringify(next))
  }
  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const close = () => {
    dialogRef.current?.close()
    onClose()
  }
  const choose = (id: Tab) => {
    setTab(id)
    dialogRef.current?.querySelector('.admin-console-body')?.scrollTo(0, 0)
  }

  const days = daysToGo()
  const countdown = days > 1 ? `${days} days to go` : days === 1 ? 'Tomorrow' : days === 0 ? 'Museum day' : 'Museum closed'
  const doneCount = todos.filter((todo) => done.includes(todo.id)).length
  const byKind = (Object.keys(kinds) as Challenge['kind'][]).map((kind) => ({ kind, booths: exhibits.filter((exhibit) => challenges[exhibit.id].kind === kind) }))
  const stats = [
    { value: exhibits.length, label: 'Booths' },
    { value: byKind.length, label: 'Challenge types' },
    { value: secrets.length, label: 'Hidden exhibits' },
    { value: explorerTypes.length, label: 'Explorer types' },
  ]
  return (
    <dialog ref={dialogRef} className="admin-console" aria-labelledby="admin-title" onCancel={(event) => { event.preventDefault(); close() }} onKeyDownCapture={(event) => {
      if (event.key === 'Escape' && children) event.preventDefault()
    }}>
      <header className="admin-console-bar">
        <div className="admin-console-brand">
          <span className="admin-console-mark">TECH<span>x</span>26</span>
          <h2 id="admin-title">Organiser console</h2>
        </div>
        <div className="admin-console-status">
          <span className={lockdown ? 'admin-chip' : 'admin-chip live'}><i aria-hidden="true" />{lockdown ? 'Lockdown' : 'Live'}</span>
          <span className="admin-chip"><CalendarDays size={14} aria-hidden="true" />{countdown}</span>
        </div>
        <button className="admin-console-close" onClick={close} autoFocus aria-label="Close admin"><X size={20} /></button>
      </header>
      <nav className="admin-console-nav" role="tablist" aria-label="Admin sections">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} role="tab" id={`admin-tab-${id}`} aria-selected={tab === id} aria-controls="admin-pane" className={tab === id ? 'active' : ''} onClick={() => choose(id)}>
            <Icon size={18} aria-hidden="true" />{label}
          </button>
        ))}
      </nav>
      <div className="admin-console-body" id="admin-pane" role="tabpanel" aria-labelledby={`admin-tab-${tab}`}>
        {tab === 'overview' && (
          <>
            <section className="admin-hero">
              <p className="kicker">TECHx26 · Museum of Technology</p>
              <strong>{countdown}</strong>
              <p>27 November 2026 · Kogarah Front and Back</p>
              <div className="admin-stats">
                {stats.map((stat) => <span key={stat.label}><b>{stat.value}</b>{stat.label}</span>)}
              </div>
            </section>
            <div className="admin-overview">
              <section className="admin-card">
                <PaneHead kicker="This device" title="Switches" />
                <label className="admin-switch"><input type="checkbox" checked={lockdown} onChange={(event) => onLockdown(event.target.checked)} /><span aria-hidden="true" />Lockdown mode: content only</label>
                <p className="admin-card-note">Hides the passport, scanning, challenges and leaderboard so visitors just see the map, schedule, tours and booths. It’s on for everyone until 27 November and switches off automatically on the day. This switch only changes this device.{lockdownSet && <> <button className="text-button" onClick={() => onLockdown(null)}>Back to automatic</button></>}</p>
                <div className="admin-card-actions">
                  <button className="admin-reset" onClick={() => { if (confirm('Reset your stamps, challenges, points and details on this device?')) onReset() }}><RotateCcw size={15} /> Reset my progress</button>
                </div>
              </section>
              <section className="admin-card admin-todo">
                <PaneHead kicker="Before the day" title="To do" />
                <div className="admin-progress" role="img" aria-label={`${doneCount} of ${todos.length} done`}><span style={{ width: `${(doneCount / todos.length) * 100}%` }} /></div>
                <p className="admin-card-note">{doneCount} of {todos.length} done · ticks are kept on this device</p>
                <ul>
                  {todos.map((todo) => (
                    <li key={todo.id}>
                      <label className={done.includes(todo.id) ? 'done' : ''}>
                        <input type="checkbox" checked={done.includes(todo.id)} onChange={() => toggle(todo.id)} />
                        <span className="admin-todo-box" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                        {todo.text}
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
        {tab === 'challenges' && (
          <>
            <PaneHead kicker="Challenge library" title="Every booth challenge, ready to demo.">Demos don’t save points or ask for details.</PaneHead>
            <div className="admin-kinds">
              {byKind.map(({ kind, booths }) => (
                <article key={kind} className="admin-kind">
                  <div className="admin-kind-icons">{booths.slice(0, 4).map((exhibit) => <span key={exhibit.id} style={{ color: wings.find((wing) => wing.id === exhibit.wingId)!.colour }}><BoothArt id={exhibit.id} className="admin-kind-icon" /></span>)}</div>
                  <h3>{kinds[kind].name}<small>{booths.length} booth{booths.length > 1 ? 's' : ''}</small></h3>
                  <p>{kinds[kind].detail}</p>
                  <p className="admin-kind-booths">{booths.map((exhibit) => exhibit.title).join(' · ')}</p>
                  <button onClick={() => onTry(booths[0].id)}><Play size={15} /> Try it</button>
                </article>
              ))}
            </div>
            <PaneHead kicker="By booth" title="Booths and code words" />
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Booth</th><th>Challenge</th><th>Type</th><th>Code word</th><th /></tr></thead>
                <tbody>
                  {exhibits.map((exhibit) => {
                    const challenge = challenges[exhibit.id]
                    return (
                      <tr key={exhibit.id} style={{ '--accent': wings.find((wing) => wing.id === exhibit.wingId)!.colour } as React.CSSProperties}>
                        <td><span className="admin-booth"><BoothArt id={exhibit.id} className="admin-table-icon" /><span><small>{boothNumber(exhibit)}</small>{exhibit.title}</span></span></td>
                        <td>{challenge.title}</td>
                        <td>{kinds[challenge.kind].name}</td>
                        <td>{challenge.kind === 'code' ? <code>{challenge.code}</code> : '—'}</td>
                        <td><button onClick={() => onTry(exhibit.id)} aria-label={`Try ${challenge.title}`}><Play size={14} /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {tab === 'print' && (
          <>
            <PaneHead kicker="Print shop" title="Posters for the venue.">Print-ready A4 PNGs. Every poster’s QR code opens the museum guide.</PaneHead>
            <PosterStudio />
            <section className="admin-card admin-print-qr">
              <div>
                <PaneHead kicker="QR codes" title="Booth and hidden exhibit posters">One poster per booth with its stamp code, plus the five hidden exhibits. Each hidden exhibit is worth 25 bonus points.</PaneHead>
                <button className="button button-dark" onClick={onBoothPosters}><QrCode size={16} /> Open the QR poster studio</button>
              </div>
            </section>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Hidden exhibit</th><th>Suggested spot</th><th>Code</th><th>Link</th></tr></thead>
                <tbody>
                  {secrets.map((secret) => (
                    <tr key={secret.id} style={{ '--accent': '#c31672' } as React.CSSProperties}>
                      <td><span className="admin-booth"><SecretArt id={secret.id} className="admin-table-icon" /><span><small>{secret.era}</small>{secret.title}</span></span></td>
                      <td>{secret.place}</td>
                      <td><code>{secret.code}</code></td>
                      <td><code>{secretUrl(secret).replace(/^https?:\/\//, '')}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaneHead kicker="Welcome desk" title="Explorer stickers and cards">One for each result of the “What kind of explorer are you?” quiz. People show their card at the welcome desk to collect the matching sticker. Downloads are print-ready PNGs with transparent corners.</PaneHead>
            <ExplorerPrintKit />
          </>
        )}
        {tab === 'leaderboard' && (
          <>
            <PaneHead kicker="Leaderboard" title="Points and players" />
            <div className="admin-overview">
              <section className="admin-card">
                <PaneHead kicker="Live leaderboard" title={syncEnabled ? 'Connected' : 'Switched off'} />
                <p className="admin-card-note">{syncEnabled ? 'Scores sync to Supabase, so everyone sees the same leaderboard.' : 'The live leaderboard is built but off, so points stay on each device. Get Supabase approved (TPSA), then follow “Live leaderboard” in the README to switch it on.'}</p>
              </section>
              <section className="admin-card">
                <PaneHead kicker="This device" title="Demo players" />
                <label className="admin-switch"><input type="checkbox" checked={demo} onChange={(event) => onDemo(event.target.checked)} /><span aria-hidden="true" />Show demo players on the leaderboard</label>
                <p className="admin-card-note">Fills the leaderboard with made-up players so you can show how it looks before anyone has scored.</p>
              </section>
            </div>
          </>
        )}
      </div>
      {children}
    </dialog>
  )
}
