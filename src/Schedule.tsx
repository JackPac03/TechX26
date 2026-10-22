import { useState } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'
import { eventDate, exhibits, schedule, type Exhibit } from './data'

const minutes = (time: string) => {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

const clock = (time: string) => {
  const [hours, mins] = time.split(':').map(Number)
  return `${((hours + 11) % 12) + 1}:${String(mins).padStart(2, '0')}${hours < 12 ? 'am' : 'pm'}`
}

export function Schedule({ onOpen }: { onOpen: (exhibit: Exhibit) => void }) {
  const [now] = useState(() => new Date())
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const current = now.getHours() * 60 + now.getMinutes()

  return (
    <section className="section schedule-section" id="schedule">
      <div className="section-heading" data-reveal>
        <div><p className="kicker">Friday 27 November</p><h2>Plan your day.</h2></div>
        <p>Keynotes, activities and breaks, with where to find them. On the day, what’s on right now is highlighted.</p>
      </div>
      <ol className="schedule-list">
        {schedule.map((session, index) => {
          const start = minutes(session.start)
          const end = session.end ? minutes(session.end) : start + 30
          const status = today !== eventDate ? '' : current >= end ? 'past' : current >= start ? 'now' : ''
          const exhibit = exhibits.find((item) => item.id === session.exhibit)
          return (
            <li key={`${session.start}-${session.title}`} className={`schedule-item ${status}`} data-reveal style={{ '--i': index } as React.CSSProperties}>
              <div className="schedule-time"><strong>{clock(session.start)}</strong>{session.end && <span>to {clock(session.end)}</span>}</div>
              <div className="schedule-card">
                <div className="schedule-meta"><span>{session.kind}</span>{status === 'now' && <b>Happening now</b>}</div>
                <h3>{session.title}</h3>
                <p>{session.detail}</p>
                <div className="schedule-footer">
                  <span><MapPin size={14} />{session.place}</span>
                  {exhibit && <button onClick={() => onOpen(exhibit)}>Open booth <ArrowRight size={14} /></button>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
