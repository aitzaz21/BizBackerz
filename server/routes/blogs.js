import express from 'express'
import rateLimit from 'express-rate-limit'
import Blog from '../models/Blog.js'

const router = express.Router()

/* Escape regex meta-characters so user search input is never treated as a pattern */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/* One view increment per IP per slug per minute — prevents trivial bot inflation */
const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  keyGenerator: (req) => `view:${req.ip}:${req.params.slug}`,
  standardHeaders: false,
  legacyHeaders: false,
})

/* ── GET /api/sitemap-blog.xml ──────────────────────────────── */
router.get('/sitemap-blog.xml', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }, { slug: 1, updatedAt: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean()

    const urls = blogs.map(b => {
      const lastmod = (b.updatedAt || b.createdAt).toISOString().split('T')[0]
      return `  <url>\n    <loc>https://bizbackerz.com/blog/${b.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    }).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    return res.send(xml)
  } catch (err) {
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>')
  }
})

/* ── GET /api/blogs ─────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { tag, search, featured, page = 1 } = req.query
    const limit = Math.min(Math.max(1, +req.query.limit || 12), 100)
    const filter = { published: true }
    if (tag && tag !== 'all') filter.tag = tag
    if (featured === 'true') filter.featured = true
    if (search) {
      const safe = escapeRegex(String(search).slice(0, 200))
      filter.$or = [
        { title:   { $regex: safe, $options: 'i' } },
        { excerpt: { $regex: safe, $options: 'i' } },
        { tag:     { $regex: safe, $options: 'i' } },
      ]
    }

    const total = await Blog.countDocuments(filter)
    const blogs = await Blog.find(filter, { content: 0 })   // strip content for list
      .sort({ featured: -1, createdAt: -1 })
      .skip((Math.max(1, +page) - 1) * limit)
      .limit(limit)
      .lean()

    const tags = await Blog.distinct('tag', { published: true })

    return res.json({ success: true, blogs, total, page: +page, pages: Math.ceil(total / limit), tags })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── GET /api/blogs/:slug ──────────────────────────────────── */
router.get('/:slug', viewLimiter, async (req, res) => {
  try {
    /* viewLimiter lets the request through either way; check its header to
       decide whether to count this visit — avoids rate-limit 429 on readers */
    const rateHit = res.getHeader('X-RateLimit-Remaining') === '0'

    const blog = rateHit
      ? await Blog.findOne({ slug: req.params.slug, published: true }).lean()
      : await Blog.findOneAndUpdate(
          { slug: req.params.slug, published: true },
          { $inc: { views: 1 } },
          { new: true },
        ).lean()

    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' })

    const related = await Blog.find(
      { published: true, tag: blog.tag, _id: { $ne: blog._id } },
      { content: 0 },
    ).sort({ createdAt: -1 }).limit(3).lean()

    return res.json({ success: true, blog, related })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
