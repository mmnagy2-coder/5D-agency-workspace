import { useEffect, useMemo, useRef, useState } from 'react'
import { brand } from '../config/brand.js'
import { channels } from '../config/channels.js'
import { Composer, refsIn } from '../components/Composer.jsx'
import { BrandCheckPanel, downloadAll, FormatWall, ScheduleList } from '../components/PostEditor.jsx'
import { conceptTitle, go, Icon, personName, thumbDialect } from '../components/ui.jsx'
import { Creative } from '../creative/Creative.jsx'
import { hasArabic, isAr, isolateTags, L, t, tg } from '../i18n/index.js'
import { writeConcepts } from '../lib/engines.js'
import { applyWordSwaps, brandCheck, buildFormats, sleep, uid } from '../lib/simulate.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'
import { people } from '../config/agency.js'

const STEPS = ['brief', 'concepts', 'formats', 'check']

// A short working title from the brief, in the language it was written in.
// @Tags read as the element's name in that language.
const titleFrom = (prompt) => {
  const ar = hasArabic(prompt.replace(/@\w+/g, ''))
  const clean = prompt
    .replace(/@(\w+)/g, (_, tag) => {
      const el = brand.elements.find((e) => e.tag.toLowerCase() === tag.toLowerCase())
      if (el) return ar ? el.nameAr : el.name
      return tag.replace(/([a-z])([A-Z])/g, '$1 $2')
    })
    .replace(/\s+/g, ' ')
    .replace(/لـ /g, 'لـ')
    .trim()
  const short = clean.split(/[.,:;،؛]/)[0].trim()
  if (short.length > 46) return `${short.slice(0, 44).trim()}…`
  return ar ? short : short.charAt(0).toUpperCase() + short.slice(1)
}

export default function Create() {
  const { state, dispatch, toast } = useStore()
  const me = ROLE_INFO[state.role].person
  const gender = people[me]?.gender
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

  const template = state.templates.find((x) => x.id === templateId)
  const refs = refsIn(prompt)

  const PROGRESS = [
    t('create.p.read'),
    refs.length ? t('create.p.refs', { refs: refs.map((r) => '@' + r.tag).join(isAr() ? '، ' : ', ') }) : t('create.p.match'),
    t('create.p.copy'),
    template ? t('create.p.template', { name: L(template, 'name') }) : t('create.p.compose'),
  ]

  async function generate(p = prompt, tplId = templateId, nextRound = 0) {
    const tpl = state.templates.find((x) => x.id === tplId)
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

  // The headline you edit is the one in the interface language. The other
  // version is shown underneath for reference.
  const editDialect = isAr() ? 'egyptian' : 'english'
  const refDialect = isAr() ? 'english' : 'egyptian'
  const editChosen = (field, value) => {
    setConcepts((cs) => cs.map((c) => (c.id === selected ? { ...c, copy: { ...c.copy, [editDialect]: { ...c.copy[editDialect], [field]: value } } } : c)))
  }

  const formatAll = () => {
    const title = titleFrom(prompt)
    setPost({
      id: uid('post'),
      title,
      titleAr: hasArabic(title) ? title : undefined,
      prompt,
      analysis,
      concept: chosen,
      formats: buildFormats(chosen, enabled, { arabicFirst: analysis?.arabic }),
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
    toast(t('toast.fixed'))
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
    const vars = { who: me, title: saved.title, titleAr: saved.titleAr }
    dispatch({ type: 'post/add', post: saved })
    if (!isApprover) dispatch({ type: 'notify', note: { to: 'client', key: 'n.sent', vars, link: `review?${saved.id}` } })
    if (state.paidHandover && isApprover) dispatch({ type: 'notify', note: { to: 'agency', key: 'n.paidReady', vars: { title: saved.title, titleAr: saved.titleAr }, link: 'calendar' } })
    toast(isApprover ? t('create.toast.scheduled', { n: formats.filter((f) => f.enabled).length }) : t('create.toast.sent', { name: personName('layla') }))
    setSavedId(saved.id)
    setStep('done')
  }

  const sendToAgency = () => {
    const title = titleFrom(prompt)
    const ticket = {
      id: uid('tk'),
      kind: 'request',
      title,
      titleAr: hasArabic(title) ? title : undefined,
      detail: prompt,
      status: 'new',
      from: me,
      createdAt: new Date().toISOString(),
      messages: [{ by: me, at: new Date().toISOString(), text: prompt }],
    }
    dispatch({ type: 'ticket/add', ticket })
    dispatch({ type: 'notify', note: { to: 'agency', key: 'n.newRequest', vars: { who: me, title: ticket.title, titleAr: ticket.titleAr }, link: 'desk' } })
    setTicketId(ticket.id)
    toast(t('create.toast.agency'), 'agency')
  }

  const stepIndex = STEPS.indexOf(step === 'generating' || step === 'agency' ? 'brief' : step === 'done' ? 'check' : step)
  const postTitle = post ? L(post, 'title') : ''

  return (
    <div className="page">
      <nav className="steps" aria-label={t('create.progress')}>
        {STEPS.map((id, i) => (
          <span key={id} style={{ display: 'contents' }}>
            {i > 0 && <span className="sep">/</span>}
            <button
              className={`${i === stepIndex ? 'on' : ''} ${i < stepIndex ? 'done' : ''}`}
              disabled={i > stepIndex || step === 'done' || (i >= 1 && !concepts.length) || (i >= 2 && !post)}
              onClick={() => setStep(id)}
            >
              <b>{i + 1}</b>
              {t(`create.step.${id}`)}
            </button>
          </span>
        ))}
      </nav>

      {step === 'brief' && (
        <div className="split-main">
          <div className="stack">
            <h1>{t('create.brief.title')}</h1>
            <p className="lede">{t('create.brief.lede')}</p>
            <Composer value={prompt} onChange={setPrompt} onSubmit={() => generate()} templates={state.templates} templateId={templateId} onTemplate={setTemplateId} submitLabel={t('create.make')} autoFocus />
          </div>
          <aside className="panel">
            <h3>{t('create.channels.title')}</h3>
            <p className="small muted" style={{ marginTop: 0 }}>
              {t('create.channels.sub')}
            </p>
            <div className="stack" style={{ gap: 6 }}>
              {channels.map((c) => {
                const net = state.networks.find((n) => n.id === c.network)
                return (
                  <label key={c.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                    <span className="row" style={{ gap: 8 }}>
                      <input type="checkbox" checked={enabled.includes(c.id)} onChange={(e) => setEnabled(e.target.checked ? [...enabled, c.id] : enabled.filter((x) => x !== c.id))} />
                      {L(c, 'name')}
                    </span>
                    <span className="tiny muted">{net?.connected ? <span dir="ltr">{c.ratio}</span> : t('channel.notConnected')}</span>
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
              <div key={i} className={`line ${i < progress ? 'done' : i === progress ? 'now' : ''}`}>
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
            <span className="tag agency">{t('create.agency.tag')}</span>
            <h1 style={{ marginTop: 10 }}>{t('create.agency.title')}</h1>
            {analysis.agency.map((key) => (
              <p key={key} style={{ margin: '4px 0' }}>
                {t(`agency.reason.${key}`)}
              </p>
            ))}
            <p className="small muted">{t('create.agency.how')}</p>
            <blockquote className="paper" style={{ margin: '14px 0', padding: 14 }} dir="auto">
              {isolateTags(prompt)}
            </blockquote>
            {ticketId ? (
              <div className="row">
                <span className="tag ok">
                  {t('create.agency.sent')} {t('agency.responseTime')}
                </span>
                <button className="btn" onClick={() => go('help')}>
                  {t('create.agency.follow')}
                </button>
              </div>
            ) : (
              <div className="row">
                <button className="btn agency lg" onClick={sendToAgency}>
                  <Icon name="send" size={16} /> {t('create.agency.send')}
                </button>
                <button className="btn" onClick={() => setStep('brief')}>
                  {t('create.agency.edit')}
                </button>
              </div>
            )}
          </div>
          <aside className="panel small">
            <h3>{t('scope.studio.title')}</h3>
            <p className="muted">{t('scope.studio.body')}</p>
            <h3>{t('scope.agency.title')}</h3>
            <p className="muted">{t('scope.agency.body')}</p>
          </aside>
        </div>
      )}

      {step === 'concepts' && (
        <div className="split-main">
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: 28 }}>{t('create.concepts.title')}</h1>
                <p className="muted small" style={{ margin: 0 }}>
                  {t('create.concepts.sub')}
                </p>
              </div>
              <button className="btn" onClick={() => generate(prompt, templateId, round + 1)}>
                {t('create.concepts.more')}
              </button>
            </div>
            <div className="grid cols-2" style={{ maxWidth: 820 }}>
              {concepts.map((c) => (
                <div key={c.id} className={`creative pick ${c.id === selected ? 'selected' : ''}`} onClick={() => setSelected(c.id)} role="button" tabIndex={0} aria-pressed={c.id === selected} onKeyDown={(e) => e.key === 'Enter' && setSelected(c.id)}>
                  <div className="art">
                    <Creative w={1080} h={1350} concept={c} dialect={thumbDialect()} />
                  </div>
                  <div className="meta">
                    <b>{conceptTitle(c)}</b>
                    <span className="small muted">{c.copy[editDialect].headline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {chosen && (
            <aside className="panel stack" style={{ position: 'sticky', top: 80 }}>
              <h3 style={{ margin: 0 }}>{conceptTitle(chosen)}</h3>
              <label className="field">
                {t('create.concepts.headline')}
                <input type="text" value={chosen.copy[editDialect].headline} dir={editDialect === 'english' ? 'ltr' : 'rtl'} onChange={(e) => editChosen('headline', e.target.value)} />
              </label>
              <label className="field">
                {t('create.concepts.subline')}
                <textarea value={chosen.copy[editDialect].sub} dir={editDialect === 'english' ? 'ltr' : 'rtl'} onChange={(e) => editChosen('sub', e.target.value)} />
              </label>
              <p className="tiny muted" style={{ margin: 0 }}>
                {t(isAr() ? 'create.concepts.noteAr' : 'create.concepts.note')}
              </p>
              <div className="paper" style={{ padding: 10 }} dir={refDialect === 'english' ? 'ltr' : 'rtl'} lang={refDialect === 'english' ? 'en' : 'ar'}>
                <div className="tiny muted" dir={isAr() ? 'rtl' : 'ltr'}>
                  {L(
                    brand.dialects.find((d) => d.id === refDialect),
                    'name',
                  )}
                </div>
                <b>{chosen.copy[refDialect].headline}</b>
                <div className="small">{chosen.copy[refDialect].sub}</div>
              </div>
              <button className="btn gold lg" onClick={formatAll}>
                {t('create.concepts.format')}
              </button>
              <span className="tiny muted">{t('create.concepts.selected', { n: enabled.length })}</span>
            </aside>
          )}
        </div>
      )}

      {step === 'formats' && post && (
        <div>
          <div className="row between" style={{ marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 28 }} dir="auto">
                {postTitle}
              </h1>
              <p className="muted small" style={{ margin: 0 }}>
                {t('create.formats.sub', { n: live.length })}
              </p>
            </div>
            <div className="row">
              <label className="row small" style={{ gap: 6 }}>
                <input type="checkbox" checked={showSafe} onChange={(e) => setShowSafe(e.target.checked)} /> {t('create.formats.safe')}
              </label>
              <button className="btn" onClick={() => downloadAll(wallRef.current, post, toast)}>
                <Icon name="download" size={16} /> {t('create.formats.download')}
              </button>
              <button className="btn primary" onClick={() => setStep('check')}>
                {t('create.step.check')}
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
            <h1 style={{ fontSize: 28 }}>{t('create.check.title')}</h1>
            <p className="lede">{t(isApprover ? 'create.check.ledeApprove' : 'create.check.ledeSend')}</p>
            <div className="panel" style={{ padding: '6px 16px' }}>
              <ScheduleList post={post} onChange={setPost} networks={state.networks} />
            </div>
            {offline.length > 0 && (
              <p className="small" style={{ color: 'var(--warn)' }}>
                {t(offline.length > 1 ? 'create.check.offline' : 'create.check.offlineOne', { n: offline.length })}
              </p>
            )}
          </div>
          <aside className="panel stack" style={{ position: 'sticky', top: 80 }}>
            <BrandCheckPanel results={results} onFix={onFix} />
            <button className="btn primary lg" disabled={blocking > 0} onClick={submit}>
              {isApprover ? tg('action.approve', gender) : tg('action.sendLayla', gender, { name: personName('layla') })}
            </button>
            {blocking > 0 && <span className="tiny muted">{t('create.check.blocked')}</span>}
            <button className="btn ghost" onClick={() => setStep('formats')}>
              {t('create.check.back')}
            </button>
          </aside>
        </div>
      )}

      {step === 'done' && post && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <span className={`tag ${isApprover ? 'ok' : 'warn'}`}>{t(isApprover ? 'status.scheduled' : 'status.pending')}</span>
          <h1 style={{ marginTop: 10 }} dir="auto">
            {isApprover ? t('create.done.scheduled', { title: postTitle }) : t('create.done.withLayla', { title: postTitle, name: personName('layla') })}
          </h1>
          <p className="muted">
            {isApprover
              ? `${t('create.done.goOut', { n: live.length - offline.length })}${state.paidHandover ? ` ${t('create.done.paid')}` : ''}`
              : t('create.done.layla')}
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
              {t('create.done.again')}
            </button>
            <button className="btn" onClick={() => go(isApprover ? 'calendar' : `review?${savedId}`)}>
              {t(isApprover ? 'home.openCalendar' : 'create.done.openReview')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
