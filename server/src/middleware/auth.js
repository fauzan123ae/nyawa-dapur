import jwt from 'jsonwebtoken'
import { queryOne } from '../db/index.js'

// Simple in-memory user cache (TTL 30 detik)
// Mengurangi query DB di setiap request
// Cache menyimpan user + householdId yang sudah di-resolve
const userCache = new Map()
const CACHE_TTL = 30_000 // 30 detik

function getCached(userId, requestedHouseholdId) {
  const entry = userCache.get(userId)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    userCache.delete(userId)
    return null
  }
  // Jika header x-household-id berubah dari yang di-cache, invalidate
  // agar householdId di-resolve ulang
  if (requestedHouseholdId && entry.householdId !== Number(requestedHouseholdId)) {
    return null
  }
  return entry
}

function setCache(userId, user, householdId) {
  userCache.set(userId, { user, householdId, ts: Date.now() })
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
    const activeHouseholdId = req.headers['x-household-id']

    // Cek cache dulu — termasuk householdId yang sudah di-resolve
    const cached = getCached(decoded.id, activeHouseholdId)
    if (cached) {
      req.user = { ...cached.user, householdId: cached.householdId }
      return next()
    }

    // Cache miss — query DB
    const dbUser = await queryOne('SELECT * FROM users WHERE id = $1', [decoded.id])
    if (!dbUser) return res.status(401).json({ message: 'User tidak ditemukan.' })

    const user = { ...dbUser }
    let resolvedHouseholdId = null

    // Resolve householdId
    if (activeHouseholdId) {
      const membership = await queryOne(
        'SELECT household_id FROM household_members WHERE user_id = $1 AND household_id = $2',
        [user.id, activeHouseholdId]
      )
      if (membership) {
        resolvedHouseholdId = membership.household_id
      }
    }

    if (!resolvedHouseholdId) {
      const personalHh = await queryOne(
        `SELECT h.id FROM households h JOIN household_members hm ON h.id = hm.household_id 
         WHERE hm.user_id = $1 AND h.owner_id = $1 AND h.name = $2 LIMIT 1`,
        [user.id, `Dapur ${user.name}`]
      )
      if (personalHh) {
        resolvedHouseholdId = personalHh.id
      } else {
        const anyHh = await queryOne('SELECT household_id FROM household_members WHERE user_id = $1 LIMIT 1', [user.id])
        resolvedHouseholdId = anyHh ? anyHh.household_id : null
      }
    }

    user.householdId = resolvedHouseholdId

    // Simpan ke cache: user + householdId
    setCache(decoded.id, user, resolvedHouseholdId)

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluwarsa.' })
  }
}
