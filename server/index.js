import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'
import bookingRoutes from './routes/bookings.js'
import blogRoutes from './routes/blogs.js'
import adminRoutes from './routes/admin.js'
import reviewRoutes from './routes/reviews.js'
import teamRoutes from './routes/team.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
dotenv.config({ path: resolve(__dirname, '.env') })

const app  = express()
const PORT = process.env.PORT || 3001

// ── Security headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,   // CSP handled by the frontend build
}))

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://bizbackerz.com',
  'https://www.bizbackerz.com',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

// ── MongoDB ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1) })

// ── Routes ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bizbackerz-api', timestamp: new Date().toISOString() })
})

app.use('/api', apiRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/team', teamRoutes)

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`BizBackerz API running on port ${PORT}`))
export default app
