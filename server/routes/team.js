import express from 'express'
import TeamMember from '../models/TeamMember.js'
import SiteSettings from '../models/SiteSettings.js'

const router = express.Router()

const DEFAULT_SETTINGS = {
  gridCols: 3,
  sectionTitle: 'People Who Treat Your Work Like Their Own',
  sectionSubtitle: 'Experienced operators, not order-takers. Our team is meticulously selected for their problem-solving skills, operational instinct, and dedication to excellence.',
}

/* ── GET /api/team ─────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const [members, settingsDoc] = await Promise.all([
      TeamMember.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean(),
      SiteSettings.findOne({ key: 'team' }).lean(),
    ])
    const settings = { ...DEFAULT_SETTINGS, ...(settingsDoc?.value || {}) }
    return res.json({ success: true, members, settings })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
