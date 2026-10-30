import { useState } from 'react'
import { channels } from '../config/channels.js'
import { Modal, personName } from '../components/ui.jsx'
import { isAr, L, ltr, t } from '../i18n/index.js'
import { useStore } from '../store/store.jsx'
import { NETWORK_COLOURS } from './Calendar.jsx'

export default function Channels() {
  const { state, dispatch, toast } = useStore()
  const [connecting, setConnecting] = useState(null)
  const canManage = state.role !== 'maker'

  return (
    <div className="page">
      <h1>{t('nav.channels')}</h1>
      <p className="lede">{t('channels.lede')}</p>
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
                    {L(n, 'name')}{' '}
                    <span className="muted small" dir="ltr">
                      {n.handle}
                    </span>
                  </div>
                  <div className="tiny muted">
                    {formats.map((f) => `${L(f, 'name')} ${f.ratio}`).join(isAr() ? '، ' : ', ')}
                    {n.connected ? t('channels.queued', { n: queued }) : ''}
                  </div>
                </div>
                {n.connected ? <span className="tag ok">{t('channels.connected')}</span> : <span className="tag">{t('channel.notConnectedTag')}</span>}
                {canManage && (
                  <button
                    className="btn sm"
                    onClick={() => {
                      if (n.connected) {
                        dispatch({ type: 'network/toggle', id: n.id })
                        toast(t('channels.toast.off', { name: L(n, 'name') }))
                      } else setConnecting(n)
                    }}
                  >
                    {t(n.connected ? 'channels.disconnect' : 'channels.connect')}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="stack">
          <div className="panel">
            <h3>{t('channels.paid')}</h3>
            <label className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
              <input type="checkbox" checked={state.paidHandover} disabled={!canManage} onChange={() => dispatch({ type: 'paid/toggle' })} style={{ marginTop: 4 }} />
              <span>
                {t('channels.paidToggle')}
                <div className="small muted">{t('channels.paidNote')}</div>
              </span>
            </label>
          </div>
          <div className="panel small muted">
            {canManage ? t('channels.manageNote') : t('channels.onlyApprover', { name: personName('layla') })}
          </div>
        </div>
      </div>
      {connecting && (
        <Modal onClose={() => setConnecting(null)} label={t('channels.connectTo', { name: L(connecting, 'name') })}>
          <h2>{t('channels.connectTo', { name: L(connecting, 'name') })}</h2>
          <p>{t('channels.connectBody', { handle: ltr(connecting.handle) })}</p>
          <p className="small muted">{t('channels.connectNote', { name: L(connecting, 'name') })}</p>
          <div className="row end">
            <button className="btn" onClick={() => setConnecting(null)}>
              {t('cancel')}
            </button>
            <button
              className="btn primary"
              onClick={() => {
                dispatch({ type: 'network/toggle', id: connecting.id })
                toast(t('channels.toast.on', { name: L(connecting, 'name') }))
                setConnecting(null)
              }}
            >
              {t('channels.allow')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
