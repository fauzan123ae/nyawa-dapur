import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query, queryOne } from '../db/index.js'

const formatUser = (u) => ({
  id:            u.id,
  name:          u.name,
  email:         u.email,
  xp:            u.xp,
  level:         u.level,
  firewood:      u.firewood,
  currentStreak: u.current_streak,
  lastActiveAt:  u.last_active_at,
})

const makeToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

export async function register(req, res) {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(422).json({ message: 'Semua field wajib diisi.' })
  if (password.length < 8)
    return res.status(422).json({ message: 'Password minimal 8 karakter.' })

  try {
    const exists = await queryOne('SELECT id FROM users WHERE email=$1', [email])
    if (exists) return res.status(422).json({ message: 'Email sudah terdaftar.' })

    const hashed = await bcrypt.hash(password, 12)
    const result = await query(
      `INSERT INTO users (name,email,password,xp,level,firewood,current_streak)
       VALUES ($1,$2,$3,0,1,10,0) RETURNING *`,
      [name, email, hashed]
    )
    const user = result.rows[0]

    // Buat household untuk user baru
    const crypto = await import('crypto')
    const inviteCode = crypto.randomBytes(4).toString('hex')
    const hhRes = await query(
      `INSERT INTO households (name, owner_id, invite_code) VALUES ($1, $2, $3) RETURNING id`,
      [`Dapur ${user.name}`, user.id, inviteCode]
    )
    const hhId = hhRes.rows[0].id

    // Tambahkan user sebagai owner di household_members
    await query(
      `INSERT INTO household_members (household_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [hhId, user.id]
    )

    // Set householdId di user object untuk konsistensi
    user.householdId = hhId

    return res.status(201).json({ token: makeToken(user), user: formatUser(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}

export async function login(req, res) {
  const { email, password } = req.body
  try {
    const user = await queryOne('SELECT * FROM users WHERE email=$1', [email])
    if (!user) return res.status(401).json({ message: 'Email atau password salah.' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Email atau password salah.' })

    return res.json({ token: makeToken(user), user: formatUser(user) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}

export async function logout(req, res) {
  return res.json({ message: 'Logout berhasil.' })
}

export async function me(req, res) {
  return res.json(formatUser(req.user))
}