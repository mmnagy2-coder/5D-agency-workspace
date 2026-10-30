// The agency that sits inside the client's workspace.
// Rebranding the platform to 5D's own product is a change to this file
// and to the shell tokens in styles.css, not a fork of the app.

export const agency = {
  id: '5d',
  name: '5D',
  fullName: 'Fifth Dimension',
  promise: 'Your agency, inside your workspace',
  responseTime: 'Replies within 4 working hours',
}

export const people = {
  layla: { id: 'layla', name: 'Layla Mansour', role: 'Marketing manager', side: 'client', approver: true, initials: 'LM' },
  karim: { id: 'karim', name: 'Karim Adel', role: 'Content executive', side: 'client', approver: false, initials: 'KA' },
  omar: { id: 'omar', name: 'Omar Haddad', role: 'Account lead, 5D', side: 'agency', approver: false, initials: 'OH' },
  dina: { id: 'dina', name: 'Dina Fawzy', role: 'Designer, 5D', side: 'agency', approver: false, initials: 'DF' },
}

// Who each role switch logs in as.
export const roles = {
  client: { id: 'client', label: 'Client team', person: 'layla' },
  agency: { id: 'agency', label: '5D agency', person: 'omar' },
}

// Engines the platform calls. In this prototype every engine is simulated.
// The live integration point for each lives in src/lib/engines.js.
export const engines = [
  { id: 'claude', name: 'Claude', does: 'Briefs, copy, dialect versions and brand checks', status: 'Simulated in prototype' },
  { id: 'higgsfield', name: 'Higgsfield', does: 'Images and video', status: 'Simulated in prototype' },
]
