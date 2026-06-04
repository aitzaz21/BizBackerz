import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  slug:           { type: String, required: true, unique: true, trim: true, lowercase: true },
  excerpt:        { type: String, required: true, trim: true, maxlength: 400 },
  content:        { type: String, required: true },       // HTML rich text
  tag:            { type: String, default: 'General', trim: true },
  category:       { type: String, default: 'General', trim: true },
  color:          { type: String, default: '#2a8bff' },
  coverImage:     { type: String, default: '' },          // URL
  author:         { type: String, default: 'BizBackerz Team', trim: true },
  authorBio:      { type: String, default: '' },
  authorAvatar:   { type: String, default: '' },
  readTime:       { type: Number, default: 5 },           // minutes
  seoTitle:           { type: String, default: '' },
  seoDescription:     { type: String, default: '' },
  seoKeywords:        { type: String, default: '' },
  focusKeyword:       { type: String, default: '' },   // primary target search term
  noindex:            { type: Boolean, default: false }, // true = noindex,nofollow
  ogImage:            { type: String, default: '' },
  ogImageAlt:         { type: String, default: '' },   // OG image alt text (1200×630)
  coverImageAlt:      { type: String, default: '' },   // featured image alt text
  twitterTitle:       { type: String, default: '' },   // twitter:title override
  twitterDescription: { type: String, default: '' },   // twitter:description override
  qna:            [{ question: { type: String, default: '' }, answer: { type: String, default: '' } }],
  published:      { type: Boolean, default: false },
  featured:       { type: Boolean, default: false },
  views:          { type: Number, default: 0 },
}, { timestamps: true })

BlogSchema.index({ slug: 1 })
BlogSchema.index({ published: 1, createdAt: -1 })
BlogSchema.index({ tag: 1 })

export default mongoose.model('Blog', BlogSchema)
