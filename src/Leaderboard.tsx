import { useMemo, useState } from 'react'
import { Trophy } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { boothNumber, exhibits, wings } from './data'
import { boothScore, challengeBase, challengeBonus, demoEntries, readPlayer, secretPoints, stampPoints, totalScore, type Entry } from './scoring'

// Overall and per-booth rankings. Until the event server exists it ranks you, plus demo players when switched on.
export function Leaderboard({ visited, results, secrets, demo }: { visited: string[]; results: Record<string, number>; secrets: string[]; demo: boolean }) {
  const [booth, setBooth] = useState('')
  const player = readPlayer()
  const others = useMemo(() => (demo ? demoEntries() : []), [demo])
  const you: Entry = { name: player?.name ?? 'You', you: true, visited, results, secrets }
  const score = (entry: Entry) => (booth ? boothScore(entry, booth) : totalScore(entry))
  const ranked = [you, ...others].map((entry) => ({ entry, points: score(entry) })).filter(({ entry, points }) => points > 0 || entry.you).sort((a, b) => b.points - a.points)
  const yourRank = ranked.findIndex(({ entry }) => entry.you) + 1
  const shown = ranked.slice(0, 10)
  const exhibit = exhibits.find((item) => item.id === booth)

  return (
    <section className="section leaderboard-section" id="leaderboard">
      <div className="section-heading" data-reveal>
        <div><p className="kicker">Leaderboard</p><h2>Who’s exploring<br />the most?</h2></div>
        <p>Collect stamps and complete booth challenges to climb the board. The best explorers will be contacted for prizes.</p>
      </div>
      <div className="leaderboard-layout" data-reveal>
        <div className="leaderboard-card">
          <div className="leaderboard-tabs" role="tablist" aria-label="Leaderboard">
            <button role="tab" aria-selected={!booth} className={!booth ? 'active' : ''} onClick={() => setBooth('')}>Overall</button>
            <label className={booth ? 'active' : ''}>
              <span className="sr-only">Booth leaderboard</span>
              <select value={booth} onChange={(event) => setBooth(event.target.value)} aria-label="Choose a booth">
                <option value="">By booth…</option>
                {exhibits.map((item) => <option key={item.id} value={item.id}>{boothNumber(item)} · {item.title}</option>)}
              </select>
            </label>
          </div>
          {exhibit && (
            <p className="leaderboard-booth" style={{ '--accent': wings.find((wing) => wing.id === exhibit.wingId)!.colour } as React.CSSProperties}>
              <BoothArt id={exhibit.id} className="leaderboard-booth-icon" />Booth {boothNumber(exhibit)} · {exhibit.title}
            </p>
          )}
          {demo && <p className="leaderboard-demo">Demo data · sample players for showing the leaderboard</p>}
          <ol className="leaderboard-list">
            {shown.map(({ entry, points }, index) => (
              <li key={entry.name + index} className={entry.you ? 'you' : ''} style={{ '--i': index } as React.CSSProperties}>
                <span className={`leaderboard-rank rank-${index + 1}`}>{index < 3 ? <Trophy size={15} /> : index + 1}</span>
                <span className="leaderboard-name">{entry.name}{entry.you && <small>You</small>}</span>
                <b>{points.toLocaleString()}<small> pts</small></b>
              </li>
            ))}
            {yourRank > 10 && (
              <li className="you outside">
                <span className="leaderboard-rank">{yourRank}</span>
                <span className="leaderboard-name">{you.name}<small>You</small></span>
                <b>{score(you).toLocaleString()}<small> pts</small></b>
              </li>
            )}
          </ol>
          {!demo && ranked.length === 1 && <p className="leaderboard-empty">The live leaderboard goes up on the day. Until then, here’s your score.</p>}
        </div>
        <aside className="leaderboard-points" aria-label="How points work">
          <h3>How points work</h3>
          <div><b>+{stampPoints}</b><span>for every passport stamp</span></div>
          <div><b>+{challengeBase}</b><span>for completing a booth challenge</span></div>
          <div><b>+{challengeBonus}</b><span>bonus, depending on how well you do</span></div>
          <div><b>+{secretPoints}</b><span>for every hidden exhibit you find</span></div>
          <p>Only your best score at each booth counts, so you can replay to improve it.</p>
        </aside>
      </div>
    </section>
  )
}
