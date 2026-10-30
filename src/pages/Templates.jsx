import { useEffect, useState } from 'react'
import { agency } from '../config/agency.js'
import { TemplateBuilder, templateConcept, THEME_NAMES } from '../components/TemplateBuilder.jsx'
import { go, Icon } from '../components/ui.jsx'
import { Creative } from '../creative/Creative.jsx'
import { ROLE_INFO, useStore } from '../store/store.jsx'

export default function Templates() {
  const { state, dispatch, toast } = useStore()
  const [building, setBuilding] = useState(false)
  const side = ROLE_INFO[state.role].side

  useEffect(() => {
    if (side !== 'client') return
    const t = setTimeout(() => dispatch({ type: 'template/seen' }), 4000)
    return () => clearTimeout(t)
  }, [side, dispatch])

  const use = (t) => {
    dispatch({ type: 'composer', composer: { prompt: '', templateId: t.id, prefillOnly: true } })
    go('create')
  }

  return (
    <div className="page">
      <div className="row between">
        <div>
          <h1>Templates</h1>
          <p className="lede">Each template locks the logo, clear space, palette and type, and re-lays itself for every channel. New ones arrive from {agency.name} when the team needs something the studio cannot make yet.</p>
        </div>
        {side === 'agency' && (
          <button className="btn agency" onClick={() => setBuilding(true)}>
            <Icon name="plus" size={16} /> Build a template
          </button>
        )}
      </div>
      <div className="grid cols-3">
        {state.templates.map((t) => {
          const c = templateConcept(t)
          return (
            <article key={t.id} className="creative">
              <div className="art" style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 4, padding: 4, background: 'var(--line-soft)' }}>
                <Creative w={1080} h={1350} concept={c} />
                <div style={{ display: 'grid', gap: 4 }}>
                  <Creative w={1080} h={1080} concept={c} dialect="egyptian" />
                  <Creative w={1600} h={900} concept={c} />
                </div>
              </div>
              <div className="meta">
                <div className="row between">
                  <b>{t.name}</b>
                  <span className="row" style={{ gap: 4 }}>
                    {t.isNew && side === 'client' && <span className="tag warn">New</span>}
                    <span className={`tag ${t.source === '5D' ? 'agency' : 'brand'}`}>{t.source === '5D' ? `From ${agency.name}` : 'Brand'}</span>
                  </span>
                </div>
                <span className="small muted">{t.description}</span>
                <span className="tiny muted">Sample shown: {THEME_NAMES[t.sampleTheme]}</span>
                <div className="row" style={{ marginTop: 6 }}>
                  <button className="btn sm primary" onClick={() => use(t)}>
                    Use this template
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {building && (
        <TemplateBuilder
          onClose={() => setBuilding(false)}
          onPublish={(tpl) => {
            dispatch({ type: 'template/add', template: tpl })
            dispatch({ type: 'notify', note: { to: 'client', text: `${agency.name} added a new template: ${tpl.name}.`, link: 'templates' } })
            toast(`Published ${tpl.name} to Qamari's workspace`, 'agency')
            setBuilding(false)
          }}
        />
      )}
    </div>
  )
}
