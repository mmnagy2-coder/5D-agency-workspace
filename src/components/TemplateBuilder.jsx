import { useState } from 'react'
import { agency } from '../config/agency.js'
import { Creative } from '../creative/Creative.jsx'
import { THEMES } from '../lib/copy.js'
import { uid } from '../lib/simulate.js'
import { Modal } from './ui.jsx'

export const LAYOUTS = [
  ['hero', 'Product hero'],
  ['split', 'Split band'],
  ['greeting', 'Framed greeting'],
  ['character', 'Character quote'],
]
export const MOTIFS = [
  ['box', 'Medjool Reserve box'],
  ['tin', 'Maamoul tin'],
  ['bottle', 'Date syrup'],
  ['teta', 'Teta Nour'],
  ['yassin', 'Yassin'],
  ['table', 'Long table'],
  ['lantern', 'Lantern'],
]
export const THEME_NAMES = { general: 'Everyday', ramadan: 'Ramadan', eid: 'Eid', launch: 'Launch', offer: 'Offer', gift: 'Gifting' }

export function templateConcept(t) {
  const copy = (THEMES[t.sampleTheme] || THEMES.general)[0]
  const motif = t.layout === 'greeting' ? 'greeting' : t.layout === 'character' && !['teta', 'yassin'].includes(t.motif) ? 'teta' : t.motif
  return { id: t.id, layout: t.layout, palette: t.palette, motif, copy, theme: t.sampleTheme }
}

export function TemplateBuilder({ onClose, onPublish, initial }) {
  const [t, setT] = useState(
    initial || {
      name: 'Corporate gifting, landscape',
      layout: 'hero',
      palette: 'night',
      motif: 'box',
      sampleTheme: 'gift',
      description: 'Gift box for company orders. Built for LinkedIn and email headers.',
    },
  )
  const set = (k) => (e) => setT({ ...t, [k]: e.target.value })
  const concept = templateConcept({ ...t, id: 'draft' })
  return (
    <Modal onClose={onClose} wide label="Build a template">
      <h2>Build a template for Qamari</h2>
      <p className="small muted" style={{ marginTop: -6 }}>
        Logo position, clear space, palette and type stay locked to the brand kit. The client's team can only change the words and the product.
      </p>
      <div className="grid" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
        <div className="stack">
          <label className="field">
            Name
            <input type="text" value={t.name} onChange={set('name')} />
          </label>
          <label className="field">
            Layout
            <select value={t.layout} onChange={set('layout')}>
              {LAYOUTS.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Background
            <select value={t.palette} onChange={set('palette')}>
              <option value="night">Night indigo</option>
              <option value="date">Date brown</option>
              <option value="milk">Milk cream</option>
            </select>
          </label>
          <label className="field">
            Default subject
            <select value={t.motif} onChange={set('motif')} disabled={t.layout === 'greeting'}>
              {MOTIFS.map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Sample copy
            <select value={t.sampleTheme} onChange={set('sampleTheme')}>
              {Object.entries(THEME_NAMES).map(([id, l]) => (
                <option key={id} value={id}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            When to use it
            <textarea value={t.description} onChange={set('description')} />
          </label>
          <button
            className="btn agency lg"
            disabled={!t.name.trim()}
            onClick={() => onPublish({ ...t, id: uid('tpl'), source: '5D', isNew: true, addedAt: new Date().toISOString() })}
          >
            Publish to Qamari's workspace
          </button>
          <span className="tiny muted">It appears in the client's templates straight away, marked as new from {agency.name}.</span>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 0.72fr', alignItems: 'start' }}>
          <div className="stack">
            <div style={{ lineHeight: 0, borderRadius: 6, overflow: 'hidden' }}>
              <Creative w={1600} h={900} concept={concept} />
            </div>
            <div className="grid cols-2">
              <div style={{ lineHeight: 0, borderRadius: 6, overflow: 'hidden' }}>
                <Creative w={1080} h={1080} concept={concept} />
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
