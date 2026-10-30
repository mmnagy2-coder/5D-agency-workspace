import { useRef, useState } from 'react'
import { agency } from '../config/agency.js'
import { brand } from '../config/brand.js'
import { AssetArt, fmtDate, go, Icon, Modal } from '../components/ui.jsx'
import { saveBlob, slug, svgToPngBlob } from '../lib/exporter.js'
import { uid } from '../lib/simulate.js'
import { useStore } from '../store/store.jsx'

const SOURCES = ['All', 'Brand kit', 'Created here', 'From 5D']
const KINDS = { logo: 'Logo', product: 'Product', character: 'Character', scene: 'Scene', video: 'Video', document: 'Document', artwork: 'Artwork' }
const ELEMENT_FOR = { box: 'MedjoolReserve', tin: 'MaamoulTin', bottle: 'DateSyrup', teta: 'TetaNour', yassin: 'Yassin', table: 'LongTable' }

export default function Library() {
  const { state, dispatch, toast } = useStore()
  const [source, setSource] = useState('All')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [adding, setAdding] = useState(false)

  const created = state.posts
    .filter((p) => ['scheduled', 'published'].includes(p.status))
    .map((p) => ({ id: `art-${p.id}`, name: p.title, kind: 'artwork', concept: p.concept, source: 'Created here', tags: [p.concept.theme], addedAt: p.createdAt }))
  const all = [...state.assets, ...created]
  const list = all
    .filter((a) => source === 'All' || a.source === source)
    .filter((a) => !q || `${a.name} ${a.tags?.join(' ')} ${a.kind}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page">
      <div className="row between">
        <div>
          <h1>Library</h1>
          <p className="lede">Every approved asset Qamari owns: brand kit originals, what the team has made here, and what {agency.name} has delivered.</p>
        </div>
        {state.role === 'agency' && (
          <button className="btn agency" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} /> Add to Qamari's library
          </button>
        )}
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        {SOURCES.map((s) => (
          <button key={s} className={`chip ${source === s ? 'on' : ''}`} onClick={() => setSource(s)}>
            {s} <span className="tiny">{s === 'All' ? all.length : all.filter((a) => a.source === s).length}</span>
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <input type="search" placeholder="Search the library" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} aria-label="Search the library" />
      </div>
      {list.length === 0 ? (
        <div className="empty">No assets match. Try another search, or ask {agency.name} for what is missing.</div>
      ) : (
        <div className="grid cols-4">
          {list.map((a) => (
            <div key={a.id} className="creative pick" onClick={() => setOpen(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(a)}>
              <div className="art">
                <AssetArt asset={a} />
              </div>
              <div className="meta">
                <b>{a.name}</b>
                <div className="row" style={{ gap: 6 }}>
                  <span className={`tag ${a.source === 'From 5D' ? 'agency' : a.source === 'Created here' ? 'ok' : 'brand'}`}>{a.source}</span>
                  <span className="tiny muted">{KINDS[a.kind]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && <AssetModal asset={open} onClose={() => setOpen(null)} dispatch={dispatch} toast={toast} />}
      {adding && (
        <AddAsset
          onClose={() => setAdding(false)}
          onAdd={(asset) => {
            dispatch({ type: 'asset/add', asset })
            dispatch({ type: 'notify', note: { to: 'client', text: `${agency.name} added ${asset.name} to your library.`, link: 'library' } })
            toast(`Added to Qamari's library`, 'agency')
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}

function AssetModal({ asset, onClose, dispatch, toast }) {
  const ref = useRef(null)
  const tag = ELEMENT_FOR[asset.motif]
  const use = () => {
    const prompt = tag ? `@${tag} ` : asset.concept ? `A new version of “${asset.name}” ` : `Using ${asset.name}: `
    dispatch({ type: 'composer', composer: { prompt, templateId: null, prefillOnly: true } })
    onClose()
    go('create')
  }
  const download = async () => {
    const svg = ref.current?.querySelector('svg')
    if (!svg) return
    const isArt = !!asset.concept
    const blob = await svgToPngBlob(svg, isArt ? 1080 : 1200, isArt ? 1350 : 1200)
    const res = await saveBlob(blob, `${slug(asset.name)}.png`)
    if (res === 'saved') toast('Downloaded')
  }
  return (
    <Modal onClose={onClose} label={asset.name}>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div ref={ref} style={{ lineHeight: 0, borderRadius: 8, overflow: 'hidden' }}>
          {asset.concept ? <AssetArt asset={asset} w={1080} h={1350} /> : <AssetArt asset={asset} w={1200} h={1200} />}
        </div>
        <div className="stack">
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 26 }}>{asset.name}</h2>
          <div className="row">
            <span className={`tag ${asset.source === 'From 5D' ? 'agency' : 'brand'}`}>{asset.source}</span>
            <span className="tag">{KINDS[asset.kind]}</span>
            {asset.duration && <span className="tag">{asset.duration}</span>}
            {asset.pages && <span className="tag">{asset.pages} pages</span>}
          </div>
          <p className="small muted">Added {fmtDate(asset.addedAt, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
          {tag && (
            <p className="small">
              Referenced in prompts as <span className="chip ref">@{tag}</span>
            </p>
          )}
          <div className="row">
            {asset.kind !== 'document' && (
              <button className="btn primary" onClick={use}>
                Use in a new post
              </button>
            )}
            <button className="btn" onClick={download}>
              <Icon name="download" size={16} /> Download
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const MOTIFS = [
  ['box', 'Medjool Reserve box'],
  ['tin', 'Maamoul tin'],
  ['bottle', 'Date syrup'],
  ['teta', 'Teta Nour'],
  ['yassin', 'Yassin'],
  ['table', 'Long table'],
  ['lantern', 'Lantern'],
]

export function AddAsset({ onClose, onAdd, initialName }) {
  const [name, setName] = useState(initialName || 'Suhoor table, wide')
  const [kind, setKind] = useState('scene')
  const [motif, setMotif] = useState('table')
  const [palette, setPalette] = useState('night')
  const preview = { id: 'preview', name, kind, motif, palette, source: 'From 5D' }
  return (
    <Modal onClose={onClose} label="Add to library">
      <h2>Add to Qamari's library</h2>
      <p className="small muted">In the live product this is an upload from 5D's production. Here you pick what it shows.</p>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <label className="field">
            Name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            Kind
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {['scene', 'product', 'character', 'video'].map((k) => (
                <option key={k} value={k}>
                  {KINDS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Shows
            <select value={motif} onChange={(e) => setMotif(e.target.value)}>
              {MOTIFS.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Background
            <select value={palette} onChange={(e) => setPalette(e.target.value)}>
              {brand.colours.slice(0, 4).filter((c) => ['night', 'date', 'milk'].includes(c.id)).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn agency" disabled={!name.trim()} onClick={() => onAdd({ ...preview, id: uid('as'), tags: [kind], addedAt: new Date().toISOString(), duration: kind === 'video' ? '0:30' : undefined })}>
            Publish to Qamari's library
          </button>
        </div>
        <div style={{ lineHeight: 0, borderRadius: 8, overflow: 'hidden' }}>
          <AssetArt asset={preview} />
        </div>
      </div>
    </Modal>
  )
}
