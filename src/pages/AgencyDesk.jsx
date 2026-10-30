import { useState } from 'react'
import { agency, people } from '../config/agency.js'
import { brand } from '../config/brand.js'
import { TemplateBuilder } from '../components/TemplateBuilder.jsx'
import { Thread, TICKET_STATUS, TicketTag } from '../components/Thread.jsx'
import { Avatar, fmtDate, go, personName, relTime } from '../components/ui.jsx'
import { ROLE_INFO, useStore } from '../store/store.jsx'
import { AddAsset } from './Library.jsx'

export default function AgencyDesk() {
  const { state, dispatch, toast } = useStore()
  const me = ROLE_INFO[state.role].person
  const [openId, setOpenId] = useState(() => state.tickets.find((t) => t.status === 'new')?.id || state.tickets[0]?.id)
  const [building, setBuilding] = useState(false)
  const [adding, setAdding] = useState(false)
  const open = state.tickets.find((t) => t.id === openId)

  const counts = Object.keys(TICKET_STATUS).map((s) => [s, state.tickets.filter((t) => t.status === s).length])
  const activity = state.posts
    .flatMap((p) => p.history.map((h) => ({ ...h, post: p })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 7)

  const deliver = (what, link) => {
    dispatch({ type: 'ticket/update', id: open.id, patch: { status: 'delivered' } })
    dispatch({ type: 'ticket/message', id: open.id, message: { by: me, at: new Date().toISOString(), text: `Delivered. ${what} is in your workspace now.` } })
    dispatch({ type: 'notify', note: { to: 'client', text: `${agency.name} delivered ${open.title}.`, link } })
  }

  return (
    <div className="page">
      <h1>Agency desk</h1>
      <p className="lede">
        Everything {brand.name}'s team has asked {agency.name} for, and everything they are making in the studio. When the studio cannot make something, it lands here. What you build goes straight back into their workspace.
      </p>

      <div className="grid cols-4" style={{ marginBottom: 24 }}>
        {counts.map(([s, n]) => (
          <div key={s} className="panel stat">
            <span className="small muted">{TICKET_STATUS[s][0]}</span>
            <b>{n}</b>
          </div>
        ))}
        <div className="panel stat">
          <span className="small muted">Waiting on Layla</span>
          <b>{state.posts.filter((p) => p.status === 'pending').length}</b>
        </div>
      </div>

      <div className="split-main" style={{ gridTemplateColumns: '360px minmax(0, 1fr)' }}>
        <div className="stack">
          <div className="paper list" style={{ padding: '4px 12px' }}>
            {state.tickets.map((t) => (
              <div key={t.id} className="list-row click" onClick={() => setOpenId(t.id)} style={t.id === openId ? { background: 'var(--panel)' } : null}>
                <Avatar id={t.from} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div className="tiny muted">
                    {t.kind === 'issue' ? 'Problem' : 'Request'} from {personName(t.from)}, {relTime(t.createdAt)}
                  </div>
                </div>
                <TicketTag status={t.status} />
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>In the studio right now</h3>
            <div className="stack" style={{ gap: 8 }}>
              {activity.map((a, i) => (
                <div key={i} className="row small" style={{ flexWrap: 'nowrap', cursor: 'pointer' }} onClick={() => go(`review?${a.post.id}`)}>
                  <Avatar id={a.by} />
                  <span>
                    <b>{personName(a.by)}</b> {a.action.toLowerCase()} {a.post.title}
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
                <h2 style={{ margin: 0 }}>{open.title}</h2>
                <div className="small muted">
                  From {people[open.from]?.name}, {fmtDate(open.createdAt)}
                </div>
              </div>
              <select
                value={open.status}
                onChange={(e) => {
                  dispatch({ type: 'ticket/update', id: open.id, patch: { status: e.target.value } })
                  toast(`Marked ${TICKET_STATUS[e.target.value][0].toLowerCase()}`, 'agency')
                }}
                style={{ width: 'auto' }}
                aria-label="Status"
              >
                {Object.entries(TICKET_STATUS).map(([id, [label]]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {open.detail && <p style={{ margin: 0 }}>{open.detail}</p>}
            {open.status !== 'delivered' && (
              <div className="row">
                <button className="btn agency" onClick={() => setBuilding(true)}>
                  Build a template for this
                </button>
                <button className="btn" onClick={() => setAdding(true)}>
                  Deliver an asset to the library
                </button>
              </div>
            )}
            <Thread
              ticket={open}
              me={me}
              onSend={(message) => {
                dispatch({ type: 'ticket/message', id: open.id, message })
                if (open.status === 'new') dispatch({ type: 'ticket/update', id: open.id, patch: { status: 'in-progress' } })
                dispatch({ type: 'notify', note: { to: 'client', text: `${agency.name} replied on ${open.title}.`, link: 'help' } })
              }}
            />
          </div>
        ) : (
          <div className="empty">No requests yet.</div>
        )}
      </div>

      {building && open && (
        <TemplateBuilder
          initial={{ name: open.title.replace(/^(A|An)\s/i, ''), layout: 'hero', palette: 'night', motif: 'box', sampleTheme: /gift/i.test(open.title) ? 'gift' : 'general', description: open.detail || open.title }}
          onClose={() => setBuilding(false)}
          onPublish={(tpl) => {
            dispatch({ type: 'template/add', template: tpl })
            deliver(`The ${tpl.name} template`, 'templates')
            toast(`Published ${tpl.name} to Qamari's workspace`, 'agency')
            setBuilding(false)
          }}
        />
      )}
      {adding && open && (
        <AddAsset
          initialName={open.title}
          onClose={() => setAdding(false)}
          onAdd={(asset) => {
            dispatch({ type: 'asset/add', asset })
            deliver(asset.name, 'library')
            toast(`Delivered ${asset.name} to Qamari's library`, 'agency')
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
