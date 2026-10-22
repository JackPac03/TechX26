import { useEffect, useEffectEvent } from 'react'
import { Share2 } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { WingBadge } from './Collectibles'
import { boothNumber, exhibits, wings, type Exhibit, type Wing } from './data'

export type Celebration = { exhibit: Exhibit; count: number; wingDone?: Wing; passportDone: boolean }

const confetti = ['#ef1721', '#c31672', '#9619df', '#ff7a3d', '#ffd166']

export function CelebrationOverlay({ celebration, onDone, onShare }: { celebration: Celebration; onDone: () => void; onShare: () => void }) {
  const { exhibit, count, wingDone, passportDone } = celebration
  const wing = wings.find((item) => item.id === exhibit.wingId)!
  const milestone = Boolean(wingDone || passportDone)
  const finish = useEffectEvent(onDone)

  useEffect(() => {
    navigator.vibrate?.([24, 60, 90])
    const timer = setTimeout(finish, milestone ? 5200 : 2800)
    return () => clearTimeout(timer)
  }, [celebration, milestone])

  return (
    <div className="celebration" role="status" aria-live="assertive" onClick={onDone} style={{ '--accent': wing.colour } as React.CSSProperties}>
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => (
          <i key={index} style={{ '--a': `${index * 137.5}deg`, '--d': `${130 + ((index * 53) % 170)}px`, '--c': confetti[index % confetti.length], '--t': `${(index % 6) * 40}ms` } as React.CSSProperties} />
        ))}
      </div>
      <div className="celebration-card">
        <div className="celebration-stamp" aria-hidden="true"><BoothArt id={exhibit.id} className="draw" /><small>Booth {boothNumber(exhibit)}</small></div>
        <p className="kicker">Stamp collected</p>
        <h2>{exhibit.title}</h2>
        <p className="celebration-score">{count} of {exhibits.length} stamps collected</p>
        {wingDone && (
          <div className="celebration-medal" style={{ '--accent': wingDone.colour } as React.CSSProperties}>
            <WingBadge wing={wingDone} got={1} total={1} />
            <span><small>Badge unlocked</small>{wingDone.badge}<em>Every {wingDone.title} booth collected</em></span>
          </div>
        )}
        {passportDone && <p className="celebration-complete">Passport complete. You’ve explored every booth!</p>}
        {milestone && <button className="button button-primary" onClick={(event) => { event.stopPropagation(); onShare() }}><Share2 size={17} /> Share your progress</button>}
        <small className="celebration-hint">Tap anywhere to continue</small>
      </div>
    </div>
  )
}
