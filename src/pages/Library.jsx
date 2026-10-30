import { useRef, useState } from 'react'
import { brand } from '../config/brand.js'
import { AssetArt, fmtDate, go, Icon, Modal } from '../components/ui.jsx'
import { hasArabic, inputDir, L, t } from '../i18n/index.js'
import { saveBlob, slug, svgToPngBlob } from '../lib/exporter.js'
import { uid } from '../lib/simulate.js'
import { useStore } from '../store/store.jsx'

// Sources and kinds are stored in English and read in the interface language.
const SOURCES = ['All', 'Brand kit', 'Created here', 'From 5D']
const SOURCE_KEY = { All: 'library.src.all', 'Brand kit': 'library.src.kit', 'Created here': 'library.src.here', 'From 5D': 'library.src.agency' }
export const sourceLabel = (s) => t(SOURCE_KEY[s] || s)
const kindLabel = (k) => t(`kind.${k}`)
const ELEMENT_FOR = { box: 'MedjoolReserve', tin: 'MaamoulTin', bottle: 'DateSyrup', teta: 'TetaNour', yassin: 'Yassin', table: 'LongTable' }

export default function Library() {
  const { state, dispatch, toast } = useStore()
  const [source, setSource] = useState('All')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [adding, setAdding] = useState(false)

  const created = state.posts
    .filter((p) => ['scheduled', 'published'].includes(p.status))
    .map((p) => ({ id: `art-${p.id}`, name: p.title, nameAr: p.titleAr, kind: 'artwork', concept: p.concept, source: 'Created here', tags: [p.concept.theme], addedAt: p.createdAt }))
  const all = [...state.assets, ...created]
  const list = all
    .filter((a) => source === 'All' || a.source === source)
    .filter((a) => !q || `${a.name} ${a.nameAr || ''} ${a.tags?.join(' ')} ${a.kind} ${kindLabel(a.kind)}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page">
      <div className="row between">
        <div>
          <h1>{t('nav.library')}</h1>
          <p className="lede">{t('library.lede')}</p>
        </div>
        {state.role === 'agency' && (
          <button className="btn agency" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} /> {t('library.add')}
          </button>
        )}
      </div>
      <div className="row" style={{ marginBottom: 16 }}>
        {SOURCES.map((s) => (
          <button key={s} className={`chip ${source === s ? 'on' : ''}`} onClick={() => setSource(s)}>
            {sourceLabel(s)} <span className="tiny">{s === 'All' ? all.length : all.filter((a) => a.source === s).length}</span>
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <input type="search" placeholder={t('library.search')} value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} aria-label={t('library.search')} />
      </div>
      {list.length === 0 ? (
        <div className="empty">{t('library.empty')}</div>
      ) : (
        <div className="grid cols-4">
          {list.map((a) => (
            <div key={a.id} className="creative pick" onClick={() => setOpen(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(a)}>
              <div className="art">
                <AssetArt asset={a} />
              </div>
              <div className="meta">
                <b>{L(a, 'name')}</b>
                <div className="row" style={{ gap: 6 }}>
                  <span className={`tag ${a.source === 'From 5D' ? 'agency' : a.source === 'Created here' ? 'ok' : 'brand'}`}>{sourceLabel(a.source)}</span>
                  <span className="tiny muted">{kindLabel(a.kind)}</span>
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
            dispatch({ type: 'notify', note: { to: 'client', key: 'n.assetAdded', vars: { name: asset.name, nameAr: asset.nameAr }, link: 'library' } })
            toast(t('library.added'), 'agency')
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
    const prompt = tag ? `@${tag} ` : asset.concept ? t('library.newVersion', { name: L(asset, 'name') }) : t('library.using', { name: L(asset, 'name') })
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
    if (res === 'saved') toast(t('toast.downloadedPlain'))
  }
  return (
    <Modal onClose={onClose} label={L(asset, 'name')}>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div ref={ref} style={{ lineHeight: 0, borderRadius: 8, overflow: 'hidden' }}>
          {asset.concept ? <AssetArt asset={asset} w={1080} h={1350} /> : <AssetArt asset={asset} w={1200} h={1200} />}
        </div>
        <div className="stack">
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 26 }}>{L(asset, 'name')}</h2>
          <div className="row">
            <span className={`tag ${asset.source === 'From 5D' ? 'agency' : 'brand'}`}>{sourceLabel(asset.source)}</span>
            <span className="tag">{kindLabel(asset.kind)}</span>
            {asset.duration && <span className="tag">{asset.duration}</span>}
            {asset.pages && <span className="tag">{t('library.pages', { n: asset.pages })}</span>}
          </div>
          <p className="small muted">{t('library.addedOn', { date: fmtDate(asset.addedAt, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
          {tag && (
            <p className="small">
              {t('library.referenced')} <span className="chip ref" dir="ltr">@{tag}</span>
            </p>
          )}
          <div className="row">
            {asset.kind !== 'document' && (
              <button className="btn primary" onClick={use}>
                {t('library.use')}
              </button>
            )}
            <button className="btn" onClick={download}>
              <Icon name="download" size={16} /> {t('download')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const MOTIFS = ['box', 'tin', 'bottle', 'teta', 'yassin', 'table', 'lantern']

export function AddAsset({ onClose, onAdd, initialName }) {
  const [name, setName] = useState(initialName || t('library.defaultName'))
  const [kind, setKind] = useState('scene')
  const [motif, setMotif] = useState('table')
  const [palette, setPalette] = useState('night')
  const preview = { id: 'preview', name, nameAr: hasArabic(name) ? name : undefined, kind, motif, palette, source: 'From 5D' }
  return (
    <Modal onClose={onClose} label={t('library.add')}>
      <h2>{t('library.add')}</h2>
      <p className="small muted">{t('library.addNote')}</p>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <label className="field">
            {t('field.name')}
            <input type="text" value={name} dir={inputDir(name)} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            {t('field.kind')}
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {['scene', 'product', 'character', 'video'].map((k) => (
                <option key={k} value={k}>
                  {kindLabel(k)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t('field.shows')}
            <select value={motif} onChange={(e) => setMotif(e.target.value)}>
              {MOTIFS.map((id) => (
                <option key={id} value={id}>
                  {t(`motif.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t('field.background')}
            <select value={palette} onChange={(e) => setPalette(e.target.value)}>
              {brand.colours.slice(0, 4).filter((c) => ['night', 'date', 'milk'].includes(c.id)).map((c) => (
                <option key={c.id} value={c.id}>
                  {L(c, 'name')}
                </option>
              ))}
            </select>
          </label>
          <button className="btn agency" disabled={!name.trim()} onClick={() => onAdd({ ...preview, id: uid('as'), tags: [kind], addedAt: new Date().toISOString(), duration: kind === 'video' ? '0:30' : undefined })}>
            {t('library.publish')}
          </button>
        </div>
        <div style={{ lineHeight: 0, borderRadius: 8, overflow: 'hidden' }}>
          <AssetArt asset={preview} />
        </div>
      </div>
    </Modal>
  )
}
