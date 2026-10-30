// White-label brand configuration.
// Everything the client sees as "their" workspace comes from this file:
// name, logo, palette, type, voice, rules and the reusable elements people
// reference with @tags. Swap this file to put a different client in the app.
// Every text field has an Arabic sibling (nameAr, textAr) for the Arabic interface.
// Qamari is a fictional demo brand.

export const brand = {
  id: 'qamari',
  name: 'Qamari',
  nameAr: 'قمري',
  descriptor: 'Dates and sweets for the long table',
  descriptorAr: 'تمور وحلويات للسفرة الكبيرة',
  markets: ['Egypt', 'Saudi Arabia', 'UAE'],
  workspaceName: 'Qamari Studio',
  workspaceNameAr: 'قمري ستوديو',
  demo: true,

  // Shell accent and surface tones are derived from these.
  colours: [
    { id: 'night', name: 'Night indigo', nameAr: 'نيلي الليل', hex: '#1F2A4A', role: 'Primary background', roleAr: 'الخلفية الأساسية', locked: true },
    { id: 'saffron', name: 'Saffron gold', nameAr: 'دهبي الزعفران', hex: '#D9A441', role: 'Accent, calls to action', roleAr: 'اللون المميز والأزرار', locked: true },
    { id: 'date', name: 'Date brown', nameAr: 'بني التمر', hex: '#5A2E1B', role: 'Product, warm grounds', roleAr: 'المنتج والخلفيات الدافية', locked: true },
    { id: 'milk', name: 'Milk cream', nameAr: 'كريمي اللبن', hex: '#FBF4EA', role: 'Light background, text on dark', roleAr: 'خلفية فاتحة وكلام على الغامق', locked: true },
    { id: 'rose', name: 'Rose sand', nameAr: 'رملي وردي', hex: '#E9C9B1', role: 'Secondary surfaces', roleAr: 'أسطح ثانوية', locked: false },
    { id: 'pistachio', name: 'Pistachio', nameAr: 'فستقي', hex: '#8BA35A', role: 'Seasonal highlight only', roleAr: 'للمواسم بس', locked: false },
  ],

  type: {
    display: { family: 'Young Serif', use: 'Headlines in English', useAr: 'عناوين الإنجليزي' },
    displayAr: { family: 'Reem Kufi', use: 'Headlines in Arabic', useAr: 'عناوين العربي' },
    body: { family: 'Schibsted Grotesk', use: 'Body copy and captions in English', useAr: 'الكلام والكابشن بالإنجليزي' },
    bodyAr: { family: 'IBM Plex Sans Arabic', use: 'Body copy and captions in Arabic', useAr: 'الكلام والكابشن بالعربي' },
  },

  voice: {
    summary:
      'Warm, generous and quietly proud. Qamari speaks like the host who always sets one extra place. Short sentences, family over product, never boastful.',
    summaryAr: 'دافي وكريم وفخور بهدوء. قمري بيتكلم زي صاحب البيت اللي دايماً بيحط طبق زيادة. جمل قصيرة، العيلة قبل المنتج، ومن غير تفاخر.',
    weSay: ['the long table', 'made for sharing', 'from our family to yours', 'one more for the table'],
    weSayAr: ['السفرة الكبيرة', 'معمول عشان يتشارك', 'من عيلتنا لعيلتكم', 'واحد كمان على السفرة'],
    weAvoid: ['healthy', 'guilt-free', 'cure', 'best in the world', 'cheap'],
    weAvoidAr: ['صحي', 'من غير إحساس بالذنب', 'علاج', 'الأحسن في العالم', 'رخيص'],
  },

  // Rules the platform enforces on every asset before it can be approved.
  rules: [
    { id: 'r-logo-space', category: 'Logo', categoryAr: 'اللوجو', text: 'Logo keeps clear space equal to the height of the crescent on all sides.', textAr: 'اللوجو لازم حواليه مساحة فاضية قد طول الهلال من كل ناحية.', enforced: true },
    { id: 'r-logo-colour', category: 'Logo', categoryAr: 'اللوجو', text: 'Logo appears only in saffron gold, milk cream or night indigo.', textAr: 'اللوجو يظهر بس بدهبي الزعفران أو كريمي اللبن أو نيلي الليل.', enforced: true },
    { id: 'r-palette', category: 'Colour', categoryAr: 'الألوان', text: 'Backgrounds use night indigo, date brown or milk cream. Pistachio is seasonal and never a background.', textAr: 'الخلفيات نيلي الليل أو بني التمر أو كريمي اللبن. الفستقي للمواسم ومينفعش يبقى خلفية.', enforced: true },
    { id: 'r-type', category: 'Type', categoryAr: 'الخطوط', text: 'Headlines use Young Serif in English and Reem Kufi in Arabic. No other display faces.', textAr: 'العناوين بخط Young Serif بالإنجليزي وريم كوفي بالعربي. مفيش خطوط عناوين تانية.', enforced: true },
    { id: 'r-claims', category: 'Claims', categoryAr: 'الادعاءات', text: 'No health, diet or medical claims. Words like healthy, cure and guilt-free are blocked.', textAr: 'ممنوع أي ادعاءات صحية أو دايت أو طبية. كلام زي صحي وعلاج ومن غير إحساس بالذنب ممنوع.', enforced: true },
    { id: 'r-ramadan', category: 'Culture', categoryAr: 'الثقافة', text: 'During Ramadan, no food or drink shown being consumed in daytime scenes.', textAr: 'في رمضان، ممنوع أكل أو شرب في مشاهد النهار.', enforced: true },
    { id: 'r-dialect', category: 'Copy', categoryAr: 'الكلام', text: 'Arabic copy matches the market dialect. Egyptian for Egypt, Gulf for Saudi Arabia and the UAE, MSA for pan-Arab placements.', textAr: 'الكلام العربي بلهجة السوق. مصري لمصر، خليجي للسعودية والإمارات، وفصحى للحملات العربية العامة.', enforced: true },
    { id: 'r-price', category: 'Offers', categoryAr: 'العروض', text: 'Prices and discounts need the offer code from the trade calendar before they can be approved.', textAr: 'الأسعار والخصومات محتاجة كود العرض من نتيجة العروض قبل الموافقة.', enforced: false },
  ],

  // Saved elements, referenced in any prompt as @Tag.
  elements: [
    { id: 'el-teta', tag: 'TetaNour', type: 'Character', typeAr: 'شخصية', name: 'Teta Nour', nameAr: 'تيتا نور', motif: 'teta', description: 'The grandmother who hosts the long table. Silver hair, saffron shawl, always mid-laugh.', descriptionAr: 'الجدة اللي بتستضيف السفرة الكبيرة. شعرها فضي، وشالها زعفراني، ودايماً بتضحك.' },
    { id: 'el-yassin', tag: 'Yassin', type: 'Character', typeAr: 'شخصية', name: 'Yassin', nameAr: 'ياسين', motif: 'yassin', description: 'Her grandson, early twenties. Carries the tray, steals a date on the way.', descriptionAr: 'حفيدها، في أوائل العشرينات. شايل الصينية وبيخطف تمراية في السكة.' },
    { id: 'el-medjool', tag: 'MedjoolReserve', type: 'Product', typeAr: 'منتج', name: 'Medjool Reserve box', nameAr: 'علبة مجدول ريزيرف', motif: 'box', description: 'Twelve Medjool dates in a night indigo box with a saffron ribbon.', descriptionAr: '12 تمرة مجدول في علبة نيلي بشريطة زعفراني.' },
    { id: 'el-maamoul', tag: 'MaamoulTin', type: 'Product', typeAr: 'منتج', name: 'Maamoul tin', nameAr: 'علبة المعمول', motif: 'tin', description: 'Round tin of date-filled maamoul, milk cream with a gold crescent lid.', descriptionAr: 'علبة معمول بالتمر مدورة، كريمي بغطا عليه هلال دهبي.' },
    { id: 'el-syrup', tag: 'DateSyrup', type: 'Product', typeAr: 'منتج', name: 'Date syrup', nameAr: 'دبس التمر', motif: 'bottle', description: 'Glass bottle of date syrup with a date brown label.', descriptionAr: 'إزازة دبس تمر بليبل بني.' },
    { id: 'el-suhoor', tag: 'GoldenSuhoor', type: 'Style', typeAr: 'ستايل', name: 'Golden suhoor', nameAr: 'سحور دهبي', motif: 'style-suhoor', description: 'Low warm light before dawn, lanterns, deep indigo shadows.', descriptionAr: 'نور دافي واطي قبل الفجر، فوانيس، وضلال نيلي غامق.' },
    { id: 'el-market', tag: 'NightMarket', type: 'Style', typeAr: 'ستايل', name: 'Night market', nameAr: 'سوق بالليل', motif: 'style-market', description: 'Busy lantern-lit street, bokeh, energy and colour.', descriptionAr: 'شارع زحمة منوّر بالفوانيس، أضواء مغبّشة، وحركة وألوان.' },
    { id: 'el-studio', tag: 'CleanStudio', type: 'Style', typeAr: 'ستايل', name: 'Clean studio', nameAr: 'ستوديو نضيف', motif: 'style-studio', description: 'Product on milk cream, soft shadow, nothing else in frame.', descriptionAr: 'المنتج على خلفية كريمي، بضل خفيف، ومفيش حاجة تانية في الكادر.' },
    { id: 'el-table', tag: 'LongTable', type: 'Background', typeAr: 'خلفية', name: 'The long table', nameAr: 'السفرة الطويلة', motif: 'table', description: 'An iftar table that runs out of frame, full of dishes and hands.', descriptionAr: 'سفرة فطار طويلة طالعة برا الكادر، مليانة أطباق وإيدين.' },
    { id: 'el-logo', tag: 'Logo', type: 'Logo', typeAr: 'لوجو', name: 'Qamari crescent lockup', nameAr: 'لوجو الهلال', motif: 'logo', description: 'Crescent mark with bilingual wordmark.', descriptionAr: 'علامة الهلال مع اسم البراند بالعربي والإنجليزي.' },
  ],

  dialects: [
    { id: 'egyptian', name: 'Egyptian Arabic', nameAr: 'مصري', market: 'Egypt', marketAr: 'مصر', dir: 'rtl' },
    { id: 'gulf', name: 'Gulf Arabic', nameAr: 'خليجي', market: 'Saudi Arabia and UAE', marketAr: 'السعودية والإمارات', dir: 'rtl' },
    { id: 'msa', name: 'Modern Standard Arabic', nameAr: 'فصحى', market: 'Pan-Arab', marketAr: 'كل الدول العربية', dir: 'rtl' },
    { id: 'english', name: 'English', nameAr: 'إنجليزي', market: 'UAE expat, global', marketAr: 'الجاليات في الإمارات والعالم', dir: 'ltr' },
  ],
}

export const brandColour = (id) => brand.colours.find((c) => c.id === id)?.hex
