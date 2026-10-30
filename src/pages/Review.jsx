import { useEffect, useMemo, useState } from 'react'
import { people } from '../config/agency.js'
import { channelById } from '../config/channels.js'
import { BrandCheckPanel, FormatWall, ScheduleList } from '../components/PostEditor.jsx'
import { actionText, Avatar, fmtDate, go, parseHash, personGender, personName, PostThumb, StatusTag } from '../components/ui.jsx'
import { inputDir, isAr, isolateTags, L, t, tg } from '../i18n/index.js'
import { applyWordSwaps, brandCheck } from '../lib/simulate.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

const TABS = ['pending', 'changes', 'scheduled', 'published', 'all']

const idFromHash = () => {
  const { route, param } = parseHash()
  return route === 'review' ? param : null
}

export default function Review() {
  const { state, dispatch, toast } = useStore()
  const [openId, setOpenId] = useState(idFromHash)
  const [tab, setTab] = useState(state.role === 'maker' ? 'changes' : 'pending')

  useEffect(() => {
    const on = () => setOpenId(idFromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const post = state.posts.find((p) => p.id === openId)
  if (post) return <PostDetail key={post.id} post={post} onBack={() => go('review')} state={state} dispatch={dispatch} toast={toast} />

  const list = state.posts.filter((p) => tab === 'all' || p.status === tab)
  return (
    <div className="page">
      <h1>{t('page.review')}</h1>
      <p className="lede">{t('review.lede', { name: personName('layla') })}</p>
      <div className="row" style={{ marginBottom: 16 }}>
        {TABS.map((id) => {
          const n = id === 'all' ? state.posts.length : state.posts.filter((p) => p.status === id).length
          return (
            <button key={id} className={`chip ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
              {t(`review.tab.${id}`)} <span className="tiny">{n}</span>
            </button>
          )
        })}
      </div>
      {list.length === 0 ? (
        <div className="empty">{t('review.empty')}</div>
      ) : (
        <div className="paper list" style={{ padding: '4px 14px' }}>
          {list.map((p) => {
            const live = p.formats.filter((f) => f.enabled)
            const first = live.map((f) => f.scheduledAt).sort()[0]
            return (
              <div key={p.id} className="list-row click" onClick={() => go(`review?${p.id}`)}>
                <PostThumb post={p} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{L(p, 'title')}</div>
                  <div className="small muted">{first ? t('review.firstOut', { n: live.length, when: fmtDate(first) }) : t('review.unscheduled', { n: live.length })}</div>
                </div>
                <Avatar id={p.createdBy} />
                <StatusTag status={p.status} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PostDetail({ post: saved, onBack, state, dispatch, toast }) {
  const [post, setPost] = useState(saved)
  const [note, setNote] = useState('')
  const [asking, setAsking] = useState(false)
  const me = ROLE_INFO[state.role].person
  const role = state.role
  const editable = (role === 'maker' && ['changes', 'pending', 'draft'].includes(post.status)) || (role === 'approver' && post.status !== 'published')
  const results = useMemo(() => brandCheck(post, state.rules), [post, state.rules])
  const blocking = results.filter((r) => r.status === 'fail').length
  const dirty = JSON.stringify(post.formats) !== JSON.stringify(saved.formats) || post.offerCode !== saved.offerCode || JSON.stringify(post.concept) !== JSON.stringify(saved.concept)
  const lastNote = [...saved.history].reverse().find((h) => h.note)

  const commit = (patch, action, extraNote) => {
    const entry = { at: new Date().toISOString(), by: me, action, ...(extraNote ? { note: extraNote } : {}) }
    const next = { ...post, ...patch, history: [...saved.history, entry] }
    dispatch({ type: 'post/update', id: saved.id, patch: next })
    setPost(next)
  }

  const onFix = (fix, value) => {
    if (fix.kind === 'swap-words') setPost(applyWordSwaps(post, fix.words))
    if (fix.kind === 'move-to-iftar') setPost({ ...post, resolved: { ...post.resolved, daytime: true } })
    if (fix.kind === 'offer-code') setPost({ ...post, offerCode: value })
  }

  const vars = { who: me, title: saved.title, titleAr: saved.titleAr }
  const approve = () => {
    commit({ status: 'scheduled', approvedBy: me }, 'Approved and scheduled')
    dispatch({ type: 'notify', note: { to: 'client', key: 'n.approved', vars, link: `review?${saved.id}` } })
    if (state.paidHandover) dispatch({ type: 'notify', note: { to: 'agency', key: 'n.paidReady', vars: { title: saved.title, titleAr: saved.titleAr }, link: 'calendar' } })
    toast(t('create.toast.scheduled', { n: post.formats.filter((f) => f.enabled).length }))
  }
  const askChanges = () => {
    commit({ status: 'changes' }, 'Asked for changes', note.trim())
    dispatch({ type: 'notify', note: { to: 'client', key: 'n.changesAsked', vars, link: `review?${saved.id}` } })
    setAsking(false)
    setNote('')
    toast(t('review.toast.sentBack'))
  }
  const resend = () => {
    commit({ status: 'pending' }, 'Sent for approval')
    dispatch({ type: 'notify', note: { to: 'client', key: 'n.resent', vars, link: `review?${saved.id}` } })
    toast(t('create.toast.sent', { name: personName('layla') }))
  }
  const saveTimes = () => {
    commit({}, 'Changed the schedule')
    toast(t('review.toast.saved'))
  }
  const gender = personGender(me)

  return (
    <div className="page">
      <button className="btn ghost sm" onClick={onBack} style={{ marginBottom: 10 }}>
        {t('review.back')}
      </button>
      <div className="split-main">
        <div>
          <div className="row" style={{ marginBottom: 6 }}>
            <StatusTag status={saved.status} />
            <span className="small muted">
              {t('review.madeBy', { name: L(people[saved.createdBy], 'name') || t('review.theTeam') })} <q dir="auto">{isolateTags(L(saved, 'prompt'))}</q>
            </span>
          </div>
          <h1 dir="auto">{L(saved, 'title')}</h1>
          {saved.status === 'changes' && lastNote && (
            <div className="panel" style={{ background: 'var(--bad-soft)', borderColor: 'transparent', margin: '10px 0 18px' }}>
              <b>{tg('review.askedBy', personGender(lastNote.by), { name: personName(lastNote.by) })}</b>
              <p style={{ margin: '4px 0 0' }} dir="auto">
                {L(lastNote, 'note') || t('review.noNote')}
              </p>
            </div>
          )}
          {role === 'agency' && (
            <p className="small" style={{ color: 'var(--agency)' }}>
              {t('review.agencyNote', { name: personName('layla') })}
            </p>
          )}
          <FormatWall post={post} onChange={setPost} editable={editable} animate={false} />
        </div>
        <aside className="stack" style={{ position: 'sticky', top: 80 }}>
          <div className="panel stack">
            {role === 'approver' && saved.status === 'pending' && (
              <>
                <button className="btn primary lg" disabled={blocking > 0} onClick={approve}>
                  {tg('action.approve', gender)}
                </button>
                {!asking ? (
                  <button className="btn" onClick={() => setAsking(true)}>
                    {tg('action.askChanges', gender)}
                  </button>
                ) : (
                  <div className="stack">
                    <label className="field">
                      {t('review.whatChange')}
                      <textarea value={note} dir={inputDir(note)} onChange={(e) => setNote(e.target.value)} autoFocus />
                    </label>
                    <div className="row">
                      <button className="btn" disabled={!note.trim()} onClick={askChanges}>
                        {tg('action.sendBack', gender)}
                      </button>
                      <button className="btn ghost" onClick={() => setAsking(false)}>
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {role === 'maker' && saved.status === 'changes' && (
              <button className="btn primary lg" disabled={blocking > 0} onClick={resend}>
                {tg('action.resend', gender)}
              </button>
            )}
            {role === 'maker' && saved.status === 'pending' && <p className="small muted" style={{ margin: 0 }}>{t('review.waitingLayla', { name: personName('layla') })}</p>}
            {editable && dirty && saved.status !== 'pending' && saved.status !== 'changes' && (
              <button className="btn primary" onClick={saveTimes}>
                {t('review.saveChanges')}
              </button>
            )}
            {editable && dirty && (saved.status === 'pending' || saved.status === 'changes') && (
              <button className="btn" onClick={() => commit({}, 'Edited')}>
                {t('review.saveEdits')}
              </button>
            )}
            {saved.status === 'scheduled' && role === 'approver' && (
              <button
                className="btn danger"
                onClick={() => {
                  commit({ status: 'pending', approvedBy: null }, 'Took off the schedule')
                  toast(t('review.toast.unscheduled'))
                }}
              >
                {tg('action.unschedule', gender)}
              </button>
            )}
            <BrandCheckPanel results={results} onFix={onFix} canFix={editable} />
          </div>
          <div className="panel">
            <h3>{t('review.dates')}</h3>
            <ScheduleList post={post} onChange={setPost} networks={state.networks} editable={editable} />
          </div>
          <div className="panel">
            <h3>{t('review.history')}</h3>
            <div className="stack" style={{ gap: 8 }}>
              {saved.history.map((h, i) => (
                <div key={i} className="row small" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                  <Avatar id={h.by} />
                  <div>
                    <b>{personName(h.by)}</b> {actionText(h)}
                    {h.note && (
                      <div className="muted" dir="auto">
                        <q>{L(h, 'note')}</q>
                      </div>
                    )}
                    <div className="tiny muted">{fmtDate(h.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="tiny muted">
            {t('review.channels', {
              list: post.formats
                .filter((f) => f.enabled)
                .map((f) => L(channelById(f.channelId), 'name'))
                .join(isAr() ? '، ' : ', '),
            })}
          </p>
        </aside>
      </div>
    </div>
  )
}
