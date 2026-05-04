import express from 'express'
import Booking from '../models/Booking.js'
import {
  sendConfirmationEmail,
  sendAdminNewBooking,
  sendBookingConfirmedToUser,
  sendAdminConfirmed,
} from '../services/emailService.js'

const router = express.Router()

/* Determine ET UTC offset (4 for EDT, 5 for EST) for a given YYYY-MM-DD */
function getETOffset(dateStr) {
  const testUTC = new Date(`${dateStr}T16:00:00Z`)
  const etHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: '2-digit', hour12: false,
    }).format(testUTC)
  )
  return 16 - (etHour < 0 ? etHour + 24 : etHour)
}

/* Get office-hours UTC window: 11:00 AM – 8:00 PM Eastern for a given date */
function getETWindow(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const offset = getETOffset(dateStr)
  const startUTCHour = 11 + offset
  const endUTCHour   = 20 + offset
  const windowStart = new Date(Date.UTC(y, m - 1, d + Math.floor(startUTCHour / 24), startUTCHour % 24, 0, 0))
  const windowEnd   = new Date(Date.UTC(y, m - 1, d + Math.floor(endUTCHour   / 24), endUTCHour   % 24, 0, 0))
  return { windowStart, windowEnd }
}

/* ── GET /api/bookings/slots/:date
   Returns ISO strings of already-taken slots for a given YYYY-MM-DD (ET date).
   Office window: 11:00 AM – 8:00 PM Eastern Time. ── */
router.get('/slots/:date', async (req, res) => {
  try {
    const { date } = req.params
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD.' })
    }

    const { windowStart, windowEnd } = getETWindow(date)

    const taken = await Booking.find({
      appointmentUTC: { $gte: windowStart, $lt: windowEnd },
      status: { $in: ['pending', 'confirmed'] },
    }).select('appointmentUTC -_id')

    res.json({ success: true, bookedSlots: taken.map(b => b.appointmentUTC.toISOString()) })
  } catch (err) {
    console.error('slots error:', err)
    res.status(500).json({ success: false, error: 'Could not fetch slot availability.' })
  }
})

/* ── POST /api/bookings
   Create a new pending booking. ── */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, country, timezone, appointmentUTC, slotDisplayUser, slotDisplayET } = req.body

    if (!name || !email || !phone || !country || !timezone || !appointmentUTC) {
      return res.status(400).json({ success: false, error: 'All fields are required.' })
    }

    // Basic email format guard
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' })
    }

    const apptDate = new Date(appointmentUTC)
    if (isNaN(apptDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid appointment time.' })
    }

    // Slot must be in the future
    if (apptDate <= new Date()) {
      return res.status(400).json({ success: false, error: 'Please select a future time slot.' })
    }

    // Check slot availability (race-condition-safe: use findOneAndUpdate later if needed)
    const conflict = await Booking.findOne({
      appointmentUTC: apptDate,
      status: { $in: ['pending', 'confirmed'] },
    })
    if (conflict) {
      return res.status(409).json({ success: false, error: 'This slot was just taken. Please choose another time.' })
    }

    const booking = await Booking.create({
      name, email, phone, country, timezone,
      appointmentUTC: apptDate,
      slotDisplayUser: slotDisplayUser || appointmentUTC,
      slotDisplayPKT:  slotDisplayET   || appointmentUTC,
    })

    // Fire-and-forget emails
    sendConfirmationEmail(booking).catch(e => console.error('confirm email:', e.message))
    sendAdminNewBooking(booking).catch(e => console.error('admin email:', e.message))

    res.status(201).json({ success: true, message: 'Booking created. Please confirm via the email we sent you.' })
  } catch (err) {
    console.error('booking create error:', err)
    res.status(500).json({ success: false, error: 'Failed to create booking. Please try again.' })
  }
})

/* ── GET /api/bookings/confirm/:token
   Confirm a booking via email link. Redirects to the frontend. ── */
router.get('/confirm/:token', async (req, res) => {
  const client = process.env.CLIENT_URL || 'http://localhost:5173'

  try {
    const booking = await Booking.findOne({ confirmToken: req.params.token })

    if (!booking) {
      return res.redirect(`${client}/booking?status=invalid`)
    }

    if (booking.status === 'confirmed') {
      return res.redirect(
        `${client}/booking?status=already-confirmed&name=${encodeURIComponent(booking.name)}`
      )
    }

    // Expire after 24 hours
    const ageHours = (Date.now() - booking.createdAt.getTime()) / 3_600_000
    if (ageHours > 24) {
      return res.redirect(`${client}/booking?status=expired`)
    }

    booking.status = 'confirmed'
    booking.confirmedAt = new Date()
    await booking.save()

    sendBookingConfirmedToUser(booking).catch(e => console.error('confirmed user email:', e.message))
    sendAdminConfirmed(booking).catch(e => console.error('confirmed admin email:', e.message))

    return res.redirect(
      `${client}/booking?status=confirmed` +
      `&name=${encodeURIComponent(booking.name)}` +
      `&slot=${encodeURIComponent(booking.slotDisplayUser)}`
    )
  } catch (err) {
    console.error('confirm error:', err)
    res.redirect(`${client}/booking?status=error`)
  }
})

export default router
