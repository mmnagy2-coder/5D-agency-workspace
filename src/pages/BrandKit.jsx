import { agency } from '../config/agency.js'
import { brand } from '../config/brand.js'
import { ElementThumb } from '../components/Composer.jsx'
import { Icon } from '../components/ui.jsx'
import { C, Crescent } from '../creative/motifs.jsx'
import { ROLE_INFO, useStore } from '../store/store.jsx'

function Lockup({ bg, fg, mark }) {
  return (
    <svg viewBox="0 0 400 200" role="img" aria-label="Qamari logo lockup" style={{ width: '100%', display: 'block' }}>
      <rect width="400" height="200" fill={bg} />
      <rect x="62" y="52" width="276" height="96" fill="none" stroke={fg} strokeDasharray="4 5" opacity="0.25" />
      <Crescent cx={112} cy={96} r={26} fill={mark} />
      <text x="146" y="110" fontFamily="'Young Serif', serif" fontSize="44" fill={fg}>
        Qamari
      </text>
      <text x="332" y="138" fontFamily="'Reem Kufi', sans-serif" fontSize="20" fontWeight="700" fill={fg} textAnchor="end">
        قمري
      </text>
    </svg>
  )
}

export default function BrandKit() {
  const { state, dispatch, toast } = useStore()
  const isAgency = ROLE_INFO[state.role].side === 'agency'

  return (
    <div className="page">
      <h1>Brand kit</h1>
      <p className="lede">
        {brand.descriptor}. This is what every asset in the studio is made from. The rules marked enforced are checked on every post, and nothing that breaks them can be approved. Only {agency.name} can change the kit.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2>Logo</h2>
        <div className="grid cols-3">
          <div className="swatch">
            <Lockup bg={C.night} fg={C.milk} mark={C.saffron} />
            <div className="info">On night indigo</div>
          </div>
          <div className="swatch">
            <Lockup bg={C.milk} fg={C.night} mark={C.date} />
            <div className="info">On milk cream</div>
          </div>
          <div className="swatch">
            <Lockup bg={C.date} fg={C.milk} mark={C.saffron} />
            <div className="info">On date brown</div>
          </div>
        </div>
        <p className="small muted">The dashed line is the clear space. It equals the height of the crescent.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Colour</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {brand.colours.map((c) => (
            <div key={c.id} className="swatch">
              <div className="chipcol" style={{ background: c.hex }} />
              <div className="info">
                <div className="row between" style={{ flexWrap: 'nowrap' }}>
                  <b>{c.name}</b>
                  {c.locked && (
                    <span title="Locked in every template" style={{ color: 'var(--muted)' }}>
                      <Icon name="lock" size={14} />
                    </span>
                  )}
                </div>
                <div className="tiny muted">{c.hex}</div>
                <div className="tiny">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }} className="grid cols-2">
        <div className="panel">
          <h2>Type</h2>
          <div className="specimen" style={{ fontFamily: "'Young Serif', serif" }}>One more place at the table</div>
          <p className="tiny muted">{brand.type.display.family}. {brand.type.display.use}.</p>
          <div className="specimen" dir="rtl" style={{ fontFamily: "'Reem Kufi', sans-serif", fontWeight: 700 }}>
            دايماً فيه مكان لواحد كمان
          </div>
          <p className="tiny muted">{brand.type.displayAr.family}. {brand.type.displayAr.use}.</p>
          <p style={{ fontFamily: 'var(--ui)' }}>Medjool Reserve, packed for a whole month of iftars.</p>
          <p className="tiny muted">{brand.type.body.family} and {brand.type.bodyAr.family} for body copy.</p>
        </div>
        <div className="panel">
          <h2>Voice</h2>
          <p>{brand.voice.summary}</p>
          <h3>We say</h3>
          <div className="row" style={{ marginBottom: 12 }}>
            {brand.voice.weSay.map((w) => (
              <span key={w} className="tag ok">
                {w}
              </span>
            ))}
          </div>
          <h3>We never say</h3>
          <div className="row">
            {brand.voice.weAvoid.map((w) => (
              <span key={w} className="tag bad">
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Rules</h2>
        <div className="paper list" style={{ padding: '4px 16px' }}>
          {state.rules.map((r) => (
            <div key={r.id} className="list-row" style={{ alignItems: 'flex-start' }}>
              <span className="tag" style={{ minWidth: 72, justifyContent: 'center' }}>
                {r.category}
              </span>
              <span style={{ flex: 1 }}>{r.text}</span>
              {isAgency ? (
                <label className="row small" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={r.enforced}
                    onChange={() => {
                      dispatch({ type: 'rule/toggle', id: r.id })
                      toast(`${r.category} rule is now ${r.enforced ? 'advice only' : 'enforced'}`, 'agency')
                    }}
                  />
                  Enforced
                </label>
              ) : (
                <span className={`tag ${r.enforced ? 'brand' : ''}`}>{r.enforced ? 'Enforced' : 'Advice'}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>Characters, products and styles</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          Type the tag in any brief and the studio uses the approved version.
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {brand.elements.map((el) => (
            <div key={el.id} className="paper row" style={{ padding: 12, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <ElementThumb el={el} size={56} />
              <div style={{ minWidth: 0 }}>
                <span className="chip ref" style={{ fontSize: 12 }}>
                  @{el.tag}
                </span>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {el.type}
                </div>
                <div className="small">{el.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Languages and dialects</h2>
        <div className="grid cols-4">
          {brand.dialects.map((d) => (
            <div key={d.id} className="panel">
              <b>{d.name}</b>
              <div className="small muted">{d.market}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
