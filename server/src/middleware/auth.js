import jwt from 'jsonwebtoken'
import { queryOne } from '../db/index.js'

// Simple in-memory user cache (TTL 30 detik)
// Mengurangi query DB di setiap request
const userCache = new Map()
const CACHE_TTL = 30_000 // 30 detik

function getCached(userId) {
  const entry = userCache.get(userId)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    userCache.delete(userId)
    return null
  }
  return entry.user
}

function setCache(userId, user) {
  userCache.set(userId, { user, ts: Date.now() })
  // Bersihkan cache lama (max 500 entry)
  if (userCache.size > 500) {
    const firstKey = userCache.keys().next().value
    userCache.delete(firstKey)
  }
}

// Export untuk di-invalidate dari controller saat data user berubah
export function invalidateUserCache(userId) {
  userCache.delete(userId)
}

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Cek cache dulu sebelum query DB
    let user = getCached(decoded.id)
    if (!user) {
      user = await queryOne('SELECT * FROM users WHERE id = $1', [decoded.id])
      if (!user) return res.status(401).json({ message: 'User tidak ditemukan.' })
      setCache(decoded.id, user)
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluwarsa.' })
  }
}
