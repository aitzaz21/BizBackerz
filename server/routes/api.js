import express from 'express'
import { sendAdminContactAlert } from '../services/emailService.js'
import Contact from '../models/Contact.js'

const router = express.Router()

const MAX_NAME    = 100
const MAX_EMAIL   = 254
const MAX_PHONE   = 30
const MAX_MESSAGE = 5000

router.post('/contact', async (req, res) => {
  try {
    /* Trim before required check — whitespace-only values must not pass */
    const name    = String(req.body.name    || '').trim().slice(0, MAX_NAME)
    const email   = String(req.body.email   || '').trim().slice(0, MAX_EMAIL)
    const phone   = String(req.body.phone   || '').trim().slice(0, MAX_PHONE)
    const message = String(req.body.message || '').trim().slice(0, MAX_MESSAGE)

    if (!name || !email || !message)
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' })

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' })

    await Contact.create({ name, email, phone, message })

    sendAdminContactAlert({ name, email, phone, message })
      .catch(e => console.error('admin contact email error:', e.message))

    return res.json({ success: true, message: 'Thank you! We will get back to you within 24 hours.' })
  } catch (err) {
    console.error('contact route error:', err.message)
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' })
  }
})

router.post('/lead', async (req, res) => {
  try {
    /* Trim before required check */
    const name    = String(req.body.name    || '').trim().slice(0, MAX_NAME)
    const email   = String(req.body.email   || '').trim().slice(0, MAX_EMAIL)
    const company = String(req.body.company || '').trim().slice(0, 200)
    const service = String(req.body.service || '').trim().slice(0, 200)

    if (!name || !email)
      return res.status(400).json({ success: false, error: 'Name and email required.' })

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' })

    void company; void service  // captured but not yet persisted — reserved for future Lead model
    return res.json({ success: true, message: 'We received your request.' })
  } catch {
    return res.status(500).json({ success: false, error: 'Server error.' })
  }
})

router.get('/services', (req, res) => {
  res.json({ success: true, data: [
    'Administrative Support', 'Accounting Services', 'Social Media Management',
    'Marketing Support', 'Content Creation', 'Customer Support',
    'Lead Generation', 'Project Management', 'E-Commerce Services',
  ]})
})

export default router
