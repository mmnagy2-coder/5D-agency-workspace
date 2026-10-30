import { useState } from 'react'
import { agency, people } from '../config/agency.js'
import { Thread, TicketTag } from '../components/Thread.jsx'
import { fmtDate } from '../components/ui.jsx'
import { uid } from '../lib/simulate.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

export default function Help() {
  const { state, dispatch, toast } = useStore()
  const me = ROLE_INFO[state.role].person
  const [kind, setKind] = useState('request')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [openId, setOpenId] = useState(state.tickets[0]?.id)
  const open = state.tickets.find((t) => t.id === openId)

  const raise = () => {
    const ticket = {
      id: uid('tk'),
      kind,
      title: title.trim(),
      detail: detail.trim(),
      status: 'new',
      from: me,
      createdAt: new Date().toISOString(),
      messages: [{ by: me, at: new Date().toISOString(), text: detail.trim() || title.trim() }],
    }
    dispatch({ type: 'ticket/add', ticket })
    dispatch({ type: 'notify', note: { to: 'agency', text: `${people[me].name.split(' ')[0]} ${kind === 'issue' ? 'reported a problem' : 'asked for something new'}: ${ticket.title}`, link: 'desk' } })
    toast(`Sent to ${agency.name}. ${agency.responseTime}.`, 'agency')
    setTitle('')
    setDetail('')
    setOpenId(ticket.id)
  }

  return (
    <div className="page">
      <h1>Ask {agency.name}</h1>
      <p className="lede">
        For anything the studio cannot make on its own, or anything that is not working. {agency.name} replies here, and what they make goes straight into your library or templates. {agency.responseTime}.
      </p>
      <div className="split-main" style={{ gridTemplateColumns: '380px minmax(0, 1fr)' }}>
        <div className="stack">
          <div className="panel stack">
            <div className="row">
              <button className={`chip ${kind === 'request' ? 'on' : ''}`} onClick={() => setKind('request')}>
                Something new
              </button>
              <button className={`chip ${kind === 'issue' ? 'on' : ''}`} onClick={() => setKind('issue')}>
                Something is not working
              </button>
            </div>
            <label className="field">
              {kind === 'issue' ? 'What is wrong?' : 'What do you need?'}
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === 'issue' ? 'The TikTok format cuts off the logo' : 'A Pinterest template for gift boxes'} />
            </label>
            <label className="field">
              Details
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="When you need it, which markets, anything to avoid" />
            </label>
            <button className="btn agency" disabled={!title.trim()} onClick={raise}>
              Send to {agency.name}
            </button>
          </div>
          <div className="paper list" style={{ padding: '4px 12px' }}>
            {state.tickets.map((t) => (
              <div key={t.id} className="list-row click" onClick={() => setOpenId(t.id)} style={t.id === openId ? { background: 'var(--panel)' } : null}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div className="tiny muted">
                    {t.kind === 'issue' ? 'Problem' : 'Request'}, {fmtDate(t.createdAt, { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <TicketTag status={t.status} />
              </div>
            ))}
          </div>
        </div>
        {open ? (
          <div className="panel">
            <div className="row between" style={{ marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>{open.title}</h2>
              <TicketTag status={open.status} />
            </div>
            {open.detail && <p className="muted small">{open.detail}</p>}
            <Thread
              ticket={open}
              me={me}
              onSend={(message) => {
                dispatch({ type: 'ticket/message', id: open.id, message })
                dispatch({ type: 'notify', note: { to: 'agency', text: `New reply on ${open.title}`, link: 'desk' } })
              }}
            />
          </div>
        ) : (
          <div className="empty">Pick a request to see the conversation.</div>
        )}
      </div>
    </div>
  )
}
