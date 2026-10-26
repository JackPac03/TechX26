import { useEffect, useMemo, useRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import { BoothArt } from './BoothArt'
import { boothNumber, exhibits, wings } from './data'
import { boothScore, challengeBase, challengeBonus, demoEntries, playerCode, readPlayer, secretPoints, stampPoints, totalScore, type Entry } from './scoring'
import { fetchLeaderboard, fetchRank, syncEnabled, type BoardRow } from './sync'

// Overall and per-booth rankings. With the live leaderboard on it ranks everyone; otherwise you, plus demo players when switched on.
export function Leaderboard({ visited, results, secrets, demo }: { visited: string[]; results: Record<string, number>; secrets: string[]; demo: boolean }) {
  const [booth, setBooth] = useState('')
  const player = readPlayer()
  const code = player ? playerCode(player.id) : undefined
  const others = useMemo(() => (demo ? demoEntries() : []), [demo])
  const you: Entry = { name: player?.nickname ?? 'You', code, you: true, visited, results, secrets }
  const score = (entry: Entry) => (booth ? boothScore(entry, booth) : totalScore(entry))
  const yourPoints = score(you)
  const live = syncEnabled && !demo
  const [board, setBoard] = useState<{ booth: string; rows: BoardRow[]; rank?: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const latestPoints = useRef(yourPoints)
  useEffect(() => { latestPoints.current = yourPoints })

  // Fetch the live board when it scrolls into view, then every minute while it's on screen.
  useEffect(() => {
    if (!live) return
    let timer = 0
    let onScreen = false
    const load = async () => {
      clearTimeout(timer)
      if (onScreen && document.visibilityState === 'visible') {
        try {
          const rows = await fetchLeaderboard(booth)
          const points = latestPoints.current
          // Your place only needs asking for when you're not in the top 10.
          const outside = readPlayer() && points > 0 && rows.length === 10 && points < rows[9].points
          setBoard({ booth, rows, rank: outside ? await fetchRank(points, booth) : undefined })
          setFailed(false)
        } catch {
          setFailed(true)
        }
      }
      timer = window.setTimeout(load, 60_000)
    }
    const observer = new IntersectionObserver(([entry]) => {
      const wasOnScreen = onScreen
      onScreen = entry.isIntersecting
      if (onScreen && !wasOnScreen) load()
    })
    observer.observe(sectionRef.current!)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [live, booth])

  // Your own entry always uses this phone's latest progress, in place of your last saved row.
  const liveRows = live && board?.booth === booth ? board.rows : null
  const serverOthers: Entry[] = (liveRows ?? []).filter((row) => !(player && row.code === code && row.nickname === player.nickname)).map((row) => ({ name: row.nickname, code: row.code, visited: [], results: {}, points: row.points }))
  const ranked = [you, ...(live ? serverOthers : others)].map((entry) => ({ entry, points: entry.points ?? score(entry) })).filter(({ entry, points }) => points > 0 || entry.you).sort((a, b) => b.points - a.points)
  const yourRank = board?.rank && liveRows ? board.rank : ranked.findIndex(({ entry }) => entry.you) + 1
  const shown = ranked.slice(0, 10)
  const exhibit = exhibits.find((item) => item.id === booth)
  const nameOf = (entry: Entry) => <>{entry.name}{entry.code && <code>#{entry.code}</code>}{entry.you && <small>You</small>}</>

  return (
    <section className="section leaderboard-section" id="leaderboard" ref={sectionRef}>
      <div className="section-heading" data-reveal>
        <div><p className="kicker">Leaderboard</p><h2>Who’s exploring<br />the most?</h2></div>
        <p>Collect stamps and complete booth challenges to climb the board. To claim a prize, show staff your nickname and player code on your phone.</p>
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
              <li key={entry.name + entry.code + index} className={entry.you ? 'you' : ''} style={{ '--i': index } as React.CSSProperties}>
                <span className={`leaderboard-rank rank-${index + 1}`}>{index < 3 ? <Trophy size={15} /> : index + 1}</span>
                <span className="leaderboard-name">{nameOf(entry)}</span>
                <b>{points.toLocaleString()}<small> pts</small></b>
              </li>
            ))}
            {yourRank > 10 && (
              <li className="you outside">
                <span className="leaderboard-rank">{yourRank}</span>
                <span className="leaderboard-name">{nameOf(you)}</span>
                <b>{yourPoints.toLocaleString()}<small> pts</small></b>
              </li>
            )}
          </ol>
          {live && !player && <p className="leaderboard-empty">Win any booth challenge and pick a nickname to join the board.</p>}
          {live && failed && <p className="leaderboard-empty">The live leaderboard isn’t available right now. Your points are safe on this phone and will sync when it’s back.</p>}
          {!live && !demo && ranked.length === 1 && <p className="leaderboard-empty">The live leaderboard goes up on the day. Until then, here’s your score.</p>}
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
