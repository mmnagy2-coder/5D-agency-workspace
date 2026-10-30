// Exports rendered formats as PNG files at their delivery size.
// Fonts are inlined so the exported file matches what is on screen.

const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;600&family=Young+Serif&family=Reem+Kufi:wght@500;700&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap'

let fontPromise = null

async function toDataUrl(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.readAsDataURL(blob)
  })
}

function embeddedFonts() {
  if (!fontPromise) {
    fontPromise = (async () => {
      try {
        let css = await (await fetch(FONT_CSS)).text()
        // Keep the latin and arabic subsets only, to keep each export small.
        const blocks = css.split('}').filter((b) => /U\+0000-00FF|U\+0600-06FF/.test(b))
        css = blocks.join('}') + (blocks.length ? '}' : '')
        const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1])
        for (const u of [...new Set(urls)]) css = css.split(u).join(await toDataUrl(u))
        return css
      } catch {
        return ''
      }
    })()
  }
  return fontPromise
}

export async function svgToPngBlob(svg, w, h) {
  const clone = svg.cloneNode(true)
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const css = await embeddedFonts()
  if (css) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = css
    clone.insertBefore(style, clone.firstChild)
  }
  const xml = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    return await new Promise((r) => canvas.toBlob(r, 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Inside a published artifact the page cannot start downloads itself, so
// files go through the viewer's downloads capability, which asks first.
// Run locally, a plain download link is used.
export async function saveBlob(blob, name) {
  const host = typeof window !== 'undefined' ? window.claude : null
  if (host?.use) {
    let dl = null
    try {
      dl = await host.use('downloads')
    } catch {
      dl = null
    }
    if (dl) {
      try {
        await dl.save({ filename: name, data: blob })
        return 'saved'
      } catch (e) {
        return e?.code === 'declined' ? 'declined' : 'failed'
      }
    }
    return 'failed'
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  return 'saved'
}

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
