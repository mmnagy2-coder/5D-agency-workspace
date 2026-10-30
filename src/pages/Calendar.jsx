import { useState } from 'react'
import { channelById, networks as allNetworks, networkName } from '../config/channels.js'
import { go, personName } from '../components/ui.jsx'
import { isAr, L, locale, t } from '../i18n/index.js'
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

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export default function Calendar() {
  const { state } = useStore()
  // Weeks start on Monday in English and on Saturday in Arabic, as they do in Egypt.
  const weekStart = isAr() ? 6 : 1
  const startOfWeek = (d) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    x.setDate(x.getDate() - ((x.getDay() - weekStart + 7) % 7))
    return x
  }
  const [offset, setOffset] = useState(0)
  const [hidden, setHidden] = useState([])
  const today = new Date()
  const thisWeek = startOfWeek(today)
  const cursor = new Date(thisWeek)
  cursor.setDate(thisWeek.getDate() + offset * 28)

  const slots = state.posts
    .filter((p) => p.status !== 'draft')
    .flatMap((p) => p.formats.filter((f) => f.enabled).map((f) => ({ post: p, f, ch: channelById(f.channelId), t: new Date(f.scheduledAt) })))
    .filter((s) => !hidden.includes(s.ch.network))

  // A rolling four-week view, starting at the beginning of this week.
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(cursor)
    d.setDate(cursor.getDate() + i)
    return d
  })
  const last = days[27]
  const fmt = (d, o) => d.toLocaleDateString(locale(), o)
  const time = (d) => d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })
  const month = t('calendar.range', { from: fmt(cursor, { day: 'numeric', month: 'long' }), to: fmt(last, { day: 'numeric', month: 'long', year: 'numeric' }) })
  const dow = days.slice(0, 7).map((d) => fmt(d, { weekday: 'short' }))

  return (
    <div className="page">
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>{month}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {t('calendar.lede', { name: personName('layla') })}
          </p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setOffset(offset - 1)} aria-label={t('calendar.prevLabel')}>
            {t('calendar.prev')}
          </button>
          <button className="btn" onClick={() => setOffset(0)}>
            {t('calendar.today')}
          </button>
          <button className="btn" onClick={() => setOffset(offset + 1)} aria-label={t('calendar.nextLabel')}>
            {t('calendar.next')}
          </button>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {allNetworks.map((n) => (
          <button key={n.id} className={`chip ${hidden.includes(n.id) ? '' : 'on'}`} onClick={() => setHidden(hidden.includes(n.id) ? hidden.filter((x) => x !== n.id) : [...hidden, n.id])} aria-pressed={!hidden.includes(n.id)}>
            <i style={{ width: 8, height: 8, borderRadius: '50%', background: NETWORK_COLOURS[n.id], display: 'inline-block' }} />
            {networkName(n.id, isAr())}
          </button>
        ))}
      </div>
      <div className="cal">
        {dow.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const here = slots.filter((s) => sameDay(s.t, d)).sort((a, b) => a.t - b.t)
          return (
            <div key={d.toISOString()} className={`day ${d < thisWeek ? 'other' : ''} ${sameDay(d, today) ? 'today' : ''}`}>
              <span className="num" title={fmt(d, { day: 'numeric', month: 'long' })}>{d.getDate()}</span>
              {d.getDate() === 1 && <span className="tiny muted" style={{ marginTop: -4 }}>{fmt(d, { month: 'long' })}</span>}
              {here.slice(0, 4).map((s) => (
                <button
                  key={s.post.id + s.f.channelId}
                  className={`slot ${['pending', 'changes'].includes(s.post.status) ? 'pending' : ''} ${s.post.status === 'published' ? 'published' : ''}`}
                  onClick={() => go(`review?${s.post.id}`)}
                  title={[L(s.post, 'title'), L(s.ch, 'name'), time(s.t)].join(isAr() ? '، ' : ', ')}
                >
                  <i style={{ background: NETWORK_COLOURS[s.ch.network] }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {time(s.t)} {L(s.post, 'title')}
                  </span>
                </button>
              ))}
              {here.length > 4 && <span className="tiny muted">{t('calendar.more', { n: here.length - 4 })}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
