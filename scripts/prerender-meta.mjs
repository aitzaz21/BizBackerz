/**
 * prerender-meta.js
 *
 * Runs after `vite build`. For each known route, it clones the built
 * index.html and injects the correct <title>, <meta description>,
 * <link rel="canonical">, and Open Graph tags.
 *
 * Apache's DirectoryIndex rule then serves each route's own index.html
 * directly — so Google sees the correct meta on the FIRST request,
 * without waiting for JavaScript to execute.
 *
 * Usage: node scripts/prerender-meta.js
 * Or via package.json: "build": "vite build && node scripts/prerender-meta.js"
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST      = join(__dirname, '../client/dist')
const BASE_URL  = 'https://bizbackerz.com'

/* ── Per-route meta ─────────────────────────────────────────── */
const ROUTES = [
  {
    path: '/about',
    title: 'About BizBackerz – Your Virtual Assistance Partner',
    description: 'BizBackerz is a UK-based virtual assistance agency helping 50+ businesses save 10+ hours a week. Expert VAs for admin, marketing, customer support, and more. 48-hour setup.',
  },
  {
    path: '/services',
    title: 'Virtual Assistant Services – 10 Premium Services | BizBackerz',
    description: 'Explore BizBackerz\'s 10 premium virtual assistant services: digital advertising, admin support, social media management, lead generation, customer support, and more.',
  },
  {
    path: '/services/digital-advertising',
    title: 'Google Ads & Digital Advertising Services | BizBackerz',
    description: 'Drive qualified leads with Google Local Service Ads, AI Max, and Performance Max campaigns. BizBackerz manages your digital advertising for 25% more inbound leads.',
  },
  {
    path: '/services/administrative-support',
    title: 'Virtual Administrative Assistant Services | BizBackerz',
    description: 'Reclaim 10+ hours a week with BizBackerz virtual administrative assistant services — calendar management, email handling, data entry, and document preparation.',
  },
  {
    path: '/services/customer-support',
    title: 'Virtual Customer Support Services | BizBackerz',
    description: 'Protect your reputation with BizBackerz virtual customer support — ticket management, live chat, and email support with a 2-hour average response time.',
  },
  {
    path: '/services/social-media-management',
    title: 'Social Media Management Services | BizBackerz',
    description: 'Grow your brand with BizBackerz social media management — consistent content, community engagement, and analytics across Instagram, Facebook, LinkedIn, and TikTok.',
  },
  {
    path: '/services/content-creation',
    title: 'Content Creation Services for Business | BizBackerz',
    description: 'SEO-optimized blog posts, email sequences, social media copy, and website content crafted in your brand voice. BizBackerz delivers 8+ pieces per month.',
  },
  {
    path: '/services/lead-generation',
    title: 'B2B Lead Generation Services | BizBackerz',
    description: 'Fill your pipeline with 30+ qualified leads per month. BizBackerz delivers B2B lead generation through targeted LinkedIn outreach and cold email campaigns.',
  },
  {
    path: '/services/project-management',
    title: 'Virtual Project Management Services | BizBackerz',
    description: 'Keep every deadline met with BizBackerz virtual project management — task coordination, stakeholder reporting, and workflow optimization. 100% on-time delivery.',
  },
  {
    path: '/services/accounting-services',
    title: 'Virtual Bookkeeping & Accounting Services | BizBackerz',
    description: 'Keep your books clean with BizBackerz virtual accounting services — daily bookkeeping, invoicing, bank reconciliation, and monthly financial reports.',
  },
  {
    path: '/services/marketing-support',
    title: 'Virtual Marketing Support Services | BizBackerz',
    description: 'Double your marketing output with BizBackerz virtual marketing support — campaign management, email marketing, ad copy, and weekly ROI reporting.',
  },
  {
    path: '/services/e-commerce-services',
    title: 'E-Commerce Virtual Assistant Services | Amazon & Shopify | BizBackerz',
    description: 'Streamline your online store with BizBackerz e-commerce virtual assistant — product listings, inventory management, order processing, and review management.',
  },
  {
    path: '/blog',
    title: 'Virtual Assistant Blog – Tips, Guides & Business Growth | BizBackerz',
    description: 'Expert insights on virtual assistance, business delegation, productivity, social media, lead generation, and scaling your business. Read the BizBackerz blog.',
  },
  {
    path: '/contact',
    title: 'Contact BizBackerz – Hire a Virtual Assistant',
    description: 'Get in touch with BizBackerz to hire a dedicated virtual assistant. Call (904) 668-6362 or email Hello@bizbackerz.com. Available Mon–Fri, 11:00 AM – 8:00 PM ET.',
  },
  {
    path: '/booking',
    title: 'Book a Free Consultation | BizBackerz Virtual Assistants',
    description: 'Schedule a free 30-minute discovery call with BizBackerz. Choose your time slot and start delegating your business tasks to expert virtual assistants within 48 hours.',
  },
  {
    path: '/reviews',
    title: 'Client Reviews & Testimonials | BizBackerz Virtual Assistants',
    description: 'Read 5-star Google reviews from real estate agents, e-commerce sellers, and business owners who use BizBackerz virtual assistant services.',
  },
  {
    path: '/faq',
    title: 'Virtual Assistant FAQ – Common Questions Answered | BizBackerz',
    description: 'Answers to the most common questions about BizBackerz virtual assistant services — setup time, pricing, tools, availability, and security.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | BizBackerz Virtual Assistance',
    description: 'BizBackerz privacy policy — how we collect, use, and protect your personal data when you use our virtual assistant services.',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | BizBackerz Virtual Assistance',
    description: 'BizBackerz terms and conditions governing the use of our virtual assistant services and client responsibilities.',
  },
]

/* ── Helpers ─────────────────────────────────────────────────── */
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function injectMeta(html, { path, title, description }) {
  const canonical  = `${BASE_URL}${path}`
  const safeTitle  = escapeHtml(title)
  const safeDesc   = escapeHtml(description)
  const safeCanon  = escapeHtml(canonical)

  /* Title */
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)

  /* Meta description */
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${safeDesc}" />`
  )
  html = html.replace(
    /<meta name="title"[^>]*>/,
    `<meta name="title" content="${safeTitle}" />`
  )

  /* OG tags */
  html = html.replace(/<meta property="og:title"[^>]*>/,       `<meta property="og:title" content="${safeTitle}" />`)
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${safeDesc}" />`)
  html = html.replace(/<meta property="og:url"[^>]*>/,          `<meta property="og:url" content="${safeCanon}" />`)

  /* Twitter */
  html = html.replace(/<meta name="twitter:title"[^>]*>/,       `<meta name="twitter:title" content="${safeTitle}" />`)
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${safeDesc}" />`)
  html = html.replace(/<meta name="twitter:url"[^>]*>/,         `<meta name="twitter:url" content="${safeCanon}" />`)

  /* Canonical */
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${safeCanon}" />`)

  /* hreflang — inject just before </head> */
  const hreflangTags = [
    `<link rel="alternate" hreflang="en-US"     href="${BASE_URL}${path}" />`,
    `<link rel="alternate" hreflang="en-GB"     href="https://bizbackerz.co.uk${path}" />`,
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}" />`,
  ].join('\n    ')
  html = html.replace('</head>', `  ${hreflangTags}\n  </head>`)

  return html
}

function writeRoute(html, routePath) {
  const dir  = join(DIST, routePath.replace(/^\//, ''))
  const file = join(dir, 'index.html')
  try {
    mkdirSync(dir, { recursive: true })
    writeFileSync(file, html, 'utf8')
    console.log(`  ✓ ${routePath}`)
  } catch (err) {
    console.error(`  ✗ ${routePath} — ${err.message}`)
    process.exit(1)
  }
}

/* ── Main ───────────────────────────────────────────────────── */
function run() {
  const indexPath = join(DIST, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('❌  dist/index.html not found — run `vite build` first.')
    process.exit(1)
  }

  const baseHtml = readFileSync(indexPath, 'utf8')
  console.log('\n📄  Injecting per-route meta tags...\n')

  for (const route of ROUTES) {
    const html = injectMeta(baseHtml, route)
    writeRoute(html, route.path)
  }

  console.log(`\n✅  Done — ${ROUTES.length} routes pre-rendered.\n`)
  console.log('Apache DirectoryIndex will now serve each route\'s own index.html,')
  console.log('so Google sees the correct title/canonical on the very first request.\n')
}

run()
