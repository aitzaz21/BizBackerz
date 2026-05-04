import mongoose from 'mongoose'
import crypto from 'crypto'

const bookingSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  country:      { type: String, required: true },
  timezone:     { type: String, required: true },

  appointmentUTC: { type: Date, required: true },

  // Pre-formatted strings for emails (computed at booking time, never re-derived)
  slotDisplayUser: { type: String },  // e.g. "Tue, Apr 29 · 10:30 AM ET"
  slotDisplayPKT:  { type: String },  // e.g. "Tue, Apr 29 · 8:00 PM PKT"

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  confirmToken: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex'),
  },
  confirmedAt: { type: Date },
}, { timestamps: true })

bookingSchema.index({ appointmentUTC: 1, status: 1 })

export default mongoose.model('Booking', bookingSchema)
