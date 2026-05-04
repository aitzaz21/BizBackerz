import jwt from 'jsonwebtoken'

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ success: false, error: 'No token provided.' })

  const secret = process.env.JWT_SECRET
  if (!secret) return res.status(500).json({ success: false, error: 'Server misconfiguration.' })

  try {
    req.admin = jwt.verify(token, secret)
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' })
  }
}
