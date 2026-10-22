import { useEffect, useRef, type ReactNode } from 'react'
import { Play, RotateCcw, X } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { challenges, type Challenge } from './challenges'
import { boothNumber, exhibits, wings } from './data'
import { SecretArt } from './Collectibles'
import { secrets, secretUrl } from './secrets'

const kinds: Record<Challenge['kind'], { name: string; detail: string }> = {
  quiz: { name: 'Quiz', detail: 'Three multiple-choice questions. Pass with two right.' },
  code: { name: 'Find out', detail: 'After a chat, the host shares a code word to enter.' },
  order: { name: 'Put it in order', detail: 'Tap the steps of a process in the right sequence.' },
  match: { name: 'Match pairs', detail: 'Pair each term with its meaning.' },
  scramble: { name: 'Word scramble', detail: 'Unscramble three words with hints.' },
  memory: { name: 'Memory flip', detail: 'Flip cards to find every matching pair.' },
  packets: { name: 'Packet patrol', detail: 'Tap the threats before they hit the network, against the clock.' },
  phish: { name: 'Spot the phish', detail: 'Decide whether each message is safe or a scam.' },
  simon: { name: 'Recovery drill', detail: 'Watch a growing sequence and repeat it.' },
  bugs: { name: 'Bug hunt', detail: 'Tap the line with the bug in each code snippet.' },
  password: { name: 'Passphrase builder', detail: 'Build a passphrase that passes every check.' },
  contrast: { name: 'Contrast check', detail: 'Pick the more readable colour combination.' },
  roadmap: { name: 'Roadmap on a budget', detail: 'Choose features that deliver enough value within capacity.' },
  pedal: { name: 'Pedal power', detail: 'Tap as fast as you can before time runs out.' },
}

// Challenge demos for booth hosts, opened from the footer.
export function AdminPanel({ demo, onDemo, onTry, onReset, onClose, children }: { demo: boolean; onDemo: (on: boolean) => void; onTry: (id: string) => void; onReset: () => void; onClose: () => void; children?: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const close = () => {
    dialogRef.current?.close()
    onClose()
  }

  const byKind = (Object.keys(kinds) as Challenge['kind'][]).map((kind) => ({ kind, booths: exhibits.filter((exhibit) => challenges[exhibit.id].kind === kind) }))
  return (
    <dialog ref={dialogRef} className="section admin-section admin-dialog" aria-labelledby="admin-title" onCancel={(event) => { event.preventDefault(); close() }} onKeyDownCapture={(event) => {
      if (event.key === 'Escape' && children) event.preventDefault()
    }}>
      <div className="admin-dialog-bar"><span>TECHx26 · Admin</span><button onClick={close} autoFocus>Close library <X size={17} /></button></div>
      <div className="section-heading">
        <div><p className="kicker">Admin · temporary</p><h2 id="admin-title">Challenge library.</h2></div>
        <p>Every type of booth challenge, ready to demo. Demos don’t save points or ask for details.</p>
      </div>
      <div className="admin-controls">
        <label className="admin-switch"><input type="checkbox" checked={demo} onChange={(event) => onDemo(event.target.checked)} /><span aria-hidden="true" />Show demo players on the leaderboard</label>
        <button className="admin-reset" onClick={() => { if (confirm('Reset your stamps, challenges, points and details on this device?')) onReset() }}><RotateCcw size={15} /> Reset my progress</button>
      </div>
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
      <h3 className="admin-subhead">Hidden exhibits</h3>
      <p className="admin-note">Print these from Booth QR codes in the footer and place them around the venue. Each is worth 25 bonus points.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Exhibit</th><th>Suggested spot</th><th>Code</th><th>Link</th></tr></thead>
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
      {children}
    </dialog>
  )
}
