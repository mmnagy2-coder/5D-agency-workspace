import { useEffect, useState } from 'react'
import { people } from '../config/agency.js'
import { channelById } from '../config/channels.js'
import { Creative } from '../creative/Creative.jsx'
import { C, Motif, StarPattern } from '../creative/motifs.jsx'
import { useStore } from '../store/store.jsx'

const paths = {
  create: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
  library: 'M4 5h6v14H4zM12 5h3v14h-3zM17 6l3 .8-3.2 12.4-2.9-.8z',
  kit: 'M12 3a9 9 0 100 18c1.1 0 1.5-.8 1.2-1.6-.4-1 .3-2.4 1.6-2.4H17a4 4 0 004-4c0-5-4-10-9-10zM7.5 12.5h.01M9 8h.01M14 7.5h.01',
  templates: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  review: 'M5 12l4 4L19 6',
  calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  channels: 'M5 12a7 7 0 0114 0M8 12a4 4 0 018 0M12 12v8M9 20h6',
  reports: 'M5 20V10M11 20V4M17 20v-7',
  help: 'M12 21a9 9 0 110-18 9 9 0 010 18zM9.5 9a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01',
  desk: 'M3 7h18v4H3zM5 11v9M19 11v9M9 15h6',
  bell: 'M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0',
  close: 'M6 6l12 12M18 6L6 18',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  plus: 'M12 5v14M5 12h14',
  send: 'M4 12l16-8-6 16-2-7z',
  lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z',
  at: 'M16 12a4 4 0 10-1.2 2.8M16 8v5a2 2 0 004 0v-1a8 8 0 10-3 6.2',
}

export function Icon({ name, size = 18, stroke = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

export function Avatar({ id }) {
  const p = people[id]
  if (!p) return <span className="avatar system">QS</span>
  return (
    <span className={`avatar ${p.side === 'agency' ? 'agency' : ''}`} title={`${p.name}, ${p.role}`}>
      {p.initials}
    </span>
  )
}

export const personName = (id) => (id === 'system' ? 'Qamari Studio' : people[id]?.name.split(' ')[0] || 'Someone')

const STATUS = {
  draft: ['Draft', ''],
  pending: ['Waiting for approval', 'warn'],
  changes: ['Changes requested', 'bad'],
  scheduled: ['Scheduled', 'ok'],
  published: ['Published', 'brand'],
}
export function StatusTag({ status }) {
  const [label, cls] = STATUS[status] || [status, '']
  return <span className={`tag ${cls}`}>{label}</span>
}

export function Modal({ children, onClose, wide, label }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        <div className="row end" style={{ marginBottom: -8 }}>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.text}
        </div>
      ))}
    </div>
  )
}

// Thumbnail for any library asset.
export function AssetArt({ asset, w = 600, h = 600 }) {
  if (asset.concept) return <Creative w={w} h={h} concept={asset.concept} dialect={asset.dialect || 'english'} />
  const bg = { night: C.night, date: C.date, milk: C.milk }[asset.palette] || C.night
  const id = `a${asset.id.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={asset.name}>
      <defs>
        <StarPattern id={id} colour={asset.palette === 'milk' ? C.date : C.saffron} size={w * 0.12} opacity={0.08} />
      </defs>
      <rect width={w} height={h} fill={bg} />
      <rect width={w} height={h} fill={`url(#${id})`} />
      {asset.kind === 'logo' && (
        <g>
          <Motif name="greeting" cx={w / 2} cy={h * 0.42} s={w * 0.5} accent={asset.palette === 'date' ? C.milk : C.saffron} />
          <text x={w / 2} y={h * 0.82} textAnchor="middle" fontFamily="'Young Serif', serif" fontSize={w * 0.13} fill={asset.palette === 'date' ? C.milk : C.saffron}>
            Qamari
          </text>
        </g>
      )}
      {asset.kind === 'document' && (
        <g>
          <rect x={w * 0.24} y={h * 0.14} width={w * 0.52} height={h * 0.72} fill="#fff" stroke={C.rose} strokeWidth={w * 0.01} />
          <rect x={w * 0.32} y={h * 0.24} width={w * 0.36} height={h * 0.05} fill={C.night} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={w * 0.32} y={h * (0.36 + i * 0.07)} width={w * (i % 2 ? 0.28 : 0.36)} height={h * 0.02} fill={C.rose} />
          ))}
        </g>
      )}
      {['product', 'character', 'scene', 'video'].includes(asset.kind) && <Motif name={asset.motif} cx={w / 2} cy={h * 0.52} s={w * 0.86} accent={C.saffron} />}
      {asset.kind === 'video' && (
        <g>
          <circle cx={w / 2} cy={h / 2} r={w * 0.1} fill="rgba(0,0,0,0.45)" />
          <path d={`M${w * 0.47} ${h * 0.44} L${w * 0.56} ${h * 0.5} L${w * 0.47} ${h * 0.56} Z`} fill="#fff" />
          <rect x={w * 0.72} y={h * 0.88} width={w * 0.2} height={h * 0.07} rx={h * 0.02} fill="rgba(0,0,0,0.5)" />
          <text x={w * 0.82} y={h * 0.93} textAnchor="middle" fontSize={h * 0.045} fill="#fff" fontFamily="system-ui">
            {asset.duration}
          </text>
        </g>
      )}
    </svg>
  )
}

export function PostThumb({ post, size = 46 }) {
  const ch = channelById('ig-feed')
  return (
    <span className="thumb" style={{ width: size }}>
      <Creative w={ch.w} h={ch.h} concept={post.concept} dialect="english" />
    </span>
  )
}

export function fmtDate(iso, opts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) {
  try {
    return new Date(iso).toLocaleString('en-GB', opts)
  } catch {
    return iso
  }
}

export function relTime(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.round(d / 60)} min ago`
  if (d < 86400) return `${Math.round(d / 3600)} h ago`
  return `${Math.round(d / 86400)} d ago`
}

// Routes are plain hash names (#review, #review-post-abc12) so they survive
// the artifact viewer, which only passes simple #name fragments.
export function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  const route = h.split(/[-?]/)[0] || 'home'
  return { route, param: h.slice(route.length + 1) || null }
}

export function useHashRoute() {
  const get = () => parseHash().route
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const on = () => {
      setRoute(get())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (r) => {
  window.location.hash = r.replace('?', '-')
}
