/**
 * Dashboard Controller Tests
 *
 * Tests for: getDashboard, buyFirewood, igniteWood, nextDay
 * All DB calls are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

import { query, queryOne } from '../db/index.js'
import { getDashboard, buyFirewood, igniteWood, nextDay } from '../controllers/dashboardController.js'
import { authenticate, invalidateUserCache } from '../middleware/auth.js'

// ─── Helper ─────────────────────────────────────────────────────────────────────
function buildApp() {
  const app = express()
  app.use(express.json())
  app.use(authenticate)
  app.get('/api/dashboard', getDashboard)
  app.post('/api/dashboard/shop/buy-firewood', buyFirewood)
  app.post('/api/dashboard/kitchen/ignite-wood', igniteWood)
  app.post('/api/dashboard/simulation/next-day', nextDay)
  return app
}

function makeToken(userId = 1) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

const TEST_USER = {
  id: 1, name: 'Chef', email: 'chef@test.com', password: 'h',
  xp: 100, level: 2, firewood: 5, current_streak: 3,
  last_active_at: new Date().toISOString(),
}

function setupAuth(userOverrides = {}) {
  const user = { ...TEST_USER, ...userOverrides }
  // Must also invalidate cache so authenticate re-queries with the new user data
  invalidateUserCache(user.id)
  queryOne.mockImplementation(async (sql) => {
    if (sql.includes('FROM users WHERE id')) return { ...user }
    // Auth middleware: explicit household header check
    if (sql.includes('FROM household_members WHERE user_id') && sql.includes('household_id')) return { household_id: 1 }
    // Auth middleware: personal household fallback (FROM households h JOIN …)
    if (sql.includes('FROM households h JOIN')) return { id: 1 }
    // Auth middleware: any-household fallback
    if (sql.includes('FROM household_members')) return { household_id: 1 }
    return null
  })
  return user
}

// ─────────────────────────────────────────────────────────────────────────────────

describe('Dashboard Controller', () => {
  let app, token

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildApp()
    token = makeToken()
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // GET DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/dashboard', () => {
    it('should return full dashboard data', async () => {
      setupAuth()

      // ingredients query
      query.mockResolvedValueOnce({
        rows: [
          {
            id: 1, name: 'Tomat', quantity: '2.00', unit: 'kilogram',
            purchase_date: '2026-07-10', expiry_date: '2026-07-20',
            status: 'active', updated_at: new Date().toISOString(),
          },
        ],
      })

      // quests query (existing quests for today)
      query.mockResolvedValueOnce({
        rows: [
          { id: 1, user_id: 1, type: 'cook_saving', description: '🍳 Masak minimal 1 bahan.', xp_reward: 30, is_completed: false, quest_date: '2026-07-17' },
        ],
      })

      // cooking_history query for cook_saving quest check
      query.mockResolvedValueOnce({
        rows: [{ count: '0' }],
      })

      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('userData')
      expect(res.body).toHaveProperty('ingredientsData')
      expect(res.body).toHaveProperty('questsData')
      expect(res.body.userData.name).toBe('Chef')
      expect(res.body.ingredientsData).toHaveLength(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // BUY FIREWOOD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/dashboard/shop/buy-firewood', () => {
    it('should return 422 when XP is insufficient', async () => {
      setupAuth({ xp: 30 })

      const res = await request(app)
        .post('/api/dashboard/shop/buy-firewood')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(422)
      expect(res.body.message).toContain('XP tidak cukup')
    })

    it('should buy firewood successfully when XP is enough', async () => {
      setupAuth({ xp: 100 })
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .post('/api/dashboard/shop/buy-firewood')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('Berhasil tukar 50 XP')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // IGNITE WOOD
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/dashboard/kitchen/ignite-wood', () => {
    it('should return 422 when no firewood', async () => {
      setupAuth({ firewood: 0 })

      const res = await request(app)
        .post('/api/dashboard/kitchen/ignite-wood')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Tidak ada kayu bakar.')
    })

    it('should ignite wood successfully', async () => {
      setupAuth({ firewood: 3 })
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .post('/api/dashboard/kitchen/ignite-wood')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Api berhasil dinyalakan!')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // NEXT DAY (simulation)
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/dashboard/simulation/next-day', () => {
    it('should advance day and update streak', async () => {
      setupAuth()
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .post('/api/dashboard/simulation/next-day')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Waktu maju +1 hari.')
      expect(res.body).toHaveProperty('simulatedDate')
    })
  })
})
