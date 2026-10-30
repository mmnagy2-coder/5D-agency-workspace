import { useState } from 'react'
import { Creative } from '../creative/Creative.jsx'
import { inputDir, isAr, t as tr } from '../i18n/index.js'
import { THEMES } from '../lib/copy.js'
import { uid } from '../lib/simulate.js'
import { Modal } from './ui.jsx'

export const LAYOUTS = ['hero', 'split', 'greeting', 'character']
export const MOTIFS = ['box', 'tin', 'bottle', 'teta', 'yassin', 'table', 'lantern']
export const THEMES_LIST = ['general', 'ramadan', 'eid', 'launch', 'offer', 'gift']

export function templateConcept(t) {
  const copy = (THEMES[t.sampleTheme] || THEMES.general)[0]
  const motif = t.layout === 'greeting' ? 'greeting' : t.layout === 'character' && !['teta', 'yassin'].includes(t.motif) ? 'teta' : t.motif
  return { id: t.id, layout: t.layout, palette: t.palette, motif, copy, theme: t.sampleTheme }
}

export function TemplateBuilder({ onClose, onPublish, initial }) {
  const [t, setT] = useState(
    initial || {
      name: tr('builder.defaultName'),
      layout: 'hero',
      palette: 'night',
      motif: 'box',
      sampleTheme: 'gift',
      description: tr('builder.defaultDescription'),
    },
  )
  const set = (k) => (e) => setT({ ...t, [k]: e.target.value })
  const concept = templateConcept({ ...t, id: 'draft' })
  return (
    <Modal onClose={onClose} wide label={tr('templates.build')}>
      <h2>{tr('builder.title')}</h2>
      <p className="small muted" style={{ marginTop: -6 }}>
        {tr('builder.lede')}
      </p>
      <div className="grid" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
        <div className="stack">
          <label className="field">
            {tr('field.name')}
            <input type="text" value={t.name} dir={inputDir(t.name)} onChange={set('name')} />
          </label>
          <label className="field">
            {tr('field.layout')}
            <select value={t.layout} onChange={set('layout')}>
              {LAYOUTS.map((id) => (
                <option key={id} value={id}>
                  {tr(`layout.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {tr('field.background')}
            <select value={t.palette} onChange={set('palette')}>
              {['night', 'date', 'milk'].map((id) => (
                <option key={id} value={id}>
                  {tr(`colour.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {tr('field.subject')}
            <select value={t.motif} onChange={set('motif')} disabled={t.layout === 'greeting'}>
              {MOTIFS.map((id) => (
                <option key={id} value={id}>
                  {tr(`motif.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {tr('field.sample')}
            <select value={t.sampleTheme} onChange={set('sampleTheme')}>
              {THEMES_LIST.map((id) => (
                <option key={id} value={id}>
                  {tr(`theme.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {tr('field.when')}
            <textarea value={t.description} dir={inputDir(t.description)} onChange={set('description')} />
          </label>
          <button
            className="btn agency lg"
            disabled={!t.name.trim()}
            onClick={() => onPublish({ ...t, id: uid('tpl'), source: '5D', isNew: true, addedAt: new Date().toISOString() })}
          >
            {tr('builder.publish')}
          </button>
          <span className="tiny muted">{tr('builder.note')}</span>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 0.72fr', alignItems: 'start' }}>
          <div className="stack">
            <div style={{ lineHeight: 0, borderRadius: 6, overflow: 'hidden' }}>
              <Creative w={1600} h={900} concept={concept} dialect={isAr() ? 'egyptian' : 'english'} />
            </div>
            <div className="grid cols-2">
              <div style={{ lineHeight: 0, borderRadius: 6, overflow: 'hidden' }}>
                <Creative w={1080} h={1080} concept={concept} dialect={isAr() ? 'english' : 'egyptian'} />
              </div>
              <div style={{ lineHeight: 0, borderRadius: 6, overflow: 'hidden' }}>
                <Creative w={1080} h={1080} concept={concept} dialect="gulf" />
              </div>
            </div>
          </div>
          <div style={{ lineHeight: 0, borderRadius: 6, overflow: 'hidden' }}>
            <Creative w={1080} h={1920} concept={concept} dialect="egyptian" />
          </div>
        </div>
      </div>
    </Modal>
  )
}
