import { agency } from '../config/agency.js'
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

function Pair({ label, old, now, unit = '', max, lowerBetter = true }) {
  const better = lowerBetter ? now < old : now > old
  return (
    <div className="bar-row">
      <div className="small" style={{ fontWeight: 600 }}>
        {label}
        <div className="tiny muted">{lowerBetter ? 'Lower is better' : 'Higher is better'}</div>
      </div>
      <div className="bar-pair">
        <div className="bar" style={{ width: `${(old / max) * 80}%`, background: '#b9bbb4' }}>
          <span className="muted">
            {unit === '$' ? `$${old}` : `${old}${unit}`} before
          </span>
        </div>
        <div className="bar" style={{ width: `${Math.max((now / max) * 80, 1)}%`, background: better ? 'var(--brand)' : 'var(--bad)' }}>
          <span>
            {unit === '$' ? `$${now}` : `${now}${unit}`} now
          </span>
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
      <h1>The new way against the old way</h1>
      <p className="lede">
        Measured against the baseline Qamari and {agency.name} signed before the pilot, taken from the last three campaigns run the old way. Figures in this prototype are illustrative. Assets, approvals and changes asked for update live from the work in this workspace.
      </p>

      <div className="grid cols-4" style={{ marginBottom: 28 }}>
        <div className="panel stat">
          <span className="small muted">Brief to live</span>
          <b>{PILOT.daysToLive} days</b>
          <span className="was">was {BASELINE.daysToLive} days</span>
        </div>
        <div className="panel stat">
          <span className="small muted">Cost per asset</span>
          <b>${PILOT.costPerAsset}</b>
          <span className="was">was ${BASELINE.costPerAsset}</span>
        </div>
        <div className="panel stat">
          <span className="small muted">Assets this month</span>
          <b>{assets}</b>
          <span className="was">was {BASELINE.assetsPerMonth} a month</span>
        </div>
        <div className="panel stat">
          <span className="small muted">Time to approval</span>
          <b>{approvalHours} h</b>
          <span className="was">was {BASELINE.approvalHours} h</span>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: 'start', marginBottom: 28 }}>
        <div className="panel">
          <div className="row between" style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0 }}>Per asset</h2>
            <div className="legend">
              <span>
                <i style={{ background: '#b9bbb4' }} />
                Old way
              </span>
              <span>
                <i style={{ background: 'var(--brand)' }} />
                With the studio
              </span>
            </div>
          </div>
          <div className="bars">
            <Pair label="Days from brief to live" old={BASELINE.daysToLive} now={PILOT.daysToLive} max={BASELINE.daysToLive} />
            <Pair label="Cost per asset" old={BASELINE.costPerAsset} now={PILOT.costPerAsset} unit="$" max={BASELINE.costPerAsset} />
            <Pair label="Revision rounds" old={BASELINE.revisions} now={PILOT.revisions} max={BASELINE.revisions} />
            <Pair label="Hours to approval" old={BASELINE.approvalHours} now={approvalHours} max={BASELINE.approvalHours} />
          </div>
        </div>
        <div className="panel">
          <h2>Where {agency.name}'s hours go each month</h2>
          <div className="bars">
            <Pair label="Routine production" old={BASELINE.routineHours} now={PILOT.routineHours} unit=" h" max={BASELINE.routineHours} />
            <Pair label="New creative and strategy" old={BASELINE.creativeHours} now={PILOT.creativeHours} unit=" h" max={BASELINE.routineHours} lowerBetter={false} />
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>
            The point of the pilot is this shift. The client's team makes the everyday assets, and the agency's time moves to the work only an agency can do.
          </p>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <h2>By channel, last 30 days</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr className="muted small" style={{ textAlign: 'left' }}>
                <th style={{ padding: '6px 4px' }}>Channel</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Posts</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Reach</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Engagement</th>
                <th style={{ padding: '6px 4px', textAlign: 'right' }}>Before</th>
              </tr>
            </thead>
            <tbody>
              {CHANNEL_PERF.map((r) => (
                <tr key={r.network} style={{ borderTop: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '8px 4px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: NETWORK_COLOURS[r.network], marginRight: 8 }} />
                    {r.network}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{r.posts}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{r.reach}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>{r.er}%</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }} className="muted">
                    {r.was}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h2>Quality record</h2>
          <p className="small">Every rejection and every fix is logged, so the pilot shows what the human check caught.</p>
          <div className="grid cols-2">
            <div className="stat">
              <b>{caught}</b>
              <span className="was">posts sent back by the approver</span>
            </div>
            <div className="stat">
              <b>{state.rules.filter((r) => r.enforced).length}</b>
              <span className="was">brand rules enforced on every post</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
