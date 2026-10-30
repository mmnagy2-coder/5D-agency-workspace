import { brand } from '../config/brand.js'
import { ElementThumb } from '../components/Composer.jsx'
import { Icon } from '../components/ui.jsx'
import { C, Crescent } from '../creative/motifs.jsx'
import { hasArabic, L, t } from '../i18n/index.js'
import { ROLE_INFO, useStore } from '../store/store.jsx'

function Lockup({ bg, fg, mark }) {
  return (
    <svg viewBox="0 0 400 200" role="img" aria-label={t('kit.lockup')} style={{ width: '100%', display: 'block' }}>
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
      <h1>{t('nav.kit')}</h1>
      <p className="lede">
        {L(brand, 'descriptor')}. {t('kit.lede')}
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2>{t('kit.logo')}</h2>
        <div className="grid cols-3">
          <div className="swatch">
            <Lockup bg={C.night} fg={C.milk} mark={C.saffron} />
            <div className="info">{t('kit.on', { colour: t('colour.night') })}</div>
          </div>
          <div className="swatch">
            <Lockup bg={C.milk} fg={C.night} mark={C.date} />
            <div className="info">{t('kit.on', { colour: t('colour.milk') })}</div>
          </div>
          <div className="swatch">
            <Lockup bg={C.date} fg={C.milk} mark={C.saffron} />
            <div className="info">{t('kit.on', { colour: t('colour.date') })}</div>
          </div>
        </div>
        <p className="small muted">{t('kit.clearSpace')}</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>{t('kit.colour')}</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {brand.colours.map((c) => (
            <div key={c.id} className="swatch">
              <div className="chipcol" style={{ background: c.hex }} />
              <div className="info">
                <div className="row between" style={{ flexWrap: 'nowrap' }}>
                  <b>{L(c, 'name')}</b>
                  {c.locked && (
                    <span title={t('kit.locked')} style={{ color: 'var(--muted)' }}>
                      <Icon name="lock" size={14} />
                    </span>
                  )}
                </div>
                <div className="tiny muted" dir="ltr" style={{ textAlign: 'start' }}>
                  {c.hex}
                </div>
                <div className="tiny">{L(c, 'role')}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }} className="grid cols-2">
        <div className="panel">
          <h2>{t('kit.type')}</h2>
          <div className="specimen" dir="ltr" lang="en" style={{ fontFamily: "'Young Serif', serif" }}>
            One more place at the table
          </div>
          <p className="tiny muted">
            {brand.type.display.family}. {L(brand.type.display, 'use')}.
          </p>
          <div className="specimen" dir="rtl" style={{ fontFamily: "'Reem Kufi', sans-serif", fontWeight: 700 }}>
            دايماً فيه مكان لواحد كمان
          </div>
          <p className="tiny muted">
            {brand.type.displayAr.family}. {L(brand.type.displayAr, 'use')}.
          </p>
          <p dir="ltr" lang="en" style={{ fontFamily: "'Schibsted Grotesk', sans-serif" }}>
            Medjool Reserve, packed for a whole month of iftars.
          </p>
          <p dir="rtl" lang="ar" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            مجدول ريزيرف، متعبي لشهر فطار كامل.
          </p>
          <p className="tiny muted">{t('kit.body', { en: brand.type.body.family, ar: brand.type.bodyAr.family })}</p>
        </div>
        <div className="panel">
          <h2>{t('kit.voice')}</h2>
          <p>{L(brand.voice, 'summary')}</p>
          <h3>{t('kit.weSay')}</h3>
          <div className="row" style={{ marginBottom: 12 }}>
            {[...brand.voice.weSay, ...brand.voice.weSayAr].map((w) => (
              <span key={w} className="tag ok" lang={hasArabic(w) ? 'ar' : 'en'} dir="auto">
                {w}
              </span>
            ))}
          </div>
          <h3>{t('kit.weAvoid')}</h3>
          <div className="row">
            {[...brand.voice.weAvoid, ...brand.voice.weAvoidAr].map((w) => (
              <span key={w} className="tag bad" lang={hasArabic(w) ? 'ar' : 'en'} dir="auto">
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>{t('kit.rules')}</h2>
        <div className="paper list" style={{ padding: '4px 16px' }}>
          {state.rules.map((r) => (
            <div key={r.id} className="list-row" style={{ alignItems: 'flex-start' }}>
              <span className="tag" style={{ minWidth: 72, justifyContent: 'center' }}>
                {L(r, 'category')}
              </span>
              <span style={{ flex: 1 }}>{L(r, 'text')}</span>
              {isAgency ? (
                <label className="row small" style={{ gap: 6, flexWrap: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={r.enforced}
                    onChange={() => {
                      dispatch({ type: 'rule/toggle', id: r.id })
                      toast(t(r.enforced ? 'kit.toast.advice' : 'kit.toast.enforced', { category: L(r, 'category') }), 'agency')
                    }}
                  />
                  {t('kit.enforced')}
                </label>
              ) : (
                <span className={`tag ${r.enforced ? 'brand' : ''}`}>{t(r.enforced ? 'kit.enforced' : 'kit.advice')}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>{t('kit.elements')}</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          {t('kit.elementsSub')}
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
          {brand.elements.map((el) => (
            <div key={el.id} className="paper row" style={{ padding: 12, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <ElementThumb el={el} size={56} />
              <div style={{ minWidth: 0 }}>
                <span className="chip ref" style={{ fontSize: 12 }} dir="ltr">
                  @{el.tag}
                </span>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {L(el, 'type')}. {L(el, 'name')}
                </div>
                <div className="small">{L(el, 'description')}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('kit.dialects')}</h2>
        <div className="grid cols-4">
          {brand.dialects.map((d) => (
            <div key={d.id} className="panel">
              <b>{L(d, 'name')}</b>
              <div className="small muted">{L(d, 'market')}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
