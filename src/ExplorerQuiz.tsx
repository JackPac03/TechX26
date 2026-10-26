import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Clock, Compass, Download, MapPin, RotateCcw, Share2, Sparkles, Sticker, X } from 'lucide-react'
import { exhibits, tours } from './data'
import { ExplorerCard } from './ExplorerSticker'
import { explorerQuestions as questions, explorerTypeKey, scoreExplorer, type ExplorerType } from './explorerTypes'
import './ExplorerQuiz.css'

type Answers = (number | null)[]
const emptyAnswers = (): Answers => questions.map(() => null)
const canShareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] })

export function ExplorerQuiz({ saved, onResult, onChoose, onClose }: { saved?: ExplorerType; onResult: (type: ExplorerType) => void; onChoose: (tourId: string) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  // Someone who has already taken the quiz goes straight to their card.
  const [step, setStep] = useState(saved ? questions.length : 0)
  const [result, setResult] = useState(saved)
  const [saving, setSaving] = useState(false)

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
    const next = answers.map((answer, i) => (i === step ? index : answer))
    setAnswers(next)
    setStep(step + 1)
    if (step < questions.length - 1) return
    const type = scoreExplorer(next as number[])
    setResult(type)
    localStorage.setItem(explorerTypeKey, type.id)
    onResult(type)
  }
  const retake = () => { setAnswers(emptyAnswers()); setStep(0) }
  const close = () => { dialogRef.current?.close(); onClose() }

  // Download the card, or hand it to the share sheet where the device supports it.
  const saveCard = async (share: boolean) => {
    if (!cardRef.current || !result) return
    setSaving(true)
    try {
      const { toBlob } = await import('html-to-image')
      const blob = await toBlob(cardRef.current, { pixelRatio: 4, style: { boxShadow: 'none' } })
      if (!blob) return
      const fileName = `techx26-${result.id}-explorer-card.png`
      if (share) {
        await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], text: `I’m ${result.label} at the TECHx26 Museum of Technology. #TECHx26` })
        return
      }
      const link = document.createElement('a')
      link.download = fileName
      link.href = URL.createObjectURL(blob)
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    } catch {
      // The visitor closed the share sheet.
    } finally {
      setSaving(false)
    }
  }

  const finished = step >= questions.length && result
  const tour = finished ? tours.find((item) => item.id === result.tour)! : null

  return (
    <dialog
      ref={dialogRef}
      className={finished ? 'explorer-quiz is-result' : 'explorer-quiz'}
      aria-labelledby="explorer-quiz-title"
      onCancel={(event) => { event.preventDefault(); close() }}
      onClick={(event) => { if (event.target === event.currentTarget) close() }}
    >
      <button type="button" className="explorer-quiz-close" onClick={close} aria-label="Close explorer quiz"><X size={18} /></button>
      <div className="explorer-quiz-inner">
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
              {answers[step] !== null && <button type="button" className="explorer-quiz-link" onClick={() => choose(answers[step]!)}>Keep answer<ArrowRight size={14} aria-hidden="true" /></button>}
            </div>
          </>
        ) : tour && (
          <div className="explorer-quiz-result" style={{ '--tour-colour': tour.colour } as CSSProperties}>
            <p className="explorer-quiz-count">You’re</p>
            <h2 id="explorer-quiz-title" ref={headingRef} tabIndex={-1}>{result.label}</h2>
            <p className="explorer-quiz-tagline">{result.tagline}</p>
            <div className="explorer-quiz-collect">
              <Sticker size={22} aria-hidden="true" />
              <p><strong>Collect your sticker</strong>Show this card at the welcome desk to pick up your {result.short} sticker.</p>
            </div>
            <div className="explorer-quiz-save" aria-busy={saving}>
              <button type="button" className="explorer-quiz-secondary" onClick={() => saveCard(false)} disabled={saving}><Download size={15} aria-hidden="true" />Save my card</button>
              {canShareFiles && <button type="button" className="explorer-quiz-secondary" onClick={() => saveCard(true)} disabled={saving}><Share2 size={15} aria-hidden="true" />Share</button>}
            </div>
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
            {answers[questions.length - 1] !== null && <button type="button" className="explorer-quiz-link explorer-quiz-back" onClick={() => setStep(questions.length - 1)}><ArrowLeft size={14} aria-hidden="true" />Change my last answer</button>}
          </div>
        )}
      </div>
      {/* The card waits face down while you answer, then flips to reveal your type. */}
      <div className="explorer-quiz-stage" aria-hidden={!finished} style={result ? { '--from': result.colours[0] } as CSSProperties : undefined}>
        <div className={finished ? 'explorer-flip revealed' : 'explorer-flip'}>
          <div className="explorer-flip-back">
            <span className="brand-mark">TECH<span>x</span>26</span>
            <span className="explorer-flip-seal"><Sparkles size={34} strokeWidth={1.5} /></span>
            <strong>Your explorer card</strong>
            <small>{finished ? '' : `${questions.length - step} question${questions.length - step === 1 ? '' : 's'} to reveal`}</small>
          </div>
          <div className="explorer-flip-front">{result && <ExplorerCard ref={cardRef} type={result} />}</div>
        </div>
      </div>
    </dialog>
  )
}
