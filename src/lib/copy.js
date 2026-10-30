// Simulated copy library. In the live product Claude writes these from the
// brief, the brand voice and the dialect rules (see src/lib/engines.js).
// Each theme carries English plus the three Arabic dialects the brand uses.

const t = (english, egyptian, gulf, msa) => ({ english, egyptian, gulf, msa })
const c = (headline, sub, cta, badge) => ({ headline, sub, cta, ...(badge ? { badge } : {}) })

export const THEMES = {
  ramadan: [
    t(
      c('One more place at the table', 'Medjool Reserve, packed for a whole month of iftars.', 'Order for Ramadan'),
      c('دايماً فيه مكان لواحد كمان', 'صندوق مجدول ريزيرف لكل فطار في الشهر', 'اطلب لرمضان'),
      c('السفرة دايم تشيل واحد زيادة', 'صندوق مجدول ريزيرف لفطور الشهر كله', 'اطلب لرمضان'),
      c('على مائدتنا مكان لضيف آخر دائماً', 'صندوق مجدول ريزيرف لإفطار الشهر كله', 'اطلب لرمضان'),
    ),
    t(
      c('Break your fast the Teta way', 'Three dates, a glass of water, then the feast.', 'Shop the iftar box'),
      c('افطر على طريقة تيتا', 'تلات تمرات وكوباية مية وبعدين السفرة', 'تسوّق صندوق الفطار'),
      c('افطر على طريقة جدتنا', 'ثلاث تمرات وكاسة ماي وبعدها السفرة', 'تسوّق صندوق الفطور'),
      c('أفطر على طريقة الجدة', 'ثلاث تمرات وكوب ماء ثم المائدة', 'تسوّق صندوق الإفطار'),
    ),
    t(
      c('Lit by lanterns, sweetened by Qamari', 'Maamoul for every guest who drops by after taraweeh.', 'Fill the tin'),
      c('فانوس منوّر ومعمول من قمري', 'معمول لكل ضيف يعدّي بعد التراويح', 'املأ العلبة'),
      c('فانوس يضوي ومعمول من قمري', 'معمول لكل ضيف يمرّ بعد التراويح', 'املأ العلبة'),
      c('فوانيس مضيئة ومعمول من قمري', 'معمول لكل ضيف يزورنا بعد التراويح', 'املأ العلبة'),
    ),
    t(
      c('Ramadan Kareem', "From our family's table to yours.", 'Send a greeting'),
      c('رمضان كريم', 'من سفرتنا لسفرتكم', 'ابعت تهنئة'),
      c('رمضان كريم', 'من سفرتنا لسفرتكم', 'أرسل تهنئة'),
      c('رمضان كريم', 'من مائدة عائلتنا إلى مائدتكم', 'أرسل تهنئة'),
    ),
  ],
  eid: [
    t(
      c("Eid tastes like Teta's maamoul", 'Baked the way she taught us, boxed for every visit.', 'Order for Eid'),
      c('العيد طعمه معمول تيتا', 'معمول على طريقتها في علبة لكل زيارة', 'اطلب للعيد'),
      c('العيد طعمه معمول جدتنا', 'معمول على طريقتها في علبة لكل زيارة', 'اطلب للعيد'),
      c('للعيد طعم معمول الجدة', 'خُبز كما علّمتنا وعُبّئ لكل زيارة', 'اطلب للعيد'),
    ),
    t(
      c('Eid Mubarak', 'However many visits, there is always a tin open.', 'Send a greeting'),
      c('كل سنة وانت طيب', 'مهما كترت الزيارات فيه علبة مفتوحة', 'ابعت تهنئة'),
      c('عساكم من عواده', 'مهما كثرت الزيارات فيه علبة مفتوحة', 'أرسل تهنئة'),
      c('عيد مبارك', 'مهما كثرت الزيارات تبقى علبة مفتوحة', 'أرسل تهنئة'),
    ),
  ],
  launch: [
    t(
      c('Pour a little Qamari', 'New date syrup, for pancakes, tahini and everything after.', 'Try it first'),
      c('حط لمسة قمري', 'دبس التمر الجديد للبان كيك والطحينة وكل حاجة', 'جرّبه الأول'),
      c('حط لمسة من قمري', 'دبس التمر الجديد للبان كيك والطحينة وكل شي', 'جرّبه أول'),
      c('أضف لمسة من قمري', 'دبس التمر الجديد للفطائر والطحينة وما بعدهما', 'جرّبه أولاً'),
    ),
    t(
      c('Something new on the long table', 'Qamari date syrup is here.', 'Find it in store'),
      c('حاجة جديدة على السفرة', 'دبس تمر قمري وصل', 'دوّر عليه في المحل'),
      c('شي جديد على السفرة', 'دبس تمر قمري وصل', 'تلقاه في المحلات'),
      c('جديد على المائدة', 'وصل دبس تمر قمري', 'تجده في المتاجر'),
    ),
  ],
  offer: [
    t(
      c('Two boxes, one table', 'Buy two Medjool Reserve boxes and the second is 30% off.', 'Claim the offer', '-30%'),
      c('علبتين لسفرة واحدة', 'اشتري علبتين مجدول ريزيرف والتانية بخصم ٣٠٪', 'استفيد بالعرض', '٣٠٪-'),
      c('علبتين لسفرة وحدة', 'اشترِ علبتين مجدول ريزيرف والثانية بخصم ٣٠٪', 'استفد من العرض', '٣٠٪-'),
      c('علبتان لمائدة واحدة', 'اشترِ علبتين من مجدول ريزيرف والثانية بخصم ٣٠٪', 'احصل على العرض', '٣٠٪-'),
    ),
    t(
      c('More for the table', 'Maamoul tins at 20% off this week only.', 'Shop the offer', '-20%'),
      c('زيادة للسفرة', 'علب المعمول بخصم ٢٠٪ الأسبوع ده بس', 'تسوّق العرض', '٢٠٪-'),
      c('زيادة للسفرة', 'علب المعمول بخصم ٢٠٪ هالأسبوع بس', 'تسوّق العرض', '٢٠٪-'),
      c('المزيد للمائدة', 'علب المعمول بخصم ٢٠٪ هذا الأسبوع فقط', 'تسوّق العرض', '٢٠٪-'),
    ),
  ],
  gift: [
    t(
      c('The gift that gets opened first', 'Medjool Reserve, wrapped in saffron ribbon.', 'Send as a gift'),
      c('الهدية اللي بتتفتح الأول', 'مجدول ريزيرف بشريطة زعفراني', 'ابعتها هدية'),
      c('الهدية اللي تنفتح أول', 'مجدول ريزيرف بشريطة زعفرانية', 'أرسلها هدية'),
      c('الهدية التي تُفتح أولاً', 'مجدول ريزيرف بشريط بلون الزعفران', 'أرسلها هدية'),
    ),
  ],
  general: [
    t(
      c('Made for sharing', 'Dates and sweets for the long table.', 'Shop Qamari'),
      c('اتعمل عشان يتشارك', 'تمور وحلويات للسفرة الكبيرة', 'تسوّق من قمري'),
      c('مسوّى عشان يتقاسم', 'تمور وحلويات للسفرة الكبيرة', 'تسوّق من قمري'),
      c('صُنع للمشاركة', 'تمور وحلويات للمائدة الكبيرة', 'تسوّق من قمري'),
    ),
    t(
      c('From our family to yours', 'Every Qamari box is packed the way we pack our own.', 'Shop Qamari'),
      c('من عيلتنا لعيلتكم', 'كل علبة قمري بنجهزها زي ما بنجهز علبتنا', 'تسوّق من قمري'),
      c('من عيلتنا لعيلتكم', 'كل علبة قمري نجهزها مثل ما نجهز علبتنا', 'تسوّق من قمري'),
      c('من عائلتنا إلى عائلتكم', 'نجهّز كل علبة قمري كما نجهّز علبتنا', 'تسوّق من قمري'),
    ),
  ],
}

export const HASHTAGS = {
  ramadan: { en: ['#Qamari', '#RamadanKareem', '#LongTable'], ar: ['#قمري', '#رمضان_كريم', '#سفرة_رمضان'] },
  eid: { en: ['#Qamari', '#EidMubarak'], ar: ['#قمري', '#عيد_مبارك'] },
  launch: { en: ['#Qamari', '#DateSyrup', '#New'], ar: ['#قمري', '#دبس_التمر'] },
  offer: { en: ['#Qamari', '#Offer'], ar: ['#قمري', '#عروض'] },
  gift: { en: ['#Qamari', '#GiftIdeas'], ar: ['#قمري', '#هدايا'] },
  general: { en: ['#Qamari', '#MadeForSharing'], ar: ['#قمري'] },
}

// Approved replacements for blocked words in the brand voice.
export const SAFE_SWAPS = {
  healthy: 'wholesome',
  'guilt-free': 'made for sharing',
  'guilt free': 'made for sharing',
  cure: 'comfort',
  'best in the world': 'made with care',
  cheap: 'great value',
  'sugar-free': 'naturally sweet',
  'sugar free': 'naturally sweet',
}
