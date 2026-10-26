import { useEffect, useRef, useState } from 'react'
import { Calendar, Check, Database, FileText, Laptop, MessageSquare, Server, Shield, Users, Video, Wifi, X } from 'lucide-react'
import { bugSnippets, challengeKinds, contrastRounds, phishMessages, roadmapFeatures, type Challenge } from './challenges'
import { challengePoints, nicknameProblem, playerKey, readPlayer } from './scoring'

// performance runs from 0 to 1 and sets the bonus points.
type Done = (passed: boolean, summary: string, performance: number) => void

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Shared "tap to start" gate for timed games, so the clock starts when the player is ready.
function StartGate({ label, onStart }: { label: string; onStart: () => void }) {
  return <button className="game-start" onClick={onStart}>{label}</button>
}

function Quiz({ questions, onDone }: { questions: { q: string; options: string[]; answer: number }[]; onDone: Done }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const question = questions[index]
  const next = () => {
    if (index + 1 < questions.length) { setIndex(index + 1); setPicked(null); return }
    onDone(score >= questions.length - 1, `${score} of ${questions.length} correct`, score / questions.length)
  }
  return (
    <div className="game-quiz">
      <p className="game-progress">Question {index + 1} of {questions.length}</p>
      <h3>{question.q}</h3>
      <div className="game-options">
        {question.options.map((option, i) => (
          <button key={option} disabled={picked !== null} className={picked === null ? '' : i === question.answer ? 'right' : i === picked ? 'wrong' : 'faded'} onClick={() => { setPicked(i); if (i === question.answer) setScore(score + 1) }}>{option}</button>
        ))}
      </div>
      {picked !== null && <button className="game-next" onClick={next}>{index + 1 < questions.length ? 'Next question' : 'See result'}</button>}
    </div>
  )
}

function CodeWord({ code, onDone }: { code: string; onDone: Done }) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  return (
    <form className="game-code" onSubmit={(event) => { event.preventDefault(); if (value.trim().toUpperCase() === code) onDone(true, 'Code word accepted', 1); else setWrong(true) }}>
      <label htmlFor="code-word">Code word from the team</label>
      <input id="code-word" className={wrong ? 'shake' : ''} value={value} onChange={(event) => { setValue(event.target.value); setWrong(false) }} placeholder="Enter the code word" autoComplete="off" autoCapitalize="characters" />
      {wrong && <p className="game-hint">Not quite. Check the spelling with the team.</p>}
      <button className="game-next" disabled={!value.trim()}>Submit</button>
    </form>
  )
}

function Order({ steps, onDone }: { steps: string[]; onDone: Done }) {
  const [pool] = useState(() => shuffle(steps))
  const [placed, setPlaced] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [flash, setFlash] = useState('')
  const tap = (step: string) => {
    if (step !== steps[placed.length]) { setMistakes(mistakes + 1); setFlash(step); setTimeout(() => setFlash(''), 400); return }
    const next = [...placed, step]
    setPlaced(next)
    if (next.length === steps.length) setTimeout(() => onDone(mistakes <= 2, mistakes ? `${mistakes} wrong tap${mistakes > 1 ? 's' : ''}` : 'Perfect order', 1 - mistakes * 0.25), 450)
  }
  return (
    <div className="game-order">
      <ol className="game-placed">{steps.map((step, i) => <li key={step} className={placed[i] ? 'on' : ''}><span>{i + 1}</span>{placed[i] ?? ''}</li>)}</ol>
      <div className="game-options">
        {pool.filter((step) => !placed.includes(step)).map((step) => <button key={step} className={flash === step ? 'wrong shake' : ''} onClick={() => tap(step)}>{step}</button>)}
      </div>
      <p className="game-progress">Wrong taps: {mistakes} · keep it to 2 or fewer</p>
    </div>
  )
}

function Match({ pairs, onDone }: { pairs: [string, string][]; onDone: Done }) {
  const [left] = useState(() => shuffle(pairs.map(([term]) => term)))
  const [right] = useState(() => shuffle(pairs.map(([, meaning]) => meaning)))
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrong, setWrong] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const pick = (meaning: string) => {
    if (!selected) return
    if (pairs.some(([term, m]) => term === selected && m === meaning)) {
      const next = [...matched, selected]
      setMatched(next)
      setSelected(null)
      if (next.length === pairs.length) setTimeout(() => onDone(mistakes <= 3, mistakes ? `${mistakes} mismatch${mistakes > 1 ? 'es' : ''}` : 'Flawless', 1 - mistakes * 0.2), 450)
    } else {
      setMistakes(mistakes + 1)
      setWrong(meaning)
      setTimeout(() => setWrong(''), 400)
    }
  }
  const isMatched = (meaning: string) => pairs.some(([term, m]) => m === meaning && matched.includes(term))
  return (
    <div className="game-match">
      <p className="game-progress">Tap a term, then its meaning</p>
      <div className="game-match-grid">
        <div>{left.map((term) => <button key={term} className={matched.includes(term) ? 'right' : selected === term ? 'selected' : ''} disabled={matched.includes(term)} onClick={() => setSelected(term)}>{term}</button>)}</div>
        <div>{right.map((meaning) => <button key={meaning} className={isMatched(meaning) ? 'right' : wrong === meaning ? 'wrong shake' : ''} disabled={isMatched(meaning) || !selected} onClick={() => pick(meaning)}>{meaning}</button>)}</div>
      </div>
    </div>
  )
}

function Scramble({ words, onDone }: { words: { word: string; hint: string }[]; onDone: Done }) {
  const [index, setIndex] = useState(0)
  const [tiles, setTiles] = useState(() => scrambled(words[0].word))
  const [used, setUsed] = useState<number[]>([])
  const [wrong, setWrong] = useState(false)
  const [misses, setMisses] = useState(0)
  const { word, hint } = words[index]
  const guess = used.map((i) => tiles[i]).join('')
  const tap = (i: number) => {
    const next = [...used, i]
    setUsed(next)
    if (next.length < word.length) return
    if (next.map((t) => tiles[t]).join('') === word) {
      setTimeout(() => {
        if (index + 1 === words.length) { onDone(true, `All ${words.length} words solved`, 1 - misses * 0.2); return }
        setIndex(index + 1)
        setTiles(scrambled(words[index + 1].word))
        setUsed([])
      }, 450)
    } else {
      setWrong(true)
      setMisses(misses + 1)
      setTimeout(() => { setWrong(false); setUsed([]) }, 500)
    }
  }
  return (
    <div className="game-scramble">
      <p className="game-progress">Word {index + 1} of {words.length} · {hint}</p>
      <div className={`game-slots${wrong ? ' shake' : ''}${guess === word ? ' solved' : ''}`}>{word.split('').map((_, i) => <span key={i}>{guess[i] ?? ''}</span>)}</div>
      <div className="game-tiles">{tiles.map((letter, i) => <button key={i} disabled={used.includes(i)} onClick={() => tap(i)}>{letter}</button>)}</div>
      <button className="game-text-button" onClick={() => setUsed([])} disabled={!used.length}>Clear</button>
    </div>
  )
}
function scrambled(word: string) {
  let letters = shuffle(word.split(''))
  while (letters.join('') === word) letters = shuffle(word.split(''))
  return letters
}

const memoryIcons = [Laptop, MessageSquare, Video, FileText, Calendar, Users]
function Memory({ onDone }: { onDone: Done }) {
  const [cards] = useState(() => shuffle([...memoryIcons.keys(), ...memoryIcons.keys()]))
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.includes(cards[i])) return
    const next = [...open, i]
    setOpen(next)
    if (next.length < 2) return
    setMoves(moves + 1)
    if (cards[next[0]] === cards[next[1]]) {
      const all = [...found, cards[i]]
      setFound(all)
      setOpen([])
      if (all.length === memoryIcons.length) setTimeout(() => onDone(true, `Solved in ${moves + 1} moves`, (14 - (moves + 1)) / 8), 500)
    } else setTimeout(() => setOpen([]), 750)
  }
  return (
    <div className="game-memory">
      <p className="game-progress">Moves: {moves}</p>
      <div className="game-memory-grid">
        {cards.map((icon, i) => {
          const Icon = memoryIcons[icon]
          const shown = open.includes(i) || found.includes(icon)
          return <button key={i} className={`${shown ? 'shown' : ''}${found.includes(icon) ? ' found' : ''}`} onClick={() => flip(i)} aria-label={shown ? 'Card shown' : 'Hidden card'}><span><Icon /></span></button>
        })}
      </div>
    </div>
  )
}

function Packets({ onDone }: { onDone: Done }) {
  const [started, setStarted] = useState(false)
  const [cells, setCells] = useState<('threat' | 'safe' | null)[]>(Array(9).fill(null))
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(20)
  const scoreRef = useRef(0)
  useEffect(() => {
    if (!started) return
    const spawn = setInterval(() => setCells(() => {
      const next: ('threat' | 'safe' | null)[] = Array(9).fill(null)
      for (const i of shuffle([...Array(9).keys()]).slice(0, 2)) next[i] = Math.random() < 0.7 ? 'threat' : 'safe'
      return next
    }), 800)
    const clock = setInterval(() => setTime((t) => t - 1), 1000)
    return () => { clearInterval(spawn); clearInterval(clock) }
  }, [started])
  useEffect(() => {
    if (time === 0) onDone(scoreRef.current >= 10, `${scoreRef.current} threats blocked`, scoreRef.current / 20)
  }, [time, onDone])
  const tap = (i: number) => {
    const cell = cells[i]
    if (!cell) return
    scoreRef.current += cell === 'threat' ? 1 : -1
    setScore(scoreRef.current)
    setCells(cells.map((c, j) => j === i ? null : c))
  }
  if (!started) return <StartGate label="Start patrol" onStart={() => setStarted(true)} />
  return (
    <div className="game-packets">
      <p className="game-progress"><b>{score}</b> blocked · {time}s left</p>
      <div className="game-packet-grid">{cells.map((cell, i) => <button key={i} className={cell ?? ''} onClick={() => tap(i)} aria-label={cell ?? 'Empty'}><span /></button>)}</div>
    </div>
  )
}

function Pedal({ onDone }: { onDone: Done }) {
  const [started, setStarted] = useState(false)
  const [taps, setTaps] = useState(0)
  const [time, setTime] = useState(10)
  const finished = useRef(false)
  useEffect(() => {
    if (!started) return
    const clock = setInterval(() => setTime((t) => t - 1), 1000)
    return () => clearInterval(clock)
  }, [started])
  useEffect(() => {
    if (time === 0 && !finished.current) { finished.current = true; onDone(false, `${taps} of 60 pedal strokes`, 0) }
  }, [time, taps, onDone])
  const pedal = () => {
    if (finished.current) return
    const next = taps + 1
    setTaps(next)
    if (next >= 60) { finished.current = true; onDone(true, `60 strokes with ${time}s to spare`, time / 6) }
  }
  if (!started) return <StartGate label="Start riding" onStart={() => setStarted(true)} />
  return (
    <div className="game-pedal">
      <p className="game-progress"><b>{taps}</b> / 60 · {time}s left</p>
      <div className="game-road"><span style={{ left: `${Math.min(taps / 60, 1) * 88}%` }}>🚴</span></div>
      <button className="game-pedal-button" onPointerDown={pedal}>Pedal!</button>
    </div>
  )
}

function Phish({ onDone }: { onDone: Done }) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const message = phishMessages[index]
  const choose = (phish: boolean) => { setAnswer(phish); if (phish === message.phish) setScore(score + 1) }
  const next = () => {
    if (index + 1 < phishMessages.length) { setIndex(index + 1); setAnswer(null); return }
    onDone(score >= 5, `${score} of ${phishMessages.length} spotted`, score / phishMessages.length)
  }
  return (
    <div className="game-phish">
      <p className="game-progress">Message {index + 1} of {phishMessages.length}</p>
      <div className="game-message"><small>{message.from}</small><p>{message.text}</p></div>
      {answer === null ? (
        <div className="game-choice"><button onClick={() => choose(false)}>Safe</button><button onClick={() => choose(true)}>Phish</button></div>
      ) : (
        <>
          <p className={answer === message.phish ? 'game-feedback right' : 'game-feedback wrong'}>{answer === message.phish ? 'Correct!' : 'Not this time.'} It’s {message.phish ? 'a phish' : 'safe'}. {message.why}</p>
          <button className="game-next" onClick={next}>{index + 1 < phishMessages.length ? 'Next message' : 'See result'}</button>
        </>
      )}
    </div>
  )
}

const pads = [Server, Database, Wifi, Shield]
const randomPad = () => Math.floor(Math.random() * pads.length)
function Simon({ onDone }: { onDone: Done }) {
  const [sequence, setSequence] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [input, setInput] = useState<number[]>([])
  const [playing, setPlaying] = useState(false)
  const target = 5
  useEffect(() => {
    if (!sequence.length) return
    const timers = sequence.flatMap((pad, i) => [setTimeout(() => setLit(pad), 300 + i * 650), setTimeout(() => setLit(null), 300 + i * 650 + 420)])
    timers.push(setTimeout(() => setPlaying(false), 300 + sequence.length * 650))
    return () => timers.forEach(clearTimeout)
  }, [sequence])
  const extend = (from: number[]) => { setInput([]); setPlaying(true); setSequence([...from, randomPad()]) }
  const tap = (pad: number) => {
    if (playing) return
    const next = [...input, pad]
    if (pad !== sequence[next.length - 1]) { onDone(false, `Reached a sequence of ${sequence.length - 1}`, 0); return }
    setInput(next)
    if (next.length === sequence.length) {
      if (sequence.length === target) setTimeout(() => onDone(true, `All ${target} systems restored`, 1), 300)
      else setTimeout(() => extend(sequence), 500)
    }
  }
  if (!sequence.length) return <StartGate label="Start drill" onStart={() => extend([])} />
  return (
    <div className="game-simon">
      <p className="game-progress">{playing ? 'Watch the order…' : 'Your turn'} · sequence {sequence.length} of {target}</p>
      <div className="game-simon-grid">{pads.map((Icon, i) => <button key={i} className={lit === i ? 'lit' : ''} onClick={() => tap(i)} disabled={playing} aria-label={`System ${i + 1}`}><Icon /></button>)}</div>
    </div>
  )
}

function Bugs({ onDone }: { onDone: Done }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const snippet = bugSnippets[index]
  const next = () => {
    if (index + 1 < bugSnippets.length) { setIndex(index + 1); setPicked(null); return }
    onDone(score >= 2, `${score} of ${bugSnippets.length} bugs found`, score / bugSnippets.length)
  }
  return (
    <div className="game-bugs">
      <p className="game-progress">Snippet {index + 1} of {bugSnippets.length} · tap the buggy line</p>
      <div className="game-code-block">
        {snippet.lines.map((line, i) => (
          <button key={i} disabled={picked !== null} className={picked === null ? '' : i === snippet.bug ? 'right' : i === picked ? 'wrong' : ''} onClick={() => { setPicked(i); if (i === snippet.bug) setScore(score + 1) }}><span>{i + 1}</span><code>{line}</code></button>
        ))}
      </div>
      {picked !== null && <><p className={picked === snippet.bug ? 'game-feedback right' : 'game-feedback wrong'}>{snippet.why}</p><button className="game-next" onClick={next}>{index + 1 < bugSnippets.length ? 'Next snippet' : 'See result'}</button></>}
    </div>
  )
}

function Password({ onDone }: { onDone: Done }) {
  const [value, setValue] = useState('')
  const words = value.trim().split(/[\s-]+/).filter(Boolean)
  const checks = [
    { label: 'At least 14 characters', ok: value.length >= 14 },
    { label: 'Three or more words', ok: words.length >= 3 },
    { label: 'Includes a number or symbol', ok: /[\d!@#$%^&*?.,_+=]/.test(value) },
    { label: 'No obvious words like “password” or “westpac”', ok: Boolean(value) && !/password|westpac|qwerty|1234/i.test(value) },
  ]
  return (
    <div className="game-password">
      <label htmlFor="passphrase">Your practice passphrase</label>
      <input id="passphrase" value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. purple-koala-sings-42" autoComplete="off" spellCheck={false} />
      <ul>{checks.map((check) => <li key={check.label} className={check.ok ? 'ok' : ''}><Check size={14} />{check.label}</li>)}</ul>
      <button className="game-next" disabled={!checks.every((check) => check.ok)} onClick={() => onDone(true, 'Passphrase passes every check', 1)}>Lock it in</button>
    </div>
  )
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = ([text, bg]: string[]) => {
  const [a, b] = [luminance(text), luminance(bg)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}
function Contrast({ onDone }: { onDone: Done }) {
  const [rounds] = useState(() => contrastRounds.map((pair) => shuffle(pair)))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const options = rounds[index]
  const best = contrast(options[0]) > contrast(options[1]) ? 0 : 1
  const next = () => {
    if (index + 1 < rounds.length) { setIndex(index + 1); setPicked(null); return }
    onDone(score >= 3, `${score} of ${rounds.length} correct`, score / rounds.length)
  }
  return (
    <div className="game-contrast">
      <p className="game-progress">Round {index + 1} of {rounds.length} · which is easier to read?</p>
      <div className="game-contrast-grid">
        {options.map(([text, bg], i) => (
          <button key={i} disabled={picked !== null} className={picked === null ? '' : i === best ? 'right' : 'wrong'} style={{ color: text, background: bg }} onClick={() => { setPicked(i); if (i === best) setScore(score + 1) }}>
            Aa<small>{picked === null ? 'Readable?' : `${contrast(options[i]).toFixed(1)} : 1`}</small>
          </button>
        ))}
      </div>
      {picked !== null && <><p className="game-feedback">Accessible text needs a contrast ratio of at least 4.5 : 1.</p><button className="game-next" onClick={next}>{index + 1 < rounds.length ? 'Next round' : 'See result'}</button></>}
    </div>
  )
}

function Roadmap({ onDone }: { onDone: Done }) {
  const [chosen, setChosen] = useState<string[]>([])
  const picked = roadmapFeatures.filter((feature) => chosen.includes(feature.name))
  const cost = picked.reduce((sum, feature) => sum + feature.cost, 0)
  const value = picked.reduce((sum, feature) => sum + feature.value, 0)
  return (
    <div className="game-roadmap">
      <div className="game-meters">
        <div className={cost > 10 ? 'over' : ''}><small>Capacity</small><b>{cost} / 10</b><span style={{ width: `${Math.min(cost / 10, 1) * 100}%` }} /></div>
        <div className={value >= 19 ? 'met' : ''}><small>Customer value</small><b>{value} / 19</b><span style={{ width: `${Math.min(value / 19, 1) * 100}%` }} /></div>
      </div>
      <div className="game-features">
        {roadmapFeatures.map((feature) => (
          <button key={feature.name} className={chosen.includes(feature.name) ? 'selected' : ''} aria-pressed={chosen.includes(feature.name)} onClick={() => setChosen(chosen.includes(feature.name) ? chosen.filter((name) => name !== feature.name) : [...chosen, feature.name])}>
            <b>{feature.name}</b><small>{feature.cost} capacity · {feature.value} value</small>
          </button>
        ))}
      </div>
      <button className="game-next" disabled={!cost || cost > 10} onClick={() => onDone(value >= 19, `${value} value for ${cost} capacity`, (value - 15) / 6)}>{cost > 10 ? 'Over capacity' : 'Ship this roadmap'}</button>
    </div>
  )
}

function Game({ challenge, onDone }: { challenge: Challenge; onDone: Done }) {
  switch (challenge.kind) {
    case 'quiz': return <Quiz questions={challenge.questions} onDone={onDone} />
    case 'code': return <CodeWord code={challenge.code} onDone={onDone} />
    case 'order': return <Order steps={challenge.steps} onDone={onDone} />
    case 'match': return <Match pairs={challenge.pairs} onDone={onDone} />
    case 'scramble': return <Scramble words={challenge.words} onDone={onDone} />
    case 'memory': return <Memory onDone={onDone} />
    case 'packets': return <Packets onDone={onDone} />
    case 'pedal': return <Pedal onDone={onDone} />
    case 'phish': return <Phish onDone={onDone} />
    case 'simon': return <Simon onDone={onDone} />
    case 'bugs': return <Bugs onDone={onDone} />
    case 'password': return <Password onDone={onDone} />
    case 'contrast': return <Contrast onDone={onDone} />
    case 'roadmap': return <Roadmap onDone={onDone} />
  }
}

// Plays a booth challenge. The first win asks for a leaderboard nickname, which is remembered.
// In demo mode (from the admin panel) nothing is saved and no details are asked for.
export function ChallengeSheet({ challenge, accent, onClose, onComplete, demo }: { challenge: Challenge; accent: string; onClose: () => void; onComplete: (points: number) => void; demo?: boolean }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ passed: boolean; summary: string; points: number } | null>(null)
  const [player, setPlayer] = useState(readPlayer)
  const [nickname, setNickname] = useState('')
  const [touched, setTouched] = useState(false)
  const problem = nicknameProblem(nickname)

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  const finish = (passed: boolean, summary: string, performance: number) => {
    const points = challengePoints(performance)
    setResult({ passed, summary, points })
    if (!passed) return
    navigator.vibrate?.([20, 40, 60])
    if (player && !demo) onComplete(points)
  }

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (problem) return
    const next = { id: crypto.randomUUID(), nickname: nickname.trim() }
    localStorage.setItem(playerKey, JSON.stringify(next))
    setPlayer(next)
    onComplete(result!.points)
  }

  return (
    <div className="challenge-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="challenge-sheet" role="dialog" aria-modal="true" aria-labelledby="challenge-title" style={{ '--accent': accent } as React.CSSProperties} onMouseDown={(event) => event.stopPropagation()}>
        <button className="challenge-close" onClick={onClose} aria-label="Close challenge"><X size={20} /></button>
        <p className="challenge-kind">{challengeKinds[challenge.kind]}</p>
        <h2 id="challenge-title">{challenge.title}</h2>
        {!result && <p className="challenge-intro">{challenge.intro}</p>}

        {!result && <Game key={attempt} challenge={challenge} onDone={finish} />}

        {result && !result.passed && (
          <div className="challenge-result">
            <span className="challenge-result-icon miss" aria-hidden="true"><X /></span>
            <h3>So close!</h3>
            <p>{result.summary}. Give it another go.</p>
            <button className="game-next" onClick={() => { setResult(null); setAttempt(attempt + 1) }}>Try again</button>
          </div>
        )}

        {result?.passed && !player && !demo && (
          <form className="challenge-profile" onSubmit={saveProfile} noValidate>
            <span className="challenge-result-icon" aria-hidden="true"><Check /></span>
            <h3>Challenge complete!</h3>
            <p><b>+{result.points} points.</b> {result.summary}. Pick a nickname for the leaderboard. No real names needed, and we’ll remember it for your next challenges.</p>
            <label>Nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="nickname" maxLength={20} placeholder="e.g. Quantum Koala" /></label>
            {touched && problem && <small className="game-hint">{problem}</small>}
            <button className="game-next">Save and claim my points</button>
          </form>
        )}

        {result?.passed && (player || demo) && (
          <div className="challenge-result">
            <span className="challenge-result-icon" aria-hidden="true"><Check /></span>
            <h3>Challenge complete!</h3>
            <p className="challenge-points">+{result.points} points</p>
            <p>{result.summary}. {demo ? 'Demo mode, so nothing was saved.' : `Saved for ${player!.nickname}.`}</p>
            <button className="game-next" onClick={onClose}>{demo ? 'Close demo' : 'Back to the booth'}</button>
          </div>
        )}
      </section>
    </div>
  )
}
