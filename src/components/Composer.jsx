import { useMemo, useRef, useState } from 'react'
import { brand } from '../config/brand.js'
import { Motif } from '../creative/motifs.jsx'
import { C } from '../creative/motifs.jsx'
import { Icon } from './ui.jsx'

export function ElementThumb({ el, size = 34 }) {
  const bg = el.type === 'Style' ? { 'style-suhoor': C.night, 'style-market': C.date, 'style-studio': C.milk }[el.motif] : el.type === 'Character' ? C.date : C.night
  const motif = el.type === 'Style' ? { 'style-suhoor': 'lantern', 'style-market': 'table', 'style-studio': 'box' }[el.motif] : el.motif === 'logo' ? 'greeting' : el.motif
  return (
    <span className="thumb" style={{ width: size, borderRadius: 6 }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <rect width="100" height="100" fill={bg} />
        <Motif name={motif} cx={50} cy={52} s={88} accent={C.saffron} />
      </svg>
    </span>
  )
}

export const refsIn = (text) => brand.elements.filter((e) => new RegExp(`@${e.tag}\\b`, 'i').test(text))

export function Composer({ value, onChange, onSubmit, templates = [], templateId, onTemplate, submitLabel = 'Create', autoFocus }) {
  const ta = useRef(null)
  const [pop, setPop] = useState(null) // { query, start }
  const [hl, setHl] = useState(0)
  const refs = refsIn(value)

  const matches = useMemo(() => {
    if (!pop) return []
    const q = pop.query.toLowerCase()
    return brand.elements.filter((e) => e.tag.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
  }, [pop])

  const onInput = (e) => {
    const text = e.target.value
    onChange(text)
    const pos = e.target.selectionStart
    const before = text.slice(0, pos)
    const m = before.match(/@([\w]*)$/)
    if (m) {
      setPop({ query: m[1], start: pos - m[0].length })
      setHl(0)
    } else setPop(null)
  }

  const insert = (el) => {
    const el2 = ta.current
    const pos = el2 ? el2.selectionStart : value.length
    const start = pop ? pop.start : pos
    const next = `${value.slice(0, start)}@${el.tag} ${value.slice(pos)}`
    onChange(next)
    setPop(null)
    requestAnimationFrame(() => {
      if (!el2) return
      const caret = start + el.tag.length + 2
      el2.focus()
      el2.setSelectionRange(caret, caret)
    })
  }

  const onKey = (e) => {
    if (pop && matches.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHl((h) => (h + 1) % matches.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHl((h) => (h - 1 + matches.length) % matches.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insert(matches[hl])
        return
      }
      if (e.key === 'Escape') {
        setPop(null)
        return
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && value.trim()) onSubmit()
  }

  const removeRef = (el) => onChange(value.replace(new RegExp(`@${el.tag}\\b\\s?`, 'gi'), ''))

  return (
    <div className="composer-box">
      <textarea
        ref={ta}
        value={value}
        onChange={onInput}
        onKeyDown={onKey}
        autoFocus={autoFocus}
        aria-label="Describe what you need"
        placeholder="Describe what you need. Type @ to bring in a character, product or style from the brand kit."
      />
      {pop && matches.length > 0 && (
        <div className="mention-pop" role="listbox" aria-label="Brand elements">
          {matches.map((el, i) => (
            <button key={el.id} type="button" className={i === hl ? 'hl' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(el)} role="option" aria-selected={i === hl}>
              <ElementThumb el={el} />
              <span>
                <b>@{el.tag}</b>
                <div className="tiny muted">
                  {el.type}. {el.name}
                </div>
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="composer-tools">
        {refs.map((el) => (
          <span key={el.id} className="chip ref">
            @{el.tag}
            <button type="button" aria-label={`Remove ${el.tag}`} onClick={() => removeRef(el)}>
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          className="chip"
          onClick={() => {
            const pos = ta.current?.selectionStart ?? value.length
            const sep = pos > 0 && !/\s$/.test(value.slice(0, pos)) ? ' ' : ''
            onChange(`${value.slice(0, pos)}${sep}@${value.slice(pos)}`)
            setPop({ query: '', start: pos + sep.length })
            requestAnimationFrame(() => {
              ta.current?.focus()
              const caret = pos + sep.length + 1
              ta.current?.setSelectionRange(caret, caret)
            })
          }}
        >
          <Icon name="at" size={14} /> Brand kit
        </button>
        {onTemplate && (
          <select value={templateId || ''} onChange={(e) => onTemplate(e.target.value || null)} style={{ width: 'auto', padding: '4px 8px', fontSize: 13, borderRadius: 99 }} aria-label="Template">
            <option value="">Any template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.source === '5D' ? ' (from 5D)' : ''}
              </option>
            ))}
          </select>
        )}
        <span style={{ flex: 1 }} />
        <button type="button" className="btn primary" disabled={!value.trim()} onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
