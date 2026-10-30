import { useState } from 'react'
import { people } from '../config/agency.js'
import { TemplateBuilder } from '../components/TemplateBuilder.jsx'
import { Thread, TICKET_STATUS, TicketTag } from '../components/Thread.jsx'
import { actionText, Avatar, fmtDate, go, personName, relTime } from '../components/ui.jsx'
import { hasArabic, isolateTags, L, t, tIn } from '../i18n/index.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'
import { AddAsset } from './Library.jsx'

export default function AgencyDesk() {
  const { state, dispatch, toast } = useStore()
  const me = ROLE_INFO[state.role].person
  const [openId, setOpenId] = useState(() => state.tickets.find((x) => x.status === 'new')?.id || state.tickets[0]?.id)
  const [building, setBuilding] = useState(false)
  const [adding, setAdding] = useState(false)
  const open = state.tickets.find((x) => x.id === openId)

  const counts = Object.keys(TICKET_STATUS).map((s) => [s, state.tickets.filter((x) => x.status === s).length])
  const activity = state.posts
    .flatMap((p) => p.history.map((h) => ({ ...h, post: p })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 7)

  // The delivery note is written in both languages, so it reads right whichever one the client uses.
  // what is { key, name, nameAr } and names the thing delivered.
  const deliver = (what, link) => {
    const say = (lng) => tIn(lng, 'desk.delivered', { what: tIn(lng, what.key, { name: (lng === 'ar' && what.nameAr) || what.name }) })
    dispatch({ type: 'ticket/update', id: open.id, patch: { status: 'delivered' } })
    dispatch({ type: 'ticket/message', id: open.id, message: { by: me, at: new Date().toISOString(), text: say('en'), textAr: say('ar') } })
    dispatch({ type: 'notify', note: { to: 'client', key: 'n.delivered', vars: { title: open.title, titleAr: open.titleAr }, link } })
  }

  return (
    <div className="page">
      <h1>{t('nav.desk')}</h1>
      <p className="lede">{t('desk.lede')}</p>

      <div className="grid cols-4" style={{ marginBottom: 24 }}>
        {counts.map(([s, n]) => (
          <div key={s} className="panel stat">
            <span className="small muted">{t(`ticket.${s}`)}</span>
            <b>{n}</b>
          </div>
        ))}
        <div className="panel stat">
          <span className="small muted">{t('desk.waitingOn', { name: personName('layla') })}</span>
          <b>{state.posts.filter((p) => p.status === 'pending').length}</b>
        </div>
      </div>

      <div className="split-main" style={{ gridTemplateColumns: '360px minmax(0, 1fr)' }}>
        <div className="stack">
          <div className="paper list" style={{ padding: '4px 12px' }}>
            {state.tickets.map((x) => (
              <div key={x.id} className="list-row click" onClick={() => setOpenId(x.id)} style={x.id === openId ? { background: 'var(--panel)' } : null}>
                <Avatar id={x.from} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{L(x, 'title')}</div>
                  <div className="tiny muted">{t(x.kind === 'issue' ? 'desk.issueFrom' : 'desk.requestFrom', { name: personName(x.from), when: relTime(x.createdAt) })}</div>
                </div>
                <TicketTag status={x.status} />
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>{t('desk.activity')}</h3>
            <div className="stack" style={{ gap: 8 }}>
              {activity.map((a, i) => (
                <div key={i} className="row small" style={{ flexWrap: 'nowrap', cursor: 'pointer' }} onClick={() => go(`review?${a.post.id}`)}>
                  <Avatar id={a.by} />
                  <span>
                    <b>{personName(a.by)}</b> {actionText(a)}{t('desk.sep')}{L(a.post, 'title')}
                    <div className="tiny muted">{relTime(a.at)}</div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {open ? (
          <div className="panel stack">
            <div className="row between">
              <div>
                <h2 style={{ margin: 0 }} dir="auto">
                  {L(open, 'title')}
                </h2>
                <div className="small muted">{t('desk.from', { name: L(people[open.from], 'name'), when: fmtDate(open.createdAt) })}</div>
              </div>
              <select
                value={open.status}
                onChange={(e) => {
                  dispatch({ type: 'ticket/update', id: open.id, patch: { status: e.target.value } })
                  toast(t('desk.marked', { status: t(`ticket.${e.target.value}`) }), 'agency')
                }}
                style={{ width: 'auto' }}
                aria-label={t('desk.status')}
              >
                {Object.keys(TICKET_STATUS).map((id) => (
                  <option key={id} value={id}>
                    {t(`ticket.${id}`)}
                  </option>
                ))}
              </select>
            </div>
            {open.detail && (
              <p style={{ margin: 0 }} dir="auto">
                {isolateTags(L(open, 'detail'))}
              </p>
            )}
            {open.status !== 'delivered' && (
              <div className="row">
                <button className="btn agency" onClick={() => setBuilding(true)}>
                  {t('desk.buildTemplate')}
                </button>
                <button className="btn" onClick={() => setAdding(true)}>
                  {t('desk.deliverAsset')}
                </button>
              </div>
            )}
            <Thread
              ticket={open}
              me={me}
              onSend={(message) => {
                dispatch({ type: 'ticket/message', id: open.id, message })
                if (open.status === 'new') dispatch({ type: 'ticket/update', id: open.id, patch: { status: 'in-progress' } })
                dispatch({ type: 'notify', note: { to: 'client', key: 'n.agencyReplied', vars: { title: open.title, titleAr: open.titleAr }, link: 'help' } })
              }}
            />
          </div>
        ) : (
          <div className="empty">{t('desk.empty')}</div>
        )}
      </div>

      {building && open && (
        <TemplateBuilder
          initial={{ name: L(open, 'title').replace(/^(A|An)\s/i, ''), layout: 'hero', palette: 'night', motif: 'box', sampleTheme: /gift|هدايا|هدية/i.test(`${open.title} ${open.titleAr || ''}`) ? 'gift' : 'general', description: L(open, 'detail') || L(open, 'title') }}
          onClose={() => setBuilding(false)}
          onPublish={(tpl0) => {
            // A template built from a request keeps the request's name in both languages.
            const ar = hasArabic(tpl0.name)
            const tpl = { ...tpl0, nameAr: ar ? tpl0.name : open.titleAr, name: ar ? open.title : tpl0.name, descriptionAr: hasArabic(tpl0.description) ? tpl0.description : open.detailAr }
            dispatch({ type: 'template/add', template: tpl })
            deliver({ key: 'desk.theTemplate', name: tpl.name, nameAr: tpl.nameAr }, 'templates')
            toast(t('templates.published', { name: L(tpl, 'name') }), 'agency')
            setBuilding(false)
          }}
        />
      )}
      {adding && open && (
        <AddAsset
          initialName={L(open, 'title')}
          onClose={() => setAdding(false)}
          onAdd={(asset0) => {
            const ar = hasArabic(asset0.name)
            const asset = { ...asset0, nameAr: ar ? asset0.name : open.titleAr, name: ar ? open.title : asset0.name }
            dispatch({ type: 'asset/add', asset })
            deliver({ key: 'desk.theAsset', name: asset.name, nameAr: asset.nameAr }, 'library')
            toast(t('desk.toast.delivered', { name: L(asset, 'name') }), 'agency')
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
