import jwt from 'jsonwebtoken'

/* Parse cookies from the raw Cookie header without a dependency on cookie-parser */
function getCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k.trim() === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export default function authMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET
  if (!secret) return res.status(500).json({ success: false, error: 'Server misconfiguration.' })

  /* Prefer httpOnly cookie (XSS-resistant); fall back to Authorization header
     so existing clients using localStorage tokens keep working during transition. */
  const cookieToken = getCookie(req, 'biz_admin')
  const header      = req.headers.authorization || ''
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null
  const token       = cookieToken || bearerToken

  if (!token) return res.status(401).json({ success: false, error: 'No token provided.' })

  try {
    req.admin = jwt.verify(token, secret)
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' })
  }
}
