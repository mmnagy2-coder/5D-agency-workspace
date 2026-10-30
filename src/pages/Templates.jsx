import { useEffect, useState } from 'react'
import { TemplateBuilder, templateConcept } from '../components/TemplateBuilder.jsx'
import { go, Icon, thumbDialect } from '../components/ui.jsx'
import { hasArabic, isAr, L, t } from '../i18n/index.js'
import { Creative } from '../creative/Creative.jsx'
import { ROLE_INFO, useStore } from '../store/store.jsx'

export default function Templates() {
  const { state, dispatch, toast } = useStore()
  const [building, setBuilding] = useState(false)
  const side = ROLE_INFO[state.role].side

  useEffect(() => {
    if (side !== 'client') return
    const timer = setTimeout(() => dispatch({ type: 'template/seen' }), 4000)
    return () => clearTimeout(timer)
  }, [side, dispatch])

  const use = (tpl) => {
    dispatch({ type: 'composer', composer: { prompt: '', templateId: tpl.id, prefillOnly: true } })
    go('create')
  }

  return (
    <div className="page">
      <div className="row between">
        <div>
          <h1>{t('nav.templates')}</h1>
          <p className="lede">{t('templates.lede')}</p>
        </div>
        {side === 'agency' && (
          <button className="btn agency" onClick={() => setBuilding(true)}>
            <Icon name="plus" size={16} /> {t('templates.build')}
          </button>
        )}
      </div>
      <div className="grid cols-3">
        {state.templates.map((tpl) => {
          const c = templateConcept(tpl)
          const main = thumbDialect()
          const other = isAr() ? 'english' : 'egyptian'
          return (
            <article key={tpl.id} className="creative">
              <div className="art" style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 4, padding: 4, background: 'var(--line-soft)' }}>
                <Creative w={1080} h={1350} concept={c} dialect={main} />
                <div style={{ display: 'grid', gap: 4 }}>
                  <Creative w={1080} h={1080} concept={c} dialect={other} />
                  <Creative w={1600} h={900} concept={c} dialect={main} />
                </div>
              </div>
              <div className="meta">
                <div className="row between">
                  <b>{L(tpl, 'name')}</b>
                  <span className="row" style={{ gap: 4 }}>
                    {tpl.isNew && side === 'client' && <span className="tag warn">{t('templates.new')}</span>}
                    <span className={`tag ${tpl.source === '5D' ? 'agency' : 'brand'}`}>{tpl.source === '5D' ? t('templates.fromAgency') : t('templates.brand')}</span>
                  </span>
                </div>
                <span className="small muted">{L(tpl, 'description')}</span>
                <span className="tiny muted">{t('templates.sample', { theme: t(`theme.${tpl.sampleTheme}`) })}</span>
                <div className="row" style={{ marginTop: 6 }}>
                  <button className="btn sm primary" onClick={() => use(tpl)}>
                    {t('templates.use')}
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
          onPublish={(tpl0) => {
            const tpl = { ...tpl0, nameAr: hasArabic(tpl0.name) ? tpl0.name : undefined, descriptionAr: hasArabic(tpl0.description) ? tpl0.description : undefined }
            dispatch({ type: 'template/add', template: tpl })
            dispatch({ type: 'notify', note: { to: 'client', key: 'n.templateAdded', vars: { name: tpl.name, nameAr: tpl.nameAr }, link: 'templates' } })
            toast(t('templates.published', { name: L(tpl, 'name') }), 'agency')
            setBuilding(false)
          }}
        />
      )}
    </div>
  )
}
