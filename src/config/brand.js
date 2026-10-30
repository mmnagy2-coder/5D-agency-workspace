// White-label brand configuration.
// Everything the client sees as "their" workspace comes from this file:
// name, logo, palette, type, voice, rules and the reusable elements people
// reference with @tags. Swap this file to put a different client in the app.
// Qamari is a fictional demo brand.

export const brand = {
  id: 'qamari',
  name: 'Qamari',
  nameAr: 'قمري',
  descriptor: 'Dates and sweets for the long table',
  descriptorAr: 'تمور وحلويات للسفرة الكبيرة',
  markets: ['Egypt', 'Saudi Arabia', 'UAE'],
  workspaceName: 'Qamari Studio',
  demo: true,

  // Shell accent and surface tones are derived from these.
  colours: [
    { id: 'night', name: 'Night indigo', hex: '#1F2A4A', role: 'Primary background', locked: true },
    { id: 'saffron', name: 'Saffron gold', hex: '#D9A441', role: 'Accent, calls to action', locked: true },
    { id: 'date', name: 'Date brown', hex: '#5A2E1B', role: 'Product, warm grounds', locked: true },
    { id: 'milk', name: 'Milk cream', hex: '#FBF4EA', role: 'Light background, text on dark', locked: true },
    { id: 'rose', name: 'Rose sand', hex: '#E9C9B1', role: 'Secondary surfaces', locked: false },
    { id: 'pistachio', name: 'Pistachio', hex: '#8BA35A', role: 'Seasonal highlight only', locked: false },
  ],

  type: {
    display: { family: 'Young Serif', use: 'Headlines in English' },
    displayAr: { family: 'Reem Kufi', use: 'Headlines in Arabic' },
    body: { family: 'Schibsted Grotesk', use: 'Body copy and captions in English' },
    bodyAr: { family: 'IBM Plex Sans Arabic', use: 'Body copy and captions in Arabic' },
  },

  voice: {
    summary:
      'Warm, generous and quietly proud. Qamari speaks like the host who always sets one extra place. Short sentences, family over product, never boastful.',
    weSay: ['the long table', 'made for sharing', 'from our family to yours', 'one more for the table'],
    weAvoid: ['healthy', 'guilt-free', 'cure', 'best in the world', 'cheap'],
  },

  // Rules the platform enforces on every asset before it can be approved.
  rules: [
    { id: 'r-logo-space', category: 'Logo', text: 'Logo keeps clear space equal to the height of the crescent on all sides.', enforced: true },
    { id: 'r-logo-colour', category: 'Logo', text: 'Logo appears only in saffron gold, milk cream or night indigo.', enforced: true },
    { id: 'r-palette', category: 'Colour', text: 'Backgrounds use night indigo, date brown or milk cream. Pistachio is seasonal and never a background.', enforced: true },
    { id: 'r-type', category: 'Type', text: 'Headlines use Young Serif in English and Reem Kufi in Arabic. No other display faces.', enforced: true },
    { id: 'r-claims', category: 'Claims', text: 'No health, diet or medical claims. Words like healthy, cure and guilt-free are blocked.', enforced: true },
    { id: 'r-ramadan', category: 'Culture', text: 'During Ramadan, no food or drink shown being consumed in daytime scenes.', enforced: true },
    { id: 'r-dialect', category: 'Copy', text: 'Arabic copy matches the market dialect. Egyptian for Egypt, Gulf for Saudi Arabia and the UAE, MSA for pan-Arab placements.', enforced: true },
    { id: 'r-price', category: 'Offers', text: 'Prices and discounts need the offer code from the trade calendar before they can be approved.', enforced: false },
  ],

  // Saved elements, referenced in any prompt as @Tag.
  elements: [
    { id: 'el-teta', tag: 'TetaNour', type: 'Character', name: 'Teta Nour', motif: 'teta', description: 'The grandmother who hosts the long table. Silver hair, saffron shawl, always mid-laugh.' },
    { id: 'el-yassin', tag: 'Yassin', type: 'Character', name: 'Yassin', motif: 'yassin', description: 'Her grandson, early twenties. Carries the tray, steals a date on the way.' },
    { id: 'el-medjool', tag: 'MedjoolReserve', type: 'Product', name: 'Medjool Reserve box', motif: 'box', description: 'Twelve Medjool dates in a night indigo box with a saffron ribbon.' },
    { id: 'el-maamoul', tag: 'MaamoulTin', type: 'Product', name: 'Maamoul tin', motif: 'tin', description: 'Round tin of date-filled maamoul, milk cream with a gold crescent lid.' },
    { id: 'el-syrup', tag: 'DateSyrup', type: 'Product', name: 'Date syrup', motif: 'bottle', description: 'Glass bottle of date syrup with a date brown label.' },
    { id: 'el-suhoor', tag: 'GoldenSuhoor', type: 'Style', name: 'Golden suhoor', motif: 'style-suhoor', description: 'Low warm light before dawn, lanterns, deep indigo shadows.' },
    { id: 'el-market', tag: 'NightMarket', type: 'Style', name: 'Night market', motif: 'style-market', description: 'Busy lantern-lit street, bokeh, energy and colour.' },
    { id: 'el-studio', tag: 'CleanStudio', type: 'Style', name: 'Clean studio', motif: 'style-studio', description: 'Product on milk cream, soft shadow, nothing else in frame.' },
    { id: 'el-table', tag: 'LongTable', type: 'Background', name: 'The long table', motif: 'table', description: 'An iftar table that runs out of frame, full of dishes and hands.' },
    { id: 'el-logo', tag: 'Logo', type: 'Logo', name: 'Qamari crescent lockup', motif: 'logo', description: 'Crescent mark with bilingual wordmark.' },
  ],

  dialects: [
    { id: 'egyptian', name: 'Egyptian Arabic', market: 'Egypt', dir: 'rtl' },
    { id: 'gulf', name: 'Gulf Arabic', market: 'Saudi Arabia and UAE', dir: 'rtl' },
    { id: 'msa', name: 'Modern Standard Arabic', market: 'Pan-Arab', dir: 'rtl' },
    { id: 'english', name: 'English', market: 'UAE expat, global', dir: 'ltr' },
  ],
}

export const brandColour = (id) => brand.colours.find((c) => c.id === id)?.hex
