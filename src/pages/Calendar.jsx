import { useState } from 'react'
import { channelById, networks as allNetworks } from '../config/channels.js'
import { go } from '../components/ui.jsx'
import { useStore } from '../store/store.jsx'

export const NETWORK_COLOURS = {
  Instagram: '#C2457A',
  TikTok: '#1E2129',
  Snapchat: '#D4B200',
  Facebook: '#3B5BDB',
  X: '#5F6670',
  YouTube: '#C7372F',
  WhatsApp: '#2F9E5B',
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export default function Calendar() {
  const { state } = useStore()
  const monday = (d) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
    return x
  }
  const [cursor, setCursor] = useState(() => monday(new Date()))
  const [hidden, setHidden] = useState([])
  const today = new Date()

  const slots = state.posts
    .filter((p) => p.status !== 'draft')
    .flatMap((p) => p.formats.filter((f) => f.enabled).map((f) => ({ post: p, f, ch: channelById(f.channelId), t: new Date(f.scheduledAt) })))
    .filter((s) => !hidden.includes(s.ch.network))

  // A rolling four-week view, starting on this week's Monday.
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(cursor)
    d.setDate(cursor.getDate() + i)
    return d
  })
  const last = days[27]
  const fmt = (d, o) => d.toLocaleDateString('en-GB', o)
  const month = `${fmt(cursor, { day: 'numeric', month: 'long' })} to ${fmt(last, { day: 'numeric', month: 'long', year: 'numeric' })}`
  const move = (n) => {
    const d = new Date(cursor)
    d.setDate(d.getDate() + n * 28)
    setCursor(d)
  }

  return (
    <div className="page">
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>{month}</h1>
          <p className="muted" style={{ margin: 0 }}>
            Everything scheduled or waiting for approval, by channel. Waiting items are shaded until Layla approves them.
          </p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => move(-1)} aria-label="Previous four weeks">
            Previous
          </button>
          <button className="btn" onClick={() => setCursor(monday(today))}>
            Today
          </button>
          <button className="btn" onClick={() => move(1)} aria-label="Next four weeks">
            Next
          </button>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {allNetworks.map((n) => (
          <button key={n.id} className={`chip ${hidden.includes(n.id) ? '' : 'on'}`} onClick={() => setHidden(hidden.includes(n.id) ? hidden.filter((x) => x !== n.id) : [...hidden, n.id])} aria-pressed={!hidden.includes(n.id)}>
            <i style={{ width: 8, height: 8, borderRadius: '50%', background: NETWORK_COLOURS[n.id], display: 'inline-block' }} />
            {n.id}
          </button>
        ))}
      </div>
      <div className="cal">
        {DOW.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const here = slots.filter((s) => sameDay(s.t, d)).sort((a, b) => a.t - b.t)
          return (
            <div key={d.toISOString()} className={`day ${d < monday(today) ? 'other' : ''} ${sameDay(d, today) ? 'today' : ''}`}>
              <span className="num" title={fmt(d, { day: 'numeric', month: 'long' })}>{d.getDate()}</span>
              {d.getDate() === 1 && <span className="tiny muted" style={{ marginTop: -4 }}>{fmt(d, { month: 'long' })}</span>}
              {here.slice(0, 4).map((s) => (
                <button
                  key={s.post.id + s.f.channelId}
                  className={`slot ${['pending', 'changes'].includes(s.post.status) ? 'pending' : ''} ${s.post.status === 'published' ? 'published' : ''}`}
                  onClick={() => go(`review?${s.post.id}`)}
                  title={`${s.post.title}, ${s.ch.name}, ${s.t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
                >
                  <i style={{ background: NETWORK_COLOURS[s.ch.network] }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} {s.post.title}
                  </span>
                </button>
              ))}
              {here.length > 4 && <span className="tiny muted">and {here.length - 4} more</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
