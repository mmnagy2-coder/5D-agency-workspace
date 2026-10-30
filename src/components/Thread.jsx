import { useState } from 'react'
import { people } from '../config/agency.js'
import { inputDir, isolateTags, L, t } from '../i18n/index.js'
import { Avatar, fmtDate, personName } from './ui.jsx'

export const TICKET_STATUS = { new: 'warn', 'in-progress': 'agency', delivered: 'ok' }

export function TicketTag({ status }) {
  return <span className={`tag ${TICKET_STATUS[status] || ''}`}>{t(`ticket.${status}`)}</span>
}

export function Thread({ ticket, me, onSend }) {
  const [text, setText] = useState('')
  return (
    <div className="stack">
      <div className="thread">
        {ticket.messages.map((m, i) => (
          <div key={i} className={`msg ${people[m.by]?.side === 'agency' ? 'agency' : ''}`}>
            <Avatar id={m.by} />
            <div className="bubble">
              <div className="tiny muted">
                {personName(m.by)}
                {t('comma')}
                {fmtDate(m.at)}
              </div>
              <div dir="auto">{isolateTags(L(m, 'text'))}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input
          type="text"
          value={text}
          placeholder={t('thread.placeholder')}
          dir={inputDir(text)}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              onSend({ by: me, at: new Date().toISOString(), text: text.trim() })
              setText('')
            }
          }}
          aria-label={t('thread.reply')}
        />
        <button
          className="btn"
          disabled={!text.trim()}
          onClick={() => {
            onSend({ by: me, at: new Date().toISOString(), text: text.trim() })
            setText('')
          }}
        >
          {t('thread.send')}
        </button>
      </div>
    </div>
  )
}
