import { useEffect, useMemo, useRef, useState } from 'react'
import { agency, people } from '../config/agency.js'
import { channels } from '../config/channels.js'
import { Composer, refsIn } from '../components/Composer.jsx'
import { BrandCheckPanel, downloadAll, FormatWall, ScheduleList } from '../components/PostEditor.jsx'
import { go, Icon } from '../components/ui.jsx'
import { Creative } from '../creative/Creative.jsx'
import { writeConcepts } from '../lib/engines.js'
import { applyWordSwaps, brandCheck, buildFormats, sleep, uid } from '../lib/simulate.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

const STEPS = [
  ['brief', 'Brief'],
  ['concepts', 'Concepts'],
  ['formats', 'Every channel'],
  ['check', 'Check and schedule'],
]

const titleFrom = (prompt) => {
  const clean = prompt.replace(/@(\w+)/g, (_, t) => t.replace(/([a-z])([A-Z])/g, '$1 $2')).replace(/\s+/g, ' ').trim()
  const short = clean.split(/[.,:;]/)[0]
  return short.length > 46 ? `${short.slice(0, 44).trim()}…` : short.charAt(0).toUpperCase() + short.slice(1)
}

export default function Create() {
  const { state, dispatch, toast } = useStore()
  const me = ROLE_INFO[state.role].person
  const isApprover = state.role === 'approver'
  const [step, setStep] = useState('brief')
  const [prompt, setPrompt] = useState(state.composer?.prompt || '')
  const [templateId, setTemplateId] = useState(state.composer?.templateId || null)
  const [enabled, setEnabled] = useState(() => channels.filter((c) => state.networks.find((n) => n.id === c.network)?.connected).map((c) => c.id))
  const [analysis, setAnalysis] = useState(null)
  const [concepts, setConcepts] = useState([])
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState(null)
  const [post, setPost] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showSafe, setShowSafe] = useState(false)
  const [ticketId, setTicketId] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const wallRef = useRef(null)

  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    if (state.composer) dispatch({ type: 'composer', composer: null })
    if (state.composer?.prompt && !state.composer.prefillOnly) generate(state.composer.prompt, state.composer.templateId)
    // Run once, on arrival from the composer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const template = state.templates.find((t) => t.id === templateId)
  const refs = refsIn(prompt)

  const PROGRESS = [
    'Reading the brief',
    refs.length ? `Bringing in ${refs.map((r) => '@' + r.tag).join(', ')} from the brand kit` : 'Matching the brief to the brand kit',
    'Writing copy in English, Egyptian, Gulf and Modern Standard Arabic',
    template ? `Composing four concepts on the ${template.name} template` : 'Composing four concepts on Qamari templates',
  ]

  async function generate(p = prompt, tplId = templateId, nextRound = 0) {
    const tpl = state.templates.find((t) => t.id === tplId)
    setStep('generating')
    setProgress(0)
    const out = await writeConcepts(p, [], { template: tpl, round: nextRound })
    setAnalysis(out.analysis)
    if (out.analysis.agency.length) {
      setStep('agency')
      return
    }
    for (let i = 1; i <= 4; i++) {
      await sleep(520)
      setProgress(i)
    }
    setConcepts(out.concepts)
    setRound(nextRound)
    setSelected(out.concepts[0].id)
    setStep('concepts')
  }

  const chosen = concepts.find((c) => c.id === selected)

  const editChosen = (field, value) => {
    setConcepts((cs) => cs.map((c) => (c.id === selected ? { ...c, copy: { ...c.copy, english: { ...c.copy.english, [field]: value } } } : c)))
  }

  const formatAll = () => {
    setPost({
      id: uid('post'),
      title: titleFrom(prompt),
      prompt,
      analysis,
      concept: chosen,
      formats: buildFormats(chosen, enabled),
      offerCode: '',
      resolved: {},
    })
    setStep('formats')
  }

  const results = useMemo(() => (post ? brandCheck(post, state.rules) : []), [post, state.rules])
  const blocking = results.filter((r) => r.status === 'fail').length
  const live = post?.formats.filter((f) => f.enabled) || []
  const offline = live.filter((f) => !state.networks.find((n) => n.id === channels.find((c) => c.id === f.channelId).network)?.connected)

  const onFix = (fix, value) => {
    if (fix.kind === 'swap-words') setPost(applyWordSwaps(post, fix.words))
    if (fix.kind === 'move-to-iftar') setPost({ ...post, resolved: { ...post.resolved, daytime: true } })
    if (fix.kind === 'offer-code') setPost({ ...post, offerCode: value })
    toast('Fixed. The brand check has run again.')
  }

  const submit = () => {
    const now = new Date().toISOString()
    const status = isApprover ? 'scheduled' : 'pending'
    const history = [
      { at: now, by: me, action: 'Created' },
      isApprover ? { at: now, by: me, action: 'Approved and scheduled' } : { at: now, by: me, action: 'Sent for approval' },
    ]
    const formats = post.formats.map((f) => ({ ...f, enabled: f.enabled && !offline.includes(f) }))
    const saved = { ...post, formats, status, createdBy: me, approvedBy: isApprover ? me : null, history, createdAt: now }
    dispatch({ type: 'post/add', post: saved })
    if (!isApprover) dispatch({ type: 'notify', note: { to: 'client', text: `${people[me].name.split(' ')[0]} sent ${saved.title} for approval.`, link: `review?${saved.id}` } })
    if (state.paidHandover && isApprover) dispatch({ type: 'notify', note: { to: 'agency', text: `${saved.title} is approved. Assets are ready for the paid media team.`, link: 'calendar' } })
    toast(isApprover ? `Approved and scheduled ${formats.filter((f) => f.enabled).length} formats` : 'Sent to Layla for approval')
    setSavedId(saved.id)
    setStep('done')
  }

  const sendToAgency = () => {
    const ticket = {
      id: uid('tk'),
      kind: 'request',
      title: titleFrom(prompt),
      detail: prompt,
      status: 'new',
      from: me,
      createdAt: new Date().toISOString(),
      messages: [{ by: me, at: new Date().toISOString(), text: prompt }],
    }
    dispatch({ type: 'ticket/add', ticket })
    dispatch({ type: 'notify', note: { to: 'agency', text: `New request from ${people[me].name.split(' ')[0]}: ${ticket.title}`, link: 'desk' } })
    setTicketId(ticket.id)
    toast(`Sent to ${agency.name}`, 'agency')
  }

  const stepIndex = STEPS.findIndex(([id]) => id === (step === 'generating' || step === 'agency' ? 'brief' : step === 'done' ? 'check' : step))

  return (
    <div className="page">
      <nav className="steps" aria-label="Progress">
        {STEPS.map(([id, label], i) => (
          <span key={id} style={{ display: 'contents' }}>
            {i > 0 && <span className="sep">/</span>}
            <button
              className={`${i === stepIndex ? 'on' : ''} ${i < stepIndex ? 'done' : ''}`}
              disabled={i > stepIndex || step === 'done' || (i >= 1 && !concepts.length) || (i >= 2 && !post)}
              onClick={() => setStep(id)}
            >
              <b>{i + 1}</b>
              {label}
            </button>
          </span>
        ))}
      </nav>

      {step === 'brief' && (
        <div className="split-main">
          <div className="stack">
            <h1>Tell the studio what you need</h1>
            <p className="lede">Write it the way you would brief a colleague. Bring in characters, products and styles with @ so they look exactly as they do in the brand kit.</p>
            <Composer value={prompt} onChange={setPrompt} onSubmit={() => generate()} templates={state.templates} templateId={templateId} onTemplate={setTemplateId} submitLabel="Make concepts" autoFocus />
          </div>
          <aside className="panel">
            <h3>Channels for this post</h3>
            <p className="small muted" style={{ marginTop: 0 }}>Every concept is formatted for the channels you keep on.</p>
            <div className="stack" style={{ gap: 6 }}>
              {channels.map((c) => {
                const net = state.networks.find((n) => n.id === c.network)
                return (
                  <label key={c.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                    <span className="row" style={{ gap: 8 }}>
                      <input type="checkbox" checked={enabled.includes(c.id)} onChange={(e) => setEnabled(e.target.checked ? [...enabled, c.id] : enabled.filter((x) => x !== c.id))} />
                      {c.name}
                    </span>
                    <span className="tiny muted">{net?.connected ? c.ratio : 'not connected'}</span>
                  </label>
                )
              })}
            </div>
          </aside>
        </div>
      )}

      {step === 'generating' && (
        <div className="split-main">
          <div className="grid cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '4 / 5' }} />
            ))}
          </div>
          <aside className="panel thinking" aria-live="polite">
            {PROGRESS.map((line, i) => (
              <div key={line} className={`line ${i < progress ? 'done' : i === progress ? 'now' : ''}`}>
                {i < progress ? <span style={{ color: 'var(--ok)' }}>✓</span> : i === progress ? <span className="spinner" /> : <span style={{ width: 16 }} />}
                {line}
              </div>
            ))}
          </aside>
        </div>
      )}

      {step === 'agency' && analysis && (
        <div className="split-main">
          <div className="panel" style={{ borderColor: 'var(--agency)', background: 'var(--agency-soft)' }}>
            <span className="tag agency">Handled by {agency.name}</span>
            <h1 style={{ marginTop: 10 }}>This one needs your agency</h1>
            {analysis.agency.map((r) => (
              <p key={r} style={{ margin: '4px 0' }}>
                {r}
              </p>
            ))}
            <p className="small muted">Your brief goes to {agency.name} as it is. They reply here, and what they make lands in your library or templates.</p>
            <blockquote className="paper" style={{ margin: '14px 0', padding: 14 }}>
              {prompt}
            </blockquote>
            {ticketId ? (
              <div className="row">
                <span className="tag ok">Sent to {agency.name}. {agency.responseTime}.</span>
                <button className="btn" onClick={() => go('help')}>
                  Follow it in Ask {agency.name}
                </button>
              </div>
            ) : (
              <div className="row">
                <button className="btn agency lg" onClick={sendToAgency}>
                  <Icon name="send" size={16} /> Send to {agency.name}
                </button>
                <button className="btn" onClick={() => setStep('brief')}>
                  Edit the brief
                </button>
              </div>
            )}
          </div>
          <aside className="panel small">
            <h3>What the studio makes on its own</h3>
            <p className="muted">Posts, stories, short social video frames, offers and greetings for every connected channel, in English and three Arabic dialects, from the brand kit and templates.</p>
            <h3>What goes to {agency.name}</h3>
            <p className="muted">Shoots, TV and long-form film, new characters, identity changes, print and outdoor, new channels and anything that needs a new template.</p>
          </aside>
        </div>
      )}

      {step === 'concepts' && (
        <div className="split-main">
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: 28 }}>Four concepts</h1>
                <p className="muted small" style={{ margin: 0 }}>
                  Pick one to format for every channel. All four already follow the brand kit.
                </p>
              </div>
              <button className="btn" onClick={() => generate(prompt, templateId, round + 1)}>
                Try four more
              </button>
            </div>
            <div className="grid cols-2" style={{ maxWidth: 820 }}>
              {concepts.map((c) => (
                <div key={c.id} className={`creative pick ${c.id === selected ? 'selected' : ''}`} onClick={() => setSelected(c.id)} role="button" tabIndex={0} aria-pressed={c.id === selected} onKeyDown={(e) => e.key === 'Enter' && setSelected(c.id)}>
                  <div className="art">
                    <Creative w={1080} h={1350} concept={c} dialect="english" />
                  </div>
                  <div className="meta">
                    <b>{c.title}</b>
                    <span className="small muted">{c.copy.english.headline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {chosen && (
            <aside className="panel stack" style={{ position: 'sticky', top: 80 }}>
              <h3 style={{ margin: 0 }}>{chosen.title}</h3>
              <label className="field">
                Headline
                <input type="text" value={chosen.copy.english.headline} onChange={(e) => editChosen('headline', e.target.value)} />
              </label>
              <label className="field">
                Line under it
                <textarea value={chosen.copy.english.sub} onChange={(e) => editChosen('sub', e.target.value)} />
              </label>
              <p className="tiny muted" style={{ margin: 0 }}>
                Arabic versions keep the approved dialect copy. Ask {agency.name} if the Arabic needs a new line.
              </p>
              <div className="paper" style={{ padding: 10, direction: 'rtl', fontFamily: 'var(--ar)' }}>
                <div className="tiny muted" style={{ direction: 'ltr' }}>
                  Egyptian Arabic
                </div>
                <b>{chosen.copy.egyptian.headline}</b>
                <div className="small">{chosen.copy.egyptian.sub}</div>
              </div>
              <button className="btn gold lg" onClick={formatAll}>
                Format for every channel
              </button>
              <span className="tiny muted">{enabled.length} channels selected</span>
            </aside>
          )}
        </div>
      )}

      {step === 'formats' && post && (
        <div>
          <div className="row between" style={{ marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 28 }}>{post.title}</h1>
              <p className="muted small" style={{ margin: 0 }}>
                {live.length} formats from one concept. Change the language per channel, edit captions, or switch a format off.
              </p>
            </div>
            <div className="row">
              <label className="row small" style={{ gap: 6 }}>
                <input type="checkbox" checked={showSafe} onChange={(e) => setShowSafe(e.target.checked)} /> Show safe zones
              </label>
              <button className="btn" onClick={() => downloadAll(wallRef.current, post, toast)}>
                <Icon name="download" size={16} /> Download all
              </button>
              <button className="btn primary" onClick={() => setStep('check')}>
                Check and schedule
              </button>
            </div>
          </div>
          <div ref={wallRef}>
            <FormatWall post={post} onChange={setPost} showSafe={showSafe} />
          </div>
        </div>
      )}

      {step === 'check' && post && (
        <div className="split-main">
          <div>
            <h1 style={{ fontSize: 28 }}>Check the dates and times</h1>
            <p className="lede">Suggested times come from when each channel performs best for Qamari. Change any of them before you {isApprover ? 'approve' : 'send it for approval'}.</p>
            <div className="panel" style={{ padding: '6px 16px' }}>
              <ScheduleList post={post} onChange={setPost} networks={state.networks} />
            </div>
            {offline.length > 0 && (
              <p className="small" style={{ color: 'var(--warn)' }}>
                {offline.length} {offline.length > 1 ? 'formats are' : 'format is'} for channels that are not connected and will be left out.
              </p>
            )}
          </div>
          <aside className="panel stack" style={{ position: 'sticky', top: 80 }}>
            <BrandCheckPanel results={results} onFix={onFix} />
            {isApprover ? (
              <button className="btn primary lg" disabled={blocking > 0} onClick={submit}>
                Approve and schedule
              </button>
            ) : (
              <button className="btn primary lg" disabled={blocking > 0} onClick={submit}>
                Send to Layla for approval
              </button>
            )}
            {blocking > 0 && <span className="tiny muted">Fix the items above first. Brand rules are enforced, not optional.</span>}
            <button className="btn ghost" onClick={() => setStep('formats')}>
              Back to formats
            </button>
          </aside>
        </div>
      )}

      {step === 'done' && post && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <span className={`tag ${isApprover ? 'ok' : 'warn'}`}>{isApprover ? 'Scheduled' : 'Waiting for approval'}</span>
          <h1 style={{ marginTop: 10 }}>{isApprover ? `${post.title} is scheduled` : `${post.title} is with Layla`}</h1>
          <p className="muted">
            {isApprover
              ? `${live.length - offline.length} formats will go out at the times you set.${state.paidHandover ? ` ${agency.name}'s media team has the approved files for paid placements.` : ''}`
              : 'She gets a notification and can approve it, change the times or send it back with a note.'}
          </p>
          <div className="row">
            <button
              className="btn primary"
              onClick={() => {
                setPrompt('')
                setConcepts([])
                setPost(null)
                setStep('brief')
              }}
            >
              Make something else
            </button>
            <button className="btn" onClick={() => go(isApprover ? 'calendar' : `review?${savedId}`)}>
              {isApprover ? 'Open the calendar' : 'Open it in review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
