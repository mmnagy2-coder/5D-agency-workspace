// The simulated brain of the prototype. Every function here is a stand-in
// for a live call described in src/lib/engines.js.

import { brand } from '../config/brand.js'
import { channels } from '../config/channels.js'
import { HASHTAGS, SAFE_SWAPS, THEMES } from './copy.js'

export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const AGENCY_TRIGGERS = [
  { re: /\b(tv|tvc|television|commercial)\b/, reason: 'A TV commercial needs a shoot and broadcast delivery specs, so 5D produces it.' },
  { re: /\b(30|45|60|90)\s?-?(s|sec|secs|second|seconds)\b|\blong[- ]form\b|\bdocumentary\b|\bshort film\b/, reason: 'Long-form video is produced by 5D and then added to your library.' },
  { re: /\bjingle\b|\bsong\b|\bmusic track\b|\bsound logo\b/, reason: 'Original music needs composing and licensing through 5D.' },
  { re: /\bnew (character|mascot|face)\b/, reason: 'A new brand character has to be designed and approved before anyone can use it.' },
  { re: /\bnew logo\b|\brebrand\b|\blogo change\b|\bchange the logo\b/, reason: 'Changes to the logo and identity go through 5D.' },
  { re: /\bbillboard\b|\bouth?door\b|\booh\b|\bbus shelter\b|\bprint\b|\bpackaging\b|\bcatalogue\b|\bbrochure\b|\bflyer\b/, reason: 'Print, packaging and outdoor need a new template from 5D first.' },
  { re: /\blinkedin\b|\bpinterest\b|\bthreads\b|\bgoogle ads?\b/, reason: 'There is no template for that channel yet. 5D can add one to your workspace.' },
  { re: /\binfluencer\b|\bevent\b|\bactivation\b|\bpop[- ]up\b/, reason: 'Influencer and event work is planned with 5D.' },
]

const BLOCKED = brand.voice.weAvoid.concat(['sugar-free', 'sugar free', 'guilt free'])

export function findBlocked(text) {
  const lower = String(text || '').toLowerCase()
  return BLOCKED.filter((w) => new RegExp(`\\b${w.replace('-', '[- ]')}\\b`).test(lower))
}

export function analysePrompt(text, refIds = []) {
  const lower = text.toLowerCase()
  const refs = brand.elements.filter((e) => refIds.includes(e.id) || lower.includes(`@${e.tag.toLowerCase()}`))
  let theme = 'general'
  if (/%|\boffer\b|\bdiscount\b|\bsale\b|\bdeal\b|\bpromo|خصم|عرض/.test(lower)) theme = 'offer'
  else if (/\beid\b|عيد/.test(lower)) theme = 'eid'
  else if (/\bnew\b|\blaunch|\bsyrup\b|\bintroduc/.test(lower)) theme = 'launch'
  else if (/\bgift|\bhamper|\bpresent\b|هدية/.test(lower)) theme = 'gift'
  else if (/ramadan|iftar|suhoor|sohour|taraweeh|lantern|رمضان|فطار|سحور/.test(lower)) theme = 'ramadan'

  let product = refs.find((r) => r.type === 'Product')?.motif
  if (!product) {
    if (/maamoul|معمول|\btin\b/.test(lower)) product = 'tin'
    else if (/syrup|دبس/.test(lower)) product = 'bottle'
    else if (/medjool|\bdates?\b|\bbox\b|تمر/.test(lower)) product = 'box'
  }
  let character = refs.find((r) => r.type === 'Character')?.motif
  if (!character) {
    if (/teta|grandmother|grandma|تيتا|الجدة/.test(lower)) character = 'teta'
    else if (/yassin|grandson/.test(lower)) character = 'yassin'
  }
  const style = refs.find((r) => r.type === 'Style')?.motif
  const table = refs.some((r) => r.motif === 'table') || /long table|iftar table/.test(lower)

  const agency = AGENCY_TRIGGERS.filter((t) => t.re.test(lower)).map((t) => t.reason)
  const blocked = findBlocked(lower)
  const daytime = theme === 'ramadan' && /\b(eat|eating|drink|drinking|snack|lunch)\b/.test(lower) && /\b(day|daytime|noon|afternoon|lunch|morning)\b/.test(lower)
  const percent = (lower.match(/(\d{1,2})\s?%/) || [])[1]

  return { text, theme, product, character, style, table, refs: refs.map((r) => r.id), agency, blocked, daytime, percent }
}

const toArabicDigits = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d])

function applyPercent(copy, pct) {
  if (!pct) return copy
  const out = {}
  for (const [k, v] of Object.entries(copy)) {
    const ar = k !== 'english'
    const p = ar ? toArabicDigits(pct) : pct
    out[k] = {
      ...v,
      sub: v.sub.replace(/\d+%/, `${pct}%`).replace(/[٠-٩]+٪/, `${p}٪`),
      badge: v.badge ? (ar ? `${p}٪-` : `-${pct}%`) : v.badge,
    }
  }
  return out
}

const PALETTE_BY_STYLE = { 'style-suhoor': 'night', 'style-market': 'date', 'style-studio': 'milk' }
const PALETTE_ROTATION = ['night', 'date', 'milk', 'night']
const CONCEPT_TITLES = ['Hero product', 'Seasonal moment', 'Family story', 'Bold offer', 'Quiet studio', 'Greeting card']

export function generateConcepts(analysis, { template, round = 0 } = {}) {
  const pool = [...(THEMES[analysis.theme] || THEMES.general)]
  // Lines that name the product in the brief come first.
  const word = { box: 'medjool', tin: 'maamoul', bottle: 'syrup' }[analysis.product]
  if (word) pool.sort((a, b) => Number(`${b.english.headline} ${b.english.sub}`.toLowerCase().includes(word)) - Number(`${a.english.headline} ${a.english.sub}`.toLowerCase().includes(word)))
  while (pool.length < 4) pool.push(...THEMES.general)
  const start = (round * 2) % pool.length
  const picks = Array.from({ length: 4 }, (_, i) => pool[(start + i) % pool.length])
  const forcedPalette = PALETTE_BY_STYLE[analysis.style]

  return picks.map((copy0, i) => {
    let copy = analysis.theme === 'offer' ? applyPercent(copy0, analysis.percent) : copy0
    // The draft echoes the brief's own wording, so a blocked word in the
    // brief reaches the English copy and the brand check has to catch it.
    if (analysis.blocked.length) {
      copy = { ...copy, english: { ...copy.english, sub: `${copy.english.sub} A ${analysis.blocked[0]} treat for everyone.` } }
    }
    const head = copy.english.headline.toLowerCase()
    let layout = 'hero'
    let motif = analysis.product || (analysis.theme === 'launch' ? 'bottle' : analysis.theme === 'eid' ? 'tin' : 'box')
    let title = CONCEPT_TITLES[0]
    if (/kareem|mubarak|^eid$/.test(head) || (head.length < 16 && /ramadan|eid/.test(head))) {
      layout = 'greeting'
      motif = 'greeting'
      title = 'Greeting card'
    } else if (/teta/.test(head) || (analysis.character && i === 1)) {
      layout = 'character'
      motif = analysis.character || 'teta'
      title = 'Family story'
    } else if (analysis.table && i === 2) {
      motif = 'table'
      title = 'The long table'
    } else if (copy.english.badge) {
      title = 'Bold offer'
    } else if (i === 3) {
      layout = 'split'
      title = 'Split layout'
    } else if (i === 2) {
      title = 'Seasonal moment'
      if (!analysis.product) motif = analysis.theme === 'ramadan' ? 'lantern' : motif
    }
    if (template) layout = template.layout === 'greeting' && motif !== 'greeting' ? 'greeting' : template.layout
    if (layout === 'greeting') motif = 'greeting'
    if (layout === 'character' && !['teta', 'yassin'].includes(motif)) motif = analysis.character || 'teta'
    const palette = template?.palette || forcedPalette || PALETTE_ROTATION[i]
    return { id: uid('cn'), title, layout, palette, motif, copy, theme: analysis.theme }
  })
}

export function captionFor(concept, channel, dialect) {
  const copy = concept.copy[dialect] || concept.copy.english
  const tags = HASHTAGS[concept.theme] || HASHTAGS.general
  const ar = dialect !== 'english'
  const parts = [copy.headline, copy.sub]
  if (channel.id !== 'yt-thumb') parts.push(copy.cta)
  let text = ar ? parts.join('\n') : parts.map((p) => (/[.!?]$/.test(p) ? p : `${p}.`)).join(' ')
  if (channel.hashtags) text += `\n\n${(ar ? tags.ar : tags.en).join(' ')}`
  if (channel.captionLimit && text.length > channel.captionLimit) {
    text = ar ? copy.headline : copy.headline
  }
  if (channel.captionLimit === 0) text = ''
  return text
}

export function defaultDialect(channel) {
  // Egypt-first accounts default to Egyptian, Gulf placements to Gulf.
  if (['tiktok', 'fb-feed', 'wa-status'].includes(channel.id)) return 'egyptian'
  if (['snap'].includes(channel.id)) return 'gulf'
  if (['x-post', 'yt-thumb'].includes(channel.id)) return 'msa'
  return 'english'
}

const pad2 = (n) => String(n).padStart(2, '0')
export const toLocalInput = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`

export function suggestTime(channel, theme, base = new Date()) {
  const offset = { 'ig-feed': 1, 'ig-story': 1, tiktok: 1, snap: 2, 'fb-feed': 2, 'x-post': 2, 'yt-thumb': 3, 'wa-status': 1 }[channel.id] || 1
  const d = new Date(base)
  d.setDate(d.getDate() + offset)
  const time = channel.id === 'wa-status' && theme !== 'ramadan' ? '09:00' : channel.bestTime
  const [hh, mm] = time.split(':').map(Number)
  d.setHours(hh, mm, 0, 0)
  return toLocalInput(d)
}

export function buildFormats(concept, enabledIds) {
  return channels.map((ch) => {
    const dialect = defaultDialect(ch)
    return {
      channelId: ch.id,
      enabled: enabledIds ? enabledIds.includes(ch.id) : true,
      dialect,
      caption: captionFor(concept, ch, dialect),
      scheduledAt: suggestTime(ch, concept.theme),
    }
  })
}

// Runs every brand rule against a post. Enforced rules block approval.
export function brandCheck(post, rules) {
  const results = []
  const rule = (id) => rules.find((r) => r.id === id)
  const push = (id, status, note, fix) => {
    const r = rule(id)
    if (!r) return
    const s = !r.enforced && status === 'fail' ? 'warn' : status
    results.push({ ruleId: id, category: r.category, text: r.text, status: s, note, fix })
  }
  const live = post.formats.filter((f) => f.enabled)
  push('r-logo-space', 'pass', 'Clear space is locked in every template.')
  push('r-logo-colour', 'pass', `Logo renders in ${post.concept.palette === 'milk' ? 'date brown on milk cream' : 'saffron gold'}.`)
  push('r-palette', 'pass', `Background is ${({ night: 'night indigo', date: 'date brown', milk: 'milk cream' })[post.concept.palette]}.`)
  push('r-type', 'pass', 'Headlines set in Young Serif and Reem Kufi.')

  const hits = []
  for (const f of live) {
    for (const w of findBlocked(f.caption)) hits.push({ channelId: f.channelId, word: w })
  }
  for (const w of findBlocked(post.concept.copy.english.headline + ' ' + post.concept.copy.english.sub)) hits.push({ channelId: 'artwork', word: w })
  if (hits.length) {
    const words = [...new Set(hits.map((h) => h.word))]
    push('r-claims', 'fail', `Blocked ${words.length > 1 ? 'words' : 'word'} found: ${words.join(', ')}.`, { kind: 'swap-words', words })
  } else push('r-claims', 'pass', 'No health, diet or medical claims.')

  if (post.analysis?.daytime && !post.resolved?.daytime) {
    push('r-ramadan', 'fail', 'The brief asks for eating or drinking in a daytime scene during Ramadan.', { kind: 'move-to-iftar' })
  } else push('r-ramadan', 'pass', post.concept.theme === 'ramadan' ? 'Scene is set at iftar or suhoor.' : 'Not a Ramadan placement.')

  const arabic = live.filter((f) => f.dialect !== 'english').length
  push('r-dialect', 'pass', `${arabic} of ${live.length} formats in Arabic, each in its market dialect.`)

  if (post.concept.theme === 'offer') {
    if (post.offerCode) push('r-price', 'pass', `Offer code ${post.offerCode} matches the trade calendar.`)
    else push('r-price', 'fail', 'This post shows a discount without an offer code.', { kind: 'offer-code' })
  } else push('r-price', 'pass', 'No price or discount shown.')
  return results
}

export function applyWordSwaps(post, words) {
  const swap = (text) => {
    let out = text
    for (const w of words) {
      const rep = SAFE_SWAPS[w] || 'made with care'
      out = out.replace(new RegExp(`\\b${w.replace('-', '[- ]')}\\b`, 'gi'), rep)
    }
    return out
  }
  return {
    ...post,
    concept: {
      ...post.concept,
      copy: { ...post.concept.copy, english: { ...post.concept.copy.english, headline: swap(post.concept.copy.english.headline), sub: swap(post.concept.copy.english.sub) } },
    },
    formats: post.formats.map((f) => ({ ...f, caption: swap(f.caption) })),
  }
}
