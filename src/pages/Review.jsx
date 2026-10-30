import { useEffect, useMemo, useState } from 'react'
import { agency, people } from '../config/agency.js'
import { channelById } from '../config/channels.js'
import { BrandCheckPanel, FormatWall, ScheduleList } from '../components/PostEditor.jsx'
import { Avatar, fmtDate, go, parseHash, personName, PostThumb, StatusTag } from '../components/ui.jsx'
import { applyWordSwaps, brandCheck } from '../lib/simulate.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

const TABS = [
  ['pending', 'Waiting for approval'],
  ['changes', 'Changes requested'],
  ['scheduled', 'Scheduled'],
  ['published', 'Published'],
  ['all', 'Everything'],
]

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
      <h1>Review and approve</h1>
      <p className="lede">Nothing goes out until Layla approves it. Every post here has already passed the brand rules that are enforced.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        {TABS.map(([id, label]) => {
          const n = id === 'all' ? state.posts.length : state.posts.filter((p) => p.status === id).length
          return (
            <button key={id} className={`chip ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
              {label} <span className="tiny">{n}</span>
            </button>
          )
        })}
      </div>
      {list.length === 0 ? (
        <div className="empty">Nothing here. New work arrives as soon as someone sends it for approval.</div>
      ) : (
        <div className="paper list" style={{ padding: '4px 14px' }}>
          {list.map((p) => {
            const live = p.formats.filter((f) => f.enabled)
            const first = live.map((f) => f.scheduledAt).sort()[0]
            return (
              <div key={p.id} className="list-row click" onClick={() => go(`review?${p.id}`)}>
                <PostThumb post={p} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div className="small muted">
                    {live.length} formats, first goes out {first ? fmtDate(first) : 'unscheduled'}
                  </div>
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

  const approve = () => {
    commit({ status: 'scheduled', approvedBy: me }, 'Approved and scheduled')
    dispatch({ type: 'notify', note: { to: 'client', text: `Layla approved ${saved.title}.`, link: `review?${saved.id}` } })
    if (state.paidHandover) dispatch({ type: 'notify', note: { to: 'agency', text: `${saved.title} is approved. Assets are ready for the paid media team.`, link: 'calendar' } })
    toast(`Approved and scheduled ${post.formats.filter((f) => f.enabled).length} formats`)
  }
  const askChanges = () => {
    commit({ status: 'changes' }, 'Asked for changes', note.trim())
    dispatch({ type: 'notify', note: { to: 'client', text: `Layla asked for changes on ${saved.title}.`, link: `review?${saved.id}` } })
    setAsking(false)
    setNote('')
    toast('Sent back with your note')
  }
  const resend = () => {
    commit({ status: 'pending' }, 'Sent for approval')
    dispatch({ type: 'notify', note: { to: 'client', text: `${personName(me)} sent ${saved.title} back for approval.`, link: `review?${saved.id}` } })
    toast('Sent to Layla for approval')
  }
  const saveTimes = () => {
    commit({}, 'Changed the schedule')
    toast('Schedule saved')
  }

  return (
    <div className="page">
      <button className="btn ghost sm" onClick={onBack} style={{ marginBottom: 10 }}>
        All work
      </button>
      <div className="split-main">
        <div>
          <div className="row" style={{ marginBottom: 6 }}>
            <StatusTag status={saved.status} />
            <span className="small muted">
              Made by {people[saved.createdBy]?.name || 'the team'} from the brief: “{saved.prompt}”
            </span>
          </div>
          <h1>{saved.title}</h1>
          {saved.status === 'changes' && lastNote && (
            <div className="panel" style={{ background: 'var(--bad-soft)', borderColor: 'transparent', margin: '10px 0 18px' }}>
              <b>{personName(lastNote.by)} asked for changes</b>
              <p style={{ margin: '4px 0 0' }}>{lastNote.note || 'No note left.'}</p>
            </div>
          )}
          {role === 'agency' && (
            <p className="small" style={{ color: 'var(--agency)' }}>
              {agency.name} sees everything the team makes. Approval stays with Layla.
            </p>
          )}
          <FormatWall post={post} onChange={setPost} editable={editable} animate={false} />
        </div>
        <aside className="stack" style={{ position: 'sticky', top: 80 }}>
          <div className="panel stack">
            {role === 'approver' && saved.status === 'pending' && (
              <>
                <button className="btn primary lg" disabled={blocking > 0} onClick={approve}>
                  Approve and schedule
                </button>
                {!asking ? (
                  <button className="btn" onClick={() => setAsking(true)}>
                    Ask for changes
                  </button>
                ) : (
                  <div className="stack">
                    <label className="field">
                      What needs to change?
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
                    </label>
                    <div className="row">
                      <button className="btn" disabled={!note.trim()} onClick={askChanges}>
                        Send back
                      </button>
                      <button className="btn ghost" onClick={() => setAsking(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {role === 'maker' && saved.status === 'changes' && (
              <button className="btn primary lg" disabled={blocking > 0} onClick={resend}>
                Send back for approval
              </button>
            )}
            {role === 'maker' && saved.status === 'pending' && <p className="small muted" style={{ margin: 0 }}>Waiting for Layla. You can still adjust captions and times.</p>}
            {editable && dirty && saved.status !== 'pending' && saved.status !== 'changes' && (
              <button className="btn primary" onClick={saveTimes}>
                Save changes
              </button>
            )}
            {editable && dirty && (saved.status === 'pending' || saved.status === 'changes') && (
              <button className="btn" onClick={() => commit({}, 'Edited')}>
                Save edits
              </button>
            )}
            {saved.status === 'scheduled' && role === 'approver' && (
              <button
                className="btn danger"
                onClick={() => {
                  commit({ status: 'pending', approvedBy: null }, 'Took off the schedule')
                  toast('Taken off the schedule')
                }}
              >
                Take off the schedule
              </button>
            )}
            <BrandCheckPanel results={results} onFix={onFix} canFix={editable} />
          </div>
          <div className="panel">
            <h3>Dates and times</h3>
            <ScheduleList post={post} onChange={setPost} networks={state.networks} editable={editable} />
          </div>
          <div className="panel">
            <h3>History</h3>
            <div className="stack" style={{ gap: 8 }}>
              {saved.history.map((h, i) => (
                <div key={i} className="row small" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                  <Avatar id={h.by} />
                  <div>
                    <b>{personName(h.by)}</b> {h.action.toLowerCase()}
                    {h.note && <div className="muted">“{h.note}”</div>}
                    <div className="tiny muted">{fmtDate(h.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="tiny muted">Channels: {post.formats.filter((f) => f.enabled).map((f) => channelById(f.channelId).name).join(', ')}.</p>
        </aside>
      </div>
    </div>
  )
}
