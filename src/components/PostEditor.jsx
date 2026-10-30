import { useRef, useState } from 'react'
import { brand } from '../config/brand.js'
import { channelById } from '../config/channels.js'
import { Creative } from '../creative/Creative.jsx'
import { isAr, joinList, L, ltr, t } from '../i18n/index.js'
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
    if (res === 'saved') toast(t('toast.downloadedOne', { name: L(ch, 'name'), w: ch.w, h: ch.h }))
    if (res === 'failed') toast(t('toast.noDownloads'), 'bad')
  }
  return (
    <div className="wall" ref={wall}>
      {post.formats.map((f, i) => {
        const ch = channelById(f.channelId)
        const over = ch.captionLimit && f.caption.length > ch.captionLimit
        return (
          <article key={f.channelId} className={`format ${f.enabled ? '' : 'off'}`} style={{ animationDelay: animate ? `${i * 80}ms` : '0ms', animationName: animate ? undefined : 'none' }}>
            <div className="art" data-channel={f.channelId}>
              <Creative w={ch.w} h={ch.h} concept={post.concept} dialect={f.dialect} showSafe={showSafe} title={t('format.title', { name: L(ch, 'name') })} />
            </div>
            <div className="body">
              <div className="row between" style={{ flexWrap: 'nowrap' }}>
                <label className="row" style={{ gap: 8, fontWeight: 600 }}>
                  <input type="checkbox" checked={f.enabled} disabled={!editable} onChange={(e) => set(i, { enabled: e.target.checked })} />
                  {L(ch, 'name')}
                </label>
                <span className="tiny muted" dir="ltr">
                  {ch.w}×{ch.h}
                </span>
              </div>
              <select value={f.dialect} disabled={!editable} onChange={(e) => set(i, { dialect: e.target.value, caption: captionFor(post.concept, ch, e.target.value) })} aria-label={t('format.language', { name: L(ch, 'name') })}>
                {brand.dialects.map((d) => (
                  <option key={d.id} value={d.id}>
                    {L(d, 'name')}
                  </option>
                ))}
              </select>
              {ch.captionLimit > 0 ? (
                <>
                  <textarea value={f.caption} readOnly={!editable} dir={f.dialect === 'english' ? 'ltr' : 'rtl'} onChange={(e) => set(i, { caption: e.target.value })} aria-label={t('format.caption', { name: L(ch, 'name') })} />
                  <div className={`count ${over ? 'over' : ''}`}>
                    {t('format.count', { n: f.caption.length, max: ch.captionLimit })}
                  </div>
                </>
              ) : (
                <p className="tiny muted" style={{ margin: 0 }}>
                  {t('format.noCaption')}
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
  if (saved) toast(t('toast.downloaded', { n: saved, total: live.length }))
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
              <div style={{ fontWeight: 600 }}>{L(ch, 'name')}</div>
              <div className="tiny muted">
                {L(
                  brand.dialects.find((d) => d.id === f.dialect),
                  'name',
                )}
                {net?.connected ? t('schedule.postsTo', { handle: ltr(net.handle) }) : ''}
              </div>
              {!net?.connected && <span className="tag warn">{t('schedule.offline', { network: L(net, 'name') || ch.network })}</span>}
            </div>
            <input type="datetime-local" value={f.scheduledAt} disabled={!editable} onChange={(e) => set(i, { scheduledAt: e.target.value })} style={{ width: 210 }} aria-label={t('schedule.when', { name: L(ch, 'name') })} dir="ltr" />
          </div>
        )
      })}
    </div>
  )
}

// Brand check notes are stored as keys with values, so they read in either language.
export function checkNote(r) {
  const v = { ...(r.vars || {}) }
  if (v.colourKey) v.colour = t(v.colourKey)
  if (v.code) v.code = ltr(v.code)
  if (Array.isArray(v.words)) {
    v.count = v.words.length
    v.words = joinList(v.words.map((w) => (isAr() ? `«${w}»` : `"${w}"`)))
  }
  const key = r.noteKey === 'check.claimsFail' && v.count > 1 ? 'check.claimsFailMany' : r.noteKey
  return t(key, v)
}

export function BrandCheckPanel({ results, onFix, canFix = true }) {
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const fails = results.filter((r) => r.status === 'fail').length
  return (
    <div>
      <div className="row between" style={{ marginBottom: 4 }}>
        <h3 style={{ margin: 0 }}>{t('check.title')}</h3>
        {fails ? <span className="tag bad">{t('check.toFix', { n: fails })}</span> : <span className="tag ok">{t('check.ready')}</span>}
      </div>
      {results.map((r) => (
        <div key={r.ruleId} className="check">
          <span className={`dot ${r.status}`} aria-hidden="true">
            {r.status === 'pass' ? '✓' : '!'}
          </span>
          <div style={{ flex: 1 }}>
            <div className="small" style={{ fontWeight: 600 }}>
              {L(r.rule, 'category')}
              {r.status === 'warn' && <span className="tiny muted"> {t('check.notEnforced')}</span>}
            </div>
            <div className="small muted">{checkNote(r)}</div>
            {r.fix && canFix && r.status !== 'pass' && (
              <div style={{ marginTop: 6 }}>
                {r.fix.kind === 'swap-words' && (
                  <button className="btn sm" onClick={() => onFix(r.fix)}>
                    {t('check.fixWords')}
                  </button>
                )}
                {r.fix.kind === 'move-to-iftar' && (
                  <button className="btn sm" onClick={() => onFix(r.fix)}>
                    {t('check.fixIftar')}
                  </button>
                )}
                {r.fix.kind === 'offer-code' && (
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <input type="text" value={code} placeholder={t('check.codePlaceholder')} dir="ltr" onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label={t('check.code')} />
                    <button
                      className="btn sm"
                      onClick={() => {
                        if (TRADE_CODES.includes(code)) {
                          setErr('')
                          onFix(r.fix, code)
                        } else setErr(code ? t('check.codeBad', { code: ltr(code), example: ltr(TRADE_CODES[0]) }) : t('check.codeEmpty', { example: ltr(TRADE_CODES[0]) }))
                      }}
                    >
                      {t('check.addCode')}
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
