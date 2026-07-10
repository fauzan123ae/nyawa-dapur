import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const query    = (text, params) => pool.query(text, params)
export const queryOne = async (text, params) => {
  const res = await pool.query(text, params)
  return res.rows[0] || null
}

export default pool
