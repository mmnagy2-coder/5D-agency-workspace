import { useState } from 'react'
import { people } from '../config/agency.js'
import { Avatar, fmtDate, personName } from './ui.jsx'

export const TICKET_STATUS = {
  new: ['New', 'warn'],
  'in-progress': ['In progress', 'agency'],
  delivered: ['Delivered', 'ok'],
}

export function TicketTag({ status }) {
  const [label, cls] = TICKET_STATUS[status] || [status, '']
  return <span className={`tag ${cls}`}>{label}</span>
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
                {personName(m.by)}, {fmtDate(m.at)}
              </div>
              <div>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input
          type="text"
          value={text}
          placeholder="Write a reply"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              onSend({ by: me, at: new Date().toISOString(), text: text.trim() })
              setText('')
            }
          }}
          aria-label="Reply"
        />
        <button
          className="btn"
          disabled={!text.trim()}
          onClick={() => {
            onSend({ by: me, at: new Date().toISOString(), text: text.trim() })
            setText('')
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
