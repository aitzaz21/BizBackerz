import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BASE_URL = 'https://bizbackerz.com'
const DEFAULT_IMAGE  = `${BASE_URL}/og-image.jpg`
const DEFAULT_TITLE  = 'BizBackerz – Delegate to Dominate | Virtual Assistance'
const DEFAULT_DESC   = 'BizBackerz offers dedicated virtual assistance — admin support, social media management, lead generation, customer support, and more. Delegate to dominate your business.'
const DEFAULT_ROBOTS = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

const UK_URL = 'https://bizbackerz.co.uk'

/* Updates <head> tags dynamically — works with Google's JS crawler */
export default function PageSEO({
  title,
  description,
  canonical,
  image,
  schema,
  noindex = false,
}) {
  const { pathname } = useLocation()

  const fullTitle    = title       || DEFAULT_TITLE
  const fullDesc     = description || DEFAULT_DESC
  const canonicalUrl = canonical   || `${BASE_URL}${pathname}`
  const ogImage      = image       || DEFAULT_IMAGE

  /* hreflang: same path on both domains */
  const usUrl      = `${BASE_URL}${pathname}`
  const ukUrl      = `${UK_URL}${pathname}`

  useEffect(() => {
    const prev = {
      title:       document.title,
      description: getMeta('meta[name="description"]', 'content'),
      ogTitle:     getMeta('meta[property="og:title"]', 'content'),
      ogDesc:      getMeta('meta[property="og:description"]', 'content'),
      ogUrl:       getMeta('meta[property="og:url"]', 'content'),
      ogImage:     getMeta('meta[property="og:image"]', 'content'),
      twTitle:     getMeta('meta[name="twitter:title"]', 'content'),
      twDesc:      getMeta('meta[name="twitter:description"]', 'content'),
      twImage:     getMeta('meta[name="twitter:image"]', 'content'),
      canonical:   getLink('link[rel="canonical"]', 'href'),
      robots:      getMeta('meta[name="robots"]', 'content'),
    }

    /* ── Standard meta ── */
    document.title = fullTitle
    setMeta('meta[name="description"]',          'content', fullDesc)
    setMeta('meta[property="og:title"]',         'content', fullTitle)
    setMeta('meta[property="og:description"]',   'content', fullDesc)
    setMeta('meta[property="og:url"]',           'content', canonicalUrl)
    setMeta('meta[property="og:image"]',         'content', ogImage)
    setMeta('meta[name="twitter:title"]',        'content', fullTitle)
    setMeta('meta[name="twitter:description"]',  'content', fullDesc)
    setMeta('meta[name="twitter:image"]',        'content', ogImage)
    setLink('link[rel="canonical"]',             'href',    canonicalUrl)

    if (noindex) {
      setMeta('meta[name="robots"]', 'content', 'noindex, nofollow')
    }

    /* ── hreflang — inject 3 link tags ── */
    removeHreflang()
    const hreflangs = [
      { hreflang: 'en-US',      href: usUrl },
      { hreflang: 'en-GB',      href: ukUrl },
      { hreflang: 'x-default',  href: usUrl },
    ]
    hreflangs.forEach(({ hreflang, href }) => {
      const link = document.createElement('link')
      link.rel        = 'alternate'
      link.hreflang   = hreflang
      link.href       = href
      link.setAttribute('data-hreflang', 'true')
      document.head.appendChild(link)
    })

    /* ── JSON-LD schema — supports single object or array ── */
    if (schema) {
      removeAllPageSchemas()
      /* If schema is an array, write one <script> tag per item so
         Google can parse each type independently */
      const schemas = Array.isArray(schema) ? schema : [schema]
      schemas.filter(Boolean).forEach((item, i) => {
        const s = document.createElement('script')
        s.id         = i === 0 ? 'page-schema' : `page-schema-${i}`
        s.setAttribute('data-page-schema', 'true')
        s.type       = 'application/ld+json'
        s.textContent = JSON.stringify(item)
        document.head.appendChild(s)
      })
    }

    return () => {
      document.title = prev.title
      setMeta('meta[name="description"]',         'content', prev.description)
      setMeta('meta[property="og:title"]',        'content', prev.ogTitle)
      setMeta('meta[property="og:description"]',  'content', prev.ogDesc)
      setMeta('meta[property="og:url"]',          'content', prev.ogUrl)
      setMeta('meta[property="og:image"]',        'content', prev.ogImage)
      setMeta('meta[name="twitter:title"]',       'content', prev.twTitle)
      setMeta('meta[name="twitter:description"]', 'content', prev.twDesc)
      setMeta('meta[name="twitter:image"]',       'content', prev.twImage)
      setLink('link[rel="canonical"]',            'href',    prev.canonical)
      if (noindex) setMeta('meta[name="robots"]', 'content', prev.robots || DEFAULT_ROBOTS)
      removeHreflang()
      removeAllPageSchemas()
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [fullTitle, fullDesc, canonicalUrl, ogImage, noindex, JSON.stringify(schema), usUrl, ukUrl])

  return null
}

/* ── helpers ── */
function getMeta(sel, attr) {
  return document.querySelector(sel)?.getAttribute(attr) || ''
}
function getLink(sel, attr) {
  return document.querySelector(sel)?.getAttribute(attr) || ''
}
function setMeta(sel, attr, val) {
  const el = document.querySelector(sel)
  if (el && val) el.setAttribute(attr, val)
}
function setLink(sel, attr, val) {
  const el = document.querySelector(sel)
  if (el && val) el.setAttribute(attr, val)
}
function removeHreflang() {
  document.querySelectorAll('link[data-hreflang]').forEach(el => el.remove())
}
function removeAllPageSchemas() {
  document.querySelectorAll('script[data-page-schema]').forEach(el => el.remove())
  document.getElementById('page-schema')?.remove()
}
