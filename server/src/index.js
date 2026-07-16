import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes       from './routes/auth.js'
import dashboardRoutes  from './routes/dashboard.js'
import ingredientRoutes from './routes/ingredients.js'
import questRoutes      from './routes/quests.js'
import historyRoutes    from './routes/history.js'
import householdRoutes     from './routes/households.js'
import wasteHistoryRoutes  from './routes/wasteHistory.js'

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
app.use('/api/households',    householdRoutes)
app.use('/api/waste-history', wasteHistoryRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }))

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
})