import { useEffect, useRef } from 'react'
import { ArrowRight, Check, Compass, KeyRound, LockKeyhole, MapPin, Sparkles, X } from 'lucide-react'
import { explorerBadges, explorerTitle, mysteryStops, type ExplorerJourney as Journey, type MysteryTrail } from './explorer'
import './ExplorerJourney.css'

export function ExplorerAdventures({ trail, onStart, onPause, onHint, onQuiz }: { trail: MysteryTrail; onStart: () => void; onPause: () => void; onHint: () => void; onQuiz: () => void }) {
  const clue = mysteryStops[trail.step]
  const complete = trail.step === mysteryStops.length
  return (
    <section className="section explorer-adventures" id="discover">
      <div className="section-heading" data-reveal>
        <div><p className="kicker">A little serendipity</p><h2>Follow your curiosity.</h2></div>
        <p>No wrong turns here. Just a few more ways to find something you didn’t know you’d love.</p>
      </div>
      <div className="explorer-adventure-grid">
        <article className="explorer-adventure explorer-personality">
          <span className="explorer-adventure-icon" aria-hidden="true"><Compass size={25} /><i /><i /></span>
          <div><p className="kicker">Three questions. Your kind of tour.</p><h3>What’s your explorer type?</h3><p>Time traveller? Tinkerer? Find your museum alter ego and a tour that fits.</p></div>
          <button className="button button-dark" aria-haspopup="dialog" onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); onQuiz() }}>Find my explorer type <ArrowRight size={16} /></button>
        </article>
        <article className="explorer-adventure explorer-mystery">
          <div className="explorer-trail-top"><span className="explorer-adventure-icon" aria-hidden="true">{complete ? <Check size={25} /> : <KeyRound size={25} />}</span><ol aria-label="Mystery trail progress">{mysteryStops.map((stop, index) => <li key={stop.id} className={index < trail.step ? 'done' : ''} aria-current={trail.started && index === trail.step ? 'step' : undefined}><span className="sr-only">Stop {index + 1}{index < trail.step ? ', solved' : ''}</span>{index < trail.step ? <Check size={13} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}</li>)}</ol></div>
          <div aria-live="polite" aria-atomic="true">
            <p className="kicker">{complete ? 'All three clues solved' : trail.started ? `Mystery trail · Clue ${trail.step + 1} of 3` : 'A three-stop treasure hunt'}</p>
            <h3>{complete ? 'A certified Trailblazer.' : 'A clue less ordinary.'}</h3>
            <p>{complete ? 'You followed the clues and found your way. Your secret badge is waiting in your passport.' : trail.started ? clue.clue : 'Follow a clue, find its booth and collect a stamp. Each discovery reveals the next.'}</p>
          </div>
          {trail.started && !complete && <small className="explorer-trail-note">Scan or collect the right booth’s stamp to solve this clue. Already stamped it? Confirm that stop in its booth.</small>}
          <div className="explorer-trail-actions">
            {complete ? <a className="button button-dark" href="#passport">See my badge <ArrowRight size={16} /></a> : trail.started ? <><button className="button button-dark" onClick={onHint}><MapPin size={15} /> Hint on the map</button><button className="text-button" onClick={onPause}>Pause trail</button></> : <button className="button button-dark" onClick={onStart}>{trail.step ? 'Resume the trail' : 'Start the mystery trail'} <ArrowRight size={16} /></button>}
          </div>
        </article>
      </div>
    </section>
  )
}

export function ExplorerPassport({ journey }: { journey: Journey }) {
  const title = explorerTitle(journey.visited)
  const badges = explorerBadges(journey)
  return (
    <div className="explorer-passport">
      <div className="explorer-title"><Sparkles size={17} aria-hidden="true" /><div><small>Your explorer title</small><strong>{title.label}</strong></div></div>
      <p>{title.next ? <>{title.next.stamps - title.count} more stamp{title.next.stamps - title.count === 1 ? '' : 's'} to <b>{title.next.label}</b>.</> : 'An insider’s eye. Keep collecting the unexpected.'}</p>
      <details className="explorer-badges">
        <summary>Secret discoveries <span>{badges.filter((badge) => badge.unlocked).length}/{badges.length}</span></summary>
        <ul>{badges.map((badge) => <li key={badge.id} className={badge.unlocked ? 'unlocked' : ''}><span className="explorer-badge-seal" aria-hidden="true">{badge.unlocked ? <Sparkles size={17} /> : <LockKeyhole size={15} />}</span><div><strong>{badge.unlocked ? badge.title : 'Undiscovered'}</strong><small>{badge.unlocked ? badge.detail : badge.hint}</small></div></li>)}</ul>
        <p>Just for the joy of exploring. These don’t add competition points.</p>
      </details>
    </div>
  )
}

export function CuratorSecret({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  const close = () => { dialogRef.current?.close(); onClose() }
  return (
    <dialog className="curator-secret" ref={dialogRef} aria-labelledby="curator-secret-title" onCancel={(event) => { event.preventDefault(); close() }} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
      <div className="curator-secret-inner">
        <button className="curator-secret-close" onClick={close} aria-label="Close curator’s nook" autoFocus><X size={19} /></button>
        <div className="curator-secret-art" aria-hidden="true"><KeyRound size={38} /><Sparkles size={18} /><i /><i /></div>
        <p className="kicker">Psst. You found us.</p>
        <h2 id="curator-secret-title">The curator’s nook.</h2>
        <p>Five taps. Excellent curiosity. The museum’s tiniest secret room is officially yours.</p>
        <div className="curator-secret-badge"><Sparkles size={20} /><span><small>Secret badge unlocked</small><strong>Curator’s secret</strong></span></div>
        <p className="curator-secret-note">Curator’s tip: the best thing in this museum isn’t behind glass. It’s the conversation you haven’t had yet.</p>
        <button className="button button-dark" onClick={close}>Back to the possible <ArrowRight size={16} /></button>
      </div>
    </dialog>
  )
}
