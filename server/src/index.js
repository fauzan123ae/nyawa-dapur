import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes       from './routes/auth.js'
import dashboardRoutes  from './routes/dashboard.js'
import ingredientRoutes from './routes/ingredients.js'
import questRoutes      from './routes/quests.js'
import historyRoutes    from './routes/history.js'

const app  = express()
const PORT = process.env.PORT || 8000

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
  ],
  credentials: false,
}))
app.use(express.json())

app.use('/api/auth',        authRoutes)
app.use('/api/dashboard',   dashboardRoutes)
app.use('/api/ingredients', ingredientRoutes)
app.use('/api/quests',      questRoutes)
app.use('/api/history',     historyRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }))

// Buat tabel cooking_history saat server pertama start
async function initDb() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS cooking_history (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL,
        ingredient_id   INTEGER,
        ingredient_name TEXT    NOT NULL,
        quantity        NUMERIC NOT NULL,
        unit            TEXT    NOT NULL,
        cooked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        xp_earned       INTEGER NOT NULL DEFAULT 15
      )
    `)
    console.log('✅ Tabel cooking_history siap.')
  } catch (err) {
    console.error('❌ Gagal inisialisasi DB:', err.message)
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`)
  })
})