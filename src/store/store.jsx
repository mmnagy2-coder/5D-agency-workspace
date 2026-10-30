import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { brand } from '../config/brand.js'
import { networks } from '../config/channels.js'
import { seedAssets, seedNotifications, seedPosts, seedTemplates, seedTickets } from '../data/seed.js'
import { uid } from '../lib/simulate.js'

const KEY = 'brand-studio.v1'

function initialState() {
  return {
    role: 'maker',
    posts: seedPosts(),
    templates: seedTemplates,
    assets: seedAssets,
    tickets: seedTickets(),
    notifications: seedNotifications(),
    rules: brand.rules,
    networks,
    paidHandover: true,
    composer: null,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch {
    /* fall through to a fresh workspace */
  }
  return initialState()
}

function reducer(state, a) {
  switch (a.type) {
    case 'role':
      return { ...state, role: a.role }
    case 'composer':
      return { ...state, composer: a.composer }
    case 'post/add':
      return { ...state, posts: [a.post, ...state.posts] }
    case 'post/update':
      return { ...state, posts: state.posts.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) }
    case 'post/delete':
      return { ...state, posts: state.posts.filter((p) => p.id !== a.id) }
    case 'ticket/add':
      return { ...state, tickets: [a.ticket, ...state.tickets] }
    case 'ticket/update':
      return { ...state, tickets: state.tickets.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) }
    case 'ticket/message':
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === a.id ? { ...t, messages: [...t.messages, a.message] } : t)),
      }
    case 'template/add':
      return { ...state, templates: [a.template, ...state.templates] }
    case 'template/seen':
      return { ...state, templates: state.templates.map((t) => ({ ...t, isNew: false })) }
    case 'asset/add':
      return { ...state, assets: [a.asset, ...state.assets] }
    case 'rule/toggle':
      return { ...state, rules: state.rules.map((r) => (r.id === a.id ? { ...r, enforced: !r.enforced } : r)) }
    case 'network/toggle':
      return { ...state, networks: state.networks.map((n) => (n.id === a.id ? { ...n, connected: !n.connected } : n)) }
    case 'paid/toggle':
      return { ...state, paidHandover: !state.paidHandover }
    case 'notify':
      return { ...state, notifications: [{ id: uid('n'), at: new Date().toISOString(), read: false, ...a.note }, ...state.notifications] }
    case 'notifications/read':
      return { ...state, notifications: state.notifications.map((n) => (n.to === a.to ? { ...n, read: true } : n)) }
    case 'reset':
      return { ...initialState(), role: state.role }
    default:
      return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    try {
      const { composer: _c, ...rest } = state
      localStorage.setItem(KEY, JSON.stringify(rest))
    } catch {
      /* storage unavailable: the workspace still runs for this session */
    }
  }, [state])

  const toast = useCallback((text, kind = 'ok') => {
    const id = uid('t')
    setToasts((t) => [...t.slice(-2), { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  const value = useMemo(() => ({ state, dispatch, toast, toasts }), [state, toast, toasts])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  return useContext(Ctx)
}

// Role switcher. Makers draft, the approver signs off, 5D supports.
export const ROLE_INFO = {
  maker: { person: 'karim', side: 'client', label: 'Karim, content' },
  approver: { person: 'layla', side: 'client', label: 'Layla, approver' },
  agency: { person: 'omar', side: 'agency', label: 'Omar, 5D' },
}
