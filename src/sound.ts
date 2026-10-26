// Small synthesised sound effects, so there are no audio files to load.
let context: AudioContext | undefined

const audio = () => {
  if (!context) {
    // On iPhone, 'ambient' audio stays quiet when the silent switch is on.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'ambient'
    context = new AudioContext()
  }
  if (context.state === 'suspended') void context.resume()
  return context
}

// Browsers only allow sound after a tap or key press, so wake audio on the first one.
// Later stamps from the camera scanner then play without a tap of their own.
const unlock = () => {
  if (audio().state !== 'running') return
  removeEventListener('pointerup', unlock)
  removeEventListener('keydown', unlock)
}
addEventListener('pointerup', unlock)
addEventListener('keydown', unlock)

const tone = (ctx: AudioContext, type: OscillatorType, from: number, to: number, start: number, length: number, volume: number) => {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, start)
  oscillator.frequency.exponentialRampToValueAtTime(to, start + length)
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + length)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + length)
}

const noise = (ctx: AudioContext, start: number, length: number, volume: number, filter: BiquadFilterType, frequency: number) => {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length) ** 2
  const source = ctx.createBufferSource()
  const shape = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  source.buffer = buffer
  shape.type = filter
  shape.frequency.value = frequency
  gain.gain.value = volume
  source.connect(shape).connect(gain).connect(ctx.destination)
  source.start(start)
}

// A rubber stamp thunking onto paper, then a chime. Milestones get a longer fanfare.
export function playStamp(milestone = false) {
  const ctx = audio()
  const now = ctx.currentTime
  tone(ctx, 'sine', 160, 45, now, 0.22, 0.9)
  noise(ctx, now, 0.07, 0.6, 'lowpass', 1600)
  const notes = milestone ? [784, 988, 1175, 1568] : [988, 1319]
  notes.forEach((note, index) => tone(ctx, 'triangle', note, note, now + 0.14 + index * 0.09, 0.5, 0.12))
}

// The clack of an old light switch.
export function playSwitch() {
  const ctx = audio()
  const now = ctx.currentTime
  noise(ctx, now, 0.025, 0.7, 'highpass', 2500)
  tone(ctx, 'square', 240, 120, now, 0.04, 0.08)
}

// A sparkly twinkle for finding something in the dark. The last find gets an extra note.
export function playFind(last = false) {
  const ctx = audio()
  const now = ctx.currentTime
  const notes = last ? [1047, 1319, 1568, 2093] : [1319, 1760]
  notes.forEach((note, index) => tone(ctx, 'sine', note, note, now + index * 0.07, 0.35, 0.1))
}

// A two-tone gallery alarm.
export function playAlarm() {
  const ctx = audio()
  const now = ctx.currentTime
  for (let index = 0; index < 6; index++) tone(ctx, 'sawtooth', index % 2 ? 660 : 880, index % 2 ? 640 : 860, now + index * 0.24, 0.22, 0.07)
}
