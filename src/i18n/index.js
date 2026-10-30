// Interface language. English and Egyptian Arabic, switched from the top bar.
// t() reads the current language, so helpers outside React can use it too.
// Content objects carry Arabic in a sibling field: title and titleAr.

import { agency } from '../config/agency.js'
import { brand } from '../config/brand.js'
import { ar } from './ar.js'
import { en } from './en.js'

let lang = 'en'

export function setLang(next) {
  lang = next === 'ar' ? 'ar' : 'en'
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = lang === 'ar' ? brand.workspaceNameAr : brand.workspaceName
  }
}

export const getLang = () => lang
export const isAr = () => lang === 'ar'

// {agency} and {brand} are always available, so swapping the client or the
// agency in the config changes every string at once.
// Counted strings pick a plural form when one exists: key.one in English;
// key.one, key.two and key.few (3 to 10) in Arabic.
function pluralKey(dict, key, n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) return key
  const form = lang === 'ar' ? (n === 1 ? 'one' : n === 2 ? 'two' : n >= 3 && n <= 10 ? 'few' : null) : n === 1 ? 'one' : null
  return form && dict[`${key}.${form}`] ? `${key}.${form}` : key
}

export function t(key, vars) {
  const dict = lang === 'ar' ? ar : en
  const v = { agency: agency.name, brand: lang === 'ar' ? brand.nameAr : brand.name, ...vars }
  const k = pluralKey(dict, key, vars?.n)
  return String(dict[k] ?? en[key] ?? key).replace(/\{(\w+)\}/g, (_, x) => (v[x] ?? ''))
}

// The same string in a named language, for content stored in both at once.
export function tIn(which, key, vars) {
  const was = lang
  lang = which
  try {
    return t(key, vars)
  } finally {
    lang = was
  }
}

// Joins a list the way each language does: "a, b and c" or "أ، ب و ج".
export const joinList = (items) => {
  const a = [...items]
  if (a.length < 2) return a.join('')
  const last = a.pop()
  return lang === 'ar' ? `${a.join('، ')} و${last}` : `${a.join(', ')} and ${last}`
}

// Arabic verbs agree with the speaker. A key ending .f is the feminine form.
export function tg(key, gender, vars) {
  if (lang === 'ar' && gender === 'f' && ar[`${key}.f`]) return t(`${key}.f`, vars)
  return t(key, vars)
}

// Picks the Arabic version of a content field when there is one.
export const L = (obj, field) => (lang === 'ar' && obj?.[`${field}Ar`]) || obj?.[field] || ''

// Arabic dates use Western digits so they match every other number in the interface.
export const locale = () => (lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB')

// Latin runs such as handles, @tags, codes and prices keep their own order
// inside Arabic sentences when wrapped in a left-to-right isolate.
export const ltr = (s) => `\u2066${s}\u2069`
export const isolateTags = (s) => String(s || '').replace(/@\w+/g, (m) => ltr(m))

// Empty fields follow the interface direction so placeholders read properly.
// Once there is text, the browser picks the direction from what was typed.
export const inputDir = (value) => (value ? 'auto' : lang === 'ar' ? 'rtl' : 'ltr')

export const hasArabic = (s) => /[؀-ۿ]/.test(String(s || ''))
