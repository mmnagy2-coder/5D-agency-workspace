import { useState } from 'react'
import { agency, engines } from '../config/agency.js'
import { brand } from '../config/brand.js'
import { BrandLogo } from '../creative/Creative.jsx'
import { L, t } from '../i18n/index.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'
import { go, Icon, notificationText, relTime } from './ui.jsx'

const CRUMB = { home: 'nav.create', create: 'nav.create', review: 'page.review', calendar: 'nav.calendar', library: 'nav.library', templates: 'nav.templates', kit: 'nav.kit', channels: 'nav.channels', reports: 'nav.reports', help: 'nav.help', desk: 'nav.desk' }

export function Rail({ route }) {
  const { state, dispatch } = useStore()
  const side = ROLE_INFO[state.role].side
  const pending = state.posts.filter((p) => p.status === 'pending').length
  const changes = state.posts.filter((p) => p.status === 'changes').length
  const open = state.tickets.filter((x) => x.status !== 'delivered').length
  const fresh = state.tickets.filter((x) => x.status === 'new').length
  const newTpl = state.templates.filter((x) => x.isNew).length
  const reviewCount = state.role === 'approver' ? pending : state.role === 'maker' ? changes : 0

  const item = (id, icon, labelKey, count) => (
    <button key={id} className={`nav-item ${route === id || (id === 'home' && route === 'create') ? 'on' : ''}`} onClick={() => go(id)}>
      <Icon name={icon} />
      {t(labelKey)}
      {count ? <span className="count">{count}</span> : null}
    </button>
  )

  return (
    <aside className="rail">
      <div className="rail-brand">
        <BrandLogo size={30} text={false} />
        <div>
          <b>{L(brand, 'workspaceName')}</b>
          <small>
            {t('rail.with')} <em>{agency.name}</em>
            {brand.demo ? t('rail.demo') : ''}
          </small>
        </div>
      </div>
      <nav aria-label={t('rail.label')}>
        {side === 'agency' && (
          <>
            {item('desk', 'desk', 'nav.desk', fresh)}
            <div className="group">{t('rail.inside')}</div>
          </>
        )}
        {item('home', 'create', 'nav.create')}
        {item('review', 'review', 'nav.review', reviewCount)}
        {item('calendar', 'calendar', 'nav.calendar')}
        <div className="group">{t('rail.brand')}</div>
        {item('library', 'library', 'nav.library')}
        {item('templates', 'templates', 'nav.templates', side === 'client' ? newTpl : 0)}
        {item('kit', 'kit', 'nav.kit')}
        <div className="group">{t('rail.results')}</div>
        {item('channels', 'channels', 'nav.channels')}
        {item('reports', 'reports', 'nav.reports')}
        {side === 'client' && item('help', 'help', 'nav.help', open)}
      </nav>
      <div className="rail-foot">
        {engines.map((e) => (
          <div key={e.id} title={t(e.doesKey)}>
            <span className="engine-dot" />
            {t('engine.status', { name: e.name })}
          </div>
        ))}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => {
              dispatch({ type: 'reset' })
              go('home')
            }}
          >
            {t('rail.reset')}
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
    if (role !== 'agency' && route === 'desk') go('home')
  }

  return (
    <header className="topbar">
      <span className="crumb">{t(CRUMB[route] || 'nav.create')}</span>
      <span className="spacer" />
      <button
        className="lang"
        onClick={() => dispatch({ type: 'lang', lang: state.lang === 'ar' ? 'en' : 'ar' })}
        lang={state.lang === 'ar' ? 'en' : 'ar'}
        aria-label={t('lang.switch')}
      >
        {state.lang === 'ar' ? 'English' : 'العربية'}
      </button>
      <span className="small muted">{t('top.viewing')}</span>
      <div className="roles" role="group" aria-label={t('top.switchRole')}>
        {Object.entries(ROLE_INFO).map(([id, r]) => (
          <button key={id} className={`${state.role === id ? 'on' : ''} ${id === 'agency' ? 'agency' : ''}`} onClick={() => setRole(id)} aria-pressed={state.role === id}>
            {t(r.labelKey)}
          </button>
        ))}
      </div>
      <button
        className="bell"
        aria-label={t('top.notifications')}
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
          {mine.length === 0 && (
            <p className="muted small" style={{ padding: 10 }}>
              {t('top.nothingNew')}
            </p>
          )}
          {mine.slice(0, 8).map((n) => (
            <button
              key={n.id}
              className={n.read ? '' : 'unread'}
              onClick={() => {
                setOpen(false)
                if (n.link) go(n.link)
              }}
            >
              {notificationText(n)}
              <div className="tiny muted">{relTime(n.at)}</div>
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
