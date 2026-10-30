import { useRef, useState } from 'react'
import { brand } from '../config/brand.js'
import { channelById } from '../config/channels.js'
import { Creative } from '../creative/Creative.jsx'
import { saveBlob, slug, svgToPngBlob } from '../lib/exporter.js'
import { captionFor } from '../lib/simulate.js'
import { useStore } from '../store/store.jsx'
import { Icon } from './ui.jsx'

export const TRADE_CODES = ['RMD-TWO30', 'RMD-MAAM20', 'EID-GIFT15', 'LNC-SYRUP']

export function FormatWall({ post, onChange, showSafe, editable = true, animate = true }) {
  const wall = useRef(null)
  const { toast } = useStore()
  const set = (i, patch) => {
    const formats = post.formats.map((f, j) => (j === i ? { ...f, ...patch } : f))
    onChange({ ...post, formats })
  }
  const download = async (f) => {
    const ch = channelById(f.channelId)
    const svg = wall.current?.querySelector(`[data-channel="${f.channelId}"] svg`)
    if (!svg) return
    const blob = await svgToPngBlob(svg, ch.w, ch.h)
    const res = await saveBlob(blob, `${slug(post.title || 'qamari')}-${ch.id}-${ch.w}x${ch.h}.png`)
    if (res === 'saved') toast(`Downloaded ${ch.name} at ${ch.w} by ${ch.h}`)
    if (res === 'failed') toast('Downloads are not available in this view', 'bad')
  }
  return (
    <div className="wall" ref={wall}>
      {post.formats.map((f, i) => {
        const ch = channelById(f.channelId)
        const over = ch.captionLimit && f.caption.length > ch.captionLimit
        return (
          <article key={f.channelId} className={`format ${f.enabled ? '' : 'off'}`} style={{ animationDelay: animate ? `${i * 80}ms` : '0ms', animationName: animate ? undefined : 'none' }}>
            <div className="art" data-channel={f.channelId}>
              <Creative w={ch.w} h={ch.h} concept={post.concept} dialect={f.dialect} showSafe={showSafe} title={`${ch.name} format`} />
            </div>
            <div className="body">
              <div className="row between" style={{ flexWrap: 'nowrap' }}>
                <label className="row" style={{ gap: 8, fontWeight: 600 }}>
                  <input type="checkbox" checked={f.enabled} disabled={!editable} onChange={(e) => set(i, { enabled: e.target.checked })} />
                  {ch.name}
                </label>
                <span className="tiny muted">
                  {ch.w}×{ch.h}
                </span>
              </div>
              <select value={f.dialect} disabled={!editable} onChange={(e) => set(i, { dialect: e.target.value, caption: captionFor(post.concept, ch, e.target.value) })} aria-label={`${ch.name} language`}>
                {brand.dialects.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {ch.captionLimit > 0 ? (
                <>
                  <textarea value={f.caption} readOnly={!editable} dir={f.dialect === 'english' ? 'ltr' : 'rtl'} onChange={(e) => set(i, { caption: e.target.value })} aria-label={`${ch.name} caption`} />
                  <div className={`count ${over ? 'over' : ''}`}>
                    {f.caption.length} of {ch.captionLimit}
                  </div>
                </>
              ) : (
                <p className="tiny muted" style={{ margin: 0 }}>
                  Stories carry no caption. The words are in the artwork.
                </p>
              )}
              <button className="btn sm ghost" onClick={() => download(f)} style={{ alignSelf: 'flex-start' }}>
                <Icon name="download" size={15} /> PNG
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export async function downloadAll(container, post, toast) {
  const live = post.formats.filter((f) => f.enabled)
  let saved = 0
  for (const f of live) {
    const ch = channelById(f.channelId)
    const svg = container?.querySelector(`[data-channel="${f.channelId}"] svg`)
    if (!svg) continue
    const blob = await svgToPngBlob(svg, ch.w, ch.h)
    const res = await saveBlob(blob, `${slug(post.title || 'qamari')}-${ch.id}-${ch.w}x${ch.h}.png`)
    if (res !== 'saved') break
    saved++
    await new Promise((r) => setTimeout(r, 250))
  }
  if (saved) toast(`Downloaded ${saved} of ${live.length} formats`)
}

export function ScheduleList({ post, onChange, networks, editable = true }) {
  const set = (i, patch) => onChange({ ...post, formats: post.formats.map((f, j) => (j === i ? { ...f, ...patch } : f)) })
  return (
    <div className="list">
      {post.formats.map((f, i) => {
        if (!f.enabled) return null
        const ch = channelById(f.channelId)
        const net = networks.find((n) => n.id === ch.network)
        return (
          <div key={f.channelId} className="list-row" style={{ flexWrap: 'wrap' }}>
            <span className="thumb" style={{ width: 34 }}>
              <Creative w={ch.w} h={ch.h} concept={post.concept} dialect={f.dialect} />
            </span>
            <div style={{ flex: '1 1 160px', minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{ch.name}</div>
              <div className="tiny muted">
                {brand.dialects.find((d) => d.id === f.dialect)?.name}
                {net?.connected ? `, posts to ${net.handle}` : ''}
              </div>
              {!net?.connected && <span className="tag warn">{ch.network} not connected. Connect it in Channels.</span>}
            </div>
            <input type="datetime-local" value={f.scheduledAt} disabled={!editable} onChange={(e) => set(i, { scheduledAt: e.target.value })} style={{ width: 210 }} aria-label={`${ch.name} date and time`} />
          </div>
        )
      })}
    </div>
  )
}

export function BrandCheckPanel({ results, onFix, canFix = true }) {
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const fails = results.filter((r) => r.status === 'fail').length
  return (
    <div>
      <div className="row between" style={{ marginBottom: 4 }}>
        <h3 style={{ margin: 0 }}>Brand check</h3>
        {fails ? <span className="tag bad">{fails} to fix before approval</span> : <span className="tag ok">Ready to approve</span>}
      </div>
      {results.map((r) => (
        <div key={r.ruleId} className="check">
          <span className={`dot ${r.status}`} aria-hidden="true">
            {r.status === 'pass' ? '✓' : '!'}
          </span>
          <div style={{ flex: 1 }}>
            <div className="small" style={{ fontWeight: 600 }}>
              {r.category}
              {r.status === 'warn' && <span className="tiny muted"> (not enforced)</span>}
            </div>
            <div className="small muted">{r.note}</div>
            {r.fix && canFix && r.status !== 'pass' && (
              <div style={{ marginTop: 6 }}>
                {r.fix.kind === 'swap-words' && (
                  <button className="btn sm" onClick={() => onFix(r.fix)}>
                    Replace with approved wording
                  </button>
                )}
                {r.fix.kind === 'move-to-iftar' && (
                  <button className="btn sm" onClick={() => onFix(r.fix)}>
                    Move the scene to iftar
                  </button>
                )}
                {r.fix.kind === 'offer-code' && (
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <input type="text" value={code} placeholder="e.g. RMD-TWO30" onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label="Offer code" />
                    <button
                      className="btn sm"
                      onClick={() => {
                        if (TRADE_CODES.includes(code)) {
                          setErr('')
                          onFix(r.fix, code)
                        } else setErr(`${code || 'That code'} is not in the trade calendar. Try ${TRADE_CODES[0]}.`)
                      }}
                    >
                      Add code
                    </button>
                  </div>
                )}
                {err && r.fix.kind === 'offer-code' && <div className="tiny" style={{ color: 'var(--bad)', marginTop: 4 }}>{err}</div>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
