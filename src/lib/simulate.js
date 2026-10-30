// The simulated brain of the prototype. Every function here is a stand-in
// for a live call described in src/lib/engines.js. Briefs can be written in
// English or Arabic, and both are understood.

import { brand } from '../config/brand.js'
import { channels } from '../config/channels.js'
import { HASHTAGS, SAFE_SWAPS, THEMES } from './copy.js'

export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ARABIC = /[؀-ۿ]/
const westernDigits = (s) => String(s).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٪/g, '%')

// Requests the studio cannot make on its own. Each key has a reason in the
// interface strings (agency.reason.<key>).
const AGENCY_TRIGGERS = [
  { key: 'tv', re: /\b(tv|tvc|television|commercial)\b|تلفزيون|تليفزيون|تي ?في/ },
  { key: 'longform', re: /\b(30|45|60|90)\s?-?(s|sec|secs|second|seconds)\b|\blong[- ]form\b|\bdocumentary\b|\bshort film\b|(30|45|60|90)\s?ثانية|فيلم|وثائقي/ },
  { key: 'music', re: /\bjingle\b|\bsong\b|\bmusic track\b|\bsound logo\b|جينجل|أغنية|اغنية|مزيكا|موسيقى/ },
  { key: 'character', re: /\bnew (character|mascot|face)\b|شخصية جديدة|ماسكوت جديد/ },
  { key: 'identity', re: /\bnew logo\b|\brebrand\b|\blogo change\b|\bchange the logo\b|لوجو جديد|لوغو جديد|تغيير اللوجو|ريبراند|هوية جديدة/ },
  { key: 'print', re: /\bbillboard\b|\bouth?door\b|\booh\b|\bbus shelter\b|\bprint\b|\bpackaging\b|\bcatalogue\b|\bbrochure\b|\bflyer\b|بيلبورد|لافتة|يافطة|مطبوعات|طباعة|تغليف|بروشور|فلاير|كتالوج/ },
  { key: 'channel', re: /\blinkedin\b|\bpinterest\b|\bthreads\b|\bgoogle ads?\b|لينكد ?إن|لينكدان|بنترست|ثريدز/ },
  { key: 'event', re: /\binfluencer\b|\bevent\b|\bactivation\b|\bpop[- ]up\b|مؤثر|إنفلونسر|انفلونسر|إيفنت|ايفنت|فعالية/ },
]

const BLOCKED = [...brand.voice.weAvoid, 'sugar-free', 'sugar free', 'guilt free', ...brand.voice.weAvoidAr, 'صحية', 'خالي من السكر', 'من غير سكر']

// \b only understands Latin letters, so Arabic words get their own edges.
const wordRe = (w, flags = '') =>
  ARABIC.test(w) ? new RegExp(`(^|[\\s،.!؟:؛,])${w}(?=$|[\\s،.!؟:؛,])`, flags) : new RegExp(`\\b${w.replace('-', '[- ]')}\\b`, flags)

export function findBlocked(text) {
  const lower = String(text || '').toLowerCase()
  return BLOCKED.filter((w) => wordRe(w).test(lower))
}

export function analysePrompt(text, refIds = []) {
  const lower = westernDigits(text.toLowerCase())
  const refs = brand.elements.filter((e) => refIds.includes(e.id) || lower.includes(`@${e.tag.toLowerCase()}`))
  let theme = 'general'
  if (/%|\boffer\b|\bdiscount\b|\bsale\b|\bdeal\b|\bpromo|خصم|عرض|تخفيض/.test(lower)) theme = 'offer'
  else if (/\beid\b|عيد/.test(lower)) theme = 'eid'
  else if (/\bnew\b|\blaunch|\bsyrup\b|\bintroduc|جديد|إطلاق|اطلاق|دبس/.test(lower)) theme = 'launch'
  else if (/\bgift|\bhamper|\bpresent\b|هدية|هدايا/.test(lower)) theme = 'gift'
  else if (/ramadan|iftar|suhoor|sohour|taraweeh|lantern|رمضان|فطار|إفطار|افطار|سحور|تراويح|فانوس/.test(lower)) theme = 'ramadan'

  let product = refs.find((r) => r.type === 'Product')?.motif
  if (!product) {
    if (/maamoul|معمول|\btin\b/.test(lower)) product = 'tin'
    else if (/syrup|دبس/.test(lower)) product = 'bottle'
    else if (/medjool|\bdates?\b|\bbox\b|تمر|مجدول|علبة/.test(lower)) product = 'box'
  }
  let character = refs.find((r) => r.type === 'Character')?.motif
  if (!character) {
    if (/teta|grandmother|grandma|تيتا|الجدة|جدتنا/.test(lower)) character = 'teta'
    else if (/yassin|grandson|ياسين/.test(lower)) character = 'yassin'
  }
  const style = refs.find((r) => r.type === 'Style')?.motif
  const table = refs.some((r) => r.motif === 'table') || /long table|iftar table|السفرة الطويلة|سفرة طويلة|سفرة الفطار/.test(lower)

  const agency = AGENCY_TRIGGERS.filter((t) => t.re.test(lower)).map((t) => t.key)
  const blocked = findBlocked(lower)
  const eating = /\b(eat|eating|drink|drinking|snack|lunch)\b|ياكل|بياكل|بياكلوا|أكل|اكل|يشرب|بيشرب|شرب/.test(lower)
  const day = /\b(day|daytime|noon|afternoon|lunch|morning)\b|نهار|الضهر|الظهر|الصبح/.test(lower)
  const daytime = theme === 'ramadan' && eating && day
  const percent = (lower.match(/(\d{1,2})\s?%/) || [])[1]
  const arabic = ARABIC.test(text.replace(/@\w+/g, ''))

  return { text, theme, product, character, style, table, refs: refs.map((r) => r.id), agency, blocked, daytime, percent, arabic }
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

// The draft echoes the brief's own wording, so a blocked word in the brief
// reaches the copy and the brand check has to catch it.
function echoBlocked(copy, blocked) {
  const en = blocked.find((w) => !ARABIC.test(w))
  const ar = blocked.find((w) => ARABIC.test(w))
  const out = { ...copy }
  if (en) out.english = { ...copy.english, sub: `${copy.english.sub} A ${en} treat for everyone.` }
  if (ar) for (const d of ['egyptian', 'gulf', 'msa']) out[d] = { ...copy[d], sub: `${copy[d].sub}، وكمان ${ar}` }
  return out
}

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
    if (analysis.blocked.length) copy = echoBlocked(copy, analysis.blocked)
    const head = copy.english.headline.toLowerCase()
    let layout = 'hero'
    let motif = analysis.product || (analysis.theme === 'launch' ? 'bottle' : analysis.theme === 'eid' ? 'tin' : 'box')
    let titleKey = 'hero'
    if (/kareem|mubarak|^eid$/.test(head) || (head.length < 16 && /ramadan|eid/.test(head))) {
      layout = 'greeting'
      motif = 'greeting'
      titleKey = 'greeting'
    } else if (/teta/.test(head) || (analysis.character && i === 1)) {
      layout = 'character'
      motif = analysis.character || 'teta'
      titleKey = 'family'
    } else if (analysis.table && i === 2) {
      motif = 'table'
      titleKey = 'table'
    } else if (copy.english.badge) {
      titleKey = 'offer'
    } else if (i === 3) {
      layout = 'split'
      titleKey = 'split'
    } else if (i === 2) {
      titleKey = 'seasonal'
      if (!analysis.product) motif = analysis.theme === 'ramadan' ? 'lantern' : motif
    }
    if (template) layout = template.layout === 'greeting' && motif !== 'greeting' ? 'greeting' : template.layout
    if (layout === 'greeting') motif = 'greeting'
    if (layout === 'character' && !['teta', 'yassin'].includes(motif)) motif = analysis.character || 'teta'
    const palette = template?.palette || forcedPalette || PALETTE_ROTATION[i]
    return { id: uid('cn'), titleKey, layout, palette, motif, copy, theme: analysis.theme }
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
  if (channel.captionLimit && text.length > channel.captionLimit) text = copy.headline
  if (channel.captionLimit === 0) text = ''
  return text
}

export function defaultDialect(channel, arabicFirst = false) {
  // Egypt-first accounts default to Egyptian, Gulf placements to Gulf.
  if (['tiktok', 'fb-feed', 'wa-status'].includes(channel.id)) return 'egyptian'
  if (['snap'].includes(channel.id)) return 'gulf'
  if (['x-post', 'yt-thumb'].includes(channel.id)) return 'msa'
  // A brief written in Arabic puts Instagram in Egyptian too.
  return arabicFirst ? 'egyptian' : 'english'
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

export function buildFormats(concept, enabledIds, { arabicFirst = false } = {}) {
  return channels.map((ch) => {
    const dialect = defaultDialect(ch, arabicFirst)
    return {
      channelId: ch.id,
      enabled: enabledIds ? enabledIds.includes(ch.id) : true,
      dialect,
      caption: captionFor(concept, ch, dialect),
      scheduledAt: suggestTime(ch, concept.theme),
    }
  })
}

const COPY_KEYS = ['english', 'egyptian', 'gulf', 'msa']

// Runs every brand rule against a post. Enforced rules block approval.
// Notes come back as interface keys so they read in either language.
export function brandCheck(post, rules) {
  const results = []
  const rule = (id) => rules.find((r) => r.id === id)
  const push = (id, status, noteKey, vars, fix) => {
    const r = rule(id)
    if (!r) return
    const s = !r.enforced && status === 'fail' ? 'warn' : status
    results.push({ ruleId: id, rule: r, status: s, noteKey, vars, fix })
  }
  const live = post.formats.filter((f) => f.enabled)
  const pal = post.concept.palette
  push('r-logo-space', 'pass', 'check.logoSpace')
  push('r-logo-colour', 'pass', 'check.logoColour', { colourKey: pal === 'milk' ? 'colour.dateOnMilk' : 'colour.saffron' })
  push('r-palette', 'pass', 'check.palette', { colourKey: `colour.${pal}` })
  push('r-type', 'pass', 'check.type')

  const words = new Set()
  for (const f of live) for (const w of findBlocked(f.caption)) words.add(w)
  for (const k of COPY_KEYS) {
    const c = post.concept.copy[k]
    if (c) for (const w of findBlocked(`${c.headline} ${c.sub}`)) words.add(w)
  }
  if (words.size) push('r-claims', 'fail', 'check.claimsFail', { words: [...words] }, { kind: 'swap-words', words: [...words] })
  else push('r-claims', 'pass', 'check.claimsPass')

  if (post.analysis?.daytime && !post.resolved?.daytime) push('r-ramadan', 'fail', 'check.ramadanFail', null, { kind: 'move-to-iftar' })
  else push('r-ramadan', 'pass', post.concept.theme === 'ramadan' ? 'check.ramadanPass' : 'check.notRamadan')

  const arabic = live.filter((f) => f.dialect !== 'english').length
  push('r-dialect', 'pass', 'check.dialect', { a: arabic, n: live.length })

  if (post.concept.theme === 'offer') {
    if (post.offerCode) push('r-price', 'pass', 'check.pricePass', { code: post.offerCode })
    else push('r-price', 'fail', 'check.priceFail', null, { kind: 'offer-code' })
  } else push('r-price', 'pass', 'check.priceNone')
  return results
}

export function applyWordSwaps(post, words) {
  const swap = (text) => {
    let out = text
    for (const w of words) {
      const rep = SAFE_SWAPS[w] || (ARABIC.test(w) ? 'معمول بحب' : 'made with care')
      out = ARABIC.test(w) ? out.replace(wordRe(w, 'g'), (m, lead) => `${lead}${rep}`) : out.replace(wordRe(w, 'gi'), rep)
    }
    return out
  }
  const copy = {}
  for (const [k, v] of Object.entries(post.concept.copy)) copy[k] = { ...v, headline: swap(v.headline), sub: swap(v.sub) }
  return {
    ...post,
    concept: { ...post.concept, copy },
    formats: post.formats.map((f) => ({ ...f, caption: swap(f.caption) })),
  }
}
