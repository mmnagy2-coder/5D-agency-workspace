import { useState } from 'react'
import { agency } from '../config/agency.js'
import { channels } from '../config/channels.js'
import { Modal } from '../components/ui.jsx'
import { useStore } from '../store/store.jsx'
import { NETWORK_COLOURS } from './Calendar.jsx'

export default function Channels() {
  const { state, dispatch, toast } = useStore()
  const [connecting, setConnecting] = useState(null)
  const canManage = state.role !== 'maker'

  return (
    <div className="page">
      <h1>Channels</h1>
      <p className="lede">Approved posts go out from here to Qamari's own accounts. Organic posts are scheduled by the platform. Paid placements stay with {agency.name}'s media team, who receive every approved file.</p>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="paper list" style={{ padding: '4px 16px' }}>
          {state.networks.map((n) => {
            const formats = channels.filter((c) => c.network === n.id)
            const queued = state.posts.filter((p) => p.status === 'scheduled').flatMap((p) => p.formats.filter((f) => f.enabled && formats.some((c) => c.id === f.channelId))).length
            return (
              <div key={n.id} className="list-row">
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: NETWORK_COLOURS[n.id], flex: 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {n.id} <span className="muted small">{n.handle}</span>
                  </div>
                  <div className="tiny muted">
                    {formats.map((f) => `${f.name} ${f.ratio}`).join(', ')}
                    {n.connected ? `. ${queued} scheduled.` : ''}
                  </div>
                </div>
                {n.connected ? <span className="tag ok">Connected</span> : <span className="tag">Not connected</span>}
                {canManage && (
                  <button
                    className="btn sm"
                    onClick={() => {
                      if (n.connected) {
                        dispatch({ type: 'network/toggle', id: n.id })
                        toast(`Disconnected ${n.id}`)
                      } else setConnecting(n)
                    }}
                  >
                    {n.connected ? 'Disconnect' : 'Connect'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="stack">
          <div className="panel">
            <h3>Paid campaigns</h3>
            <label className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
              <input type="checkbox" checked={state.paidHandover} disabled={!canManage} onChange={() => dispatch({ type: 'paid/toggle' })} style={{ marginTop: 4 }} />
              <span>
                Send every approved post to {agency.name}'s media team for paid placement
                <div className="small muted">They build and run the paid campaigns on Meta, TikTok and Snapchat from the same approved files. Spend is agreed with them, not set here.</div>
              </span>
            </label>
          </div>
          <div className="panel small muted">
            {canManage ? 'Connecting an account lets Qamari Studio post to it after approval. Nothing is posted without an approver.' : 'Only Layla or 5D can connect or disconnect accounts.'}
          </div>
        </div>
      </div>
      {connecting && (
        <Modal onClose={() => setConnecting(null)} label={`Connect ${connecting.id}`}>
          <h2>Connect {connecting.id}</h2>
          <p>Qamari Studio will be able to publish approved posts to {connecting.handle}. It cannot read messages or change account settings.</p>
          <p className="small muted">In the live product this opens {connecting.id}'s own sign-in. In the prototype it connects straight away.</p>
          <div className="row end">
            <button className="btn" onClick={() => setConnecting(null)}>
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={() => {
                dispatch({ type: 'network/toggle', id: connecting.id })
                toast(`Connected ${connecting.id}`)
                setConnecting(null)
              }}
            >
              Allow publishing
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
