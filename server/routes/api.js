import express from 'express'
import { sendContactFormEmail, sendAdminContactAlert } from '../services/emailService.js'

const router = express.Router()

const MAX_NAME    = 100
const MAX_EMAIL   = 254
const MAX_PHONE   = 30
const MAX_MESSAGE = 5000

router.post('/contact', async (req, res) => {
  try {
    let { name, email, phone, message } = req.body

    if (!name || !email || !message)
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' })

    name    = String(name).trim().slice(0, MAX_NAME)
    email   = String(email).trim().slice(0, MAX_EMAIL)
    phone   = phone ? String(phone).trim().slice(0, MAX_PHONE) : ''
    message = String(message).trim().slice(0, MAX_MESSAGE)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' })

    sendAdminContactAlert({ name, email, phone, message })
      .catch(e => console.error('admin contact email error:', e.message))
    sendContactFormEmail({ name, email, phone, message })
      .catch(e => console.error('user contact email error:', e.message))

    return res.json({ success: true, message: 'Thank you! We will get back to you within 24 hours.' })
  } catch (err) {
    console.error('contact route error:', err.message)
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' })
  }
})

router.post('/lead', async (req, res) => {
  try {
    let { name, email, company, service } = req.body
    if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email required.' })
    name    = String(name).trim().slice(0, MAX_NAME)
    email   = String(email).trim().slice(0, MAX_EMAIL)
    company = company ? String(company).trim().slice(0, 200) : ''
    service = service ? String(service).trim().slice(0, 200) : ''
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
