// Original flat illustrations for the demo brand, drawn in SVG.
// Each motif draws itself centred on (cx, cy) inside a square of side s.
// In the live product these are replaced by generated imagery from the
// image engine. Here they stand in so every format renders on brand.

export const C = {
  night: '#1F2A4A',
  nightLight: '#2C3A63',
  saffron: '#D9A441',
  saffronDeep: '#B8842A',
  date: '#5A2E1B',
  dateLight: '#7A4429',
  milk: '#FBF4EA',
  rose: '#E9C9B1',
  pistachio: '#8BA35A',
  skin: '#B97A56',
  silver: '#D9D6D0',
}

export function crescentPath(cx, cy, r, ratio = 0.8, offset = 0.42, rotate = -25) {
  const r1 = r
  const r2 = r * ratio
  const d = r * offset
  const x = (d * d + r1 * r1 - r2 * r2) / (2 * d)
  const y = Math.sqrt(Math.max(r1 * r1 - x * x, 0))
  const large = x > d ? 1 : 0
  const a = (rotate * Math.PI) / 180
  const rot = (px, py) => [cx + px * Math.cos(a) - py * Math.sin(a), cy + px * Math.sin(a) + py * Math.cos(a)]
  const [p1x, p1y] = rot(x, -y)
  const [p2x, p2y] = rot(x, y)
  return `M${p1x} ${p1y} A${r1} ${r1} 0 1 0 ${p2x} ${p2y} A${r2} ${r2} 0 ${large} 1 ${p1x} ${p1y} Z`
}

export function Crescent({ cx, cy, r, fill = C.saffron, rotate = -25 }) {
  return <path d={crescentPath(cx, cy, r, 0.8, 0.42, rotate)} fill={fill} />
}

function DateFruit({ cx, cy, rx, ry, rot = 0 }) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.date} />
      <ellipse cx={cx - rx * 0.25} cy={cy - ry * 0.35} rx={rx * 0.35} ry={ry * 0.22} fill={C.dateLight} opacity="0.8" />
      <path d={`M${cx - rx * 0.5} ${cy + ry * 0.1} Q${cx} ${cy + ry * 0.35} ${cx + rx * 0.55} ${cy}`} stroke="#3E1E10" strokeWidth={ry * 0.06} fill="none" opacity="0.6" />
    </g>
  )
}

export function Lantern({ cx, cy, s, body = C.saffron, glow = true }) {
  const w = s * 0.36
  return (
    <g>
      {glow && <circle cx={cx} cy={cy} r={s * 0.55} fill={C.saffron} opacity="0.16" />}
      <line x1={cx} y1={cy - s * 0.95} x2={cx} y2={cy - s * 0.62} stroke={body} strokeWidth={s * 0.012} />
      <circle cx={cx} cy={cy - s * 0.6} r={s * 0.035} fill="none" stroke={body} strokeWidth={s * 0.015} />
      <polygon points={`${cx - w * 0.75},${cy - s * 0.4} ${cx + w * 0.75},${cy - s * 0.4} ${cx},${cy - s * 0.58}`} fill={body} />
      <path
        d={`M${cx - w * 0.8} ${cy - s * 0.4} L${cx + w * 0.8} ${cy - s * 0.4} L${cx + w} ${cy + s * 0.12} L${cx + w * 0.55} ${cy + s * 0.38} L${cx - w * 0.55} ${cy + s * 0.38} L${cx - w} ${cy + s * 0.12} Z`}
        fill={body}
      />
      <path
        d={`M${cx - w * 0.6} ${cy - s * 0.33} L${cx + w * 0.6} ${cy - s * 0.33} L${cx + w * 0.78} ${cy + s * 0.1} L${cx + w * 0.42} ${cy + s * 0.3} L${cx - w * 0.42} ${cy + s * 0.3} L${cx - w * 0.78} ${cy + s * 0.1} Z`}
        fill={C.milk}
        opacity="0.9"
      />
      {[-0.3, 0, 0.3].map((k) => (
        <line key={k} x1={cx + w * k} y1={cy - s * 0.33} x2={cx + w * k * 0.75} y2={cy + s * 0.3} stroke={body} strokeWidth={s * 0.012} />
      ))}
      <ellipse cx={cx} cy={cy} rx={w * 0.25} ry={s * 0.09} fill={C.saffron} opacity="0.75" />
      <rect x={cx - w * 0.5} y={cy + s * 0.38} width={w} height={s * 0.05} rx={s * 0.01} fill={body} />
    </g>
  )
}

export function ProductBox({ cx, cy, s }) {
  const bw = s * 0.7
  const bh = s * 0.42
  const x0 = cx - bw / 2
  const y0 = cy - bh / 2 + s * 0.02
  const lid = bh * 0.22
  return (
    <g>
      <ellipse cx={cx} cy={y0 + bh + s * 0.04} rx={bw * 0.6} ry={s * 0.04} fill="#000" opacity="0.18" />
      <polygon points={`${x0},${y0} ${x0 + bw},${y0} ${x0 + bw - bw * 0.07},${y0 - lid} ${x0 + bw * 0.07},${y0 - lid}`} fill="#4A5C92" stroke={C.saffron} strokeWidth={s * 0.005} strokeOpacity="0.6" />
      <rect x={x0} y={y0} width={bw} height={bh} rx={s * 0.012} fill="#34457A" stroke={C.saffron} strokeWidth={s * 0.006} strokeOpacity="0.6" />
      <rect x={cx - bw * 0.04} y={y0 - lid} width={bw * 0.08} height={bh + lid} fill={C.saffron} />
      <rect x={x0} y={y0 + bh * 0.42} width={bw} height={bh * 0.12} fill={C.saffron} />
      <ellipse cx={cx - bw * 0.09} cy={y0 - lid - s * 0.02} rx={bw * 0.1} ry={s * 0.035} fill={C.saffronDeep} transform={`rotate(-18 ${cx - bw * 0.09} ${y0 - lid - s * 0.02})`} />
      <ellipse cx={cx + bw * 0.09} cy={y0 - lid - s * 0.02} rx={bw * 0.1} ry={s * 0.035} fill={C.saffronDeep} transform={`rotate(18 ${cx + bw * 0.09} ${y0 - lid - s * 0.02})`} />
      <circle cx={cx} cy={y0 - lid - s * 0.018} r={s * 0.022} fill={C.saffron} />
      <Crescent cx={x0 + bw * 0.16} cy={y0 + bh * 0.22} r={s * 0.035} fill={C.saffron} />
      <DateFruit cx={cx - bw * 0.3} cy={y0 + bh + s * 0.035} rx={s * 0.065} ry={s * 0.038} rot={-12} />
      <DateFruit cx={cx - bw * 0.12} cy={y0 + bh + s * 0.05} rx={s * 0.065} ry={s * 0.038} rot={8} />
      <DateFruit cx={cx + bw * 0.33} cy={y0 + bh + s * 0.04} rx={s * 0.065} ry={s * 0.038} rot={-4} />
    </g>
  )
}

export function ProductTin({ cx, cy, s }) {
  const tw = s * 0.46
  const th = s * 0.3
  const ry = tw * 0.22
  const top = cy - th / 2
  const cookie = (x, y, r) => (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={r} fill={C.rose} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <line key={i} x1={x + Math.cos(a) * r * 0.25} y1={y + Math.sin(a) * r * 0.25} x2={x + Math.cos(a) * r * 0.85} y2={y + Math.sin(a) * r * 0.85} stroke={C.date} strokeWidth={r * 0.08} opacity="0.55" />
      })}
    </g>
  )
  return (
    <g>
      <ellipse cx={cx} cy={top + th + ry + s * 0.03} rx={tw * 0.65} ry={s * 0.04} fill="#000" opacity="0.18" />
      <rect x={cx - tw / 2} y={top} width={tw} height={th} fill={C.milk} />
      <ellipse cx={cx} cy={top + th} rx={tw / 2} ry={ry} fill={C.milk} />
      <rect x={cx - tw / 2} y={top + th * 0.08} width={tw} height={th * 0.1} fill={C.saffron} />
      <ellipse cx={cx} cy={top} rx={tw / 2} ry={ry} fill={C.saffron} />
      <ellipse cx={cx} cy={top} rx={tw / 2.4} ry={ry * 0.8} fill={C.saffronDeep} opacity="0.4" />
      <Crescent cx={cx} cy={top} r={ry * 0.55} fill={C.milk} />
      <Crescent cx={cx} cy={top + th * 0.62} r={th * 0.18} fill={C.saffron} rotate={-20} />
      {cookie(cx - tw * 0.72, top + th + ry * 0.6, s * 0.075)}
      {cookie(cx + tw * 0.74, top + th + ry * 0.4, s * 0.08)}
      {cookie(cx + tw * 0.56, top + th + ry * 1.25, s * 0.06)}
    </g>
  )
}

export function ProductBottle({ cx, cy, s }) {
  const bw = s * 0.26
  const bh = s * 0.5
  const top = cy - bh / 2 - s * 0.05
  return (
    <g>
      <ellipse cx={cx} cy={top + bh + s * 0.16} rx={bw * 0.9} ry={s * 0.035} fill="#000" opacity="0.2" />
      <rect x={cx - bw * 0.16} y={top} width={bw * 0.32} height={bh * 0.18} rx={bw * 0.04} fill={C.date} />
      <rect x={cx - bw * 0.2} y={top - bh * 0.06} width={bw * 0.4} height={bh * 0.08} rx={bw * 0.04} fill={C.saffron} />
      <path
        d={`M${cx - bw * 0.16} ${top + bh * 0.17} C${cx - bw * 0.16} ${top + bh * 0.3} ${cx - bw / 2} ${top + bh * 0.3} ${cx - bw / 2} ${top + bh * 0.42} L${cx - bw / 2} ${top + bh + s * 0.1} Q${cx - bw / 2} ${top + bh + s * 0.14} ${cx - bw * 0.4} ${top + bh + s * 0.14} L${cx + bw * 0.4} ${top + bh + s * 0.14} Q${cx + bw / 2} ${top + bh + s * 0.14} ${cx + bw / 2} ${top + bh + s * 0.1} L${cx + bw / 2} ${top + bh * 0.42} C${cx + bw / 2} ${top + bh * 0.3} ${cx + bw * 0.16} ${top + bh * 0.3} ${cx + bw * 0.16} ${top + bh * 0.17} Z`}
        fill="#2E140A"
        stroke={C.rose}
        strokeWidth={s * 0.006}
        strokeOpacity="0.55"
      />
      <rect x={cx - bw * 0.42} y={top + bh * 0.52} width={bw * 0.84} height={bh * 0.36} rx={bw * 0.05} fill={C.milk} />
      <Crescent cx={cx} cy={top + bh * 0.66} r={bw * 0.12} fill={C.saffron} />
      <rect x={cx - bw * 0.26} y={top + bh * 0.78} width={bw * 0.52} height={bh * 0.03} fill={C.date} opacity="0.7" />
      <path d={`M${cx - bw * 0.36} ${top + bh * 0.45} L${cx - bw * 0.36} ${top + bh + s * 0.08}`} stroke={C.milk} strokeWidth={bw * 0.05} opacity="0.25" strokeLinecap="round" />
    </g>
  )
}

export function Teta({ cx, cy, s }) {
  const hr = s * 0.13
  const hy = cy - s * 0.18
  return (
    <g>
      <path d={`M${cx - s * 0.36} ${cy + s * 0.48} Q${cx - s * 0.34} ${cy + s * 0.02} ${cx} ${cy - s * 0.02} Q${cx + s * 0.34} ${cy + s * 0.02} ${cx + s * 0.36} ${cy + s * 0.48} Z`} fill={C.date} />
      <path d={`M${cx - hr * 1.45} ${hy + hr * 0.4} Q${cx - hr * 1.5} ${hy - hr * 1.6} ${cx} ${hy - hr * 1.55} Q${cx + hr * 1.5} ${hy - hr * 1.6} ${cx + hr * 1.45} ${hy + hr * 0.4} L${cx + s * 0.3} ${cy + s * 0.3} Q${cx} ${cy + s * 0.12} ${cx - s * 0.3} ${cy + s * 0.3} Z`} fill={C.saffron} />
      <circle cx={cx} cy={hy} r={hr} fill={C.skin} />
      <path d={`M${cx - hr * 0.95} ${hy - hr * 0.25} Q${cx} ${hy - hr * 1.25} ${cx + hr * 0.95} ${hy - hr * 0.25} Q${cx} ${hy - hr * 0.75} ${cx - hr * 0.95} ${hy - hr * 0.25} Z`} fill={C.silver} />
      <path d={`M${cx - hr * 0.5} ${hy + hr * 0.02} q${hr * 0.15} ${-hr * 0.16} ${hr * 0.3} 0`} stroke="#3E1E10" strokeWidth={hr * 0.08} fill="none" strokeLinecap="round" />
      <path d={`M${cx + hr * 0.2} ${hy + hr * 0.02} q${hr * 0.15} ${-hr * 0.16} ${hr * 0.3} 0`} stroke="#3E1E10" strokeWidth={hr * 0.08} fill="none" strokeLinecap="round" />
      <path d={`M${cx - hr * 0.35} ${hy + hr * 0.35} Q${cx} ${hy + hr * 0.78} ${cx + hr * 0.35} ${hy + hr * 0.35} Z`} fill="#3E1E10" />
      <ellipse cx={cx} cy={cy + s * 0.2} rx={s * 0.24} ry={s * 0.055} fill={C.milk} />
      <ellipse cx={cx} cy={cy + s * 0.19} rx={s * 0.2} ry={s * 0.04} fill={C.rose} />
      <DateFruit cx={cx - s * 0.08} cy={cy + s * 0.18} rx={s * 0.04} ry={s * 0.024} rot={-10} />
      <DateFruit cx={cx + s * 0.02} cy={cy + s * 0.175} rx={s * 0.04} ry={s * 0.024} rot={6} />
      <DateFruit cx={cx + s * 0.1} cy={cy + s * 0.185} rx={s * 0.04} ry={s * 0.024} rot={-3} />
      <circle cx={cx - s * 0.24} cy={cy + s * 0.22} r={s * 0.04} fill={C.skin} />
      <circle cx={cx + s * 0.24} cy={cy + s * 0.22} r={s * 0.04} fill={C.skin} />
    </g>
  )
}

export function Yassin({ cx, cy, s }) {
  const hr = s * 0.12
  const hy = cy - s * 0.2
  return (
    <g>
      <path d={`M${cx - s * 0.3} ${cy + s * 0.48} Q${cx - s * 0.3} ${cy - s * 0.02} ${cx} ${cy - s * 0.04} Q${cx + s * 0.3} ${cy - s * 0.02} ${cx + s * 0.3} ${cy + s * 0.48} Z`} fill={C.pistachio} />
      <rect x={cx - hr * 0.35} y={hy + hr * 0.8} width={hr * 0.7} height={hr * 0.5} fill={C.skin} />
      <circle cx={cx} cy={hy} r={hr} fill={C.skin} />
      <path d={`M${cx - hr * 1.02} ${hy - hr * 0.05} Q${cx - hr * 1.1} ${hy - hr * 1.3} ${cx + hr * 0.2} ${hy - hr * 1.15} Q${cx + hr * 1.15} ${hy - hr * 1.05} ${cx + hr * 1.02} ${hy - hr * 0.1} Q${cx + hr * 0.4} ${hy - hr * 0.7} ${cx - hr * 1.02} ${hy - hr * 0.05} Z`} fill="#2A1A12" />
      <circle cx={cx - hr * 0.35} cy={hy + hr * 0.05} r={hr * 0.09} fill="#2A1A12" />
      <circle cx={cx + hr * 0.35} cy={hy + hr * 0.05} r={hr * 0.09} fill="#2A1A12" />
      <path d={`M${cx - hr * 0.3} ${hy + hr * 0.42} Q${cx} ${hy + hr * 0.65} ${cx + hr * 0.3} ${hy + hr * 0.42}`} stroke="#2A1A12" strokeWidth={hr * 0.08} fill="none" strokeLinecap="round" />
      <path d={`M${cx + s * 0.22} ${cy + s * 0.18} L${cx + s * 0.4} ${cy - s * 0.02}`} stroke={C.skin} strokeWidth={s * 0.055} strokeLinecap="round" />
      <ellipse cx={cx + s * 0.4} cy={cy - s * 0.05} rx={s * 0.2} ry={s * 0.035} fill={C.saffron} />
      <DateFruit cx={cx + s * 0.32} cy={cy - s * 0.09} rx={s * 0.035} ry={s * 0.022} rot={-8} />
      <DateFruit cx={cx + s * 0.41} cy={cy - s * 0.1} rx={s * 0.035} ry={s * 0.022} rot={10} />
      <DateFruit cx={cx + s * 0.5} cy={cy - s * 0.09} rx={s * 0.035} ry={s * 0.022} rot={-2} />
      <DateFruit cx={cx - s * 0.12} cy={cy + s * 0.05} rx={s * 0.03} ry={s * 0.019} rot={40} />
    </g>
  )
}

export function LongTable({ cx, cy, s }) {
  const w = s * 0.9
  const plates = [-0.3, -0.1, 0.1, 0.3]
  return (
    <g>
      <polygon points={`${cx - w * 0.5},${cy + s * 0.32} ${cx + w * 0.5},${cy + s * 0.32} ${cx + w * 0.3},${cy - s * 0.12} ${cx - w * 0.3},${cy - s * 0.12}`} fill={C.rose} />
      <polygon points={`${cx - w * 0.5},${cy + s * 0.32} ${cx + w * 0.5},${cy + s * 0.32} ${cx + w * 0.5},${cy + s * 0.37} ${cx - w * 0.5},${cy + s * 0.37}`} fill={C.dateLight} />
      <rect x={cx - w * 0.06} y={cy - s * 0.12} width={w * 0.12} height={s * 0.44} fill={C.saffron} opacity="0.55" />
      {plates.map((k, i) => (
        <g key={k}>
          <ellipse cx={cx + w * k * 1.15} cy={cy + s * 0.22} rx={s * 0.075} ry={s * 0.03} fill={C.milk} />
          <ellipse cx={cx + w * k * 0.85} cy={cy + s * 0.02} rx={s * 0.055} ry={s * 0.022} fill={C.milk} />
          {i % 2 === 0 && <DateFruit cx={cx + w * k * 1.15} cy={cy + s * 0.21} rx={s * 0.028} ry={s * 0.017} rot={8} />}
          <rect x={cx + w * k * 0.95 + s * 0.05} y={cy + s * 0.04} width={s * 0.022} height={s * 0.05} rx={s * 0.005} fill={C.milk} opacity="0.85" />
        </g>
      ))}
      <ellipse cx={cx} cy={cy + s * 0.08} rx={s * 0.11} ry={s * 0.04} fill={C.date} />
      <ellipse cx={cx} cy={cy + s * 0.07} rx={s * 0.08} ry={s * 0.025} fill={C.saffron} opacity="0.7" />
      <Lantern cx={cx - w * 0.38} cy={cy - s * 0.3} s={s * 0.22} />
      <Lantern cx={cx + w * 0.38} cy={cy - s * 0.32} s={s * 0.2} />
    </g>
  )
}

export function GreetingMotif({ cx, cy, s, accent = C.saffron }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={s * 0.34} fill={accent} opacity="0.08" />
      <Crescent cx={cx} cy={cy} r={s * 0.24} fill={accent} rotate={-30} />
      <Lantern cx={cx + s * 0.28} cy={cy + s * 0.02} s={s * 0.32} body={accent} glow={false} />
      <circle cx={cx - s * 0.32} cy={cy - s * 0.2} r={s * 0.012} fill={accent} />
      <circle cx={cx - s * 0.22} cy={cy - s * 0.34} r={s * 0.008} fill={accent} />
      <circle cx={cx + s * 0.05} cy={cy - s * 0.38} r={s * 0.01} fill={accent} />
    </g>
  )
}

export function Motif({ name, cx, cy, s, accent }) {
  switch (name) {
    case 'box':
      return <ProductBox cx={cx} cy={cy} s={s} />
    case 'tin':
      return <ProductTin cx={cx} cy={cy} s={s} />
    case 'bottle':
      return <ProductBottle cx={cx} cy={cy} s={s} />
    case 'teta':
      return <Teta cx={cx} cy={cy} s={s} />
    case 'yassin':
      return <Yassin cx={cx} cy={cy} s={s} />
    case 'table':
      return <LongTable cx={cx} cy={cy} s={s} />
    case 'lantern':
      return <Lantern cx={cx} cy={cy} s={s * 0.9} />
    case 'greeting':
    default:
      return <GreetingMotif cx={cx} cy={cy} s={s} accent={accent} />
  }
}

// Eight-point star tile used as a quiet ground pattern.
export function StarPattern({ id, colour, size = 80, opacity = 0.1 }) {
  const h = size / 2
  const q = size * 0.28
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <g fill="none" stroke={colour} strokeWidth={size * 0.02} opacity={opacity}>
        <rect x={h - q} y={h - q} width={q * 2} height={q * 2} />
        <rect x={h - q} y={h - q} width={q * 2} height={q * 2} transform={`rotate(45 ${h} ${h})`} />
      </g>
    </pattern>
  )
}
