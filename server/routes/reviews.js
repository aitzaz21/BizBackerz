import express from 'express'
import Review from '../models/Review.js'

const router = express.Router()

/* ── GET /api/reviews ─────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ order: 1, createdAt: -1 }).lean()
    return res.json({ success: true, reviews })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
