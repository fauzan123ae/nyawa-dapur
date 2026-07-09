import jwt from 'jsonwebtoken'
import { queryOne } from '../db/index.js'

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await queryOne('SELECT * FROM users WHERE id = $1', [decoded.id])
    if (!user) return res.status(401).json({ message: 'User tidak ditemukan.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluwarsa.' })
  }
}