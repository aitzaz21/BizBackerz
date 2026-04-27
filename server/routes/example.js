import express from 'express'
const router = express.Router()

router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body
    if (!name || !email || !message) return res.status(400).json({ success: false, error: 'Name, email, and message required.' })
    console.log('📧 Contact:', { name, email, phone })
    return res.json({ success: true, message: 'Thank you! We will get back to you shortly.' })
  } catch (err) { return res.status(500).json({ success: false, error: 'Server error.' }) }
})

router.post('/lead', async (req, res) => {
  try {
    const { name, email, company, service } = req.body
    if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email required.' })
    console.log('🎯 Lead:', { name, email, company, service })
    return res.json({ success: true, message: 'We received your request.' })
  } catch (err) { return res.status(500).json({ success: false, error: 'Server error.' }) }
})

router.get('/services', (req, res) => {
  res.json({ success: true, data: [
    'Administrative Support', 'Accounting Services', 'Social Media Management',
    'Marketing Support', 'Content Creation', 'Customer Support',
    'Lead Generation', 'Project Management', 'E-Commerce Services',
  ]})
})

export default router
