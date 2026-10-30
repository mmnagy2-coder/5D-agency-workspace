import { useState } from 'react'
import { agency, people } from '../config/agency.js'
import { channelById } from '../config/channels.js'
import { Composer } from '../components/Composer.jsx'
import { Avatar, fmtDate, go, PostThumb, relTime, StatusTag, thumbDialect } from '../components/ui.jsx'
import { Creative } from '../creative/Creative.jsx'
import { isAr, isolateTags, L, t, tg } from '../i18n/index.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

const IDEAS = {
  en: [
    'Ramadan iftar post for @MedjoolReserve with @TetaNour at the @LongTable',
    'Eid greeting for every channel',
    'Offer: 25% off the @MaamoulTin this weekend',
    'Launch teaser for @DateSyrup in the @CleanStudio style',
    'A 30-second TV ad for the first week of Ramadan',
  ],
  ar: [
    'بوست فطار رمضان لـ @MedjoolReserve مع @TetaNour على @LongTable',
    'تهنئة العيد لكل القنوات',
    'عرض: خصم 25% على @MaamoulTin الويك إند ده',
    'تيزر إطلاق @DateSyrup بستايل @CleanStudio',
    'إعلان تلفزيوني 30 ثانية لأول أسبوع في رمضان',
  ],
}

export default function Home() {
  const { state, dispatch } = useStore()
  const [text, setText] = useState('')
  const [templateId, setTemplateId] = useState(null)
  const me = people[ROLE_INFO[state.role].person]
  const first = L(me, 'name').split(' ')[0]

  const start = (prompt = text) => {
    dispatch({ type: 'composer', composer: { prompt, templateId } })
    go('create')
  }

  const pending = state.posts.filter((p) => p.status === 'pending')
  const changes = state.posts.filter((p) => p.status === 'changes')
  const queue = state.role === 'approver' ? pending : changes.concat(state.posts.filter((p) => p.status === 'draft'))

  const upcoming = state.posts
    .filter((p) => p.status === 'scheduled')
    .flatMap((p) => p.formats.filter((f) => f.enabled).map((f) => ({ post: p, f, t: new Date(f.scheduledAt) })))
    .filter((x) => x.t > new Date())
    .sort((a, b) => a.t - b.t)
    .slice(0, 6)

  const fromAgency = [
    ...state.templates.filter((x) => x.source === '5D').map((x) => ({ id: x.id, text: t('home.newTemplate', { name: L(x, 'name') }), at: x.addedAt, link: 'templates' })),
    ...state.assets.filter((a) => a.source === 'From 5D').map((a) => ({ id: a.id, text: t('home.addedToLibrary', { name: L(a, 'name') }), at: a.addedAt, link: 'library' })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 4)

  return (
    <div className="page">
      <section className="hello">
        <div className="composer">
          <h1>{tg('home.title', me.gender, { name: first })}</h1>
          <p className="who">{t('home.sub')}</p>
          <Composer value={text} onChange={setText} onSubmit={() => start()} templates={state.templates} templateId={templateId} onTemplate={setTemplateId} autoFocus />
          <div className="suggest" aria-label={t('home.ideas')}>
            {IDEAS[isAr() ? 'ar' : 'en'].map((i) => (
              <button key={i} onClick={() => setText(i)} dir="auto">
                {isolateTags(i)}
              </button>
            ))}
          </div>
        </div>
        <aside className="panel stack">
          <h2 style={{ marginBottom: 2 }}>{state.role === 'approver' ? tg('home.waiting', me.gender) : tg('home.backWithYou', me.gender)}</h2>
          {queue.length === 0 && <p className="muted small">{t('home.nothingWaiting')}</p>}
          <div className="list">
            {queue.slice(0, 4).map((p) => (
              <div key={p.id} className="list-row click" onClick={() => go(`review?${p.id}`)}>
                <PostThumb post={p} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{L(p, 'title')}</div>
                  <StatusTag status={p.status} />
                </div>
              </div>
            ))}
          </div>
          <h2 style={{ margin: '12px 0 2px' }}>{t('home.from', { agency: agency.name })}</h2>
          <div className="list">
            {fromAgency.map((n) => (
              <div key={n.id} className="list-row click" onClick={() => go(n.link)}>
                <Avatar id="dina" />
                <div className="small">
                  {n.text}
                  <div className="tiny muted">{n.at ? relTime(n.at) : ''}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn sm" onClick={() => go('help')} style={{ alignSelf: 'flex-start' }}>
            {t('home.askNew', { agency: agency.name })}
          </button>
        </aside>
      </section>

      <section style={{ marginBottom: 30 }}>
        <div className="row between">
          <h2>{t('home.next')}</h2>
          <button className="btn ghost sm" onClick={() => go('calendar')}>
            {t('home.openCalendar')}
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty">{t('home.nothingScheduled')}</div>
        ) : (
          <div className="grid cols-3">
            {upcoming.map(({ post, f }) => {
              const ch = channelById(f.channelId)
              return (
                <div key={post.id + f.channelId} className="paper row" style={{ padding: 10, flexWrap: 'nowrap', cursor: 'pointer' }} onClick={() => go(`review?${post.id}`)}>
                  <span className="thumb" style={{ width: 52 }}>
                    <Creative w={ch.w} h={ch.h} concept={post.concept} dialect={f.dialect} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{L(post, 'title')}</div>
                    <div className="small muted">
                      {L(ch, 'name')}{t('comma')}{fmtDate(f.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2>{t('home.recent')}</h2>
        <div className="grid cols-4">
          {state.posts.slice(0, 8).map((p) => (
            <div key={p.id} className="creative pick" onClick={() => go(`review?${p.id}`)}>
              <div className="art">
                <Creative w={1080} h={1350} concept={p.concept} dialect={thumbDialect()} />
              </div>
              <div className="meta">
                <b>{L(p, 'title')}</b>
                <div className="row" style={{ gap: 6 }}>
                  <StatusTag status={p.status} />
                  <span className="tiny muted">{t('formats.count', { n: p.formats.filter((f) => f.enabled).length })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
