import { useState } from 'react'
import { Thread, TicketTag } from '../components/Thread.jsx'
import { fmtDate } from '../components/ui.jsx'
import { hasArabic, inputDir, isolateTags, L, t } from '../i18n/index.js'
import { uid } from '../lib/simulate.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

export default function Help() {
  const { state, dispatch, toast } = useStore()
  const me = ROLE_INFO[state.role].person
  const [kind, setKind] = useState('request')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [openId, setOpenId] = useState(state.tickets[0]?.id)
  const open = state.tickets.find((x) => x.id === openId)

  const raise = () => {
    const ticket = {
      id: uid('tk'),
      kind,
      title: title.trim(),
      titleAr: hasArabic(title) ? title.trim() : undefined,
      detail: detail.trim(),
      status: 'new',
      from: me,
      createdAt: new Date().toISOString(),
      messages: [{ by: me, at: new Date().toISOString(), text: detail.trim() || title.trim() }],
    }
    dispatch({ type: 'ticket/add', ticket })
    dispatch({ type: 'notify', note: { to: 'agency', key: kind === 'issue' ? 'n.newIssue' : 'n.newRequest', vars: { who: me, title: ticket.title, titleAr: ticket.titleAr }, link: 'desk' } })
    toast(`${t('create.agency.sent')} ${t('agency.responseTime')}`, 'agency')
    setTitle('')
    setDetail('')
    setOpenId(ticket.id)
  }

  return (
    <div className="page">
      <h1>{t('nav.help')}</h1>
      <p className="lede">
        {t('help.lede')} {t('agency.responseTime')}
      </p>
      <div className="split-main" style={{ gridTemplateColumns: '380px minmax(0, 1fr)' }}>
        <div className="stack">
          <div className="panel stack">
            <div className="row">
              <button className={`chip ${kind === 'request' ? 'on' : ''}`} onClick={() => setKind('request')}>
                {t('help.new')}
              </button>
              <button className={`chip ${kind === 'issue' ? 'on' : ''}`} onClick={() => setKind('issue')}>
                {t('help.broken')}
              </button>
            </div>
            <label className="field">
              {t(kind === 'issue' ? 'help.whatWrong' : 'help.whatNeed')}
              <input type="text" value={title} dir={inputDir(title)} onChange={(e) => setTitle(e.target.value)} placeholder={t(kind === 'issue' ? 'help.issueExample' : 'help.requestExample')} />
            </label>
            <label className="field">
              {t('help.details')}
              <textarea value={detail} dir={inputDir(detail)} onChange={(e) => setDetail(e.target.value)} placeholder={t('help.detailsExample')} />
            </label>
            <button className="btn agency" disabled={!title.trim()} onClick={raise}>
              {t('create.agency.send')}
            </button>
          </div>
          <div className="paper list" style={{ padding: '4px 12px' }}>
            {state.tickets.map((x) => (
              <div key={x.id} className="list-row click" onClick={() => setOpenId(x.id)} style={x.id === openId ? { background: 'var(--panel)' } : null}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{L(x, 'title')}</div>
                  <div className="tiny muted">
                    {t(x.kind === 'issue' ? 'ticket.issue' : 'ticket.request')}
                    {t('comma')}
                    {fmtDate(x.createdAt, { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <TicketTag status={x.status} />
              </div>
            ))}
          </div>
        </div>
        {open ? (
          <div className="panel">
            <div className="row between" style={{ marginBottom: 8 }}>
              <h2 style={{ margin: 0 }} dir="auto">
                {L(open, 'title')}
              </h2>
              <TicketTag status={open.status} />
            </div>
            {open.detail && (
              <p className="muted small" dir="auto">
                {isolateTags(L(open, 'detail'))}
              </p>
            )}
            <Thread
              ticket={open}
              me={me}
              onSend={(message) => {
                dispatch({ type: 'ticket/message', id: open.id, message })
                dispatch({ type: 'notify', note: { to: 'agency', key: 'n.reply', vars: { who: me, title: open.title, titleAr: open.titleAr }, link: 'desk' } })
              }}
            />
          </div>
        ) : (
          <div className="empty">{t('help.pick')}</div>
        )}
      </div>
    </div>
  )
}
