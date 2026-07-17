/**
 * Auth Controller Tests
 * 
 * Tests for: register, login, logout, me, updateProfile, changePassword
 * All DB calls are mocked — no real PostgreSQL needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// ─── Import mocked DB ──────────────────────────────────────────────────────────
import { query, queryOne } from '../db/index.js'

// ─── Import controllers ────────────────────────────────────────────────────────
import { register, login, logout, me, updateProfile, changePassword } from '../controllers/authController.js'
import { authenticate, invalidateUserCache } from '../middleware/auth.js'

// ─── Helper: build Express app for testing ──────────────────────────────────────
function buildApp() {
  const app = express()
  app.use(express.json())

  // Public routes
  app.post('/api/auth/register', register)
  app.post('/api/auth/login', login)

  // Protected routes (need authenticate middleware)
  app.post('/api/auth/logout', authenticate, logout)
  app.get('/api/auth/me', authenticate, me)
  app.patch('/api/auth/profile', authenticate, updateProfile)
  app.post('/api/auth/change-password', authenticate, changePassword)

  return app
}

// ─── Helper: generate a valid JWT for testing ───────────────────────────────────
function makeTestToken(userId = 1) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

// ─── Helper: mock authenticated user in DB ──────────────────────────────────────
function mockAuthenticatedUser(user = {}) {
  const defaultUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    xp: 100,
    level: 1,
    firewood: 5,
    current_streak: 3,
    last_active_at: new Date().toISOString(),
  }
  const merged = { ...defaultUser, ...user }

  // Invalidate the user cache so authenticate re-queries
  invalidateUserCache(merged.id)

  queryOne.mockImplementation(async (sql, params) => {
    if (sql.includes('FROM users WHERE id')) return { ...merged }
    if (sql.includes('FROM household_members WHERE user_id') && sql.includes('household_id')) return { household_id: 1 }
    if (sql.includes('FROM households h JOIN')) return { id: 1 }
    return null
  })

  return merged
}

// ─────────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────────

describe('Auth Controller', () => {
  let app

  beforeEach(() => {
    vi.clearAllMocks()
    // Invalidate any cached user from previous tests
    invalidateUserCache(1)
    app = buildApp()
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // REGISTER
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/register', () => {
    it('should return 422 when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' }) // missing email & password

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Semua field wajib diisi.')
    })

    it('should return 422 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: '123' })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Password minimal 8 karakter.')
    })

    it('should return 422 when email already exists', async () => {
      queryOne.mockResolvedValueOnce({ id: 99 }) // email exists

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'taken@test.com', password: 'password123' })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Email sudah terdaftar.')
    })

    it('should register successfully and return token + user', async () => {
      const newUser = {
        id: 1,
        name: 'New User',
        email: 'new@test.com',
        xp: 0,
        level: 1,
        firewood: 10,
        current_streak: 0,
        last_active_at: null,
      }

      queryOne.mockResolvedValueOnce(null) // email doesn't exist
      query.mockResolvedValueOnce({ rows: [newUser] }) // INSERT user
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT household
      query.mockResolvedValueOnce({ rows: [] }) // INSERT household_member

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@test.com', password: 'password123' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.name).toBe('New User')
      expect(res.body.user.email).toBe('new@test.com')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/login', () => {
    it('should return 401 when email is wrong', async () => {
      queryOne.mockResolvedValueOnce(null)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'password123' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Email atau password salah.')
    })

    it('should return 401 when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correct_password', 12)
      queryOne.mockResolvedValueOnce({
        id: 1, name: 'User', email: 'user@test.com', password: hashedPassword,
        xp: 0, level: 1, firewood: 5, current_streak: 0, last_active_at: null,
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'wrong_password' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Email atau password salah.')
    })

    it('should login successfully and return token + user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12)
      queryOne.mockResolvedValueOnce({
        id: 1, name: 'User', email: 'user@test.com', password: hashedPassword,
        xp: 50, level: 2, firewood: 3, current_streak: 5, last_active_at: new Date().toISOString(),
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.name).toBe('User')
      expect(res.body.user.email).toBe('user@test.com')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/logout', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).post('/api/auth/logout')
      expect(res.status).toBe(401)
    })

    it('should logout successfully with valid token', async () => {
      mockAuthenticatedUser()
      const token = makeTestToken()

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Logout berhasil.')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // ME
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
      expect(res.status).toBe(401)
    })

    it('should return user data with valid token', async () => {
      mockAuthenticatedUser({ name: 'Auth User', email: 'auth@test.com' })
      const token = makeTestToken(1)

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Auth User')
      expect(res.body.email).toBe('auth@test.com')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // UPDATE PROFILE
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('PATCH /api/auth/profile', () => {
    it('should return 422 when name or email is missing', async () => {
      mockAuthenticatedUser()
      const token = makeTestToken()

      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Only Name' }) // missing email

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Nama dan email wajib diisi.')
    })

    it('should return 422 when email is taken by another user', async () => {
      queryOne.mockImplementation(async (sql, params) => {
        // Auth middleware: user lookup
        if (sql.includes('FROM users WHERE id')) {
          return { id: 1, name: 'User', email: 'old@test.com', password: 'h', xp: 0, level: 1, firewood: 0, current_streak: 0, last_active_at: null }
        }
        // Auth middleware: household membership
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        // Controller call: check if email is taken by another user
        if (sql.includes('email') && sql.includes('id !=')) return { id: 99 }
        return null
      })
      invalidateUserCache(1)

      const token = makeTestToken()
      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated', email: 'taken@test.com' })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Email sudah terdaftar di akun lain.')
    })

    it('should update profile successfully', async () => {
      const updatedUser = {
        id: 1, name: 'Updated Name', email: 'updated@test.com',
        xp: 50, level: 1, firewood: 3, current_streak: 2, last_active_at: null,
      }

      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) return { ...updatedUser, password: 'h' }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        if (sql.includes('email') && sql.includes('id !=')) return null // email not taken
        return null
      })
      invalidateUserCache(1)
      query.mockResolvedValueOnce({ rows: [updatedUser] })

      const token = makeTestToken()
      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', email: 'updated@test.com' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Profil berhasil diperbarui.')
      expect(res.body.user.name).toBe('Updated Name')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHANGE PASSWORD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/auth/change-password', () => {
    it('should return 422 when fields are missing', async () => {
      mockAuthenticatedUser()
      const token = makeTestToken()

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'old' }) // missing newPassword

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Password lama dan baru wajib diisi.')
    })

    it('should return 422 when new password is too short', async () => {
      mockAuthenticatedUser()
      const token = makeTestToken()

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'oldpass123', newPassword: '123' })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Password baru minimal 8 karakter.')
    })

    it('should return 401 when old password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correct_old_pass', 12)

      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) {
          return { id: 1, name: 'User', email: 'u@t.com', password: hashedPassword, xp: 0, level: 1, firewood: 0, current_streak: 0, last_active_at: null }
        }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        if (sql.includes('SELECT password')) return { password: hashedPassword }
        return null
      })
      invalidateUserCache(1)

      const token = makeTestToken()
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'wrong_old_pass', newPassword: 'newpass123' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Password lama salah.')
    })

    it('should change password successfully', async () => {
      const hashedPassword = await bcrypt.hash('old_password', 12)

      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) {
          return { id: 1, name: 'User', email: 'u@t.com', password: hashedPassword, xp: 0, level: 1, firewood: 0, current_streak: 0, last_active_at: null }
        }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        if (sql.includes('SELECT password')) return { password: hashedPassword }
        return null
      })
      invalidateUserCache(1)
      query.mockResolvedValueOnce({ rows: [] }) // UPDATE users SET password

      const token = makeTestToken()
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'old_password', newPassword: 'new_password_123' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Password berhasil diubah.')
    })
  })
})
