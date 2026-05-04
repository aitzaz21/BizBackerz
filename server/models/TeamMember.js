import mongoose from 'mongoose'

const TeamMemberSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  position:    { type: String, required: true, trim: true },
  email:       { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  specialties: [{ type: String, trim: true }],
  socials: {
    linkedin:  { type: String, default: '' },
    twitter:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    website:   { type: String, default: '' },
  },
  avatar:    { type: String, default: '' },
  initials:  { type: String, default: '' },
  color:     { type: String, default: '#2a8bff' },
  order:     { type: Number, default: 0 },
  visible:   { type: Boolean, default: true },
}, { timestamps: true })

TeamMemberSchema.index({ order: 1, createdAt: 1 })

export default mongoose.model('TeamMember', TeamMemberSchema)
