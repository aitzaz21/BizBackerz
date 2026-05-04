import express from 'express'
import Blog from '../models/Blog.js'

const router = express.Router()

/* ── GET /api/blogs ─────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { tag, search, featured, page = 1, limit = 12 } = req.query
    const filter = { published: true }
    if (tag && tag !== 'all') filter.tag = tag
    if (featured === 'true') filter.featured = true
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tag: { $regex: search, $options: 'i' } },
    ]

    const total = await Blog.countDocuments(filter)
    const blogs = await Blog.find(filter, { content: 0 })   // strip content for list
      .sort({ featured: -1, createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean()

    const tags = await Blog.distinct('tag', { published: true })

    return res.json({ success: true, blogs, total, page: +page, pages: Math.ceil(total / +limit), tags })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── GET /api/blogs/:slug ──────────────────────────────────── */
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
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
