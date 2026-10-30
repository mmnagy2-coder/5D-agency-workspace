import { useState } from 'react'
import { agency, engines } from '../config/agency.js'
import { brand } from '../config/brand.js'
import { BrandLogo } from '../creative/Creative.jsx'
import { ROLE_INFO, useStore } from '../store/store.jsx'
import { go, Icon, relTime } from './ui.jsx'

export const PAGES = {
  home: 'Create',
  create: 'Create',
  review: 'Review and approve',
  calendar: 'Calendar',
  library: 'Library',
  templates: 'Templates',
  kit: 'Brand kit',
  channels: 'Channels',
  reports: 'Reports',
  help: 'Ask 5D',
  desk: 'Agency desk',
}

export function Rail({ route }) {
  const { state, dispatch } = useStore()
  const side = ROLE_INFO[state.role].side
  const pending = state.posts.filter((p) => p.status === 'pending').length
  const changes = state.posts.filter((p) => p.status === 'changes').length
  const open = state.tickets.filter((t) => t.status !== 'delivered').length
  const fresh = state.tickets.filter((t) => t.status === 'new').length
  const newTpl = state.templates.filter((t) => t.isNew).length
  const reviewCount = state.role === 'approver' ? pending : state.role === 'maker' ? changes : 0

  const item = (id, icon, label, count) => (
    <button key={id} className={`nav-item ${route === id || (id === 'home' && route === 'create') ? 'on' : ''}`} onClick={() => go(id)}>
      <Icon name={icon} />
      {label}
      {count ? <span className="count">{count}</span> : null}
    </button>
  )

  return (
    <aside className="rail">
      <div className="rail-brand">
        <BrandLogo size={30} text={false} />
        <div>
          <b>{brand.workspaceName}</b>
          <small>
            with <em>{agency.name}</em>
            {brand.demo ? ', demo brand' : ''}
          </small>
        </div>
      </div>
      <nav aria-label="Workspace">
        {side === 'agency' && (
          <>
            {item('desk', 'desk', 'Agency desk', fresh)}
            <div className="group">Inside the client workspace</div>
          </>
        )}
        {item('home', 'create', 'Create')}
        {item('review', 'review', 'Review', reviewCount)}
        {item('calendar', 'calendar', 'Calendar')}
        <div className="group">Brand</div>
        {item('library', 'library', 'Library')}
        {item('templates', 'templates', 'Templates', side === 'client' ? newTpl : 0)}
        {item('kit', 'kit', 'Brand kit')}
        <div className="group">Results</div>
        {item('channels', 'channels', 'Channels')}
        {item('reports', 'reports', 'Reports')}
        {side === 'client' && item('help', 'help', 'Ask 5D', open)}
      </nav>
      <div className="rail-foot">
        {engines.map((e) => (
          <div key={e.id} title={e.does}>
            <span className="engine-dot" />
            {e.name}: {e.status.toLowerCase()}
          </div>
        ))}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => {
              dispatch({ type: 'reset' })
              go('home')
            }}
          >
            Reset demo data
          </button>
        </div>
      </div>
    </aside>
  )
}

export function Topbar({ route }) {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const side = ROLE_INFO[state.role].side
  const mine = state.notifications.filter((n) => n.to === side)
  const unread = mine.some((n) => !n.read)

  const setRole = (role) => {
    dispatch({ type: 'role', role })
    if (role === 'agency' && route !== 'desk') go('desk')
    if (role !== 'agency' && (route === 'desk')) go('home')
  }

  return (
    <header className="topbar">
      <span className="crumb">{PAGES[route] || 'Create'}</span>
      <span className="spacer" />
      <span className="small muted">Viewing as</span>
      <div className="roles" role="group" aria-label="Switch role">
        {Object.entries(ROLE_INFO).map(([id, r]) => (
          <button key={id} className={`${state.role === id ? 'on' : ''} ${id === 'agency' ? 'agency' : ''}`} onClick={() => setRole(id)} aria-pressed={state.role === id}>
            {r.label}
          </button>
        ))}
      </div>
      <button
        className="bell"
        aria-label="Notifications"
        onClick={() => {
          setOpen(!open)
          if (!open) setTimeout(() => dispatch({ type: 'notifications/read', to: side }), 1500)
        }}
      >
        <Icon name="bell" size={17} />
        {unread && <i />}
      </button>
      {open && (
        <div className="notif-pop" onMouseLeave={() => setOpen(false)}>
          {mine.length === 0 && <p className="muted small" style={{ padding: 10 }}>Nothing new.</p>}
          {mine.slice(0, 8).map((n) => (
            <button
              key={n.id}
              className={n.read ? '' : 'unread'}
              onClick={() => {
                setOpen(false)
                if (n.link) go(n.link)
              }}
            >
              {n.text}
              <div className="tiny muted">{relTime(n.at)}</div>
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
