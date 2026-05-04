import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  initials: { type: String, required: true, trim: true },
  role:     { type: String, default: '', trim: true },
  rating:   { type: Number, default: 5, min: 1, max: 5 },
  date:     { type: String, required: true },
  text:     { type: String, required: true },
  helpful:  { type: Number, default: 0 },
  color:    { type: String, default: '#2a8bff' },
  verified: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true })

ReviewSchema.index({ order: 1, createdAt: -1 })

export default mongoose.model('Review', ReviewSchema)
