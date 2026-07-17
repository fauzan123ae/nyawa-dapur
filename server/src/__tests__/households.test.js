/**
 * Household Controller Tests
 *
 * Tests for: createHousehold, joinHousehold, getMembers, leaveHousehold, getMyHouseholds
 * All DB calls are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

import { query, queryOne } from '../db/index.js'
import {
  createHousehold, joinHousehold, getMembers, leaveHousehold, getMyHouseholds,
} from '../controllers/householdController.js'
import { authenticate, invalidateUserCache } from '../middleware/auth.js'

// ─── Helper ─────────────────────────────────────────────────────────────────────
function buildApp() {
  const app = express()
  app.use(express.json())
  app.use(authenticate)
  app.post('/api/households/create', createHousehold)
  app.post('/api/households/join', joinHousehold)
  app.get('/api/households/members', getMembers)
  app.post('/api/households/leave', leaveHousehold)
  app.get('/api/households/mine', getMyHouseholds)
  return app
}

function makeToken(userId = 1) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

const TEST_USER = {
  id: 1, name: 'Chef', email: 'chef@test.com', password: 'h',
  xp: 100, level: 2, firewood: 5, current_streak: 3, last_active_at: new Date().toISOString(),
}

function setupAuth(userOverrides = {}) {
  const user = { ...TEST_USER, ...userOverrides }
  // Invalidate cache so authenticate re-queries and picks up the new mock user
  invalidateUserCache(user.id)
  queryOne.mockImplementation(async (sql) => {
    if (sql.includes('FROM users WHERE id')) return { ...user }
    // Auth middleware: explicit household header check
    if (sql.includes('FROM household_members WHERE user_id') && sql.includes('household_id') && !sql.includes('DELETE')) {
      return { household_id: 1 }
    }
    // Auth middleware: personal household fallback (FROM households h JOIN …)
    if (sql.includes('FROM households h JOIN')) return { id: 1 }
    // Auth middleware: any-household fallback
    if (sql.includes('FROM household_members') && !sql.includes('DELETE')) return { household_id: 1 }
    return null
  })
  return user
}

// ─────────────────────────────────────────────────────────────────────────────────

describe('Household Controller', () => {
  let app, token

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildApp()
    token = makeToken()
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // CREATE HOUSEHOLD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/households/create', () => {
    it('should return 422 when name is missing', async () => {
      setupAuth()

      const res = await request(app)
        .post('/api/households/create')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Nama dapur wajib diisi.')
    })

    it('should create household successfully', async () => {
      setupAuth()
      const newHousehold = { id: 5, name: 'Dapur Keluarga', owner_id: 1, invite_code: 'abc12345' }

      query
        .mockResolvedValueOnce({ rows: [newHousehold] }) // INSERT household
        .mockResolvedValueOnce({ rows: [] })             // INSERT household_member

      const res = await request(app)
        .post('/api/households/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Dapur Keluarga' })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Dapur berhasil dibuat.')
      expect(res.body.household.name).toBe('Dapur Keluarga')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // JOIN HOUSEHOLD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/households/join', () => {
    it('should return 422 when invite code is missing', async () => {
      setupAuth()

      const res = await request(app)
        .post('/api/households/join')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Invite code wajib diisi.')
    })

    it('should return 404 when invite code is invalid', async () => {
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('SELECT * FROM users WHERE id')) return { ...TEST_USER }
        if (sql.includes('household_members') && sql.includes('user_id') && sql.includes('household_id')) return { household_id: 1 }
        if (sql.includes('invite_code')) return null // household not found
        return null
      })

      const res = await request(app)
        .post('/api/households/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ invite_code: 'invalid123' })

      expect(res.status).toBe(404)
      expect(res.body.message).toContain('tidak ditemukan')
    })

    it('should return 400 when user is already a member', async () => {
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('SELECT * FROM users WHERE id')) return { ...TEST_USER }
        if (sql.includes('invite_code')) return { id: 5, name: 'Dapur B', invite_code: 'valid123' }
        if (sql.includes('household_members')) return { household_id: 5 } // already member
        return null
      })

      const res = await request(app)
        .post('/api/households/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ invite_code: 'valid123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('sudah berada')
    })

    it('should join household successfully', async () => {
      invalidateUserCache(1)
      queryOne.mockImplementation(async (sql, params) => {
        if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
        // Auth middleware: household header check (household_id = 1, from req.user)
        if (sql.includes('FROM household_members WHERE user_id') && sql.includes('household_id') && params && params[1] == 1) {
          return { household_id: 1 }
        }
        // Auth middleware: personal household fallback
        if (sql.includes('FROM households h JOIN')) return { id: 1 }
        // Controller: lookup household by invite_code
        if (sql.includes('invite_code')) return { id: 5, name: 'Dapur B', invite_code: 'valid123' }
        // Controller: membership check for household 5 → not a member yet
        if (sql.includes('FROM household_members WHERE user_id') && params && params[1] == 5) {
          return null
        }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        return null
      })

      query.mockResolvedValueOnce({ rows: [] }) // INSERT member

      const res = await request(app)
        .post('/api/households/join')
        .set('Authorization', `Bearer ${token}`)
        .send({ invite_code: 'valid123' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('Berhasil bergabung')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // GET MEMBERS
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/households/members', () => {
    it('should return members list', async () => {
      invalidateUserCache(1)
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
        if (sql.includes('FROM household_members WHERE user_id') && sql.includes('household_id')) return { household_id: 1 }
        if (sql.includes('FROM households h JOIN')) return { id: 1 }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        // getMembers controller: SELECT id, name, invite_code …
        if (sql.includes('SELECT id, name, invite_code') || sql.includes('FROM households WHERE id')) {
          return { id: 1, name: 'Dapur Chef', invite_code: 'abc', owner_id: 1 }
        }
        return null
      })
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Chef', email: 'chef@test.com', role: 'owner', joined_at: '2026-01-01' },
          { id: 2, name: 'Helper', email: 'helper@test.com', role: 'member', joined_at: '2026-01-02' },
        ],
      })

      const res = await request(app)
        .get('/api/households/members')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.members).toHaveLength(2)
      expect(res.body.household).toBeDefined()
    })

    it('should return empty array when no household', async () => {
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('SELECT * FROM users WHERE id')) return { ...TEST_USER }
        // No household membership — user.householdId will be null
        return null
      })

      const res = await request(app)
        .get('/api/households/members')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // GET MY HOUSEHOLDS
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/households/mine', () => {
    it('should return list of user households', async () => {
      setupAuth()
      // Use mockResolvedValue (not Once) so every query call gets the household list.
      // Auth middleware doesn't call query(), only queryOne() — so this is safe.
      query.mockResolvedValue({
        rows: [
          { id: 1, name: 'Dapur Chef', invite_code: 'abc', role: 'owner', member_count: '2', is_personal: true },
          { id: 5, name: 'Dapur Keluarga', invite_code: 'xyz', role: 'member', member_count: '4', is_personal: false },
        ],
      })

      const res = await request(app)
        .get('/api/households/mine')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEAVE HOUSEHOLD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/households/leave', () => {
    it('should return 400 when user is the owner', async () => {
      invalidateUserCache(1)
      // Override ALL queryOne calls — must still handle auth middleware branches
      queryOne.mockImplementation(async (sql, params) => {
        if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
        // Auth middleware: personal household fallback
        if (sql.includes('FROM households h JOIN')) return { id: 1 }
        // leaveHousehold controller membership lookup + auth household checks
        if (sql.includes('household_members')) return { household_id: 1, role: 'owner' }
        return null
      })

      const res = await request(app)
        .post('/api/households/leave')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('Owner tidak bisa keluar')
    })

    it('should leave household successfully as member', async () => {
      invalidateUserCache(1)
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
        // Auth middleware: personal household fallback
        if (sql.includes('FROM households h JOIN')) return { id: 1 }
        // leaveHousehold controller + auth household checks
        if (sql.includes('household_members')) return { household_id: 1, role: 'member' }
        return null
      })
      query.mockResolvedValueOnce({ rows: [] }) // DELETE member

      const res = await request(app)
        .post('/api/households/leave')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Berhasil keluar dari dapur.')
    })
  })
})
