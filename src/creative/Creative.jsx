import { useId } from 'react'
import { isAr, t } from '../i18n/index.js'
import { C, Crescent, Motif, StarPattern } from './motifs.jsx'

// Renders one creative at a channel's exact delivery size.
// The same concept re-lays itself out for portrait, square and landscape,
// keeps story formats inside the platform safe zones, and flips its text
// column for Arabic. This is what "one button formats for every channel" runs.

export const PALETTES = {
  night: { bg: C.night, fg: C.milk, accent: C.saffron, sub: C.rose, ctaText: C.night, pattern: C.saffron },
  date: { bg: C.date, fg: C.milk, accent: C.saffron, sub: C.rose, ctaText: C.date, pattern: C.rose },
  milk: { bg: C.milk, fg: C.night, accent: C.date, sub: C.dateLight, ctaText: C.milk, pattern: C.date },
}

const isArabic = (dialect) => dialect !== 'english'

const FONTS = {
  display: "'Young Serif', Georgia, serif",
  displayAr: "'Reem Kufi', 'IBM Plex Sans Arabic', sans-serif",
  body: "'Schibsted Grotesk', system-ui, sans-serif",
  bodyAr: "'IBM Plex Sans Arabic', system-ui, sans-serif",
}

export function wrap(text, maxChars) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (next.length > maxChars && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

function fit(text, width, base, maxLines, charW) {
  let size = base
  let lines = wrap(text, Math.max(4, Math.floor(width / (size * charW))))
  let guard = 0
  while (lines.length > maxLines && guard < 12) {
    size *= 0.9
    lines = wrap(text, Math.max(4, Math.floor(width / (size * charW))))
    guard++
  }
  return { size, lines }
}

function TextLines({ x, y, lines, size, family, fill, lh = 1.12, dir, weight }) {
  return (
    <text x={x} y={y} fontFamily={family} fontSize={size} fill={fill} textAnchor="middle" direction={dir} fontWeight={weight} wordSpacing={dir === 'rtl' ? size * 0.16 : undefined}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * lh}>
          {l}
        </tspan>
      ))}
    </text>
  )
}

function Logo({ x, y, size, colour, dialect }) {
  const ar = isArabic(dialect)
  return (
    <g>
      <Crescent cx={x - size * 1.6} cy={y - size * 0.32} r={size * 0.42} fill={colour} />
      <text x={x - size * 1.05} y={y} fontFamily={ar ? FONTS.displayAr : FONTS.display} fontSize={size} fill={colour} textAnchor="start" fontWeight={ar ? 700 : 400}>
        {ar ? 'قمري' : 'Qamari'}
      </text>
    </g>
  )
}

function Cta({ x, y, text, size, pal, dialect }) {
  const ar = isArabic(dialect)
  const w = Math.max(text.length * size * (ar ? 0.5 : 0.56) + size * 2.2, size * 6)
  const h = size * 2.3
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={pal.accent} />
      <text x={x} y={y + size * 0.36} fontFamily={ar ? FONTS.bodyAr : FONTS.body} fontWeight="600" fontSize={size} fill={pal.ctaText} textAnchor="middle" direction={ar ? 'rtl' : 'ltr'}>
        {text}
      </text>
    </g>
  )
}

export function Creative({ w = 1080, h = 1080, concept, dialect = 'english', showSafe = false, className, title }) {
  const uid = useId().replace(/[:]/g, '')
  const pal = PALETTES[concept.palette] || PALETTES.night
  const copy = concept.copy?.[dialect] || concept.copy?.english || {}
  const ar = isArabic(dialect)
  const dir = ar ? 'rtl' : 'ltr'
  const ratio = w / h
  const portrait = ratio < 0.8
  const tall = ratio < 0.6
  const landscape = ratio > 1.3
  const m = Math.min(w, h)
  const pad = m * 0.08
  // Story formats keep everything out of the platform UI bands.
  const safeTop = tall ? h * 0.13 : pad
  const safeBottom = tall ? h * 0.2 : pad
  const layout = concept.layout || 'hero'
  const greeting = layout === 'greeting'
  const quote = layout === 'character'
  const headline = quote && !ar ? `“${copy.headline}”` : copy.headline
  const headFamily = ar ? FONTS.displayAr : FONTS.display
  const bodyFamily = ar ? FONTS.bodyAr : FONTS.body
  const headW = ar ? 0.5 : 0.52
  const bodyW = ar ? 0.48 : 0.5

  let els
  if (landscape) {
    const textOnRight = ar
    const colW = w * 0.48
    const textCx = textOnRight ? w - pad - colW / 2 : pad + colW / 2
    const motifCx = textOnRight ? pad + (w - colW - pad * 2) / 2 : w - pad - (w - colW - pad * 2) / 2
    const head = fit(headline, colW, h * (greeting ? 0.15 : 0.12), 3, headW)
    const sub = fit(copy.sub, colW * 0.95, h * 0.045, 2, bodyW)
    const headH = head.lines.length * head.size * 1.12
    const blockH = h * 0.08 + headH + sub.lines.length * sub.size * 1.3 + h * 0.18
    let y = (h - blockH) / 2 + h * 0.06
    els = (
      <>
        {layout === 'split' && <rect x={textOnRight ? 0 : w * 0.54} y="0" width={w * 0.46} height={h} fill={C.rose} />}
        {!greeting && <circle cx={motifCx} cy={h * 0.52} r={Math.min(w - colW - pad * 2, h - pad * 2) * 0.46} fill={pal.accent} opacity="0.1" />}
        <Motif name={concept.motif} cx={motifCx} cy={h * 0.52} s={Math.min(w - colW - pad * 2, h - pad * 2) * 1.05} accent={pal.accent} />
        <Logo x={textCx + h * 0.06} y={y} size={h * 0.05} colour={pal.accent} dialect={dialect} />
        <TextLines x={textCx} y={(y += h * 0.08 + head.size * 0.9)} lines={head.lines} size={head.size} family={headFamily} fill={pal.fg} dir={dir} weight={ar ? 700 : 400} />
        <TextLines x={textCx} y={(y += headH + sub.size * 0.4)} lines={sub.lines} size={sub.size} family={bodyFamily} fill={pal.sub} dir={dir} lh={1.3} />
        {copy.cta && <Cta x={textCx} y={(y += sub.lines.length * sub.size * 1.3 + h * 0.06)} text={copy.cta} size={h * 0.032} pal={pal} dialect={dialect} />}
      </>
    )
  } else {
    const usable = h - safeTop - safeBottom
    const textW = w - pad * 2
    const head = fit(headline, textW, m * (greeting ? 0.12 : portrait ? 0.095 : 0.085), greeting ? 2 : 3, headW)
    const sub = fit(copy.sub, textW * 0.9, m * 0.036, 2, bodyW)
    const headH = head.lines.length * head.size * 1.12
    const logoY = safeTop + m * 0.05
    const headY = logoY + m * 0.06 + head.size
    const ctaY = h - safeBottom - m * 0.05
    const subY = ctaY - m * 0.07 - (sub.lines.length - 1) * sub.size * 1.3 - sub.size * 0.4
    const motifTop = headY + headH - head.size * 0.4
    const motifBottom = subY - sub.size * 1.4
    const motifS = Math.min(motifBottom - motifTop, w * 0.9) * (greeting ? 0.95 : 1.05)
    const motifCy = (motifTop + motifBottom) / 2 + (portrait ? 0 : m * 0.01)
    els = (
      <>
        {layout === 'split' && <rect x="0" y={motifTop - m * 0.02} width={w} height={motifBottom - motifTop + m * 0.04} fill={C.rose} />}
        <Logo x={w / 2 + m * 0.04} y={logoY} size={m * 0.042} colour={pal.accent} dialect={dialect} />
        <TextLines x={w / 2} y={headY} lines={head.lines} size={head.size} family={headFamily} fill={pal.fg} dir={dir} weight={ar ? 700 : 400} />
        {!greeting && layout !== 'split' && <circle cx={w / 2} cy={motifCy} r={Math.max(motifS, m * 0.2) * 0.44} fill={pal.accent} opacity="0.1" />}
        {usable > 0 && <Motif name={concept.motif} cx={w / 2} cy={motifCy} s={Math.max(motifS, m * 0.2)} accent={pal.accent} />}
        <TextLines x={w / 2} y={subY} lines={sub.lines} size={sub.size} family={bodyFamily} fill={pal.sub} dir={dir} lh={1.3} />
        {copy.cta && <Cta x={w / 2} y={ctaY} text={copy.cta} size={m * 0.03} pal={pal} dialect={dialect} />}
      </>
    )
  }

  const badgeR = m * 0.11
  const badgeX = landscape ? (ar ? w * 0.36 : w * 0.64) : w - pad - badgeR * 0.9
  const badgeY = landscape ? h * 0.24 : (portrait ? h * 0.4 : h * 0.38)

  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={title || copy.headline} preserveAspectRatio="xMidYMid meet">
      <defs>
        <StarPattern id={`p${uid}`} colour={pal.pattern} size={m * 0.12} opacity={concept.palette === 'milk' ? 0.07 : 0.1} />
      </defs>
      <rect width={w} height={h} fill={pal.bg} />
      <rect width={w} height={h} fill={`url(#p${uid})`} />
      {greeting && (
        <rect x={pad * 0.5} y={tall ? safeTop - m * 0.04 : pad * 0.5} width={w - pad} height={tall ? h - safeTop - safeBottom + m * 0.08 : h - pad} rx={m * 0.03} fill="none" stroke={pal.accent} strokeWidth={m * 0.006} opacity="0.7" />
      )}
      {els}
      {copy.badge && (
        <g>
          <circle cx={badgeX} cy={badgeY} r={badgeR} fill={pal.accent} />
          <circle cx={badgeX} cy={badgeY} r={badgeR * 0.86} fill="none" stroke={pal.ctaText} strokeWidth={m * 0.004} strokeDasharray={`${m * 0.01} ${m * 0.008}`} />
          <text x={badgeX} y={badgeY + badgeR * 0.2} textAnchor="middle" fontFamily={headFamily} fontSize={badgeR * 0.62} fill={pal.ctaText} fontWeight="700" direction={dir}>
            {copy.badge}
          </text>
        </g>
      )}
      {showSafe && tall && (
        <g pointerEvents="none">
          <rect x="0" y="0" width={w} height={h * 0.13} fill="#E5484D" opacity="0.28" />
          <rect x="0" y={h - h * 0.2} width={w} height={h * 0.2} fill="#E5484D" opacity="0.28" />
          {[h * 0.075, h - h * 0.1].map((y) => (
            <text key={y} x={w / 2} y={y} textAnchor="middle" fontFamily={isAr() ? FONTS.bodyAr : FONTS.body} direction={isAr() ? 'rtl' : 'ltr'} fontSize={m * 0.035} fill="#fff">
              {t('format.safeZone')}
            </text>
          ))}
        </g>
      )}
    </svg>
  )
}

export function BrandLogo({ size = 28, colour = C.saffron, text = true, textColour }) {
  return (
    <svg width={text ? size * 4.4 : size} height={size} viewBox={text ? '0 0 176 40' : '0 0 40 40'} aria-label="Qamari">
      <path d={`${crescentPathSmall()}`} fill={colour} />
      {text && (
        <text x="44" y="29" fontFamily={FONTS.display} fontSize="26" fill={textColour || colour}>
          Qamari
        </text>
      )}
    </svg>
  )
}

function crescentPathSmall() {
  // Pre-computed crescent at (20,20) r=15.
  const r1 = 15
  const r2 = 12
  const d = 6.3
  const x = (d * d + r1 * r1 - r2 * r2) / (2 * d)
  const y = Math.sqrt(r1 * r1 - x * x)
  const a = (-25 * Math.PI) / 180
  const rot = (px, py) => [20 + px * Math.cos(a) - py * Math.sin(a), 20 + px * Math.sin(a) + py * Math.cos(a)]
  const [p1x, p1y] = rot(x, -y)
  const [p2x, p2y] = rot(x, y)
  return `M${p1x} ${p1y} A${r1} ${r1} 0 1 0 ${p2x} ${p2y} A${r2} ${r2} 0 ${x > d ? 1 : 0} 1 ${p1x} ${p1y} Z`
}
