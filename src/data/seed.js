import { analysePrompt, buildFormats, generateConcepts, toLocalInput, uid } from '../lib/simulate.js'

const day = 24 * 60 * 60 * 1000
const at = (offsetDays, hh = 10, mm = 0) => {
  const d = new Date(Date.now() + offsetDays * day)
  d.setHours(hh, mm, 0, 0)
  return d
}

export const seedTemplates = [
  { id: 'tpl-hero', name: 'Product hero', layout: 'hero', palette: 'night', motif: 'box', source: 'Brand', description: 'One product, one line, one call to action. The workhorse for feed and stories.', sampleTheme: 'general' },
  { id: 'tpl-greeting', name: 'Seasonal greeting', layout: 'greeting', palette: 'night', motif: 'greeting', source: 'Brand', description: 'Framed greeting for Ramadan, Eid and national days. No product, no price.', sampleTheme: 'ramadan' },
  { id: 'tpl-story', name: 'Family story', layout: 'character', palette: 'date', motif: 'teta', source: 'Brand', description: 'Teta Nour or Yassin with a line in their own voice.', sampleTheme: 'eid' },
  { id: 'tpl-offer', name: 'Offer burst', layout: 'hero', palette: 'milk', motif: 'box', source: 'Brand', description: 'Product with a discount badge. Needs an offer code before approval.', sampleTheme: 'offer' },
  { id: 'tpl-split', name: 'Split product', layout: 'split', palette: 'night', motif: 'tin', source: 'Brand', description: 'Product on a rose sand band with copy above. Good for launches.', sampleTheme: 'launch' },
]

function seedPost({ prompt, status, offset, by, approvedBy, title, note, pick = 0, published }) {
  const analysis = analysePrompt(prompt)
  const concept = generateConcepts(analysis)[pick]
  const formats = buildFormats(concept).map((f, i) => {
    const d = at(offset + (i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2), [20, 22, 19][i % 3], 30)
    return { ...f, scheduledAt: toLocalInput(d), enabled: i < 6 }
  })
  const created = at(Math.min(offset, 0) - 2, 11)
  const history = [{ at: created.toISOString(), by, action: 'Created' }]
  if (status !== 'draft') history.push({ at: at(Math.min(offset, 0) - 1, 15).toISOString(), by, action: 'Sent for approval' })
  if (status === 'changes') history.push({ at: at(-1, 10).toISOString(), by: 'layla', action: 'Asked for changes', note })
  if (status === 'scheduled' || status === 'published') history.push({ at: at(Math.min(offset, 0) - 1, 17).toISOString(), by: approvedBy, action: 'Approved and scheduled' })
  if (published) history.push({ at: at(offset, 20, 30).toISOString(), by: 'system', action: 'Published' })
  return {
    id: uid('post'),
    title,
    prompt,
    analysis,
    concept,
    formats,
    status,
    createdBy: by,
    approvedBy: approvedBy || null,
    offerCode: analysis.theme === 'offer' ? 'RMD-TWO30' : '',
    resolved: {},
    history,
    createdAt: created.toISOString(),
  }
}

export function seedPosts() {
  return [
    seedPost({ title: 'Gift boxes for colleagues', prompt: 'Corporate gift push for @MedjoolReserve, warm and premium', status: 'published', offset: -4, by: 'karim', approvedBy: 'layla', published: true }),
    seedPost({ title: 'Maamoul weekend', prompt: 'Weekend post for the @MaamoulTin, made for sharing', status: 'scheduled', offset: 2, by: 'karim', approvedBy: 'layla' }),
    seedPost({ title: 'Date syrup teaser', prompt: 'Launch teaser for the new @DateSyrup', status: 'scheduled', offset: 5, by: 'layla', approvedBy: 'layla', pick: 1 }),
    seedPost({ title: 'Two boxes offer', prompt: 'Offer: buy two @MedjoolReserve boxes, 30% off the second', status: 'pending', offset: 3, by: 'karim' }),
    seedPost({ title: 'Teta at the long table', prompt: 'Ramadan countdown with @TetaNour at the @LongTable', status: 'changes', offset: 6, by: 'karim', note: 'Lovely. Can we use the Gulf dialect on Snapchat and move TikTok to after taraweeh?', pick: 1 }),
  ]
}

export const seedAssets = [
  { id: 'as-logo-gold', name: 'Crescent lockup, saffron', kind: 'logo', palette: 'night', source: 'Brand kit', tags: ['logo'], addedAt: at(-120).toISOString() },
  { id: 'as-logo-milk', name: 'Crescent lockup, milk', kind: 'logo', palette: 'date', source: 'Brand kit', tags: ['logo'], addedAt: at(-120).toISOString() },
  { id: 'as-box', name: 'Medjool Reserve packshot', kind: 'product', motif: 'box', palette: 'milk', source: 'Brand kit', tags: ['product', 'medjool'], addedAt: at(-90).toISOString() },
  { id: 'as-tin', name: 'Maamoul tin packshot', kind: 'product', motif: 'tin', palette: 'milk', source: 'Brand kit', tags: ['product', 'maamoul'], addedAt: at(-90).toISOString() },
  { id: 'as-bottle', name: 'Date syrup packshot', kind: 'product', motif: 'bottle', palette: 'milk', source: 'Brand kit', tags: ['product', 'syrup'], addedAt: at(-30).toISOString() },
  { id: 'as-teta', name: 'Teta Nour character sheet', kind: 'character', motif: 'teta', palette: 'date', source: 'Brand kit', tags: ['character'], addedAt: at(-60).toISOString() },
  { id: 'as-yassin', name: 'Yassin character sheet', kind: 'character', motif: 'yassin', palette: 'night', source: 'Brand kit', tags: ['character'], addedAt: at(-60).toISOString() },
  { id: 'as-table', name: 'Long table scene', kind: 'scene', motif: 'table', palette: 'night', source: 'From 5D', tags: ['ramadan', 'scene'], addedAt: at(-12).toISOString() },
  { id: 'as-hero-film', name: 'Ramadan hero film, 60s master', kind: 'video', motif: 'table', palette: 'night', source: 'From 5D', tags: ['ramadan', 'film'], addedAt: at(-3).toISOString(), duration: '1:00' },
  { id: 'as-hero-cut', name: 'Ramadan hero film, 15s cutdown', kind: 'video', motif: 'teta', palette: 'date', source: 'From 5D', tags: ['ramadan', 'film'], addedAt: at(-3).toISOString(), duration: '0:15' },
  { id: 'as-lantern', name: 'Lantern detail', kind: 'scene', motif: 'lantern', palette: 'night', source: 'From 5D', tags: ['ramadan'], addedAt: at(-12).toISOString() },
  { id: 'as-guidelines', name: 'Brand guidelines 2026', kind: 'document', palette: 'milk', source: 'Brand kit', tags: ['guidelines'], addedAt: at(-120).toISOString(), pages: 48 },
]

export function seedTickets() {
  return [
    {
      id: uid('tk'),
      kind: 'request',
      title: '30-second Ramadan TV spot with Teta Nour',
      detail: 'We want a TV version of the long table idea for MBC Masr and Rotana during the first week of Ramadan.',
      status: 'in-progress',
      from: 'layla',
      createdAt: at(-6).toISOString(),
      messages: [
        { by: 'layla', at: at(-6, 10).toISOString(), text: 'Can we have this for the first week of Ramadan?' },
        { by: 'omar', at: at(-6, 14).toISOString(), text: 'Yes. Script and storyboard by Thursday, shoot the week after. Cutdowns will land in your library when they are approved.' },
      ],
    },
    {
      id: uid('tk'),
      kind: 'issue',
      title: 'Snapchat preview cuts off the badge',
      detail: 'On the offer template the badge sits under the Snapchat caption bar on some phones.',
      status: 'delivered',
      from: 'karim',
      createdAt: at(-9).toISOString(),
      messages: [
        { by: 'karim', at: at(-9, 9).toISOString(), text: 'Badge is hidden behind the caption on my phone.' },
        { by: 'dina', at: at(-8, 12).toISOString(), text: 'Fixed. Story formats now keep everything inside the platform safe zones.' },
      ],
    },
    {
      id: uid('tk'),
      kind: 'request',
      title: 'LinkedIn template for corporate gifting',
      detail: 'Our B2B team wants to post gift box offers for companies on LinkedIn.',
      status: 'new',
      from: 'layla',
      createdAt: at(-1).toISOString(),
      messages: [{ by: 'layla', at: at(-1, 16).toISOString(), text: 'Landscape and square, please. Same look as the gift posts.' }],
    },
  ]
}

export const seedNotifications = () => [
  { id: uid('n'), to: 'client', text: '5D added two cuts of the Ramadan hero film to your library.', at: at(-3, 12).toISOString(), read: false, link: 'library' },
  { id: uid('n'), to: 'client', text: 'Layla asked for changes on Teta at the long table.', at: at(-1, 10).toISOString(), read: false, link: 'review' },
  { id: uid('n'), to: 'agency', text: 'Layla raised a new request: LinkedIn template for corporate gifting.', at: at(-1, 16).toISOString(), read: false, link: 'desk' },
]
