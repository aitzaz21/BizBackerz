import express from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import Blog from '../models/Blog.js'
import Review from '../models/Review.js'
import TeamMember from '../models/TeamMember.js'
import SiteSettings from '../models/SiteSettings.js'
import auth from '../middleware/auth.js'
import cloudinary from '../services/cloudinary.js'

const router = express.Router()
const JWT_SECRET  = () => process.env.JWT_SECRET
const ADMIN_EMAIL = () => process.env.ADMIN_PANEL_EMAIL || process.env.ADMIN_EMAIL || ''
const ADMIN_PASS  = () => process.env.ADMIN_PASSWORD || ''

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
})

/* ── POST /api/admin/login ─────────────────────────────────── */
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ success: false, error: 'Email and password required.' })

  const secret = JWT_SECRET()
  if (!secret) return res.status(500).json({ success: false, error: 'Server misconfiguration.' })

  if (email.trim().toLowerCase() !== ADMIN_EMAIL().trim().toLowerCase() || password !== ADMIN_PASS())
    return res.status(401).json({ success: false, error: 'Invalid credentials.' })

  const token = jwt.sign({ email: email.trim().toLowerCase(), role: 'admin' }, secret, { expiresIn: '7d' })
  return res.json({ success: true, token })
})

/* ── GET /api/admin/verify ─────────────────────────────────── */
router.get('/verify', auth, (req, res) => res.json({ success: true, admin: req.admin }))

/* ── POST /api/admin/upload ────────────────────────────────── */
router.post('/upload', auth, async (req, res) => {
  try {
    const { data, folder = 'bizbackerz' } = req.body
    if (!data) return res.status(400).json({ success: false, error: 'No image data provided.' })
    const result = await cloudinary.uploader.upload(data, { folder })
    return res.json({ success: true, url: result.secure_url })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ═══════════════════════════════════════════════════════════
   BLOG ROUTES
═══════════════════════════════════════════════════════════ */

/* ── GET /api/admin/blogs ──────────────────────────────────── */
router.get('/blogs', auth, async (req, res) => {
  try {
    const { search, tag, published, page = 1, limit = 20 } = req.query
    const filter = {}
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tag:   { $regex: search, $options: 'i' } },
    ]
    if (tag && tag !== 'all') filter.tag = tag
    if (published !== undefined) filter.published = published === 'true'

    const total = await Blog.countDocuments(filter)
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean()

    return res.json({ success: true, blogs, total, page: +page, pages: Math.ceil(total / +limit) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── POST /api/admin/blogs ─────────────────────────────────── */
router.post('/blogs', auth, async (req, res) => {
  try {
    const data = req.body
    if (!data.title || !data.content)
      return res.status(400).json({ success: false, error: 'Title and content are required.' })

    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
    }

    const words = data.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length
    data.readTime = Math.max(1, Math.round(words / 200))

    const blog = await new Blog(data).save()
    return res.status(201).json({ success: true, blog })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'A blog with that slug already exists.' })
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── PUT /api/admin/blogs/:id ──────────────────────────────── */
router.put('/blogs/:id', auth, async (req, res) => {
  try {
    const data = req.body
    if (data.content) {
      const words = data.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length
      data.readTime = Math.max(1, Math.round(words / 200))
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' })
    return res.json({ success: true, blog })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── DELETE /api/admin/blogs/:id ───────────────────────────── */
router.delete('/blogs/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id)
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' })
    return res.json({ success: true, message: 'Blog deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── POST /api/admin/blogs/:id/publish ─────────────────────── */
router.post('/blogs/:id/publish', auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, { published: true }, { new: true })
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found.' })
    return res.json({ success: true, blog })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── POST /api/admin/blogs/seed ────────────────────────────── */
router.post('/blogs/seed', auth, async (req, res) => {
  try {
    const count = await Blog.countDocuments()
    if (count > 0) return res.json({ success: true, message: 'Already seeded — skipped.' })

    const seeds = req.body.blogs || []
    if (!seeds.length) return res.status(400).json({ success: false, error: 'No seed data provided.' })

    await Blog.insertMany(seeds)
    return res.json({ success: true, message: `Seeded ${seeds.length} blogs.` })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ═══════════════════════════════════════════════════════════
   REVIEW ROUTES
═══════════════════════════════════════════════════════════ */

/* ── GET /api/admin/reviews ────────────────────────────────── */
router.get('/reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ order: 1, createdAt: -1 }).lean()
    return res.json({ success: true, reviews })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── POST /api/admin/reviews ───────────────────────────────── */
router.post('/reviews', auth, async (req, res) => {
  try {
    const data = req.body
    if (!data.name || !data.text)
      return res.status(400).json({ success: false, error: 'Name and review text are required.' })

    if (!data.initials) {
      data.initials = data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }

    const review = await new Review(data).save()
    return res.status(201).json({ success: true, review })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── PUT /api/admin/reviews/:id ────────────────────────────── */
router.put('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!review) return res.status(404).json({ success: false, error: 'Review not found.' })
    return res.json({ success: true, review })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── DELETE /api/admin/reviews/:id ─────────────────────────── */
router.delete('/reviews/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ success: false, error: 'Review not found.' })
    return res.json({ success: true, message: 'Review deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ═══════════════════════════════════════════════════════════
   TEAM ROUTES
═══════════════════════════════════════════════════════════ */

/* ── GET /api/admin/team ───────────────────────────────────── */
router.get('/team', auth, async (req, res) => {
  try {
    const [members, settingsDoc] = await Promise.all([
      TeamMember.find().sort({ order: 1, createdAt: 1 }).lean(),
      SiteSettings.findOne({ key: 'team' }).lean(),
    ])
    return res.json({ success: true, members, settings: settingsDoc?.value || {} })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── POST /api/admin/team ──────────────────────────────────── */
router.post('/team', auth, async (req, res) => {
  try {
    const data = req.body
    if (!data.name || !data.position)
      return res.status(400).json({ success: false, error: 'Name and position are required.' })
    if (!data.initials)
      data.initials = data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const member = await new TeamMember(data).save()
    return res.status(201).json({ success: true, member })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── PUT /api/admin/team/:id ───────────────────────────────── */
router.put('/team/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!member) return res.status(404).json({ success: false, error: 'Team member not found.' })
    return res.json({ success: true, member })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── DELETE /api/admin/team/:id ────────────────────────────── */
router.delete('/team/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ success: false, error: 'Team member not found.' })
    return res.json({ success: true, message: 'Team member deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/* ── PUT /api/admin/team-settings ──────────────────────────── */
router.put('/team-settings', auth, async (req, res) => {
  try {
    const doc = await SiteSettings.findOneAndUpdate(
      { key: 'team' },
      { value: req.body },
      { upsert: true, new: true },
    )
    return res.json({ success: true, settings: doc.value })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
