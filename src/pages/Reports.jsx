import { networkName } from '../config/channels.js'
import { isAr, ltr, t } from '../i18n/index.js'
import { useStore } from '../store/store.jsx'
import { NETWORK_COLOURS } from './Calendar.jsx'

// Baseline: the old way of working, agreed and signed before the pilot.
// Illustrative figures for the prototype.
const BASELINE = { daysToLive: 6.5, costPerAsset: 145, revisions: 3.2, approvalHours: 52, assetsPerMonth: 36, routineHours: 118, creativeHours: 22 }
const PILOT = { daysToLive: 0.8, costPerAsset: 24, revisions: 1.3, routineHours: 31, creativeHours: 71, baseAssets: 168 }

const CHANNEL_PERF = [
  { network: 'Instagram', posts: 42, reach: '1.9M', er: 4.1, was: 2.8 },
  { network: 'TikTok', posts: 38, reach: '3.4M', er: 6.3, was: 4.9 },
  { network: 'Snapchat', posts: 30, reach: '880K', er: 2.2, was: 1.9 },
  { network: 'Facebook', posts: 24, reach: '1.1M', er: 1.7, was: 1.6 },
  { network: 'YouTube', posts: 9, reach: '420K', er: 3.0, was: 2.4 },
]

const fmt = (v, unit) => (unit === '$' ? ltr(`$${v}`) : unit === 'h' ? t('reports.hours', { n: v }) : `${v}`)

function Pair({ label, old, now, unit = '', max, lowerBetter = true }) {
  const better = lowerBetter ? now < old : now > old
  return (
    <div className="bar-row">
      <div className="small" style={{ fontWeight: 600 }}>
        {label}
        <div className="tiny muted">{t(lowerBetter ? 'reports.lower' : 'reports.higher')}</div>
      </div>
      <div className="bar-pair">
        <div className="bar" style={{ width: `${(old / max) * 80}%`, background: '#b9bbb4' }}>
          <span className="muted">{t('reports.before', { v: fmt(old, unit) })}</span>
        </div>
        <div className="bar" style={{ width: `${Math.max((now / max) * 80, 1)}%`, background: better ? 'var(--brand)' : 'var(--bad)' }}>
          <span>{t('reports.now', { v: fmt(now, unit) })}</span>
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const { state } = useStore()
  const live = state.posts.filter((p) => ['scheduled', 'published'].includes(p.status))
  const formatsLive = live.reduce((n, p) => n + p.formats.filter((f) => f.enabled).length, 0)
  const assets = PILOT.baseAssets + formatsLive
  const approvalHours = (() => {
    const spans = state.posts
      .map((p) => {
        const sent = p.history.find((h) => h.action === 'Sent for approval')
        const ok = p.history.find((h) => h.action === 'Approved and scheduled')
        return sent && ok ? (new Date(ok.at) - new Date(sent.at)) / 36e5 : null
      })
      .filter((x) => x !== null && x >= 0)
    if (!spans.length) return 3
    return Math.max(0.1, Math.round((spans.reduce((a, b) => a + b, 0) / spans.length) * 10) / 10)
  })()
  const caught = state.posts.filter((p) => p.history.some((h) => h.action === 'Asked for changes')).length

  return (
    <div className="page">
      <h1>{t('reports.title')}</h1>
      <p className="lede">{t('reports.lede')}</p>

      <div className="grid cols-4" style={{ marginBottom: 28 }}>
        <div className="panel stat">
          <span className="small muted">{t('reports.briefToLive')}</span>
          <b>{t('reports.days', { n: PILOT.daysToLive })}</b>
          <span className="was">{t('reports.was', { v: t('reports.days', { n: BASELINE.daysToLive }) })}</span>
        </div>
        <div className="panel stat">
          <span className="small muted">{t('reports.cost')}</span>
          <b>${PILOT.costPerAsset}</b>
          <span className="was">{t('reports.was', { v: ltr(`$${BASELINE.costPerAsset}`) })}</span>
        </div>
        <div className="panel stat">
          <span className="small muted">{t('reports.assets')}</span>
          <b>{assets}</b>
          <span className="was">{t('reports.wasMonth', { n: BASELINE.assetsPerMonth })}</span>
        </div>
        <div className="panel stat">
          <span className="small muted">{t('reports.approval')}</span>
          <b>{t('reports.hours', { n: approvalHours })}</b>
          <span className="was">{t('reports.was', { v: t('reports.hours', { n: BASELINE.approvalHours }) })}</span>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: 'start', marginBottom: 28 }}>
        <div className="panel">
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0 }}>{t('reports.perAsset')}</h2>
            <div className="legend">
              <span>
                <i style={{ background: '#b9bbb4' }} />
                {t('reports.oldWay')}
              </span>
              <span>
                <i style={{ background: 'var(--brand)' }} />
                {t('reports.newWay')}
              </span>
            </div>
          </div>
          <div className="bars">
            <Pair label={t('reports.daysLabel')} old={BASELINE.daysToLive} now={PILOT.daysToLive} max={BASELINE.daysToLive} />
            <Pair label={t('reports.cost')} old={BASELINE.costPerAsset} now={PILOT.costPerAsset} unit="$" max={BASELINE.costPerAsset} />
            <Pair label={t('reports.revisions')} old={BASELINE.revisions} now={PILOT.revisions} max={BASELINE.revisions} />
            <Pair label={t('reports.hoursLabel')} old={BASELINE.approvalHours} now={approvalHours} unit="h" max={BASELINE.approvalHours} />
          </div>
        </div>
        <div className="panel">
          <h2>{t('reports.hoursGo')}</h2>
          <div className="bars">
            <Pair label={t('reports.routine')} old={BASELINE.routineHours} now={PILOT.routineHours} unit="h" max={BASELINE.routineHours} />
            <Pair label={t('reports.creative')} old={BASELINE.creativeHours} now={PILOT.creativeHours} unit="h" max={BASELINE.routineHours} lowerBetter={false} />
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>
            {t('reports.shift')}
          </p>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <h2>{t('reports.byChannel')}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr className="muted small" style={{ textAlign: 'start' }}>
                <th style={{ padding: '6px 4px', textAlign: 'start' }}>{t('reports.th.channel')}</th>
                <th style={{ padding: '6px 4px', textAlign: 'end' }}>{t('reports.th.posts')}</th>
                <th style={{ padding: '6px 4px', textAlign: 'end' }}>{t('reports.th.reach')}</th>
                <th style={{ padding: '6px 4px', textAlign: 'end' }}>{t('reports.th.engagement')}</th>
                <th style={{ padding: '6px 4px', textAlign: 'end' }}>{t('reports.th.before')}</th>
              </tr>
            </thead>
            <tbody>
              {CHANNEL_PERF.map((r) => (
                <tr key={r.network} style={{ borderTop: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '8px 4px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: NETWORK_COLOURS[r.network], marginInlineEnd: 8 }} />
                    {networkName(r.network, isAr())}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'end' }}>{r.posts}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'end' }}>{r.reach}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'end', fontWeight: 600 }}>{r.er}%</td>
                  <td style={{ padding: '8px 4px', textAlign: 'end' }} className="muted">
                    {r.was}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>{t('reports.quality')}</h2>
          <p className="small">{t('reports.qualitySub')}</p>
          <div className="grid cols-2">
            <div className="stat">
              <b>{caught}</b>
              <span className="was">{t('reports.sentBack')}</span>
            </div>
            <div className="stat">
              <b>{state.rules.filter((r) => r.enforced).length}</b>
              <span className="was">{t('reports.rulesEnforced')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
