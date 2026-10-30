// The agency that sits inside the client's workspace.
// Rebranding the platform to 5D's own product is a change to this file
// and to the shell tokens in styles.css, not a fork of the app.

export const agency = {
  id: '5d',
  name: '5D',
  fullName: 'Fifth Dimension',
}

// gender drives Arabic verb agreement in the interface.
export const people = {
  layla: { id: 'layla', name: 'Layla Mansour', nameAr: 'ليلى منصور', role: 'Marketing manager', roleAr: 'مديرة التسويق', side: 'client', approver: true, initials: 'LM', initialsAr: 'ل م', gender: 'f' },
  karim: { id: 'karim', name: 'Karim Adel', nameAr: 'كريم عادل', role: 'Content executive', roleAr: 'مسؤول المحتوى', side: 'client', approver: false, initials: 'KA', initialsAr: 'ك ع', gender: 'm' },
  omar: { id: 'omar', name: 'Omar Haddad', nameAr: 'عمر حداد', role: 'Account lead, 5D', roleAr: 'مدير الحساب، 5D', side: 'agency', approver: false, initials: 'OH', initialsAr: 'ع ح', gender: 'm' },
  dina: { id: 'dina', name: 'Dina Fawzy', nameAr: 'دينا فوزي', role: 'Designer, 5D', roleAr: 'مصممة، 5D', side: 'agency', approver: false, initials: 'DF', initialsAr: 'د ف', gender: 'f' },
}

// Engines the platform calls. In this prototype every engine is simulated.
// The live integration point for each lives in src/lib/engines.js.
export const engines = [
  { id: 'claude', name: 'Claude', doesKey: 'engine.claude' },
  { id: 'higgsfield', name: 'Higgsfield', doesKey: 'engine.higgsfield' },
]
