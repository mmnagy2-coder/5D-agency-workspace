import { analysePrompt, buildFormats, generateConcepts, toLocalInput, uid } from '../lib/simulate.js'

// Demo content for Qamari. Every field people read has an Arabic sibling
// (titleAr, nameAr, textAr) so the workspace reads fully in either language.

const day = 24 * 60 * 60 * 1000
const at = (offsetDays, hh = 10, mm = 0) => {
  const d = new Date(Date.now() + offsetDays * day)
  d.setHours(hh, mm, 0, 0)
  return d
}

export const seedTemplates = [
  { id: 'tpl-hero', name: 'Product hero', nameAr: 'المنتج بطل', layout: 'hero', palette: 'night', motif: 'box', source: 'Brand', description: 'One product, one line, one call to action. The workhorse for feed and stories.', descriptionAr: 'منتج واحد وسطر واحد وزرار واحد. الأساسي للفيد والستوري.', sampleTheme: 'general' },
  { id: 'tpl-greeting', name: 'Seasonal greeting', nameAr: 'تهنئة المواسم', layout: 'greeting', palette: 'night', motif: 'greeting', source: 'Brand', description: 'Framed greeting for Ramadan, Eid and national days. No product, no price.', descriptionAr: 'تهنئة في إطار لرمضان والعيد والمناسبات القومية. من غير منتج ولا سعر.', sampleTheme: 'ramadan' },
  { id: 'tpl-story', name: 'Family story', nameAr: 'حكاية العيلة', layout: 'character', palette: 'date', motif: 'teta', source: 'Brand', description: 'Teta Nour or Yassin with a line in their own voice.', descriptionAr: 'تيتا نور أو ياسين وجملة بصوتهم.', sampleTheme: 'eid' },
  { id: 'tpl-offer', name: 'Offer burst', nameAr: 'العرض', layout: 'hero', palette: 'milk', motif: 'box', source: 'Brand', description: 'Product with a discount badge. Needs an offer code before approval.', descriptionAr: 'منتج وعليه شارة خصم. محتاج كود عرض قبل الموافقة.', sampleTheme: 'offer' },
  { id: 'tpl-split', name: 'Split product', nameAr: 'المنتج على شريط', layout: 'split', palette: 'night', motif: 'tin', source: 'Brand', description: 'Product on a rose sand band with copy above. Good for launches.', descriptionAr: 'منتج على شريط رملي وفوقه الكلام. مناسب للإطلاقات.', sampleTheme: 'launch' },
]

function seedPost({ prompt, promptAr, status, offset, by, approvedBy, title, titleAr, note, noteAr, pick = 0, published }) {
  const analysis = analysePrompt(prompt)
  const concept = generateConcepts(analysis)[pick]
  const formats = buildFormats(concept).map((f, i) => {
    const d = at(offset + (i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2), [20, 22, 19][i % 3], 30)
    return { ...f, scheduledAt: toLocalInput(d), enabled: i < 6 }
  })
  const created = at(Math.min(offset, 0) - 2, 11)
  const history = [{ at: created.toISOString(), by, action: 'Created' }]
  if (status !== 'draft') history.push({ at: at(Math.min(offset, 0) - 1, 15).toISOString(), by, action: 'Sent for approval' })
  if (status === 'changes') history.push({ at: at(-1, 10).toISOString(), by: 'layla', action: 'Asked for changes', note, noteAr })
  if (status === 'scheduled' || status === 'published') history.push({ at: at(Math.min(offset, 0) - 1, 17).toISOString(), by: approvedBy, action: 'Approved and scheduled' })
  if (published) history.push({ at: at(offset, 20, 30).toISOString(), by: 'system', action: 'Published' })
  return {
    id: uid('post'),
    title,
    titleAr,
    prompt,
    promptAr,
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
    seedPost({ title: 'Gift boxes for colleagues', titleAr: 'علب هدايا للزملا', prompt: 'Corporate gift push for @MedjoolReserve, warm and premium', promptAr: 'حملة هدايا شركات لـ @MedjoolReserve، دافية وفخمة', status: 'published', offset: -4, by: 'karim', approvedBy: 'layla', published: true }),
    seedPost({ title: 'Maamoul weekend', titleAr: 'ويك إند المعمول', prompt: 'Weekend post for the @MaamoulTin, made for sharing', promptAr: 'بوست الويك إند لـ @MaamoulTin، معمول عشان يتشارك', status: 'scheduled', offset: 2, by: 'karim', approvedBy: 'layla' }),
    seedPost({ title: 'Date syrup teaser', titleAr: 'تيزر دبس التمر', prompt: 'Launch teaser for the new @DateSyrup', promptAr: 'تيزر إطلاق @DateSyrup الجديد', status: 'scheduled', offset: 5, by: 'layla', approvedBy: 'layla', pick: 1 }),
    seedPost({ title: 'Two boxes offer', titleAr: 'عرض العلبتين', prompt: 'Offer: buy two @MedjoolReserve boxes, 30% off the second', promptAr: 'عرض: اشتري علبتين @MedjoolReserve والتانية بخصم 30%', status: 'pending', offset: 3, by: 'karim' }),
    seedPost({
      title: 'Teta at the long table',
      titleAr: 'تيتا على السفرة الطويلة',
      prompt: 'Ramadan countdown with @TetaNour at the @LongTable',
      promptAr: 'العد التنازلي لرمضان مع @TetaNour على @LongTable',
      status: 'changes',
      offset: 6,
      by: 'karim',
      note: 'Lovely. Can we use the Gulf dialect on Snapchat and move TikTok to after taraweeh?',
      noteAr: 'حلو أوي. ممكن نخلي سناب شات بالخليجي وننقل تيك توك لبعد التراويح؟',
      pick: 1,
    }),
  ]
}

export const seedAssets = [
  { id: 'as-logo-gold', name: 'Crescent lockup, saffron', nameAr: 'لوجو الهلال، دهبي', kind: 'logo', palette: 'night', source: 'Brand kit', tags: ['logo'], addedAt: at(-120).toISOString() },
  { id: 'as-logo-milk', name: 'Crescent lockup, milk', nameAr: 'لوجو الهلال، كريمي', kind: 'logo', palette: 'date', source: 'Brand kit', tags: ['logo'], addedAt: at(-120).toISOString() },
  { id: 'as-box', name: 'Medjool Reserve packshot', nameAr: 'صورة علبة مجدول ريزيرف', kind: 'product', motif: 'box', palette: 'milk', source: 'Brand kit', tags: ['product', 'medjool'], addedAt: at(-90).toISOString() },
  { id: 'as-tin', name: 'Maamoul tin packshot', nameAr: 'صورة علبة المعمول', kind: 'product', motif: 'tin', palette: 'milk', source: 'Brand kit', tags: ['product', 'maamoul'], addedAt: at(-90).toISOString() },
  { id: 'as-bottle', name: 'Date syrup packshot', nameAr: 'صورة دبس التمر', kind: 'product', motif: 'bottle', palette: 'milk', source: 'Brand kit', tags: ['product', 'syrup'], addedAt: at(-30).toISOString() },
  { id: 'as-teta', name: 'Teta Nour character sheet', nameAr: 'شيت شخصية تيتا نور', kind: 'character', motif: 'teta', palette: 'date', source: 'Brand kit', tags: ['character'], addedAt: at(-60).toISOString() },
  { id: 'as-yassin', name: 'Yassin character sheet', nameAr: 'شيت شخصية ياسين', kind: 'character', motif: 'yassin', palette: 'night', source: 'Brand kit', tags: ['character'], addedAt: at(-60).toISOString() },
  { id: 'as-table', name: 'Long table scene', nameAr: 'مشهد السفرة الطويلة', kind: 'scene', motif: 'table', palette: 'night', source: 'From 5D', tags: ['ramadan', 'scene'], addedAt: at(-12).toISOString() },
  { id: 'as-hero-film', name: 'Ramadan hero film, 60s master', nameAr: 'فيلم رمضان الرئيسي، ماستر 60 ثانية', kind: 'video', motif: 'table', palette: 'night', source: 'From 5D', tags: ['ramadan', 'film'], addedAt: at(-3).toISOString(), duration: '1:00' },
  { id: 'as-hero-cut', name: 'Ramadan hero film, 15s cutdown', nameAr: 'فيلم رمضان الرئيسي، نسخة 15 ثانية', kind: 'video', motif: 'teta', palette: 'date', source: 'From 5D', tags: ['ramadan', 'film'], addedAt: at(-3).toISOString(), duration: '0:15' },
  { id: 'as-lantern', name: 'Lantern detail', nameAr: 'تفاصيل الفانوس', kind: 'scene', motif: 'lantern', palette: 'night', source: 'From 5D', tags: ['ramadan'], addedAt: at(-12).toISOString() },
  { id: 'as-guidelines', name: 'Brand guidelines 2026', nameAr: 'دليل البراند 2026', kind: 'document', palette: 'milk', source: 'Brand kit', tags: ['guidelines'], addedAt: at(-120).toISOString(), pages: 48 },
]

export function seedTickets() {
  return [
    {
      id: uid('tk'),
      kind: 'request',
      title: '30-second Ramadan TV spot with Teta Nour',
      titleAr: 'إعلان تلفزيوني 30 ثانية لرمضان مع تيتا نور',
      detail: 'We want a TV version of the long table idea for MBC Masr and Rotana during the first week of Ramadan.',
      detailAr: 'عايزين نسخة تلفزيونية من فكرة السفرة الطويلة لـ MBC مصر وروتانا في أول أسبوع من رمضان.',
      status: 'in-progress',
      from: 'layla',
      createdAt: at(-6).toISOString(),
      messages: [
        { by: 'layla', at: at(-6, 10).toISOString(), text: 'Can we have this for the first week of Ramadan?', textAr: 'ينفع يكون جاهز لأول أسبوع في رمضان؟' },
        { by: 'omar', at: at(-6, 14).toISOString(), text: 'Yes. Script and storyboard by Thursday, shoot the week after. Cutdowns will land in your library when they are approved.', textAr: 'أيوه. السكريبت والستوري بورد يوم الخميس، والتصوير الأسبوع اللي بعده. النسخ القصيرة هتنزل في مكتبتك أول ما تتوافق.' },
      ],
    },
    {
      id: uid('tk'),
      kind: 'issue',
      title: 'Snapchat preview cuts off the badge',
      titleAr: 'معاينة سناب شات بتخبي الشارة',
      detail: 'On the offer template the badge sits under the Snapchat caption bar on some phones.',
      detailAr: 'في قالب العرض، الشارة بتقع تحت شريط الكابشن في سناب شات على بعض الموبايلات.',
      status: 'delivered',
      from: 'karim',
      createdAt: at(-9).toISOString(),
      messages: [
        { by: 'karim', at: at(-9, 9).toISOString(), text: 'Badge is hidden behind the caption on my phone.', textAr: 'الشارة مستخبية ورا الكابشن على موبايلي.' },
        { by: 'dina', at: at(-8, 12).toISOString(), text: 'Fixed. Story formats now keep everything inside the platform safe zones.', textAr: 'اتصلّحت. مقاسات الستوري بقت كلها جوه المناطق الآمنة بتاعة المنصة.' },
      ],
    },
    {
      id: uid('tk'),
      kind: 'request',
      title: 'LinkedIn template for corporate gifting',
      titleAr: 'قالب لينكدإن لهدايا الشركات',
      detail: 'Our B2B team wants to post gift box offers for companies on LinkedIn.',
      detailAr: 'فريق الشركات عندنا عايز ينزل عروض علب الهدايا للشركات على لينكدإن.',
      status: 'new',
      from: 'layla',
      createdAt: at(-1).toISOString(),
      messages: [{ by: 'layla', at: at(-1, 16).toISOString(), text: 'Landscape and square, please. Same look as the gift posts.', textAr: 'عرضي ومربع لو سمحت، بنفس شكل بوستات الهدايا.' }],
    },
  ]
}

// Notifications are stored as interface keys so they read in either language.
export const seedNotifications = () => [
  { id: uid('n'), to: 'client', key: 'n.filmAdded', at: at(-3, 12).toISOString(), read: false, link: 'library' },
  { id: uid('n'), to: 'client', key: 'n.changesAsked', vars: { who: 'layla', title: 'Teta at the long table', titleAr: 'تيتا على السفرة الطويلة' }, at: at(-1, 10).toISOString(), read: false, link: 'review' },
  { id: uid('n'), to: 'agency', key: 'n.newRequest', vars: { who: 'layla', title: 'LinkedIn template for corporate gifting', titleAr: 'قالب لينكدإن لهدايا الشركات' }, at: at(-1, 16).toISOString(), read: false, link: 'desk' },
]
