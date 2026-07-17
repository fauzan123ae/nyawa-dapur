/**
 * Ingredient Controller Tests
 *
 * Tests for: index, store, update, adjust, cook, cookAmount, cookBatch, waste, destroy
 * All DB calls are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'

import { query, queryOne } from '../db/index.js'
import {
  index, store, update, adjust, cook, cookAmount, cookBatch, waste, destroy,
} from '../controllers/ingredientController.js'
import { authenticate } from '../middleware/auth.js'

// ─── Helper ─────────────────────────────────────────────────────────────────────
function buildApp() {
  const app = express()
  app.use(express.json())
  app.use(authenticate)
  app.get('/api/ingredients', index)
  app.post('/api/ingredients', store)
  app.post('/api/ingredients/cook-batch', cookBatch)
  app.put('/api/ingredients/:id', update)
  app.put('/api/ingredients/:id/adjust', adjust)
  app.post('/api/ingredients/:id/cook', cook)
  app.post('/api/ingredients/:id/cook-amount', cookAmount)
  app.patch('/api/ingredients/:id/waste', waste)
  app.delete('/api/ingredients/:id', destroy)
  return app
}

function makeToken(userId = 1) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

const TEST_USER = {
  id: 1, name: 'Chef', email: 'chef@test.com', password: 'h',
  xp: 100, level: 2, firewood: 5, current_streak: 3, last_active_at: new Date().toISOString(),
}

const TEST_INGREDIENT = {
  id: 10, user_id: 1, household_id: 1,
  name: 'Bawang Merah', quantity: '2.00', unit: 'kilogram',
  purchase_date: '2026-07-10T00:00:00.000Z',
  expiry_date: '2026-07-20T00:00:00.000Z',
  status: 'active', updated_at: new Date().toISOString(),
}

/**
 * Sets up queryOne mock that correctly handles BOTH the authenticate middleware
 * AND the ownerCheck function in ingredientController.
 * 
 * The key insight: authenticate queries "SELECT * FROM users WHERE id = $1"
 * while ownerCheck queries "SELECT * FROM ingredients WHERE id=$1".
 * We match on both to properly route mock responses.
 */
function setupAuth(ingredientOverrides = {}) {
  const ingredient = { ...TEST_INGREDIENT, ...ingredientOverrides }
  
  queryOne.mockImplementation(async (sql, params) => {
    // Auth middleware: user lookup
    if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
    // Auth middleware: household membership
    if (sql.includes('FROM household_members WHERE user_id') && sql.includes('household_id')) return { household_id: 1 }
    // Auth middleware: personal household fallback
    if (sql.includes('FROM households h JOIN')) return { id: 1 }
    // ownerCheck: ingredient lookup
    if (sql.includes('FROM ingredients WHERE id')) return { ...ingredient }
    return null
  })
}

// ─────────────────────────────────────────────────────────────────────────────────

describe('Ingredient Controller', () => {
  let app, token

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildApp()
    token = makeToken()
    setupAuth()
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // INDEX
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/ingredients', () => {
    it('should return list of ingredients for the household', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { ...TEST_INGREDIENT },
          { ...TEST_INGREDIENT, id: 11, name: 'Bawang Putih', quantity: '1.50' },
        ],
      })

      const res = await request(app)
        .get('/api/ingredients')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body[0].name).toBe('Bawang Merah')
      expect(res.body[1].name).toBe('Bawang Putih')
    })

    it('should return empty array when no ingredients', async () => {
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .get('/api/ingredients')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // STORE
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/ingredients', () => {
    it('should return 422 when fields are missing', async () => {
      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tomat' }) // missing quantity, unit, days_to_expiry

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Semua field wajib diisi.')
    })

    it('should create ingredient successfully', async () => {
      const newIng = {
        ...TEST_INGREDIENT, id: 20, name: 'Tomat', quantity: '3.00', unit: 'kilogram',
      }
      query.mockResolvedValueOnce({ rows: [newIng] })

      const res = await request(app)
        .post('/api/ingredients')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tomat', quantity: 3, unit: 'kilogram', days_to_expiry: 7 })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Bahan ditambahkan.')
      expect(res.body.ingredient.name).toBe('Tomat')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('PUT /api/ingredients/:id', () => {
    it('should return 404 when ingredient not found', async () => {
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        if (sql.includes('FROM ingredients WHERE id')) return null // not found
        return null
      })

      const res = await request(app)
        .put('/api/ingredients/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X', quantity: 1, unit: 'kilogram', days_to_expiry: 5 })

      expect(res.status).toBe(404)
      expect(res.body.message).toBe('Bahan tidak ditemukan.')
    })

    it('should return 403 when ingredient belongs to another household', async () => {
      queryOne.mockImplementation(async (sql) => {
        if (sql.includes('FROM users WHERE id')) return { ...TEST_USER }
        if (sql.includes('FROM household_members')) return { household_id: 1 }
        if (sql.includes('FROM ingredients WHERE id')) return { ...TEST_INGREDIENT, household_id: 99 }
        return null
      })

      const res = await request(app)
        .put('/api/ingredients/10')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'X', quantity: 1, unit: 'kilogram', days_to_expiry: 5 })

      expect(res.status).toBe(403)
      expect(res.body.message).toBe('Akses ditolak.')
    })

    it('should update ingredient successfully', async () => {
      const updated = { ...TEST_INGREDIENT, name: 'Bawang Updated', quantity: '5.00' }
      query.mockResolvedValueOnce({ rows: [updated] })

      const res = await request(app)
        .put('/api/ingredients/10')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bawang Updated', quantity: 5, unit: 'kilogram', days_to_expiry: 10 })

      expect(res.status).toBe(200)
      expect(res.body.ingredient.name).toBe('Bawang Updated')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // ADJUST
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('PUT /api/ingredients/:id/adjust', () => {
    it('should increase quantity with "plus" direction', async () => {
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .put('/api/ingredients/10/adjust')
        .set('Authorization', `Bearer ${token}`)
        .send({ direction: 'plus' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Kuantitas disesuaikan.')
      // 2.00 + 0.25 (kilogram step) = 2.25
      expect(res.body.quantity).toBe(2.25)
    })

    it('should decrease quantity with "minus" direction (min 0)', async () => {
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .put('/api/ingredients/10/adjust')
        .set('Authorization', `Bearer ${token}`)
        .send({ direction: 'minus' })

      expect(res.status).toBe(200)
      expect(res.body.quantity).toBe(1.75)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // COOK (full)
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/ingredients/:id/cook', () => {
    it('should cook ingredient and gain 15 XP', async () => {
      query.mockResolvedValue({ rows: [] })

      const res = await request(app)
        .post('/api/ingredients/10/cook')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('+15 XP')
      expect(res.body.xp).toBe(TEST_USER.xp + 15)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // COOK AMOUNT (partial)
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/ingredients/:id/cook-amount', () => {
    it('should return 422 when amount is 0 or negative', async () => {
      const res = await request(app)
        .post('/api/ingredients/10/cook-amount')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 0 })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Jumlah yang dimasak harus lebih dari 0.')
    })

    it('should return 422 when amount exceeds stock', async () => {
      const res = await request(app)
        .post('/api/ingredients/10/cook-amount')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 999 })

      expect(res.status).toBe(422)
      expect(res.body.message).toContain('Stok tidak cukup')
    })

    it('should return 422 when ingredient is not active', async () => {
      setupAuth({ status: 'cooked' })

      const res = await request(app)
        .post('/api/ingredients/10/cook-amount')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 1 })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Bahan tidak dalam status aktif.')
    })

    it('should cook partial amount successfully', async () => {
      const remainingIng = { ...TEST_INGREDIENT, quantity: '1.00', status: 'active' }
      query
        .mockResolvedValueOnce({ rows: [remainingIng] }) // UPDATE ingredient
        .mockResolvedValueOnce({ rows: [] }) // INSERT cooking_history
        .mockResolvedValueOnce({ rows: [] }) // UPDATE users xp

      const res = await request(app)
        .post('/api/ingredients/10/cook-amount')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 1 })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('berhasil dimasak')
      expect(res.body.xp).toBe(TEST_USER.xp + 15)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // COOK BATCH
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/ingredients/cook-batch', () => {
    it('should return 422 when items is empty', async () => {
      const res = await request(app)
        .post('/api/ingredients/cook-batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [] })

      expect(res.status).toBe(422)
      expect(res.body.message).toBe('Pilih minimal 1 bahan.')
    })

    it('should return 422 when item format is invalid', async () => {
      const res = await request(app)
        .post('/api/ingredients/cook-batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ id: 'abc', amount: -1 }] })

      expect(res.status).toBe(422)
      expect(res.body.message).toContain('tidak valid')
    })

    it('should cook batch successfully', async () => {
      // setupAuth already provides the ingredient via queryOne for 'FROM ingredients WHERE id'
      // cookBatch uses queryOne('SELECT * FROM ingredients WHERE id = $1')
      query.mockResolvedValue({ rows: [] }) // all UPDATE/INSERT calls

      const res = await request(app)
        .post('/api/ingredients/cook-batch')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ id: 10, amount: 1 }] })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('berhasil dimasak')
      expect(res.body.xp).toBe(TEST_USER.xp + 15)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // WASTE
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('PATCH /api/ingredients/:id/waste', () => {
    it('should return 400 when amount is invalid', async () => {
      // waste() uses query('SELECT * FROM ingredients WHERE id=$1') — not queryOne
      query.mockResolvedValueOnce({ rows: [{ ...TEST_INGREDIENT }] })

      const res = await request(app)
        .patch('/api/ingredients/10/waste')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 0 })

      expect(res.status).toBe(400)
    })

    it('should waste partial amount', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ ...TEST_INGREDIENT }] }) // SELECT ingredient
        .mockResolvedValueOnce({ rows: [] }) // UPDATE ingredient
        .mockResolvedValueOnce({ rows: [] }) // INSERT waste_history

      const res = await request(app)
        .patch('/api/ingredients/10/waste')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 1 })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('dicatat busuk')
    })

    it('should waste full amount and mark as wasted', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ ...TEST_INGREDIENT }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .patch('/api/ingredients/10/waste')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 2 }) // equals full quantity

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('wasted')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('DELETE /api/ingredients/:id', () => {
    it('should delete ingredient successfully', async () => {
      query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .delete('/api/ingredients/10')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Bahan dihapus.')
    })
  })
})
