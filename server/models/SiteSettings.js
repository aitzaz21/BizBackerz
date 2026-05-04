import mongoose from 'mongoose'

const SiteSettingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

export default mongoose.model('SiteSettings', SiteSettingsSchema)
