import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import exampleRoutes from './routes/example.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bizbackerz-api', timestamp: new Date().toISOString() })
})

app.use('/api', exampleRoutes)



app.listen(PORT, () => console.log(`🚀 BizBackerz API → http://localhost:${PORT}`))
export default app
