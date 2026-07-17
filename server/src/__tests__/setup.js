/**
 * Global test setup for server tests.
 * Mocks the database module so no real PostgreSQL connection is needed.
 */
import { vi } from 'vitest'

// ─── Mock DB module ────────────────────────────────────────────────────────────
// Every controller imports from '../db/index.js'. We intercept it here
// so tests can control what the DB "returns" without a real connection.
vi.mock('../db/index.js', () => {
  const query = vi.fn()
  const queryOne = vi.fn()
  return { query, queryOne, default: {} }
})

// ─── DO NOT mock middleware/auth.js ────────────────────────────────────────────
// We keep the real `authenticate` and real `invalidateUserCache`.
// Mocking invalidateUserCache as vi.fn() would leave the in-memory userCache
// stale across tests: a test that sets up user "A" would bleed into the next
// test that expects user "B" because the cache never gets cleared.
// Keeping the real implementation means invalidateUserCache() actually removes
// the entry from the Map, so each test's queryOne mock takes effect cleanly.

// ─── Environment variables ─────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.JWT_EXPIRES_IN = '1h'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
