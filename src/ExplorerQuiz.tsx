import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Clock, Compass, MapPin, RotateCcw, X } from 'lucide-react'
import { exhibits, tours } from './data'
import './ExplorerQuiz.css'

type TourId = 'ai-edit' | 'under-the-hood' | 'front-of-house' | 'safe-and-sound' | 'grow-your-career' | 'heart-of-westpac' | 'first-look'
type Option = { label: string; detail: string; points: Partial<Record<TourId, number>> }
type Question = { prompt: string; options: Option[] }

// Q1 sets your main interest (3 points); Q2 (style) and Q3 (time) nudge the result.
// Ties go to your Q1 pick, then to the order tours are listed in data.ts.
const questions: Question[] = [
  {
    prompt: 'Which gallery do you wander into first?',
    options: [
      { label: 'The future wing', detail: 'Robots, quantum and whatever comes next', points: { 'ai-edit': 3 } },
      { label: 'The workshop', detail: 'I want to see how it’s built', points: { 'under-the-hood': 3 } },
      { label: 'The shopfront', detail: 'What our customers actually see and use', points: { 'front-of-house': 3 } },
      { label: 'The vault', detail: 'Locks, alarms and keeping things running', points: { 'safe-and-sound': 3 } },
      { label: 'The study hall', detail: 'New skills and my next career move', points: { 'grow-your-career': 3 } },
      { label: 'The people’s gallery', detail: 'Stories, communities and causes', points: { 'heart-of-westpac': 3 } },
    ],
  },
  {
    prompt: 'Pick your explorer style.',
    options: [
      { label: 'Skim the highlights', detail: 'Best bits only, no jargon please', points: { 'first-look': 3, 'heart-of-westpac': 1 } },
      { label: 'Chat with the guides', detail: 'I’ll ask the hosts a hundred questions', points: { 'front-of-house': 1, 'grow-your-career': 1, 'heart-of-westpac': 1 } },
      { label: 'Open the display case', detail: 'Give me the technical detail', points: { 'under-the-hood': 2, 'ai-edit': 1, 'safe-and-sound': 1 } },
    ],
  },
  {
    prompt: 'How long is your expedition?',
    options: [
      { label: 'A quick 20-minute loop', detail: 'I’ve got a meeting soon', points: { 'first-look': 2, 'safe-and-sound': 1, 'heart-of-westpac': 1 } },
      { label: 'About half an hour', detail: 'Time for a proper look', points: { 'ai-edit': 1, 'front-of-house': 1, 'grow-your-career': 1 } },
      { label: '40 minutes or more', detail: 'Pack my snacks, I’m here a while', points: { 'under-the-hood': 1, 'front-of-house': 1, 'grow-your-career': 1 } },
    ],
  },
]

const explorerTypes: Record<TourId, { label: string; tagline: string }> = {
  'ai-edit': { label: 'The Time Traveller', tagline: 'You skip the past and head straight for tomorrow.' },
  'under-the-hood': { label: 'The Tinkerer', tagline: 'You read the plaque, then ask how the exhibit was built.' },
  'front-of-house': { label: 'The Concierge', tagline: 'You see every exhibit through a customer’s eyes.' },
  'safe-and-sound': { label: 'The Vault Keeper', tagline: 'You notice the alarms before the artwork.' },
  'grow-your-career': { label: 'The Apprentice Adventurer', tagline: 'Every gallery is a chance to level up.' },
  'heart-of-westpac': { label: 'The Storyteller', tagline: 'You come for the people behind the exhibits.' },
  'first-look': { label: 'The Speed Sightseer', tagline: 'Highlights in, jargon out, back before your coffee cools.' },
}

type Answers = (number | null)[]

function recommendTour(answers: Answers): string {
  const scores = new Map<string, number>(tours.map((tour) => [tour.id, 0]))
  answers.forEach((answer, index) => {
    if (answer === null) return
    const option = questions[index].options[answer]
    for (const [id, points] of Object.entries(option.points)) scores.set(id, (scores.get(id) ?? 0) + (points ?? 0))
  })
  const interest = answers[0] === null ? undefined : Object.keys(questions[0].options[answers[0]].points)[0]
  let best = tours[0].id
  for (const tour of tours) {
    const score = scores.get(tour.id)!
    const top = scores.get(best)!
    if (score > top || (score === top && tour.id === interest)) best = tour.id
  }
  return best
}

const emptyAnswers = (): Answers => questions.map(() => null)

export function ExplorerQuiz({ onChoose, onClose }: { onChoose: (tourId: string) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      if (opener?.isConnected && (document.activeElement === document.body || document.activeElement === null)) opener.focus({ preventScroll: true })
    }
  }, [])

  // Move focus to the new heading so screen readers announce each step.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    headingRef.current?.focus({ preventScroll: true })
  }, [step])

  const choose = (index: number) => {
    setAnswers((current) => current.map((answer, i) => (i === step ? index : answer)))
    setStep((current) => current + 1)
  }
  const retake = () => { setAnswers(emptyAnswers()); setStep(0) }
  const close = () => { dialogRef.current?.close(); onClose() }

  const finished = step >= questions.length
  const tour = finished ? tours.find((item) => item.id === recommendTour(answers))! : null
  const type = tour ? explorerTypes[tour.id as TourId] : null

  return (
    <dialog
      ref={dialogRef}
      className="explorer-quiz"
      aria-labelledby="explorer-quiz-title"
      onCancel={(event) => { event.preventDefault(); close() }}
      onClick={(event) => { if (event.target === event.currentTarget) close() }}
    >
      <div className="explorer-quiz-inner">
        <button type="button" className="explorer-quiz-close" onClick={close} aria-label="Close explorer quiz"><X size={18} /></button>
        <p className="explorer-quiz-kicker"><Compass size={13} aria-hidden="true" />What kind of explorer are you?</p>

        {!finished ? (
          <>
            <div className="explorer-quiz-progress" aria-hidden="true">
              {questions.map((_, i) => <span key={i} className={i <= step ? 'is-done' : undefined} />)}
            </div>
            <p className="explorer-quiz-count">Question {step + 1} of {questions.length}</p>
            <h2 id="explorer-quiz-title" ref={headingRef} tabIndex={-1}>{questions[step].prompt}</h2>
            <div className="explorer-quiz-options" role="group" aria-labelledby="explorer-quiz-title">
              {questions[step].options.map((option, index) => (
                <button key={option.label} type="button" className="explorer-quiz-option" aria-pressed={answers[step] === index} onClick={() => choose(index)}>
                  <strong>{option.label}</strong>
                  <span>{option.detail}</span>
                </button>
              ))}
            </div>
            <div className="explorer-quiz-nav">
              {step > 0 ? <button type="button" className="explorer-quiz-link" onClick={() => setStep(step - 1)}><ArrowLeft size={14} aria-hidden="true" />Back</button> : <span />}
              {answers[step] !== null && <button type="button" className="explorer-quiz-link" onClick={() => setStep(step + 1)}>Keep answer<ArrowRight size={14} aria-hidden="true" /></button>}
            </div>
          </>
        ) : tour && type && (
          <div className="explorer-quiz-result" style={{ '--tour-colour': tour.colour } as CSSProperties}>
            <p className="explorer-quiz-count">You’re</p>
            <h2 id="explorer-quiz-title" ref={headingRef} tabIndex={-1}>{type.label}</h2>
            <p className="explorer-quiz-tagline">{type.tagline}</p>
            <div className="explorer-quiz-tour">
              <p className="explorer-quiz-count">Your tour · {tour.audience}</p>
              <h3>{tour.title}</h3>
              <p className="explorer-quiz-meta">
                <span><Clock size={13} aria-hidden="true" />{tour.minutes} min</span>
                <span><MapPin size={13} aria-hidden="true" />{tour.stops.length} stops</span>
              </p>
              <p className="explorer-quiz-desc">{tour.description}</p>
              <ol className="explorer-quiz-stops">
                {tour.stops.map((id) => <li key={id}>{exhibits.find((exhibit) => exhibit.id === id)?.title ?? id}</li>)}
              </ol>
            </div>
            <div className="explorer-quiz-actions">
              <button type="button" className="explorer-quiz-primary" onClick={() => { dialogRef.current?.close(); onChoose(tour.id) }}>Start this tour<ArrowRight size={16} aria-hidden="true" /></button>
              <button type="button" className="explorer-quiz-secondary" onClick={retake}><RotateCcw size={14} aria-hidden="true" />Retake</button>
            </div>
            <button type="button" className="explorer-quiz-link explorer-quiz-back" onClick={() => setStep(questions.length - 1)}><ArrowLeft size={14} aria-hidden="true" />Change my last answer</button>
          </div>
        )}
      </div>
    </dialog>
  )
}
